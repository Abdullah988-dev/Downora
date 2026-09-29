
import { ArrowDown, Link, Sparkles } from "lucide-react";
import { useState } from "react";

import MediaPreview from "./MediaPreview";
import LoadingState from "./LoadingState";
import ErrorState from "./ErrorState";
import ImageResult from "./ImageResult";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5001";

export default function Hero() {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState("idle");
  const [mediaData, setMediaData] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  /*
   * Normal URL analysis
   */
  const handleAnalyze = async () => {
    const trimmedUrl = url.trim();

    if (!trimmedUrl) {
      setErrorMessage("Please paste a URL first.");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setMediaData(null);
    setErrorMessage("");

    try {
      const response = await fetch(`${API_URL}/api/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: trimmedUrl,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to analyze this URL."
        );
      }

      setMediaData(data.data);

      const lowerUrl = trimmedUrl.toLowerCase();

      const isImage =
        lowerUrl.includes(".jpg") ||
        lowerUrl.includes(".jpeg") ||
        lowerUrl.includes(".png") ||
        lowerUrl.includes(".webp") ||
        lowerUrl.includes(".gif");

      if (isImage) {
        setStatus("image");
      } else {
        setStatus("success");
      }
    } catch (error) {
      console.error("Analyze error:", error);

      setErrorMessage(
        error.message ||
          "Unable to connect to Downora backend."
      );

      setStatus("error");
    }
  };

  /*
   * Authorized test media
   * Used to verify the complete download system.
   */
  const handleTestDownload = async () => {
    setStatus("loading");
    setMediaData(null);
    setErrorMessage("");

    try {
      const response = await fetch(
        `${API_URL}/api/test-media`
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to load test media."
        );
      }

      setMediaData(data.data);
      setStatus("success");
    } catch (error) {
      console.error("Test media error:", error);

      setErrorMessage(
        error.message ||
          "Unable to load authorized test media."
      );

      setStatus("error");
    }
  };

  /*
   * Reset downloader
   */
  const resetDownloader = () => {
    setStatus("idle");
    setUrl("");
    setMediaData(null);
    setErrorMessage("");
  };

  return (
    <section className="relative min-h-screen overflow-hidden pt-20">

      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-20 h-96 w-96 -translate-x-1/2 rounded-full bg-blue-600/20 blur-[120px]" />

        <div className="absolute bottom-0 left-10 h-72 w-72 rounded-full bg-purple-600/10 blur-[100px]" />

        <div className="absolute right-10 top-1/3 h-64 w-64 rounded-full bg-cyan-500/10 blur-[110px]" />
      </div>

      {/* Main Content */}
      <div className="mx-auto w-full max-w-5xl px-6 py-20 text-center">

        {/* Badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-2 text-sm text-blue-300">
          <Sparkles size={16} />
          Fast • Simple • Powerful
        </div>

        {/* Heading */}
        <h1 className="mx-auto max-w-4xl text-5xl font-black leading-tight tracking-tight sm:text-6xl lg:text-7xl">
          Download Media

          <span className="block bg-gradient-to-r from-blue-400 via-cyan-300 to-purple-400 bg-clip-text text-transparent">
            Your Way.
          </span>
        </h1>

        {/* Description */}
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-400">
          Paste a supported public media link, analyze the
          available information, choose an available option,
          and continue with the download.
        </p>

        {/* Downloader */}
        <div
          id="downloader"
          className="mx-auto mt-10 max-w-3xl rounded-3xl border border-white/10 bg-white/[0.04] p-3 shadow-2xl shadow-black/30 backdrop-blur-xl"
        >
          <div className="flex flex-col gap-3 sm:flex-row">

            {/* URL Input */}
            <div className="flex flex-1 items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/80 px-5 py-4">
              <Link
                className="shrink-0 text-slate-500"
                size={20}
              />

              <input
                type="text"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);

                  if (status === "error") {
                    setStatus("idle");
                    setErrorMessage("");
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAnalyze();
                  }
                }}
                placeholder="Paste your video or image URL..."
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
              />
            </div>

            {/* Analyze Button */}
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={
                !url.trim() || status === "loading"
              }
              className="flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-7 py-4 font-semibold transition hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-600/30 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ArrowDown size={20} />

              {status === "loading"
                ? "Analyzing..."
                : "Analyze"}
            </button>
          </div>

          {/* Authorized Test Button */}
          <div className="mt-3">
            <button
              type="button"
              onClick={handleTestDownload}
              disabled={status === "loading"}
              className="w-full rounded-2xl border border-green-500/20 bg-green-500/10 px-5 py-3 text-sm font-semibold text-green-400 transition hover:border-green-500/40 hover:bg-green-500/15 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {status === "loading"
                ? "Loading Test Media..."
                : "Test Download System"}
            </button>
          </div>
        </div>

        {/* Supported Platforms */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-sm text-slate-500">
          <span>Supports:</span>

          {[
            "YouTube",
            "TikTok",
            "Facebook",
            "Instagram",
            "X",
          ].map((platform) => (
            <span
              key={platform}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1"
            >
              {platform}
            </span>
          ))}
        </div>

        {/* Loading */}
        {status === "loading" && <LoadingState />}

        {/* Success */}
        {status === "success" && mediaData && (
          <MediaPreview mediaData={mediaData} />
        )}

        {/* Image */}
        {status === "image" && (
          <ImageResult mediaData={mediaData} />
        )}

        {/* Error */}
        {status === "error" && (
          <ErrorState
            message={
              errorMessage ||
              "This platform or URL format is not supported."
            }
            onRetry={resetDownloader}
          />
        )}
      </div>
    </section>
  );
}
