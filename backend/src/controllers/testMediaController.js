const getTestMedia = async (req, res) => {
  try {
    const formats = [
      {
        quality: "360p",
        format: "mp4",
        ext: "mp4",
        hasAudio: true,
        url: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
        filename: "downora-360p.mp4",
      },
      {
        quality: "720p",
        format: "mp4",
        ext: "mp4",
        hasAudio: true,
        url: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
        filename: "downora-720p.mp4",
      },
    ];

    return res.json({
      success: true,
      message: "Authorized test media loaded successfully.",
      data: {
        platform: "test",
        url: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
        title: "Downora Authorized Test Video",
        thumbnail: null,
        duration: "00:05",
        mediaType: "video",
        formats,
        status: "ready",
      },
    });
  } catch (error) {
    console.error("Test Media Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to load test media.",
    });
  }
};

module.exports = {
  getTestMedia,
};