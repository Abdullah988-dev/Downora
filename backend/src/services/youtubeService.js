const axios = require("axios");
const fs = require("fs");
const { create } = require("youtube-dl-exec");

const ytdlp = create(process.env.YTDLP_BINARY || undefined);

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

function extractYouTubeVideoId(url) {
  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname.toLowerCase();

    if (hostname === "youtu.be") {
      return parsedUrl.pathname.split("/").filter(Boolean)[0] || null;
    }

    if (
      hostname === "youtube.com" ||
      hostname === "www.youtube.com" ||
      hostname === "m.youtube.com"
    ) {
      const watchId = parsedUrl.searchParams.get("v");

      if (watchId) {
        return watchId;
      }

      const pathParts = parsedUrl.pathname.split("/").filter(Boolean);

      if (["shorts", "embed", "live"].includes(pathParts[0])) {
        return pathParts[1] || null;
      }
    }

    return null;
  } catch {
    return null;
  }
}

function formatSeconds(totalSeconds) {
  const total = Number(totalSeconds || 0);

  if (!total) {
    return null;
  }

  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = Math.floor(total % 60);

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(
      seconds
    ).padStart(2, "0")}`;
  }

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function parseDuration(isoDuration) {
  if (!isoDuration) {
    return null;
  }

  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);

  if (!match) {
    return isoDuration;
  }

  const hours = Number(match[1] || 0);
  const minutes = Number(match[2] || 0);
  const seconds = Number(match[3] || 0);

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(
      seconds
    ).padStart(2, "0")}`;
  }

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

/*
|--------------------------------------------------------------------------
| yt-dlp options
|--------------------------------------------------------------------------
|
| Optional environment variables (all optional):
|
| YTDLP_BINARY       Path to the yt-dlp binary (example: ./yt-dlp)
| YTDLP_COOKIES_PATH Path to a cookies.txt file (helps with bot checks)
| YTDLP_YT_CLIENT    YouTube player client(s), example: "web,tv"
| YTDLP_PROXY        Proxy URL, example: http://user:pass@host:port
|
*/

function buildYtdlpFlags() {
  const flags = {
    dumpSingleJson: true,
    noWarnings: true,
    noCheckCertificates: true,
    noPlaylist: true,
    socketTimeout: 20,
  };

  const cookiesPath = process.env.YTDLP_COOKIES_PATH;

  if (cookiesPath) {
    if (fs.existsSync(cookiesPath)) {
      flags.cookies = cookiesPath;
    } else {
      console.warn(
        `YTDLP_COOKIES_PATH is set but file was not found: ${cookiesPath}`
      );
    }
  }

  if (process.env.YTDLP_YT_CLIENT) {
    flags.extractorArgs = `youtube:player_client=${process.env.YTDLP_YT_CLIENT}`;
  }

  if (process.env.YTDLP_PROXY) {
    flags.proxy = process.env.YTDLP_PROXY;
  }

  return flags;
}

/*
 * Turns a raw yt-dlp error into a short code that is easy to
 * understand in the logs and in the API response.
 */

function classifyYtdlpError(error) {
  const text = `${error?.stderr || ""} ${error?.message || ""}`.toLowerCase();

  if (
    text.includes("enoent") ||
    text.includes("not found") ||
    text.includes("no such file")
  ) {
    return "YTDLP_NOT_FOUND";
  }

  if (
    text.includes("sign in to confirm") ||
    text.includes("not a bot") ||
    text.includes("confirm you")
  ) {
    return "YOUTUBE_BOT_CHECK";
  }

  if (text.includes("python")) {
    return "PYTHON_MISSING";
  }

  if (
    text.includes("private video") ||
    text.includes("video unavailable") ||
    text.includes("this video is not available")
  ) {
    return "VIDEO_UNAVAILABLE";
  }

  if (text.includes("timed out") || text.includes("timeout")) {
    return "YTDLP_TIMEOUT";
  }

  return "YTDLP_UNKNOWN_ERROR";
}

/*
|--------------------------------------------------------------------------
| Fetch yt-dlp info (never throws)
|--------------------------------------------------------------------------
*/

async function fetchYtdlpInfo(url) {
  try {
    const info = await ytdlp(url, buildYtdlpFlags());

    return { info, errorCode: null };
  } catch (error) {
    const errorCode = classifyYtdlpError(error);

    console.error(
      `YouTube format extraction error [${errorCode}]:`,
      error?.stderr || error?.message || error
    );

    return { info: null, errorCode };
  }
}

/*
|--------------------------------------------------------------------------
| Fetch metadata from YouTube Data API (never throws)
|--------------------------------------------------------------------------
*/

async function fetchApiVideo(videoId) {
  if (!process.env.YOUTUBE_API_KEY) {
    console.warn("YOUTUBE_API_KEY is not configured. Using yt-dlp metadata.");
    return null;
  }

  try {
    const response = await axios.get(
      "https://www.googleapis.com/youtube/v3/videos",
      {
        params: {
          part: "snippet,contentDetails",
          id: videoId,
          key: process.env.YOUTUBE_API_KEY,
        },
        timeout: 10000,
      }
    );

    return response.data.items?.[0] || null;
  } catch (error) {
    console.error(
      "YouTube Data API error:",
      error?.response?.data?.error?.message || error.message
    );

    return null;
  }
}

/*
|--------------------------------------------------------------------------
| Build formats from yt-dlp info
|--------------------------------------------------------------------------
|
| We don't send YouTube's temporary direct media URLs to the frontend.
|
| Instead we return:
| - quality
| - formatId
| - height
| - extension
|
| The actual download is performed by yt-dlp on the backend.
|
*/

function buildFormatsFromInfo(info) {
  const formats = Array.isArray(info?.formats) ? info.formats : [];

  /*
   * We need video formats.
   */

  const videoFormats = formats.filter((item) => {
    if (!item) {
      return false;
    }

    const hasVideo = item.vcodec && item.vcodec !== "none";
    const ext = String(item.ext || "").toLowerCase();
    const height = Number(item.height || 0);

    if (!hasVideo || !height) {
      return false;
    }

    return ["mp4", "webm"].includes(ext);
  });

  /*
   * Quality map: one format per resolution.
   */

  const qualityMap = new Map();

  for (const item of videoFormats) {
    const height = Number(item.height || 0);

    if (!height) {
      continue;
    }

    const quality = `${height}p`;
    const existing = qualityMap.get(quality);

    if (!existing) {
      qualityMap.set(quality, item);
      continue;
    }

    /*
     * Prefer:
     * 1. MP4
     * 2. H264
     * 3. Higher bitrate
     */

    const itemIsMp4 = item.ext === "mp4";
    const existingIsMp4 = existing.ext === "mp4";

    if (itemIsMp4 && !existingIsMp4) {
      qualityMap.set(quality, item);
      continue;
    }

    if (!itemIsMp4 && existingIsMp4) {
      continue;
    }

    const itemIsH264 = String(item.vcodec || "")
      .toLowerCase()
      .includes("avc1");

    const existingIsH264 = String(existing.vcodec || "")
      .toLowerCase()
      .includes("avc1");

    if (itemIsH264 && !existingIsH264) {
      qualityMap.set(quality, item);
      continue;
    }

    if (!itemIsH264 && existingIsH264) {
      continue;
    }

    if (Number(item.tbr || 0) > Number(existing.tbr || 0)) {
      qualityMap.set(quality, item);
    }
  }

  const result = [];

  for (const [quality, item] of qualityMap.entries()) {
    result.push({
      quality,

      /*
       * Always output MP4 from our downloader.
       */

      format: "mp4",
      ext: "mp4",

      /*
       * The final download will contain audio
       * (audio is merged during download).
       */

      hasAudio: true,

      /*
       * IMPORTANT:
       * Do NOT send the temporary YouTube URL.
       */

      url: null,

      /*
       * Backend uses this format ID.
       */

      formatId: item.format_id || null,

      width: item.width || null,
      height: item.height || null,
      fps: item.fps || null,

      videoCodec: item.vcodec || null,
      audioCodec: null,

      bitrate: item.tbr || null,

      filename: `downora-${quality}.mp4`,
    });
  }

  /*
   * Highest quality first.
   */

  result.sort((a, b) => Number(b.height || 0) - Number(a.height || 0));

  return result;
}

/*
 * Public helper (used by other files).
 * Throws if yt-dlp fails, so callers can handle it.
 */

async function getYouTubeFormats(url) {
  const { info, errorCode } = await fetchYtdlpInfo(url);

  if (!info) {
    throw new Error(errorCode || "YTDLP_UNKNOWN_ERROR");
  }

  return buildFormatsFromInfo(info);
}

/*
|--------------------------------------------------------------------------
| YouTube information
|--------------------------------------------------------------------------
*/

async function getYouTubeInfo(url) {
  const videoId = extractYouTubeVideoId(url);

  if (!videoId) {
    throw new Error("Invalid YouTube video URL.");
  }

  /*
   * Run both requests at the same time.
   *
   * - YouTube Data API  -> title, thumbnail, duration
   * - yt-dlp            -> formats (and fallback metadata)
   */

  const [apiVideo, ytdlpResult] = await Promise.all([
    fetchApiVideo(videoId),
    fetchYtdlpInfo(url),
  ]);

  const ytdlpInfo = ytdlpResult.info;

  if (!apiVideo && !ytdlpInfo) {
    throw new Error("YouTube video was not found or could not be read.");
  }

  const formats = ytdlpInfo ? buildFormatsFromInfo(ytdlpInfo) : [];

  const title = apiVideo?.snippet?.title || ytdlpInfo?.title || null;

  const thumbnail =
    apiVideo?.snippet?.thumbnails?.high?.url ||
    apiVideo?.snippet?.thumbnails?.medium?.url ||
    apiVideo?.snippet?.thumbnails?.default?.url ||
    ytdlpInfo?.thumbnail ||
    null;

  const duration =
    parseDuration(apiVideo?.contentDetails?.duration) ||
    formatSeconds(ytdlpInfo?.duration);

  /*
   * If yt-dlp worked but no usable video format was found,
   * report that clearly instead of a generic error.
   */

  let formatsError = null;

  if (formats.length === 0) {
    formatsError = ytdlpResult.errorCode || "NO_USABLE_FORMATS";
  }

  return {
    platform: "youtube",

    url,

    videoId,

    title,

    thumbnail,

    duration,

    mediaType: "video",

    formats,

    status: formats.length > 0 ? "ready" : "metadata-only",

    /*
     * Short reason code (for debugging). null when formats exist.
     */

    formatsError,
  };
}

module.exports = {
  getYouTubeInfo,
  getYouTubeFormats,
  extractYouTubeVideoId,
};