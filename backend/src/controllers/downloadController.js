const fs = require("fs");
const os = require("os");
const path = require("path");
const crypto = require("crypto");
const axios = require("axios");
const ytdlp = require("youtube-dl-exec");

const {
  extractYouTubeVideoId,
} = require("../services/youtubeService");

/*
|--------------------------------------------------------------------------
| Configuration
|--------------------------------------------------------------------------
*/

const FFMPEG_PATH =
  process.env.FFMPEG_PATH ||
  "C:\\Users\\Abdullah\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-9.0.2-full_build\\bin";

/*
|--------------------------------------------------------------------------
| Download Jobs
|--------------------------------------------------------------------------
*/

const downloadJobs = new Map();

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

function createJob() {
  const id = crypto.randomUUID();

  const job = {
    id,
    platform: null,
    status: "starting",
    progress: 0,
    downloadedBytes: 0,
    totalBytes: 0,
    speed: 0,
    eta: null,
    filename: "downora-video.mp4",
    outputPath: null,
    outputDir: null,
    error: null,
    clients: new Set(),
    createdAt: Date.now(),
    completedAt: null,
  };

  downloadJobs.set(id, job);

  return job;
}

function safeFilename(filename) {
  return (
    (filename || "downora-video.mp4")
      .replace(/[^a-zA-Z0-9._-]/g, "_")
      .slice(0, 120) || "downora-video.mp4"
  );
}

function formatBytes(bytes) {
  const value = Number(bytes || 0);

  if (!value) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB"];

  const index = Math.min(
    Math.floor(Math.log(value) / Math.log(1024)),
    units.length - 1
  );

  return `${(
    value / Math.pow(1024, index)
  ).toFixed(index === 0 ? 0 : 2)} ${units[index]}`;
}

function parseSpeed(value) {
  if (!value) {
    return 0;
  }

  const text = String(value)
    .trim()
    .replace(/\s+/g, "");

  const match = text.match(
    /^([\d.]+)(B|KiB|MiB|GiB|KB|MB|GB)\/s$/i
  );

  if (!match) {
    return 0;
  }

  const number = Number(match[1]);
  const unit = match[2].toLowerCase();

  const multipliers = {
    b: 1,
    kb: 1024,
    kib: 1024,
    mb: 1024 * 1024,
    mib: 1024 * 1024,
    gb: 1024 * 1024 * 1024,
    gib: 1024 * 1024 * 1024,
  };

  return number * (multipliers[unit] || 1);
}

function parsePercent(value) {
  if (value === undefined || value === null) {
    return null;
  }

  const match = String(value).match(/([\d.]+)/);

  if (!match) {
    return null;
  }

  const percent = Number(match[1]);

  if (!Number.isFinite(percent)) {
    return null;
  }

  return Math.max(0, Math.min(100, percent));
}

function parseBytes(value) {
  if (value === undefined || value === null) {
    return null;
  }

  const text = String(value)
    .trim()
    .replace(/\s+/g, "");

  if (/^\d+$/.test(text)) {
    return Number(text);
  }

  const match = text.match(
    /^([\d.]+)(B|KB|KiB|MB|MiB|GB|GiB)$/i
  );

  if (!match) {
    return null;
  }

  const number = Number(match[1]);
  const unit = match[2].toLowerCase();

  const multipliers = {
    b: 1,
    kb: 1024,
    kib: 1024,
    mb: 1024 * 1024,
    mib: 1024 * 1024,
    gb: 1024 * 1024 * 1024,
    gib: 1024 * 1024 * 1024,
  };

  return number * (multipliers[unit] || 1);
}

/*
|--------------------------------------------------------------------------
| Send Progress
|--------------------------------------------------------------------------
*/

function updateJob(job, data = {}) {
  Object.assign(job, data);

  const payload = JSON.stringify({
    type: "progress",
    status: job.status,
    progress: job.progress,
    downloadedBytes: job.downloadedBytes,
    totalBytes: job.totalBytes,
    downloaded: formatBytes(job.downloadedBytes),
    total: formatBytes(job.totalBytes),
    speed: job.speed,
    speedText: formatBytes(job.speed) + "/s",
    eta: job.eta,
    filename: job.filename,
    platform: job.platform,
    error: job.error,
  });

  for (const client of job.clients) {
    try {
      client.write(`data: ${payload}\n\n`);
    } catch {
      job.clients.delete(client);
    }
  }
}

function sendJobEvent(job, type, extra = {}) {
  const payload = JSON.stringify({
    type,
    status: job.status,
    progress: job.progress,
    downloadedBytes: job.downloadedBytes,
    totalBytes: job.totalBytes,
    downloaded: formatBytes(job.downloadedBytes),
    total: formatBytes(job.totalBytes),
    speed: job.speed,
    speedText: formatBytes(job.speed) + "/s",
    eta: job.eta,
    filename: job.filename,
    platform: job.platform,
    error: job.error,
    ...extra,
  });

  for (const client of job.clients) {
    try {
      client.write(`data: ${payload}\n\n`);
    } catch {
      job.clients.delete(client);
    }
  }
}

/*
|--------------------------------------------------------------------------
| Parse yt-dlp Progress
|--------------------------------------------------------------------------
*/

function parseProgressLine(line, job) {
  if (!line) {
    return;
  }

  const text = String(line).trim();

  if (!text.startsWith("PROGRESS|")) {
    return;
  }

  const parts = text.split("|");

  if (parts.length < 6) {
    return;
  }

  const percent = parsePercent(parts[1]);
  const downloadedBytes = parseBytes(parts[2]);
  const totalBytes = parseBytes(parts[3]);
  const speed = parseSpeed(parts[4]);
  const etaText = parts[5] || null;

  if (percent !== null) {
    job.progress = Math.round(percent * 10) / 10;
  }

  if (
    downloadedBytes !== null &&
    downloadedBytes >= 0
  ) {
    job.downloadedBytes = downloadedBytes;
  }

  if (
    totalBytes !== null &&
    totalBytes > 0
  ) {
    job.totalBytes = totalBytes;
  }

  if (speed >= 0) {
    job.speed = speed;
  }

  job.eta = etaText;
  job.status = "downloading";

  updateJob(job);
}

/*
|--------------------------------------------------------------------------
| Start Generic yt-dlp Download
|--------------------------------------------------------------------------
*/

const startMediaDownload = async (req, res) => {
  try {
    const {
      url,
      formatId,
      filename,
      platform,
    } = req.body;

    if (!url || typeof url !== "string") {
      return res.status(400).json({
        success: false,
        message: "Media URL is required.",
      });
    }

    const cleanUrl = url.trim();

    let parsedUrl;

    try {
      parsedUrl = new URL(cleanUrl);
    } catch {
      return res.status(400).json({
        success: false,
        message: "Invalid media URL.",
      });
    }

    if (
      !["http:", "https:"].includes(
        parsedUrl.protocol
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Only HTTP and HTTPS URLs are supported.",
      });
    }

    if (!formatId) {
      return res.status(400).json({
        success: false,
        message: "Format ID is required.",
      });
    }

    const selectedPlatform =
      String(platform || "youtube").toLowerCase();

    const allowedPlatforms = [
      "youtube",
      "tiktok",
      "facebook",
      "instagram",
      "x",
    ];

    if (!allowedPlatforms.includes(selectedPlatform)) {
      return res.status(400).json({
        success: false,
        message: "Unsupported platform.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | YouTube validation only for YouTube
    |--------------------------------------------------------------------------
    */

    if (selectedPlatform === "youtube") {
      const videoId =
        extractYouTubeVideoId(cleanUrl);

      if (!videoId) {
        return res.status(400).json({
          success: false,
          message: "Invalid YouTube URL.",
        });
      }
    }

    /*
    |--------------------------------------------------------------------------
    | Create Job
    |--------------------------------------------------------------------------
    */

    const job = createJob();

    job.platform = selectedPlatform;

    job.filename = safeFilename(
      filename ||
        `downora-${selectedPlatform}-${formatId}.mp4`
    );

    res.status(202).json({
      success: true,
      message: "Download started.",
      jobId: job.id,
      platform: selectedPlatform,
    });

    /*
    |--------------------------------------------------------------------------
    | Run background download
    |--------------------------------------------------------------------------
    */

    runMediaDownload(
      job,
      cleanUrl,
      String(formatId),
      selectedPlatform
    ).catch((error) => {
      console.error(
        "Background download error:",
        error
      );

      job.status = "error";
      job.error =
        error.message ||
        "Download failed.";

      updateJob(job);

      sendJobEvent(
        job,
        "error"
      );
    });
  } catch (error) {
    console.error(
      "Start Media Download Error:",
      error
    );

    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Unable to start download.",
      });
    }
  }
};

/*
|--------------------------------------------------------------------------
| Run Generic yt-dlp Download
|--------------------------------------------------------------------------
*/

async function runMediaDownload(
  job,
  url,
  formatId,
  platform
) {
  let outputDir = null;

  try {
    outputDir = fs.mkdtempSync(
      path.join(os.tmpdir(), "downora-")
    );

    job.outputDir = outputDir;

    const outputFile = path.join(
      outputDir,
      job.filename
    );

    job.outputPath = outputFile;

    /*
    |--------------------------------------------------------------------------
    | Format Selection
    |--------------------------------------------------------------------------
    */

    let formatSelector;

    /*
    |--------------------------------------------------------------------------
    | YouTube
    |--------------------------------------------------------------------------
    */

    if (platform === "youtube") {
      formatSelector =
        `${formatId}+bestaudio[ext=m4a]/${formatId}+bestaudio/best`;
    }

    /*
    |--------------------------------------------------------------------------
    | TikTok
    |--------------------------------------------------------------------------
    |
    | TikTok ke liye selected format ko prefer karte hain,
    | lekin agar woh unavailable ho to best available
    | video+audio format automatically select hoga.
    |
    */

    else if (platform === "tiktok") {
      formatSelector =
        `${formatId}/bestvideo+bestaudio/best`;
    }

    /*
    |--------------------------------------------------------------------------
    | Facebook / Instagram / X
    |--------------------------------------------------------------------------
    |
    | Instagram/Facebook/X ke video aur audio aksar
    | alag streams mein aate hain (YouTube jaisa).
    | Isliye selected formatId ke saath hamesha
    | bestaudio jodna zaroori hai, warna sirf
    | video-only (bina awaz wali) file bann jati hai.
    | Agar formatId+audio combination fail ho jaye
    | to neeche wale fallbacks automatically try
    | honge.
    |
    */

    else {
      formatSelector =
        `${formatId}+bestaudio[ext=m4a]/${formatId}+bestaudio/${formatId}/bestvideo+bestaudio/best`;
    }

    console.log(
      "Starting media download:",
      {
        jobId: job.id,
        platform,
        url,
        formatId,
        formatSelector,
      }
    );

    updateJob(job, {
      status: "starting",
      progress: 0,
      downloadedBytes: 0,
      totalBytes: 0,
      speed: 0,
      eta: null,
    });

    /*
    |--------------------------------------------------------------------------
    | yt-dlp Options
    |--------------------------------------------------------------------------
    */

    const ytdlpOptions = {
      format: formatSelector,

      output: outputFile,

      mergeOutputFormat: "mp4",

      ffmpegLocation: FFMPEG_PATH,

      noWarnings: true,

      noCheckCertificates: true,

      noPlaylist: true,

      retries: 10,

      fragmentRetries: 10,

      socketTimeout: 30000,

      newline: true,

      progress: true,

      progressDelta: 0.5,

      progressTemplate:
        "download:PROGRESS|%(progress._percent_str)s|%(progress.downloaded_bytes)s|%(progress.total_bytes)s|%(progress._speed_str)s|%(progress._eta_str)s",
    };

    /*
    |--------------------------------------------------------------------------
    | Platform-specific Options
    |--------------------------------------------------------------------------
    */

    if (platform === "tiktok") {
      /*
      | TikTok kabhi kabhi format metadata different
      | return karta hai, isliye best available format
      | ko allow karte hain.
      */

      ytdlpOptions.noPlaylist = true;

      /*
      | Agar selected format available na ho to
      | yt-dlp automatically fallback karega.
      */
      ytdlpOptions.formatSort =
        "res,fps,codec:avc:m4a";

      /*
      | TikTok ke liye browser-like headers.
      */
      ytdlpOptions.addHeader = [
        "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/151.0.0.0 Safari/537.36",
        "Accept-Language: en-US,en;q=0.9",
      ];
    }

    /*
    |--------------------------------------------------------------------------
    | Start yt-dlp
    |--------------------------------------------------------------------------
    */

    const subprocess = ytdlp.exec(
      url,
      ytdlpOptions
    );

    let stderrBuffer = "";
    let stdoutBuffer = "";

    /*
    |--------------------------------------------------------------------------
    | stderr progress
    |--------------------------------------------------------------------------
    */

    const processOutput = (chunk) => {
      const text = chunk.toString();

      stderrBuffer += text;

      const lines =
        stderrBuffer.split(/\r?\n/);

      stderrBuffer =
        lines.pop() || "";

      for (const line of lines) {
        parseProgressLine(
          line,
          job
        );
      }
    };

    /*
    |--------------------------------------------------------------------------
    | stdout progress
    |--------------------------------------------------------------------------
    */

    const processStdout = (chunk) => {
      const text = chunk.toString();

      stdoutBuffer += text;

      const lines =
        stdoutBuffer.split(/\r?\n/);

      stdoutBuffer =
        lines.pop() || "";

      for (const line of lines) {
        parseProgressLine(
          line,
          job
        );
      }
    };

    if (subprocess.stderr) {
      subprocess.stderr.on(
        "data",
        processOutput
      );
    }

    if (subprocess.stdout) {
      subprocess.stdout.on(
        "data",
        processStdout
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Wait for yt-dlp
    |--------------------------------------------------------------------------
    */

    await subprocess;

    /*
    |--------------------------------------------------------------------------
    | Flush remaining progress data
    |--------------------------------------------------------------------------
    */

    if (stderrBuffer.trim()) {
      parseProgressLine(
        stderrBuffer,
        job
      );
    }

    if (stdoutBuffer.trim()) {
      parseProgressLine(
        stdoutBuffer,
        job
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Make sure file exists
    |--------------------------------------------------------------------------
    */

    if (!fs.existsSync(outputFile)) {
      /*
      | yt-dlp kabhi filename/extension modify kar sakta hai.
      | Isliye output directory mein actual file find karte hain.
      */

      const files =
        fs.readdirSync(outputDir);

      const downloadedFile =
        files.find((file) => {
          const fullPath =
            path.join(
              outputDir,
              file
            );

          try {
            return (
              fs.statSync(fullPath).isFile()
            );
          } catch {
            return false;
          }
        });

      if (downloadedFile) {
        job.outputPath =
          path.join(
            outputDir,
            downloadedFile
          );

        job.filename =
          safeFilename(
            downloadedFile
          );
      }
    }

    /*
    |--------------------------------------------------------------------------
    | Final output path check
    |--------------------------------------------------------------------------
    */

    if (
      !job.outputPath ||
      !fs.existsSync(job.outputPath)
    ) {
      throw new Error(
        "Downloaded file was not created."
      );
    }

    /*
    |--------------------------------------------------------------------------
    | File stats
    |--------------------------------------------------------------------------
    */

    const stats =
      fs.statSync(
        job.outputPath
      );

    if (stats.size <= 0) {
      throw new Error(
        "Downloaded file is empty."
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Completed
    |--------------------------------------------------------------------------
    */

    job.status =
      "completed";

    job.progress = 100;

    job.downloadedBytes =
      stats.size;

    job.totalBytes =
      stats.size;

    job.speed = 0;

    job.eta =
      "00:00";

    job.completedAt =
      Date.now();

    updateJob(job);

    sendJobEvent(
      job,
      "completed"
    );

    console.log(
      `${platform} Download Completed`
    );

    console.log(
      "File:",
      job.outputPath
    );

    console.log(
      "Size:",
      stats.size,
      "bytes"
    );

  } catch (error) {
    console.error(
      `${platform} Download Error:`,
      error
    );

    job.status =
      "error";

    job.error =
      error.message ||
      "Unable to download media.";

    updateJob(job);

    sendJobEvent(
      job,
      "error"
    );

    /*
    |--------------------------------------------------------------------------
    | Cleanup failed job
    |--------------------------------------------------------------------------
    */

    if (
      outputDir &&
      fs.existsSync(outputDir)
    ) {
      try {
        fs.rmSync(
          outputDir,
          {
            recursive: true,
            force: true,
          }
        );

        job.outputDir =
          null;

        job.outputPath =
          null;

      } catch (cleanupError) {
        console.error(
          "Cleanup error:",
          cleanupError.message
        );
      }
    }
  }
}

/*
|--------------------------------------------------------------------------
| Backward Compatible YouTube Start
|--------------------------------------------------------------------------
*/

const startYouTubeDownload = async (
  req,
  res
) => {
  req.body = {
    ...req.body,
    platform: "youtube",
  };

  return startMediaDownload(
    req,
    res
  );
};

/*
|--------------------------------------------------------------------------
| Live Progress SSE
|--------------------------------------------------------------------------
*/

const streamDownloadProgress = (
  req,
  res
) => {
  const { jobId } =
    req.params;

  const job =
    downloadJobs.get(jobId);

  if (!job) {
    return res.status(404).json({
      success: false,
      message:
        "Download job not found.",
    });
  }

  res.setHeader(
    "Content-Type",
    "text/event-stream"
  );

  res.setHeader(
    "Cache-Control",
    "no-cache, no-transform"
  );

  res.setHeader(
    "Connection",
    "keep-alive"
  );

  res.setHeader(
    "X-Accel-Buffering",
    "no"
  );

  if (res.flushHeaders) {
    res.flushHeaders();
  }

  job.clients.add(res);

  /*
  |--------------------------------------------------------------------------
  | Initial state
  |--------------------------------------------------------------------------
  */

  const initialPayload =
    JSON.stringify({
      type: "progress",
      status: job.status,
      progress: job.progress,
      downloadedBytes:
        job.downloadedBytes,
      totalBytes:
        job.totalBytes,
      downloaded:
        formatBytes(
          job.downloadedBytes
        ),
      total:
        formatBytes(
          job.totalBytes
        ),
      speed: job.speed,
      speedText:
        formatBytes(job.speed) +
        "/s",
      eta: job.eta,
      filename:
        job.filename,
      platform:
        job.platform,
      error:
        job.error,
    });

  res.write(
    `data: ${initialPayload}\n\n`
  );

  /*
  |--------------------------------------------------------------------------
  | Heartbeat
  |--------------------------------------------------------------------------
  */

  const heartbeat =
    setInterval(() => {
      try {
        res.write(
          ": ping\n\n"
        );
      } catch {
        clearInterval(
          heartbeat
        );
      }
    }, 15000);

  req.on("close", () => {
    clearInterval(
      heartbeat
    );

    job.clients.delete(
      res
    );
  });
};

/*
|--------------------------------------------------------------------------
| Completed File
|--------------------------------------------------------------------------
*/

const downloadCompletedFile = (
  req,
  res
) => {
  const { jobId } =
    req.params;

  const job =
    downloadJobs.get(jobId);

  if (!job) {
    return res.status(404).json({
      success: false,
      message:
        "Download job not found.",
    });
  }

  if (
    job.status !==
    "completed"
  ) {
    return res.status(409).json({
      success: false,
      message:
        "Download is not completed yet.",
    });
  }

  if (
    !job.outputPath ||
    !fs.existsSync(
      job.outputPath
    )
  ) {
    return res.status(404).json({
      success: false,
      message:
        "Downloaded file is no longer available.",
    });
  }

  const stats =
    fs.statSync(
      job.outputPath
    );

  res.setHeader(
    "Content-Type",
    "video/mp4"
  );

  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${job.filename}"`
  );

  res.setHeader(
    "Content-Length",
    stats.size
  );

  const stream =
    fs.createReadStream(
      job.outputPath
    );

  stream.on(
    "error",
    (error) => {
      console.error(
        "Final file stream error:",
        error.message
      );

      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message:
            "Unable to download file.",
        });
      } else {
        res.destroy(error);
      }
    }
  );

  stream.on(
    "close",
    () => {
      setTimeout(() => {
        try {
          if (
            job.outputDir &&
            fs.existsSync(
              job.outputDir
            )
          ) {
            fs.rmSync(
              job.outputDir,
              {
                recursive: true,
                force: true,
              }
            );
          }

          downloadJobs.delete(
            jobId
          );
        } catch (error) {
          console.error(
            "Final cleanup error:",
            error.message
          );
        }
      }, 5000);
    }
  );

  stream.pipe(res);
};

/*
|--------------------------------------------------------------------------
| Generic Direct Media Download
|--------------------------------------------------------------------------
*/

const downloadMedia = async (
  req,
  res
) => {
  const {
    url,
    filename,
    formatId,
    platform,
  } = req.query;

  if (!url) {
    return res.status(400).json({
      success: false,
      message:
        "Media URL is required.",
    });
  }

  /*
  |--------------------------------------------------------------------------
  | New job system
  |--------------------------------------------------------------------------
  */

  if (formatId) {
    req.body = {
      url,
      formatId,
      filename,
      platform:
        platform || "youtube",
    };

    return startMediaDownload(
      req,
      res
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Direct media URL
  |--------------------------------------------------------------------------
  */

  let mediaUrl;

  try {
    mediaUrl =
      new URL(url);
  } catch {
    return res.status(400).json({
      success: false,
      message:
        "Invalid media URL.",
    });
  }

  if (
    !["http:", "https:"].includes(
      mediaUrl.protocol
    )
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Only HTTP and HTTPS media URLs are supported.",
    });
  }

  try {
    const response =
      await axios.get(
        mediaUrl.toString(),
        {
          responseType:
            "stream",
          timeout: 30000,
        }
      );

    const contentType =
      response.headers[
        "content-type"
      ] ||
      "application/octet-stream";

    const safeName =
      safeFilename(
        filename ||
          "downora-media"
      );

    res.setHeader(
      "Content-Type",
      contentType
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${safeName}"`
    );

    if (
      response.headers[
        "content-length"
      ]
    ) {
      res.setHeader(
        "Content-Length",
        response.headers[
          "content-length"
        ]
      );
    }

    response.data.on(
      "error",
      (error) => {
        console.error(
          "Media stream error:",
          error.message
        );

        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            message:
              "Media download failed.",
          });
        } else {
          res.destroy(error);
        }
      }
    );

    response.data.pipe(res);
  } catch (error) {
    console.error(
      "Direct Download Error:",
      error.message
    );

    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message:
          "Unable to download the media.",
      });
    }

    res.destroy(error);
  }
};

/*
|--------------------------------------------------------------------------
| Exports
|--------------------------------------------------------------------------
*/

module.exports = {
  downloadMedia,
  downloadYouTubeMedia:
    startYouTubeDownload,
  startYouTubeDownload,
  startMediaDownload,
  streamDownloadProgress,
  downloadCompletedFile,
};