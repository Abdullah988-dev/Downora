const getMediaInfo = async ({ platform, url }) => {
  switch (platform) {
    case "youtube":
      return {
        platform,
        url,
        title: null,
        thumbnail: null,
        duration: null,
        mediaType: "video",
        formats: [],
        status: "pending",
      };

    case "tiktok":
      return {
        platform,
        url,
        title: null,
        thumbnail: null,
        duration: null,
        mediaType: "video",
        formats: [],
        status: "pending",
      };

    case "facebook":
      return {
        platform,
        url,
        title: null,
        thumbnail: null,
        duration: null,
        mediaType: "video",
        formats: [],
        status: "pending",
      };

    case "instagram":
      return {
        platform,
        url,
        title: null,
        thumbnail: null,
        duration: null,
        mediaType: "unknown",
        formats: [],
        status: "pending",
      };

    case "x":
      return {
        platform,
        url,
        title: null,
        thumbnail: null,
        duration: null,
        mediaType: "video",
        formats: [],
        status: "pending",
      };

    default:
      throw new Error("Unsupported platform");
  }
};

module.exports = {
  getMediaInfo,
};