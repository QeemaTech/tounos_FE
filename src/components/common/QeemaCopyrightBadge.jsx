import React from "react";

/**
 * Reusable Qeema Tech copyright & branding badge.
 * Directs to https://www.qeematech.net/
 *
 * @param {Object} props
 * @param {'auto' | 'dark' | 'light'} [props.variant='auto'] - Color theme variant for the badge
 * @param {string} [props.className=''] - Additional CSS classes
 * @param {'en' | 'ar'} [props.lang='en'] - Language for the text ("Developed by" or "تم التطوير بواسطة")
 * @param {string} [props.customText] - Optional custom label to display
 */
export default function QeemaCopyrightBadge({
  variant = "auto",
  className = "",
  lang = "en",
  customText,
}) {
  const isDark = variant === "dark";
  const defaultText = lang === "ar" ? "تم التطوير بواسطة" : "Developed by";
  const developedByText = customText || defaultText;

  return (
    <a
      href="https://www.qeematech.net/"
      target="_blank"
      rel="noopener noreferrer"
      title="Qeema Tech | https://www.qeematech.net/"
      className={`group inline-flex items-center gap-2 rounded-full py-1 px-3 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#0C5ADB]/40 ${
        isDark
          ? "border border-white/10 bg-white/5 text-xs text-slate-300 hover:border-[#0C5ADB]/60 hover:bg-white/10 hover:text-white"
          : "border border-slate-200/90 bg-white/90 text-xs text-slate-600 shadow-xs backdrop-blur-sm hover:border-[#0C5ADB]/50 hover:bg-white hover:text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-slate-400 dark:hover:border-[#0C5ADB]/60 dark:hover:bg-white/10 dark:hover:text-white"
      } ${className}`}
    >
      <span className="font-medium text-[11px] sm:text-xs tracking-tight">
        {developedByText}
      </span>
      <span
        className={`inline-flex items-center justify-center rounded-md bg-white px-2 py-0.5 shadow-xs transition-transform duration-200 group-hover:scale-105 ${
          isDark ? "ring-1 ring-white/20" : "ring-1 ring-slate-200/80 dark:ring-white/10"
        }`}
      >
        <img
          src="/assets/qeema_letters.svg"
          alt="Qeema Tech"
          width="76"
          height="16"
          className="h-3.5 sm:h-4 w-auto object-contain transition-opacity group-hover:opacity-95"
          loading="lazy"
        />
      </span>
    </a>
  );
}
