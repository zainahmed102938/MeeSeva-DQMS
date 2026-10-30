import React from 'react';

/**
 * Official Telangana State Emblem / Crest Vector Component
 * Features the iconic Kakatiya Kala Thoranam, Charminar silhouette, and State Seal.
 */
export default function TelanganaEmblem({ className = "w-10 h-10", size = 40 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Government of Telangana Official Emblem"
      role="img"
    >
      {/* Outer Golden Ring */}
      <circle cx="50" cy="50" r="48" stroke="#d97706" strokeWidth="2.5" fill="#044728" />
      <circle cx="50" cy="50" r="45" stroke="#f59e0b" strokeWidth="1" strokeDasharray="2 2" />

      {/* Inner White / Cream Medallion */}
      <circle cx="50" cy="50" r="39" fill="#f8fafc" stroke="#044728" strokeWidth="2" />

      {/* Sun Ray Beams / Garland Pattern */}
      <g opacity="0.3" stroke="#d97706" strokeWidth="0.8">
        <line x1="50" y1="13" x2="50" y2="18" />
        <line x1="50" y1="82" x2="50" y2="87" />
        <line x1="13" y1="50" x2="18" y2="50" />
        <line x1="82" y1="50" x2="87" y2="50" />
        <line x1="24" y1="24" x2="28" y2="28" />
        <line x1="76" y1="76" x2="72" y2="72" />
        <line x1="24" y1="76" x2="28" y2="72" />
        <line x1="76" y1="24" x2="72" y2="28" />
      </g>

      {/* Kakatiya Kala Thoranam (Warangal Arch) */}
      <path
        d="M26 64 V40 Q32 30 50 30 Q68 30 74 40 V64"
        stroke="#044728"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M31 64 V42 Q36 34 50 34 Q64 34 69 42 V64"
        stroke="#d97706"
        strokeWidth="1.5"
        fill="none"
      />

      {/* Arch Keystone & Pillars Detail */}
      <rect x="23" y="60" width="6" height="4" rx="1" fill="#044728" />
      <rect x="71" y="60" width="6" height="4" rx="1" fill="#044728" />
      <circle cx="50" cy="27" r="3" fill="#d97706" stroke="#044728" strokeWidth="1" />

      {/* Charminar Silhouette */}
      <g fill="#044728">
        {/* Base */}
        <rect x="40" y="52" width="20" height="12" rx="0.5" />
        {/* Main Arch Cutout */}
        <path d="M46 64 V56 Q50 53 54 56 V64 Z" fill="#f8fafc" />
        {/* 4 Minarets */}
        <rect x="38" y="44" width="2.5" height="18" rx="0.5" />
        <rect x="44" y="46" width="2" height="6" />
        <rect x="54" y="46" width="2" height="6" />
        <rect x="59.5" y="44" width="2.5" height="18" rx="0.5" />
        {/* Minaret Domes */}
        <circle cx="39.25" cy="43.5" r="1.8" fill="#d97706" />
        <circle cx="60.75" cy="43.5" r="1.8" fill="#d97706" />
      </g>

      {/* Ashoka Lion Crest Silhouette at the Top */}
      <path
        d="M48 18 H52 L51 14 H49 Z"
        fill="#d97706"
        stroke="#044728"
        strokeWidth="0.8"
      />

      {/* State Text Ring (Symbolic Gov Border) */}
      <text
        x="50"
        y="80"
        textAnchor="middle"
        fontSize="5.5"
        fontWeight="bold"
        fill="#044728"
        fontFamily="sans-serif"
      >
        TELANGANA
      </text>
    </svg>
  );
}
