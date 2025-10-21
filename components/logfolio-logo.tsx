import React from "react";

const LogfolioLogo = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="420"
      height="120"
      viewBox="0 0 420 120"
      role="img"
      aria-labelledby="logoTitle logoDesc"
    >
      <title id="logoTitle">Logfolio</title>
      <desc id="logoDesc">
        Logfolio logo: open journal icon with rising stock line, purple/violet
        gradient, and wordmark
      </desc>

      <defs>
        <linearGradient id="gradPurple" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="#7C3AED" />
          <stop offset="100%" stop-color="#A78BFA" />
        </linearGradient>
        <filter id="softShadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow
            dx="0"
            dy="4"
            stdDeviation="6"
            flood-color="#6b21a8"
            flood-opacity="0.12"
          />
        </filter>
      </defs>

      <g transform="translate(18,18)">
        <path
          d="M0 6.5C0 3.462 2.462 1 5.5 1h58c3.038 0 5.5 2.462 5.5 5.5v67c0 3.038-2.462 5.5-5.5 5.5h-58C2.462 79 0 76.538 0 73.5V6.5z"
          fill="url(#gradPurple)"
          opacity="0.98"
          filter="url(#softShadow)"
          transform="translate(0,0)"
        />
        <path
          d="M70 6.5C70 3.462 72.462 1 75.5 1h58c3.038 0 5.5 2.462 5.5 5.5v67c0 3.038-2.462 5.5-5.5 5.5h-58C72.462 79 70 76.538 70 73.5V6.5z"
          fill="#EEEAFB"
          opacity="0.9"
        />
        <rect x="64" y="6" width="6" height="74" rx="2" fill="#f3efff" />

        <g opacity="0.14" transform="translate(8,20)">
          <rect x="0" y="0" width="48" height="2" rx="1" fill="#000" />
          <rect x="0" y="10" width="48" height="2" rx="1" fill="#000" />
          <rect x="0" y="20" width="36" height="2" rx="1" fill="#000" />
        </g>

        <g transform="translate(6,14)">
          <polyline
            points="4,46 18,32 34,40 54,18 74,30 90,20"
            fill="none"
            stroke="rgba(255,255,255,0.15)"
            stroke-width="4"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <polyline
            points="4,46 18,32 34,40 54,18 74,30 90,20"
            fill="none"
            stroke="#FFFFFF"
            stroke-width="3.6"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <circle
            cx="4"
            cy="46"
            r="3.8"
            fill="#7C3AED"
            stroke="#fff"
            stroke-width="1"
          />
          <circle
            cx="18"
            cy="32"
            r="3.8"
            fill="#7C3AED"
            stroke="#fff"
            stroke-width="1"
          />
          <circle
            cx="34"
            cy="40"
            r="3.8"
            fill="#7C3AED"
            stroke="#fff"
            stroke-width="1"
          />
          <circle
            cx="54"
            cy="18"
            r="3.8"
            fill="#7C3AED"
            stroke="#fff"
            stroke-width="1"
          />
          <circle
            cx="74"
            cy="30"
            r="3.8"
            fill="#7C3AED"
            stroke="#fff"
            stroke-width="1"
          />
          <circle
            cx="90"
            cy="20"
            r="3.8"
            fill="#7C3AED"
            stroke="#fff"
            stroke-width="1"
          />
        </g>
      </g>

      <g
        transform="translate(140,56)"
        font-family="Inter, Roboto, Arial, sans-serif"
        font-weight="600"
        text-anchor="start"
      >
        <text x="0" y="0" font-size="36" fill="#2B0B5A" dy="0.35em">
          Logfolio
        </text>
      </g>
    </svg>
  );
};

export default LogfolioLogo;
