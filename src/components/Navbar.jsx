import { Download, Menu, X, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

const links = [
  { name: "Home", href: "#" },
  { name: "Features", href: "#features" },
  { name: "How It Works", href: "#how-it-works" },
  { name: "FAQ", href: "#faq" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-white/10 bg-slate-950/90 shadow-lg shadow-black/10 backdrop-blur-2xl"
          : "border-b border-transparent bg-slate-950/70 backdrop-blur-xl"
      }`}
    >
      <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-6">

        {/* Logo */}
        <a
          href="#"
          onClick={closeMenu}
          className="group flex items-center gap-3"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20 transition duration-300 group-hover:scale-105 group-hover:bg-blue-500">
            <Download size={20} />
          </div>

          <div>
            <span className="block text-xl font-black tracking-tight text-white">
              Downora
            </span>

            <span className="hidden text-[10px] font-medium uppercase tracking-[0.18em] text-slate-600 sm:block">
              Media Downloader
            </span>
          </div>
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-400 transition duration-200 hover:bg-white/[0.05] hover:text-white"
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* Desktop CTA */}
        <a
          href="#downloader"
          className="hidden items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/10 transition duration-300 hover:-translate-y-0.5 hover:bg-blue-500 hover:shadow-blue-600/20 md:flex"
        >
          <Download size={16} />
          Download
        </a>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-300 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white md:hidden"
        >
          {menuOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`overflow-hidden border-t border-white/10 bg-slate-950/95 backdrop-blur-2xl transition-all duration-300 md:hidden ${
          menuOpen
            ? "max-h-[500px] opacity-100"
            : "max-h-0 border-transparent opacity-0"
        }`}
      >
        <nav className="mx-auto max-w-7xl px-5 py-5 sm:px-6">

          {/* Mobile Links */}
          <div className="space-y-1">
            {links.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={closeMenu}
                className="flex items-center justify-between rounded-2xl px-4 py-3.5 text-sm font-medium text-slate-400 transition duration-200 hover:bg-white/[0.05] hover:text-white"
              >
                <span>{link.name}</span>

                <ChevronRight
                  size={17}
                  className="text-slate-700"
                />
              </a>
            ))}
          </div>

          {/* Mobile CTA */}
          <a
            href="#downloader"
            onClick={closeMenu}
            className="mt-4 flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500"
          >
            <Download size={17} />
            Start Downloading
          </a>

          {/* Small Bottom Text */}
          <p className="mt-4 text-center text-[11px] text-slate-600">
            Fast • Simple • Multi-platform
          </p>
        </nav>
      </div>
    </header>
  );
}