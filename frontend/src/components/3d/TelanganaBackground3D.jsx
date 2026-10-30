import React from 'react';
import { useTheme } from '../../context/ThemeContext';

/**
 * Lightweight Institutional Ambient Backdrop
 * Replaces continuous Three.js WebGL useFrame loops with a zero-overhead,
 * hardware-composited SVG architectural grid and subtle radial accents.
 */
export default function TelanganaBackground3D({ variant = 'citizen', theme: propTheme }) {
  let contextTheme = null;
  try {
    const ctx = useTheme();
    if (ctx?.theme) contextTheme = ctx.theme;
  } catch {
    // Fallback if rendered outside ThemeProvider
  }

  const theme = propTheme || contextTheme || 'light';
  const isDark = theme === 'dark';
  const isOfficial = variant === 'official';

  const primaryGlow = isOfficial
    ? isDark
      ? 'rgba(245, 158, 11, 0.09)'
      : 'rgba(180, 83, 9, 0.05)'
    : isDark
      ? 'rgba(37, 99, 235, 0.11)'
      : 'rgba(30, 58, 138, 0.05)';

  const secondaryGlow = isOfficial
    ? isDark
      ? 'rgba(16, 185, 129, 0.07)'
      : 'rgba(4, 120, 87, 0.04)'
    : isDark
      ? 'rgba(16, 185, 129, 0.08)'
      : 'rgba(4, 120, 87, 0.04)';

  const gridStroke = isDark ? 'rgba(148, 163, 184, 0.055)' : 'rgba(15, 23, 42, 0.038)';

  return (
    <div
      className="fixed inset-0 pointer-events-none -z-10 overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* Base institutional canvas fill */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: 'var(--bg-page)',
          backgroundImage: `
            radial-gradient(circle at 14% 18%, ${primaryGlow} 0%, transparent 45%),
            radial-gradient(circle at 86% 82%, ${secondaryGlow} 0%, transparent 48%)
          `
        }}
      />

      {/* Crisp SVG Architectural Grid */}
      <svg
        className="w-full h-full opacity-90"
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
      >
        <defs>
          <pattern
            id={`gov-grid-${variant}-${theme}`}
            width="48"
            height="48"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 48 0 L 0 0 0 48"
              fill="none"
              stroke={gridStroke}
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#gov-grid-${variant}-${theme})`} />
      </svg>
    </div>
  );
}

