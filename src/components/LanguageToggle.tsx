"use client";

import { useLang, useT } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";

export function LanguageToggle() {
  const { lang, setLang } = useLang();
  const t = useT();

  const toggle = () => setLang(lang === "en" ? "zh" : "en");

  return (
    <div className="flex items-center gap-1 text-sm font-medium">
      <button
        type="button"
        onClick={() => setLang("en")}
        className={`rounded px-2 py-1 transition ${
          lang === "en"
            ? "bg-ink text-white"
            : "text-slate-500 hover:text-ink"
        }`}
        aria-label="English"
      >
        {t.lang.en}
      </button>
      <span className="text-slate-300">|</span>
      <button
        type="button"
        onClick={() => setLang("zh")}
        className={`rounded px-2 py-1 transition ${
          lang === "zh"
            ? "bg-ink text-white"
            : "text-slate-500 hover:text-ink"
        }`}
        aria-label="中文"
      >
        {t.lang.zh}
      </button>
    </div>
  );
}
