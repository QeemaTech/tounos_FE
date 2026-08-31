import React from "react";

/**
 * Reusable Qeema Tech copyright & branding badge.
 * Directs to https://www.qeematech.net/
 *
 * @param {Object} props
 * @param {'auto' | 'dark' | 'light'} [props.variant='auto'] - Color theme variant for the badge
 * @param {string} [props.className=''] - Additional CSS classes
 * @param {'ar' | 'en' | 'auto'} [props.lang='ar'] - Language for the text ("تم التطوير بواسطة" or "Developed by")
 * @param {string} [props.customText] - Optional custom label to display
 */
export default function QeemaCopyrightBadge({
  variant = "auto",
  className = "",
  lang = "ar",
  customText,
}) {
  // Determine text direction & label
  const isRtl =
    lang === "ar" ||
    (typeof document !== "undefined" &&
      document.documentElement.getAttribute("dir") === "rtl");

  const defaultText = isRtl ? "تم التطوير بواسطة" : "Developed by";
  const developedByText = customText || defaultText;

  const isDark = variant === "dark";

  return (
    <a
      href="https://www.qeematech.net/"
      target="_blank"
      rel="noopener noreferrer"
      title="Qeema Tech | https://www.qeematech.net/"
      className={`group inline-flex items-center gap-2 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#0C5ADB]/40 ${
        isDark
          ? "border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-400 hover:border-[#0C5ADB]/60 hover:bg-white/10 hover:text-white"
          : "border border-slate-200/90 bg-white/90 px-3 py-1 text-xs text-slate-600 shadow-sm backdrop-blur hover:border-[#0C5ADB]/50 hover:bg-white hover:text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-slate-400 dark:hover:border-[#0C5ADB]/60 dark:hover:bg-white/10 dark:hover:text-white"
      } ${className}`}
    >
      <span className="font-medium">{developedByText}</span>
      <span
        className={`inline-flex items-center justify-center rounded-md bg-white px-1.5 py-0.5 shadow-sm transition-transform duration-200 group-hover:scale-105 ${
          isDark ? "ring-1 ring-white/20" : "ring-1 ring-slate-200/60 dark:ring-white/10"
        }`}
      >
        <img
          src="/assets/qeema_letters.svg"
          alt="Qeema Tech"
          width="64"
          height="14"
          className="h-3.5 w-auto object-contain transition-opacity group-hover:opacity-90"
          loading="lazy"
        />
      </span>
    </a>
  );
}
