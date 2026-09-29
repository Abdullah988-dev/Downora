import {
  FaYoutube,
  FaTiktok,
  FaFacebookF,
  FaInstagram,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

const platforms = [
  {
    name: "YouTube",
    description: "Videos & media",
    icon: FaYoutube,
    style: "bg-red-500/10 text-red-400",
  },
  {
    name: "TikTok",
    description: "Short videos",
    icon: FaTiktok,
    style: "bg-cyan-500/10 text-cyan-300",
  },
  {
    name: "Facebook",
    description: "Public media",
    icon: FaFacebookF,
    style: "bg-blue-500/10 text-blue-400",
  },
  {
    name: "Instagram",
    description: "Public media",
    icon: FaInstagram,
    style: "bg-pink-500/10 text-pink-400",
  },
  {
    name: "X",
    description: "Posts & media",
    icon: FaXTwitter,
    style: "bg-slate-500/10 text-white",
  },
];

export default function SupportedPlatforms() {
  return (
    <section className="relative overflow-hidden py-24">
      <div className="mx-auto max-w-7xl px-6">

        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-4 inline-block rounded-full border border-purple-400/20 bg-purple-500/10 px-4 py-2 text-sm text-purple-300">
            Supported Platforms
          </div>

          <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
            One downloader.
            <span className="block text-slate-500">
              Multiple platforms.
            </span>
          </h2>

          <p className="mt-5 text-base leading-7 text-slate-400">
            Download supported public media from your favorite platforms.
          </p>
        </div>

        <div className="mx-auto mt-14 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {platforms.map((platform) => {
            const Icon = platform.icon;

            return (
              <div
                key={platform.name}
                className="group rounded-3xl border border-white/10 bg-white/[0.035] p-6 text-center backdrop-blur-xl transition duration-300 hover:-translate-y-2 hover:border-white/20 hover:bg-white/[0.06]"
              >
                <div
                  className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${platform.style} transition duration-300 group-hover:scale-110`}
                >
                  <Icon size={28} />
                </div>

                <h3 className="mt-5 font-bold text-white">
                  {platform.name}
                </h3>

                <p className="mt-2 text-xs text-slate-500">
                  {platform.description}
                </p>
              </div>
            );
          })}
        </div>

        <p className="mt-8 text-center text-xs text-slate-600">
          Platform availability may vary depending on the source URL and
          platform restrictions.
        </p>

      </div>
    </section>
  );
}