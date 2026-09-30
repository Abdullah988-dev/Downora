const axios = require("axios");
const { create } = require("youtube-dl-exec");
const ytdlp = create(process.env.YTDLP_BINARY || undefined);

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

      const pathParts = parsedUrl.pathname
        .split("/")
        .filter(Boolean);

      if (
        ["shorts", "embed", "live"].includes(pathParts[0])
      ) {
        return pathParts[1] || null;
      }
    }

    return null;
  } catch {
    return null;
  }
}

function parseDuration(isoDuration) {
  if (!isoDuration) {
    return null;
  }

  const match = isoDuration.match(
    /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/
  );

  if (!match) {
    return isoDuration;
  }

  const hours = Number(match[1] || 0);
  const minutes = Number(match[2] || 0);
  const seconds = Number(match[3] || 0);

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(
      2,
      "0"
    )}:${String(seconds).padStart(2, "0")}`;
  }

  return `${minutes}:${String(seconds).padStart(
    2,
    "0"
  )}`;
}

/*
|--------------------------------------------------------------------------
| Get YouTube formats
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

async function getYouTubeFormats(url) {
  const info = await ytdlp(url, {
    dumpSingleJson: true,
    noWarnings: true,
    noCheckCertificates: true,
    noPlaylist: true,
  });

  const formats = Array.isArray(info.formats)
    ? info.formats
    : [];

  /*
   * We need video formats.
   *
   * Prefer MP4/H.264 video because it gives the best
   * compatibility with normal MP4 players.
   */

  const videoFormats = formats.filter((item) => {
    if (!item) {
      return false;
    }

    const hasVideo =
      item.vcodec &&
      item.vcodec !== "none";

    const ext = String(item.ext || "").toLowerCase();

    const height = Number(item.height || 0);

    if (!hasVideo || !height) {
      return false;
    }

    return (
      ["mp4", "webm"].includes(ext)
    );
  });

  /*
   * Quality map.
   *
   * One format per resolution.
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
     *
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

    const itemIsH264 =
      String(item.vcodec || "")
        .toLowerCase()
        .includes("avc1");

    const existingIsH264 =
      String(existing.vcodec || "")
        .toLowerCase()
        .includes("avc1");

    if (
      itemIsH264 &&
      !existingIsH264
    ) {
      qualityMap.set(quality, item);
      continue;
    }

    if (
      Number(item.tbr || 0) >
      Number(existing.tbr || 0)
    ) {
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
       * The actual download will contain audio.
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

  result.sort((a, b) => {
    return (
      Number(b.height || 0) -
      Number(a.height || 0)
    );
  });

  return result;
}

/*
|--------------------------------------------------------------------------
| YouTube information
|--------------------------------------------------------------------------
*/

async function getYouTubeInfo(url) {
  const videoId = extractYouTubeVideoId(url);

  if (!videoId) {
    throw new Error(
      "Invalid YouTube video URL."
    );
  }

  if (!process.env.YOUTUBE_API_KEY) {
    throw new Error(
      "YOUTUBE_API_KEY is not configured."
    );
  }

  /*
   * YouTube Data API
   *
   * Used for title, thumbnail and duration.
   */

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

  const video =
    response.data.items?.[0];

  if (!video) {
    throw new Error(
      "YouTube video was not found."
    );
  }

  /*
   * yt-dlp formats
   */

  let formats = [];

  try {
    formats = await getYouTubeFormats(url);
  } catch (error) {
    console.error(
      "YouTube format extraction error:",
      error.message
    );
  }

  return {
    platform: "youtube",

    url,

    videoId,

    title:
      video.snippet?.title ||
      null,

    thumbnail:
      video.snippet?.thumbnails?.high?.url ||
      video.snippet?.thumbnails?.medium?.url ||
      video.snippet?.thumbnails?.default?.url ||
      null,

    duration:
      parseDuration(
        video.contentDetails?.duration
      ),

    mediaType: "video",

    formats,

    status:
      formats.length > 0
        ? "ready"
        : "metadata-only",
  };
}

module.exports = {
  getYouTubeInfo,
  getYouTubeFormats,
  extractYouTubeVideoId,
};