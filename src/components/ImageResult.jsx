import { Download, Image as ImageIcon } from "lucide-react";

const formats = ["JPG", "PNG", "WEBP"];

export default function ImageResult() {
  return (
    <section className="mx-auto mt-10 w-full max-w-3xl">
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/70 p-4 shadow-2xl backdrop-blur-xl sm:p-6">
        
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/10">
            <ImageIcon size={21} className="text-purple-400" />
          </div>

          <div>
            <h3 className="font-bold text-white">
              Image detected
            </h3>

            <p className="text-xs text-slate-500">
              Choose your preferred format
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-800">
          <img
            src="https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1200&q=80"
            alt="Image preview"
            className="max-h-[420px] w-full object-cover"
          />
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {formats.map((format) => (
            <button
              key={format}
              className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-semibold text-white transition hover:border-blue-500/40 hover:bg-blue-500/10"
            >
              <Download size={16} />
              {format}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}