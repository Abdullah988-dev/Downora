const ytdlp = require("youtube-dl-exec");

async function getInstagramInfo(url) {
  if (!url) {
    throw new Error("Instagram URL is required.");
  }

  const info = await ytdlp(url, {
    dumpSingleJson: true,
    noWarnings: true,
    noCheckCertificates: true,
    noPlaylist: true,
  });

  if (!info) {
    throw new Error("Unable to retrieve Instagram media information.");
  }

  const formats = Array.isArray(info.formats) ? info.formats : [];

  const resultFormats = [];

  for (const item of formats) {
    if (!item || !item.url) continue;

    const hasVideo = item.vcodec && item.vcodec !== "none";
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
      hasAudio: item.acodec && item.acodec !== "none",
      filename: `downora-instagram-${height > 0 ? height + "p" : "video"}.mp4`,
    });
  }

  const qualityMap = new Map();
  for (const item of resultFormats) {
    if (!qualityMap.has(item.quality)) {
      qualityMap.set(item.quality, item);
    }
  }

  const finalFormats = Array.from(qualityMap.values());

  finalFormats.sort((a, b) => Number(b.height || 0) - Number(a.height || 0));

  return {
    platform: "instagram",
    url,
    videoId: info.id || null,
    title: info.title || info.description || "Instagram Video",
    thumbnail: info.thumbnail || null,
    duration: info.duration ? formatDuration(info.duration) : null,
    mediaType: "video",
    formats: finalFormats,
    status: finalFormats.length > 0 ? "ready" : "metadata-only",
  };
}

function formatDuration(seconds) {
  const totalSeconds = Math.floor(Number(seconds) || 0);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const remainingSeconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  }

  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

module.exports = {
  getInstagramInfo,
};