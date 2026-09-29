import {
  Download,
  Globe2,
  ShieldCheck,
  Zap,
} from "lucide-react";

const stats = [
  {
    icon: Zap,
    value: "Fast",
    label: "Simple download experience",
  },
  {
    icon: Globe2,
    value: "5+",
    label: "Planned platform support",
  },
  {
    icon: Download,
    value: "HD",
    label: "Available quality options",
  },
  {
    icon: ShieldCheck,
    value: "Easy",
    label: "Clean and simple interface",
  },
];

export default function Stats() {
  return (
    <section className="relative overflow-hidden py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 backdrop-blur-xl sm:p-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon;

              return (
                <div
                  key={stat.label}
                  className="group flex items-center gap-4 rounded-2xl border border-transparent p-4 transition duration-300 hover:border-white/10 hover:bg-white/[0.03]"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400 transition duration-300 group-hover:scale-110">
                    <Icon size={22} />
                  </div>

                  <div>
                    <p className="text-2xl font-black text-white">
                      {stat.value}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {stat.label}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}