import React from "react";

export default function AcademicMark({ className, title = "Emblemat" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 120 120"
      role="img"
      aria-label={title}
    >
      <defs>
        <linearGradient id="academicGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#0B2A5B" />
          <stop offset="1" stopColor="#123C7A" />
        </linearGradient>
        <linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#D8B24C" />
          <stop offset="1" stopColor="#F0D27A" />
        </linearGradient>
      </defs>

      <circle cx="60" cy="60" r="56" fill="url(#academicGrad)" />
      <circle
        cx="60"
        cy="60"
        r="52"
        fill="none"
        stroke="url(#goldGrad)"
        strokeWidth="4"
      />

      <path
        d="M24 44 L60 28 L96 44 L60 60 Z"
        fill="url(#goldGrad)"
        opacity="0.95"
      />
      <path d="M60 60 L96 44" stroke="#0B2A5B" strokeWidth="3" />
      <circle cx="96" cy="44" r="3.5" fill="#0B2A5B" />
      <path
        d="M98 46 C102 54, 102 62, 96 69"
        fill="none"
        stroke="url(#goldGrad)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="96" cy="71" r="3.8" fill="url(#goldGrad)" />

      <rect x="34" y="62" width="52" height="26" rx="6" fill="#FFFFFF" />
      <path
        d="M38 82 L82 82"
        stroke="#0B2A5B"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.7"
      />
      <path
        d="M38 72 L82 72"
        stroke="#0B2A5B"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.7"
      />
      <path
        d="M49 62 L49 88"
        stroke="#0B2A5B"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.55"
      />

      <path
        d="M60 94 C44 94, 32 88, 26 78"
        fill="none"
        stroke="url(#goldGrad)"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.9"
      />
      <path
        d="M60 94 C76 94, 88 88, 94 78"
        fill="none"
        stroke="url(#goldGrad)"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.9"
      />
    </svg>
  );
}

