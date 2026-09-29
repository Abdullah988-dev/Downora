import { Clock, ExternalLink, Play } from "lucide-react";
import QualitySelector from "./QualitySelector";

export default function MediaPreview({ mediaData }) {
  if (!mediaData) return null;

  const {
    platform,
    url,
    title,
    thumbnail,
    duration,
    formats = [],
  } = mediaData;

  const isYouTube = platform?.toLowerCase() === "youtube";
  const hasFormats = Array.isArray(formats) && formats.length > 0;

  return (
    <section className="mx-auto mt-12 w-full max-w-3xl text-left">
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/70 shadow-2xl shadow-black/30 backdrop-blur-xl">

        {/* Header */}
        <div className="border-b border-white/10 px-5 py-4 sm:px-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Media Preview
              </p>

              <h3 className="mt-1 text-sm font-semibold text-white">
                Media detected successfully
              </h3>
            </div>

            <span className="rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1 text-xs font-medium text-green-400">
              Ready
            </span>
          </div>
        </div>

        {/* Main */}
        <div className="p-4 sm:p-6">

          {/* Thumbnail + Information */}
          <div className="flex flex-col gap-6 sm:flex-row">

            {/* Thumbnail */}
            <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-slate-800 sm:w-64 sm:shrink-0">
              {thumbnail ? (
                <img
                  src={thumbnail}
                  alt={title || "Video preview"}
                  className="h-full w-full object-cover"
                  loading="lazy"
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-slate-500">
                  No preview available
                </div>
              )}

              {thumbnail && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-slate-900 shadow-xl">
                    <Play size={20} fill="currentColor" />
                  </div>
                </div>
              )}
            </div>

            {/* Information */}
            <div className="flex min-w-0 flex-1 flex-col justify-center">

              {/* Platform + Duration */}
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-medium capitalize text-blue-400">
                  {platform || "Media"}
                </span>

                {duration && (
                  <span className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-400">
                    <Clock size={13} />
                    {duration}
                  </span>
                )}
              </div>

              {/* Title */}
              <h2 className="line-clamp-3 text-xl font-bold leading-7 text-white">
                {title || "Untitled media"}
              </h2>

              {/* Status */}
              <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
                <span className="h-2 w-2 rounded-full bg-green-400" />
                Media information loaded successfully
              </div>
            </div>
          </div>

          {/* Source buttons */}
          <div className="mt-6 grid gap-3 sm:grid-cols-2">

            {isYouTube && url && (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-3.5 text-sm font-semibold text-red-400 transition hover:border-red-500/40 hover:bg-red-500/15"
              >
                <span className="text-xs font-bold">YT</span>
                Open on YouTube
                <ExternalLink size={15} />
              </a>
            )}

            {url && (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3.5 text-sm font-semibold text-slate-300 transition hover:border-white/20 hover:bg-white/[0.07] ${
                  isYouTube ? "" : "sm:col-span-2"
                }`}
              >
                <ExternalLink size={17} />
                Open Source
              </a>
            )}
          </div>

          {/* REAL DOWNLOAD OPTIONS */}
          {hasFormats && (
            <div className="mt-6 border-t border-white/10 pt-6">
              <QualitySelector
                formats={formats}
                videoUrl={url}
                platform={platform}
                title={title}
              />
            </div>
          )}

          {/* No authorized formats */}
          {!hasFormats && (
            <div className="mt-6 rounded-2xl border border-yellow-500/10 bg-yellow-500/[0.03] px-5 py-5">
              <div className="text-center">
                <p className="font-semibold text-slate-300">
                  Download options are not available yet
                </p>

                <p className="mt-2 text-xs leading-5 text-slate-500">
                  The media information was loaded successfully, but the
                  backend has not provided an authorized downloadable format
                  for this media.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}