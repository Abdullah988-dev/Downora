import { ChevronDown, HelpCircle } from "lucide-react";
import { useState } from "react";

const faqs = [
  {
    question: "What is Downora?",
    answer:
      "Downora is a simple media downloader interface where you can paste a supported public media URL, analyze the available options, choose a quality or format, and download the media.",
  },
  {
    question: "Which platforms does Downora support?",
    answer:
      "The current interface is designed for YouTube, TikTok, Facebook, Instagram, and X. Actual platform availability will depend on the final backend implementation and each platform's restrictions.",
  },
  {
    question: "Can I choose the video quality?",
    answer:
      "Yes. When multiple qualities are available for a supported media source, Downora will show the available options so you can choose the one you want.",
  },
  {
    question: "Can I download images too?",
    answer:
      "Yes. Downora's interface supports image results as well as video results. Available image formats can be shown when supported by the source.",
  },
  {
    question: "Does Downora work on mobile?",
    answer:
      "Yes. The website is being designed with a mobile-first responsive layout so it can be used comfortably on phones, tablets, and desktop computers.",
  },
  {
    question: "Why can't some URLs be analyzed?",
    answer:
      "Some URLs may be unsupported, private, restricted, expired, or unavailable. The final downloader will report these situations clearly instead of showing incorrect results.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="relative overflow-hidden py-24">
      <div className="absolute left-1/2 top-1/2 -z-10 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-600/5 blur-[120px]" />

      <div className="mx-auto max-w-4xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-purple-400/20 bg-purple-500/10 px-4 py-2 text-sm text-purple-300">
            <HelpCircle size={15} />
            Frequently Asked Questions
          </div>

          <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
            Got questions?
            <span className="block text-slate-500">
              We've got answers.
            </span>
          </h2>

          <p className="mt-5 text-base leading-7 text-slate-400">
            Everything you need to know about the Downora experience.
          </p>
        </div>

        <div className="mt-14 space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={faq.question}
                className={`overflow-hidden rounded-2xl border transition-all duration-300 ${
                  isOpen
                    ? "border-blue-500/30 bg-blue-500/[0.04]"
                    : "border-white/10 bg-white/[0.025]"
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleFAQ(index)}
                  className="flex w-full items-center justify-between gap-5 px-5 py-5 text-left sm:px-6"
                >
                  <span className="font-semibold text-white">
                    {faq.question}
                  </span>

                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5 text-slate-400 transition-transform duration-300 ${
                      isOpen ? "rotate-180 text-blue-400" : ""
                    }`}
                  >
                    <ChevronDown size={18} />
                  </span>
                </button>

                <div
                  className={`grid transition-all duration-300 ${
                    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="px-5 pb-5 text-sm leading-7 text-slate-500 sm:px-6">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}