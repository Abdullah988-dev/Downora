const path = require("path");
const fs = require("fs");

function getAuthorizedTestFormats() {
  const filePath = path.join(
    process.cwd(),
    "test-media",
    "sample.mp4"
  );

  if (!fs.existsSync(filePath)) {
    return [];
  }

  const baseUrl =
    process.env.BACKEND_URL || "http://localhost:5001";

  return [
    {
      quality: "Original",
      format: "mp4",
      url: `${baseUrl}/api/test-media/sample.mp4`,
      hasAudio: true,
      filename: "downora-sample.mp4",
    },
  ];
}

function normalizeFormats(formats = []) {
  if (!Array.isArray(formats)) {
    return [];
  }

  return formats
    .filter((item) => item && item.url)
    .map((item) => ({
      quality: item.quality || "Original",
      format: item.format || "mp4",
      url: item.url,
      hasAudio: item.hasAudio === true,
      filename: item.filename || "downora-media.mp4",
    }));
}

module.exports = {
  getAuthorizedTestFormats,
  normalizeFormats,
};