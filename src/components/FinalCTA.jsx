import { ArrowDown, Sparkles } from "lucide-react";

export default function FinalCTA() {
  return (
    <section className="relative overflow-hidden py-24">
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/15 blur-[120px]" />
        <div className="absolute left-1/4 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-purple-600/10 blur-[100px]" />
      </div>

      <div className="mx-auto max-w-5xl px-6">
        <div className="relative overflow-hidden rounded-[2rem] border border-blue-400/20 bg-gradient-to-br from-blue-600/10 via-slate-900/80 to-purple-600/10 px-6 py-16 text-center shadow-2xl shadow-blue-950/20 sm:px-12 lg:px-20">
          
          <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-purple-500/10 blur-3xl" />

          <div className="relative">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-2 text-sm text-blue-300">
              <Sparkles size={15} />
              Ready when you are
            </div>

            <h2 className="mx-auto max-w-3xl text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
              Your media.
              <span className="block bg-gradient-to-r from-blue-400 via-cyan-300 to-purple-400 bg-clip-text text-transparent">
                Your choice.
              </span>
            </h2>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
              Paste your link and experience a cleaner, simpler way to
              download supported media.
            </p>

            <a
              href="#downloader"
              className="mx-auto mt-9 inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-7 py-4 font-semibold text-white shadow-lg shadow-blue-600/20 transition duration-300 hover:-translate-y-1 hover:bg-blue-500 hover:shadow-blue-600/30"
            >
              Start Downloading
              <ArrowDown size={19} />
            </a>

            <p className="mt-5 text-xs text-slate-600">
              Fast • Simple • Responsive
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}