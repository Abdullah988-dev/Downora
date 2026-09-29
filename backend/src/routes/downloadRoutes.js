const express = require("express");

const {
  downloadMedia,
  downloadYouTubeMedia,
  startYouTubeDownload,
  startMediaDownload,
  streamDownloadProgress,
  downloadCompletedFile,
} = require("../controllers/downloadController");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Start Generic Media Download
|--------------------------------------------------------------------------
*/

router.post(
  "/start",
  startMediaDownload
);

/*
|--------------------------------------------------------------------------
| Start YouTube Download
|--------------------------------------------------------------------------
*/

router.post(
  "/youtube",
  startYouTubeDownload
);

/*
|--------------------------------------------------------------------------
| Live Download Progress
|--------------------------------------------------------------------------
*/

router.get(
  "/progress/:jobId",
  streamDownloadProgress
);

/*
|--------------------------------------------------------------------------
| Download Completed File
|--------------------------------------------------------------------------
*/

router.get(
  "/file/:jobId",
  downloadCompletedFile
);

/*
|--------------------------------------------------------------------------
| Legacy Download Endpoint
|--------------------------------------------------------------------------
*/

router.get(
  "/",
  downloadMedia
);

module.exports = router;