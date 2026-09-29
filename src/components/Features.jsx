import {
  Gauge,
  ShieldCheck,
  Sparkles,
  MonitorSmartphone,
  Image as ImageIcon,
  Layers3,
} from "lucide-react";

const features = [
  {
    icon: Gauge,
    title: "Fast Downloads",
    description:
      "A clean and optimized experience designed to make downloading simple and quick.",
  },
  {
    icon: Sparkles,
    title: "Quality Selection",
    description:
      "Choose the available video quality and format that works best for you.",
  },
  {
    icon: MonitorSmartphone,
    title: "Works Everywhere",
    description:
      "Use Downora from your desktop, tablet, or mobile browser without complicated setup.",
  },
  {
    icon: ImageIcon,
    title: "Video & Images",
    description:
      "Download supported video and image media from one simple interface.",
  },
  {
    icon: Layers3,
    title: "Multiple Formats",
    description:
      "Select from available media formats and qualities when the source provides them.",
  },
  {
    icon: ShieldCheck,
    title: "Simple & Clean",
    description:
      "No confusing screens. Paste your link, choose your option, and download.",
  },
];

export default function Features() {
  return (
    <section
      id="features"
      className="relative overflow-hidden py-24"
    >
      {/* Background Glow */}
      <div className="absolute left-1/2 top-1/2 -z-10 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/5 blur-[120px]" />

      <div className="mx-auto max-w-7xl px-6">

        {/* Heading */}
        <div className="mx-auto max-w-2xl text-center">

          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-2 text-sm text-blue-300">
            <Sparkles size={15} />
            Powerful Features
          </div>

          <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
            Everything you need.
            <span className="block text-slate-500">
              Nothing you don't.
            </span>
          </h2>

          <p className="mt-5 text-base leading-7 text-slate-400">
            Downora keeps the downloading experience simple while giving you
            the control you need.
          </p>

        </div>

        {/* Feature Cards */}
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.title}
                className="group rounded-3xl border border-white/10 bg-white/[0.035] p-7 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-blue-500/30 hover:bg-white/[0.06]"
              >

                {/* Icon */}
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-400/10 bg-blue-500/10 text-blue-400 transition duration-300 group-hover:scale-110 group-hover:bg-blue-500/15">
                  <Icon size={23} />
                </div>

                {/* Title */}
                <h3 className="mt-6 text-xl font-bold text-white">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="mt-3 text-sm leading-6 text-slate-500">
                  {feature.description}
                </p>

                {/* Hover Line */}
                <div className="mt-6 h-px w-0 bg-blue-500/50 transition-all duration-500 group-hover:w-full" />

              </div>
            );
          })}

        </div>
      </div>
    </section>
  );
}