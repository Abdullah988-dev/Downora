import { LoaderCircle } from "lucide-react";

export default function LoadingState() {
  return (
    <div className="mx-auto mt-10 w-full max-w-3xl rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10">
        <LoaderCircle
          size={30}
          className="animate-spin text-blue-400"
        />
      </div>

      <h3 className="mt-5 text-xl font-bold text-white">
        Analyzing your link...
      </h3>

      <p className="mt-2 text-sm text-slate-500">
        Finding available media and download options
      </p>

      <div className="mx-auto mt-6 h-2 max-w-md overflow-hidden rounded-full bg-white/10">
        <div className="h-full w-2/3 animate-pulse rounded-full bg-blue-500" />
      </div>
    </div>
  );
}