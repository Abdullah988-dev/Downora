import {
  ArrowUp,
  Download,
} from "lucide-react";
import { 
  FaTiktok, 
  FaXTwitter, 
  FaFacebook, 
  FaInstagram, 
  FaYoutube, 
  FaEnvelope 
} from "react-icons/fa6";

const quickLinks = [
  { name: "Home", href: "#" },
  { name: "Features", href: "#features" },
  { name: "How It Works", href: "#how-it-works" },
  { name: "FAQ", href: "#faq" },
];

const platforms = [
  "YouTube",
  "TikTok",
  "Facebook",
  "Instagram",
  "X",
];

export default function Footer() {
  const scrollTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <footer className="border-t border-white/10 bg-slate-950">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">

          {/* Brand */}
          <div className="lg:col-span-2">
            <a
              href="#"
              className="inline-flex items-center gap-3"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-600/20">
                <Download size={21} className="text-white" />
              </div>

              <span className="text-2xl font-black text-white">
                Downora
              </span>
            </a>

            <p className="mt-5 max-w-md text-sm leading-7 text-slate-500">
              A simple and modern media downloading experience designed
              to make supported downloads easier across devices.
            </p>

            <div className="mt-6 flex items-center gap-3">
              <a
                href="#"
                aria-label="YouTube"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-slate-400 transition hover:border-red-500/30 hover:text-red-400"
              >
                <FaYoutube size={17} />
              </a>

              <a
                href="#"
                aria-label="TikTok"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-slate-400 transition hover:border-cyan-500/30 hover:text-cyan-300"
              >
                <FaTiktok size={17} />
              </a>

              <a
                href="#"
                aria-label="Instagram"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-slate-400 transition hover:border-pink-500/30 hover:text-pink-400"
              >
                <FaInstagram size={17} />
              </a>

              <a
                href="#"
                aria-label="Facebook"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-slate-400 transition hover:border-blue-500/30 hover:text-blue-400"
              >
                <FaFacebook size={17} />
              </a>

              <a
                href="#"
                aria-label="X"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-slate-400 transition hover:border-white/20 hover:text-white"
              >
                <FaXTwitter size={17} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-white">
              Quick Links
            </h3>

            <ul className="mt-5 space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-sm text-slate-500 transition hover:text-white"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Platforms */}
          <div>
            <h3 className="font-bold text-white">
              Platforms
            </h3>

            <ul className="mt-5 space-y-3">
              {platforms.map((platform) => (
                <li
                  key={platform}
                  className="text-sm text-slate-500"
                >
                  {platform}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-14 flex flex-col gap-5 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-600">
            © {new Date().getFullYear()} Downora. All rights reserved.
          </p>

          <div className="flex items-center gap-4">
            <a
              href="mailto:support@downora.app"
              className="flex items-center gap-2 text-xs text-slate-600 transition hover:text-slate-300"
            >
              <FaEnvelope size={14} />
              Contact
            </a>

            <button
              type="button"
              onClick={scrollTop}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-slate-500 transition hover:border-white/20 hover:text-white"
              aria-label="Back to top"
            >
              <ArrowUp size={16} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}