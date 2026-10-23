import type { SVGProps } from 'react';

const base: SVGProps<SVGSVGElement> = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true, focusable: false };

export const PhoneIcon = () => (
  <svg {...base}>
    <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />
  </svg>
);
export const TextIcon = () => (
  <svg {...base}>
    <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z" />
  </svg>
);
export const DoorIcon = () => (
  <svg {...base}>
    <path d="M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16M4 21h16M14 12h.01" />
  </svg>
);
export const BlocksIcon = () => (
  <svg {...base}>
    <rect x="3" y="13" width="8" height="8" rx="1.5" />
    <rect x="13" y="13" width="8" height="8" rx="1.5" />
    <rect x="8" y="3" width="8" height="8" rx="1.5" />
  </svg>
);
export const TalkIcon = () => (
  <svg {...base}>
    <path d="M8 10h8M8 14h5M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z" />
  </svg>
);
export const ClipIcon = () => (
  <svg {...base}>
    <rect x="5" y="4" width="14" height="17" rx="2" />
    <path d="M9 4V3h6v1M9 13l2 2 4-4" />
  </svg>
);
export const DocIcon = () => (
  <svg {...base}>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" />
    <path d="M14 3v5h5M9 13h6M9 17h4" />
  </svg>
);
export const TickIcon = () => (
  <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
    <circle cx="10" cy="10" r="9" />
    <path d="M6 10.5l2.6 2.6L14.2 7.5" />
  </svg>
);
