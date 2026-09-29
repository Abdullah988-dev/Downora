import {
  ArrowDown,
  Download,
  Link,
  Search,
  Sparkles,
} from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Paste URL",
    description:
      "Copy a public media link from a supported platform and paste it into Downora.",
    icon: Link,
  },
  {
    number: "02",
    title: "Analyze",
    description:
      "Downora analyzes the link and finds the available media information and formats.",
    icon: Search,
  },
  {
    number: "03",
    title: "Choose Quality",
    description:
      "Select the available quality and format that best fits your needs.",
    icon: Sparkles,
  },
  {
    number: "04",
    title: "Download",
    description:
      "Click download and save the media to your device through your browser.",
    icon: Download,
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative overflow-hidden py-24">
      <div className="absolute left-1/2 top-1/2 -z-10 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/5 blur-[120px]" />

      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-300">
            <Sparkles size={15} />
            How It Works
          </div>

          <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
            Four simple steps.
            <span className="block text-slate-500">
              That's it.
            </span>
          </h2>

          <p className="mt-5 text-base leading-7 text-slate-400">
            No complicated setup. Just paste your link, choose your option,
            and download.
          </p>
        </div>

        <div className="relative mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="absolute left-[12%] right-[12%] top-12 hidden h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent lg:block" />

          {steps.map((step) => {
            const Icon = step.icon;

            return (
              <div
                key={step.number}
                className="group relative rounded-3xl border border-white/10 bg-white/[0.035] p-7 backdrop-blur-xl transition duration-300 hover:-translate-y-2 hover:border-blue-500/30 hover:bg-white/[0.06]"
              >
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-400/20 bg-blue-500/10 text-blue-400 transition duration-300 group-hover:scale-110">
                    <Icon size={24} />
                  </div>

                  <span className="text-4xl font-black text-white/[0.06]">
                    {step.number}
                  </span>
                </div>

                <h3 className="mt-7 text-xl font-bold text-white">
                  {step.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-500">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-12 flex justify-center">
          <a
            href="#downloader"
            className="flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-600/20"
          >
            Start Downloading
            <ArrowDown size={17} />
          </a>
        </div>
      </div>
    </section>
  );
}