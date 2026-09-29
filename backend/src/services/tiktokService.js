const ytdlp = require("youtube-dl-exec");

/**
 * Get TikTok media information and downloadable formats.
 *
 * yt-dlp handles TikTok extraction.
 */
async function getTikTokInfo(url) {
  if (!url) {
    throw new Error("TikTok URL is required.");
  }

  /*
  |--------------------------------------------------------------------------
  | Reject TikTok photo/slideshow posts
  |--------------------------------------------------------------------------
  |
  | yt-dlp only supports TikTok videos, not photo/slideshow posts
  | (URLs containing /photo/). We reject these early with a clear
  | message instead of letting yt-dlp fail with "Unsupported URL".
  |
  */

  if (/\/photo\//i.test(url)) {
    throw new Error(
      "This is a TikTok photo/slideshow post, not a video. Photo posts are not supported yet — please paste a TikTok video link."
    );
  }

  const info = await ytdlp(url, {
    dumpSingleJson: true,
    noWarnings: true,
    noCheckCertificates: true,
    noPlaylist: true,
  });

  if (!info) {
    throw new Error("Unable to retrieve TikTok media information.");
  }

  const formats = Array.isArray(info.formats) ? info.formats : [];

  const resultFormats = [];

  // Prefer formats that contain video.
  for (const item of formats) {
    if (!item || !item.url) continue;

    const hasVideo =
      item.vcodec &&
      item.vcodec !== "none";

    if (!hasVideo) continue;

    const height = Number(item.height || 0);

    resultFormats.push({
      quality: height > 0 ? `${height}p` : "Available",
      format: item.ext || "mp4",
      ext: item.ext || "mp4",
      formatId: item.format_id || null,
      url: item.url,
      width: item.width || null,
      height: item.height || null,
      fps: item.fps || null,
      hasAudio:
        item.acodec &&
        item.acodec !== "none",
      filename: `downora-tiktok-${height > 0 ? height + "p" : "video"}.mp4`,
    });
  }

  /**
   * Remove duplicate quality entries.
   */
  const qualityMap = new Map();

  for (const item of resultFormats) {
    const key = item.quality;

    if (!qualityMap.has(key)) {
      qualityMap.set(key, item);
    }
  }

  const finalFormats = Array.from(
    qualityMap.values()
  );

  /**
   * Highest quality first.
   */
  finalFormats.sort((a, b) => {
    return (
      Number(b.height || 0) -
      Number(a.height || 0)
    );
  });

  return {
    platform: "tiktok",
    url,
    videoId: info.id || null,

    title:
      info.title ||
      info.description ||
      "TikTok Video",

    thumbnail:
      info.thumbnail ||
      null,

    duration:
      info.duration
        ? formatDuration(info.duration)
        : null,

    mediaType: "video",

    formats: finalFormats,

    status:
      finalFormats.length > 0
        ? "ready"
        : "metadata-only",
  };
}

/**
 * Convert seconds into MM:SS / HH:MM:SS.
 */
function formatDuration(seconds) {
  const totalSeconds = Math.floor(
    Number(seconds) || 0
  );

  const hours = Math.floor(
    totalSeconds / 3600
  );

  const minutes = Math.floor(
    (totalSeconds % 3600) / 60
  );

  const remainingSeconds =
    totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(
      2,
      "0"
    )}:${String(remainingSeconds).padStart(
      2,
      "0"
    )}`;
  }

  return `${minutes}:${String(
    remainingSeconds
  ).padStart(2, "0")}`;
}

module.exports = {
  getTikTokInfo,
};