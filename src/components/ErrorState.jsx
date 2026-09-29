import { AlertCircle, RefreshCw } from "lucide-react";

export default function ErrorState({ message, onRetry }) {
  return (
    <div className="mx-auto mt-10 w-full max-w-3xl rounded-3xl border border-red-500/20 bg-red-500/[0.05] p-8 text-center backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10">
        <AlertCircle size={30} className="text-red-400" />
      </div>

      <h3 className="mt-5 text-xl font-bold text-white">
        Unable to analyze link
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
        {message || "Please check your URL and try again."}
      </p>

      <button
        onClick={onRetry}
        className="mx-auto mt-6 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
      >
        <RefreshCw size={16} />
        Try Again
      </button>
    </div>
  );
}