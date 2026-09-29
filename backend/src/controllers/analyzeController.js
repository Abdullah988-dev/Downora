const { getMediaInfo } = require("../services/mediaService");
const { getYouTubeInfo } = require("../services/youtubeService");
const { getTikTokInfo } = require("../services/tiktokService");
const { getInstagramInfo } = require("../services/instagramService");
const { getFacebookInfo } = require("../services/facebookService");
const { getXInfo } = require("../services/xService");

const SUPPORTED_PLATFORMS = {
  youtube: ["youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be"],

  tiktok: ["tiktok.com", "www.tiktok.com", "vm.tiktok.com"],

  facebook: ["facebook.com", "www.facebook.com", "m.facebook.com", "fb.watch"],

  instagram: ["instagram.com", "www.instagram.com"],

  x: ["x.com", "www.x.com", "twitter.com", "www.twitter.com"],
};

function detectPlatform(hostname) {
  const host = hostname.toLowerCase().replace(/^www\./, "");

  for (const [platform, domains] of Object.entries(SUPPORTED_PLATFORMS)) {
    const matched = domains.some((domain) => {
      const cleanDomain = domain.toLowerCase().replace(/^www\./, "");

      return host === cleanDomain || host.endsWith(`.${cleanDomain}`);
    });

    if (matched) {
      return platform;
    }
  }

  return null;
}

const analyzeUrl = async (req, res) => {
  try {
    const { url } = req.body;

    // --------------------------------------------------
    // Validate URL
    // --------------------------------------------------

    if (!url || typeof url !== "string") {
      return res.status(400).json({
        success: false,
        message: "URL is required.",
      });
    }

    const trimmedUrl = url.trim();

    let parsedUrl;

    try {
      parsedUrl = new URL(trimmedUrl);
    } catch {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid URL.",
      });
    }

    // --------------------------------------------------
    // Only HTTP / HTTPS
    // --------------------------------------------------

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return res.status(400).json({
        success: false,
        message: "Only HTTP and HTTPS URLs are supported.",
      });
    }

    // --------------------------------------------------
    // Detect platform
    // --------------------------------------------------

    const platform = detectPlatform(parsedUrl.hostname);

    if (!platform) {
      return res.status(400).json({
        success: false,
        message:
          "This platform is not supported yet. Supported platforms: YouTube, TikTok, Facebook, Instagram and X.",
      });
    }

    // --------------------------------------------------
    // YouTube
    // --------------------------------------------------

    if (platform === "youtube") {
      const mediaInfo = await getYouTubeInfo(trimmedUrl);

      return res.json({
        success: true,
        message: "URL analyzed successfully.",
        data: mediaInfo,
      });
    }

    // --------------------------------------------------
    // TikTok
    // --------------------------------------------------

    if (platform === "tiktok") {
      console.log("Analyzing TikTok URL:", trimmedUrl);

      const mediaInfo = await getTikTokInfo(trimmedUrl);

      return res.json({
        success: true,
        message: "TikTok URL analyzed successfully.",
        data: mediaInfo,
      });
    }
    // --------------------------------------------------
    // Instagram
    // -----

    if (platform === "instagram") {
      console.log("Analyzing Instagram URL:", trimmedUrl);

      const mediaInfo = await getInstagramInfo(trimmedUrl);

      return res.json({
        success: true,
        message: "Instagram URL analyzed successfully.",
        data: mediaInfo,
      });
    }

    // --------------------------------------------------
    // Facebook
    // -----

    // --------------------------------------------------
    // Facebook
    // --------------------------------------------------

    if (platform === "facebook") {
      console.log("Analyzing Facebook URL:", trimmedUrl);

      const mediaInfo = await getFacebookInfo(trimmedUrl);

      return res.json({
        success: true,
        message: "Facebook URL analyzed successfully.",
        data: mediaInfo,
      });
    }
    // --------------------------------------------------
// X (Twitter)
// --------------------------------------------------

if (platform === "x") {
  console.log("Analyzing X URL:", trimmedUrl);

  const mediaInfo = await getXInfo(trimmedUrl);

  return res.json({
    success: true,
    message: "X URL analyzed successfully.",
    data: mediaInfo,
  });
}

    // --------------------------------------------------
    // Other supported platforms
    // --------------------------------------------------

    return res.json({
      success: true,
      message: "URL detected successfully.",
      data: {
        platform,
        url: trimmedUrl,
        title: null,
        thumbnail: null,
        duration: null,
        formats: [],
        status: "pending",
      },
    });
  } catch (error) {
    console.error("Analyze URL Error:", error.message);

    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong while analyzing the URL.",
    });
  }
};

module.exports = {
  analyzeUrl,
};
