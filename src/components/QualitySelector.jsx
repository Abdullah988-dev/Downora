import { Check, Download, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5001";

export default function QualitySelector({
  formats = [],
  videoUrl = "",
  platform = "youtube",
  title = "",
}) {
  const [activeFormatId, setActiveFormatId] = useState(null);
  const [progressData, setProgressData] = useState({});

  const eventSourceRef = useRef(null);
  const downloadTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }

      if (downloadTimerRef.current) {
        clearTimeout(downloadTimerRef.current);
        downloadTimerRef.current = null;
      }
    };
  }, []);

  const getFormatId = (option, index) => {
    const id = option?.formatId ?? option?.format_id ?? option?.id;

    if (id !== undefined && id !== null && String(id).trim() !== "") {
      return String(id);
    }

    return `${option?.quality || option?.label || "format"}-${index}`;
  };

  const formatBytes = (bytes) => {
    const value = Number(bytes || 0);

    if (!value || value < 0) {
      return "0 B";
    }

    const units = ["B", "KB", "MB", "GB", "TB"];

    const index = Math.min(
      Math.floor(Math.log(value) / Math.log(1024)),
      units.length - 1,
    );

    return `${(value / Math.pow(1024, index)).toFixed(
      index === 0 ? 0 : 2,
    )} ${units[index]}`;
  };

  const formatSpeed = (bytes) => {
    const value = Number(bytes || 0);

    if (!value) {
      return "0 MB/s";
    }

    return `${(value / (1024 * 1024)).toFixed(2)} MB/s`;
  };

  const cleanupProgressConnection = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    if (downloadTimerRef.current) {
      clearTimeout(downloadTimerRef.current);
      downloadTimerRef.current = null;
    }
  };

  const wait = (ms) => {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  };

  const downloadCompletedFile = async (
    jobId,
    filename = "downora-video.mp4",
    retries = 60,
  ) => {
    const fileUrl = `${API_BASE_URL}/api/download/file/${encodeURIComponent(jobId)}`;

    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const response = await fetch(fileUrl, {
          method: "GET",
          cache: "no-store",
        });

        if (response.ok) {
          const blob = await response.blob();

          const blobUrl = window.URL.createObjectURL(blob);

          const link = document.createElement("a");
          link.href = blobUrl;
          link.download = filename || "downora-video.mp4";

          document.body.appendChild(link);
          link.click();
          link.remove();

          window.URL.revokeObjectURL(blobUrl);

          return true;
        }

        if (response.status === 409) {
          await wait(1000);
          continue;
        }

        let errorMessage = `Download failed with status ${response.status}`;

        try {
          const errorData = await response.json();

          if (errorData?.message) {
            errorMessage = errorData.message;
          }
        } catch {
          // Ignore JSON parsing error.
        }

        throw new Error(errorMessage);
      } catch (error) {
        if (attempt === retries - 1) {
          throw error;
        }

        await wait(1000);
      }
    }

    throw new Error("Downloaded file was not ready.");
  };

  const handleDownload = async (option, index) => {
    if (!option) {
      alert("Invalid download format.");
      return;
    }

    const cleanVideoUrl = String(videoUrl || "").trim();

    if (!cleanVideoUrl) {
      alert("Media URL is missing.");
      return;
    }

    const formatId = getFormatId(option, index);

    if (!formatId) {
      alert("This format does not have a valid ID.");
      return;
    }

    if (activeFormatId !== null) {
      return;
    }

    const selectedPlatform = String(platform || "youtube").toLowerCase();

    const quality =
      option?.quality || option?.label || option?.resolution || `${formatId}p`;

    const safeQuality = String(quality).replace
    (/[^a-zA-Z0-9_-]/g,
       "_"
    );

    const platformLabel =
      {
        youtube: "YouTube",
        tiktok: "TikTok",
        instagram: "Instagram",
        facebook: "Facebook",
        x: "X",
      }[selectedPlatform] || selectedPlatform;

    const safeTitle =
      String(title || "Downora-Video")
        .replace(/[\\/:*?"<>|]/g, "")
        .trim()
        .slice(0, 60) || "Downora-Video";

    const filename =
      option?.filename ||
      `${safeTitle} - ${platformLabel} - ${safeQuality}.mp4`;

    setActiveFormatId(formatId);

    setProgressData((previous) => ({
      ...previous,
      [formatId]: {
        progress: 0,
        downloadedBytes: 0,
        totalBytes: 0,
        speed: 0,
        eta: null,
        status: "starting",
        filename,
        error: null,
        jobId: null,
      },
    }));

    cleanupProgressConnection();

    try {
      const response = await fetch(`${API_BASE_URL}/api/download/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: cleanVideoUrl,
          formatId: String(formatId),
          filename,
          platform: selectedPlatform,
        }),
      });

      let data = null;

      try {
        data = await response.json();
      } catch {
        throw new Error("Backend returned an invalid response.");
      }

      if (!response.ok || !data?.success || !data?.jobId) {
        throw new Error(data?.message || "Unable to start download.");
      }

      const jobId = data.jobId;

      setProgressData((previous) => ({
        ...previous,
        [formatId]: {
          ...previous[formatId],
          jobId,
          status: "starting",
        },
      }));

      const progressUrl = `${API_BASE_URL}/api/download/progress/${encodeURIComponent(
        jobId,
      )}`;

      const eventSource = new EventSource(progressUrl);

      eventSourceRef.current = eventSource;

      eventSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);

          const currentProgress = Math.max(
            0,
            Math.min(100, Number(payload?.progress || 0)),
          );

          const downloadedBytes = Number(payload?.downloadedBytes || 0);

          const totalBytes = Number(payload?.totalBytes || 0);

          const speed = Number(payload?.speed || 0);

          const status = payload?.status || "downloading";

          setProgressData((previous) => ({
            ...previous,
            [formatId]: {
              ...previous[formatId],
              progress: currentProgress,
              downloadedBytes,
              totalBytes,
              speed,
              eta: payload?.eta || null,
              status,
              filename: payload?.filename || filename,
              error: payload?.error || null,
              jobId,
            },
          }));

          if (payload?.type === "error" || status === "error") {
            cleanupProgressConnection();

            const errorMessage = payload?.error || "Download failed.";

            setProgressData((previous) => ({
              ...previous,
              [formatId]: {
                ...previous[formatId],
                status: "error",
                error: errorMessage,
              },
            }));

            setActiveFormatId(null);

            alert(errorMessage);

            return;
          }

          /*
          |----------------------------------------------------------------
          | IMPORTANT FIX
          |----------------------------------------------------------------
          |
          | Sirf backend ke asal "completed" signal par bharosa karo.
          | currentProgress >= 100 par NAHI, kyunki YouTube jaisi
          | platforms par download do stages mein hota hai: pehle
          | video stream, phir audio stream, phir ffmpeg merge.
          | yt-dlp video-only stream khatam hote hi "100%" print
          | kar deta hai, jabke audio abhi baaki hota hai aur
          | final MP4 abhi bana hi nahi hota. Pehle wala code isay
          | "completed" samajh kar file mangna shuru kar deta tha,
          | isliye baar baar 409 milta tha aur "Downloaded file was
          | not ready" wala error aata tha.
          |
          */

          if (payload?.type === "completed" || status === "completed") {
            cleanupProgressConnection();

            setProgressData((previous) => ({
              ...previous,
              [formatId]: {
                ...previous[formatId],
                progress: 100,
                downloadedBytes: downloadedBytes || totalBytes || 0,
                totalBytes: totalBytes || downloadedBytes || 0,
                speed: 0,
                eta: "00:00",
                status: "completed",
                filename: payload?.filename || filename,
                jobId,
              },
            }));

            downloadTimerRef.current = setTimeout(async () => {
              try {
                await downloadCompletedFile(
                  jobId,
                  payload?.filename || filename,
                );

                setActiveFormatId(null);
              } catch (error) {
                console.error("Final file download error:", error);

                setProgressData((previous) => ({
                  ...previous,
                  [formatId]: {
                    ...previous[formatId],
                    status: "error",
                    error:
                      error?.message || "Unable to download completed file.",
                  },
                }));

                setActiveFormatId(null);

                alert(error?.message || "Unable to download completed file.");
              }
            }, 500);
          }
        } catch (error) {
          console.error("Progress parsing error:", error);
        }
      };

      eventSource.onerror = () => {
        console.warn("Download progress connection interrupted.");

        if (eventSource.readyState === EventSource.CLOSED) {
          eventSource.close();

          if (eventSourceRef.current === eventSource) {
            eventSourceRef.current = null;
          }
        }
      };
    } catch (error) {
      console.error("Download error:", error);

      cleanupProgressConnection();

      const errorMessage = error?.message || "Unable to start download.";

      setProgressData((previous) => ({
        ...previous,
        [formatId]: {
          ...previous[formatId],
          status: "error",
          error: errorMessage,
        },
      }));

      setActiveFormatId(null);

      alert(errorMessage);
    }
  };

  if (!Array.isArray(formats) || formats.length === 0) {
    return (
      <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.025] p-5">
        <h3 className="font-semibold text-white">Download</h3>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          No downloadable formats are currently available for this media source.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 text-left">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-white">Choose Quality</h3>

        <span className="text-sm text-slate-500">
          {formats.length} option
          {formats.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="grid gap-3">
        {formats.map((option, index) => {
          const formatId = getFormatId(option, index);

          const quality =
            option?.quality ||
            option?.label ||
            option?.resolution ||
            "Available";

          const format = option?.format || option?.ext || "mp4";

          const isActive = activeFormatId === formatId;

          const current = progressData[formatId] || {};

          const progress = Math.max(
            0,
            Math.min(100, Number(current.progress || 0)),
          );

          const isCompleted = current.status === "completed";

          const isError = current.status === "error";

          return (
            <div
              key={formatId}
              className={`rounded-2xl border p-4 transition ${
                isActive
                  ? "border-blue-500/50 bg-blue-500/10"
                  : index === 0
                    ? "border-blue-500/30 bg-blue-500/[0.06]"
                    : "border-white/10 bg-white/[0.03] hover:border-white/20"
              }`}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-4">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                      isActive
                        ? "bg-blue-600 text-white"
                        : index === 0
                          ? "bg-blue-600 text-white"
                          : "bg-white/5 text-slate-400"
                    }`}
                  >
                    {isActive && !isCompleted ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : isCompleted ? (
                      <Check size={18} />
                    ) : index === 0 ? (
                      <Check size={18} />
                    ) : (
                      <span className="text-xs font-bold">
                        {String(format).toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="font-semibold text-white">{quality}</p>

                    <p className="text-xs text-slate-500">
                      {String(format).toUpperCase()}

                      {option?.hasAudio === true
                        ? " • With Audio"
                        : " • Video + Audio"}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDownload(option, index)}
                  disabled={activeFormatId !== null || !formatId || isCompleted}
                  className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isActive ? (
                    <>
                      {isCompleted ? (
                        <Check size={16} />
                      ) : (
                        <Loader2 size={16} className="animate-spin" />
                      )}

                      {isCompleted
                        ? "Completed"
                        : isError
                          ? "Retry"
                          : `${Math.round(progress)}%`}
                    </>
                  ) : (
                    <>
                      <Download size={16} />
                      Download
                    </>
                  )}
                </button>
              </div>

              {isActive && (
                <div className="mt-4 border-t border-white/10 pt-4">
                  <div className="mb-2 flex items-center justify-between text-xs">
                    <span className="text-slate-400">
                      {isCompleted
                        ? "Download completed"
                        : isError
                          ? "Download failed"
                          : current.status === "starting"
                            ? "Preparing download..."
                            : "Downloading..."}
                    </span>

                    <span className="font-semibold text-white">
                      {Math.round(progress)}%
                    </span>
                  </div>

                  <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-blue-500 transition-all duration-300"
                      style={{
                        width: `${progress}%`,
                      }}
                    />
                  </div>

                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                    <span>
                      {formatBytes(current.downloadedBytes)}

                      {Number(current.totalBytes || 0) > 0 &&
                        ` / ${formatBytes(current.totalBytes)}`}
                    </span>

                    <span>
                      {Number(current.speed || 0) > 0
                        ? formatSpeed(current.speed)
                        : "0 MB/s"}
                    </span>

                    {current.eta && !isCompleted && (
                      <span>ETA: {current.eta}</span>
                    )}
                  </div>

                  {isError && current.error && (
                    <div className="mt-3 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">
                      {current.error}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
