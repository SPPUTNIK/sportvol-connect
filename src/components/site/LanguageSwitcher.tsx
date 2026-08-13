import { Globe } from "lucide-react";
import { languages, useI18n } from "@/lib/i18n";

export function LanguageSwitcher({ tone = "invert" }: { tone?: "invert" | "default" }) {
  const { lang, setLang } = useI18n();
  const base = tone === "invert" ? "text-ink-foreground" : "text-foreground";

  return (
    <div
      className={`flex items-center gap-1 rounded-full border ${
        tone === "invert" ? "border-hairline-invert" : "border-hairline"
      } px-1.5 py-1 ${base}`}
    >
      <Globe className="mx-1 size-3.5 opacity-60" aria-hidden />
      {languages.map((l) => (
        <button
          type="button"
          key={l.code}
          onClick={() => setLang(l.code)}
          aria-label={l.native}
          aria-pressed={lang === l.code}
          className={`rounded-full px-2 py-1 font-mono text-[0.65rem] uppercase tracking-[0.14em] transition-colors duration-300 ${
            lang === l.code ? "bg-primary text-primary-foreground" : "opacity-60 hover:opacity-100"
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
