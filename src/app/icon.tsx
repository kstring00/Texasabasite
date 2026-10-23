import { ImageResponse } from 'next/og';

export const size = { width: 64, height: 64 };
export const contentType = 'image/png';

const COLORS = ['#e2283a', '#8b2442', '#703068', '#32175a', '#1a2e52'];

export default function Icon() {
  return new ImageResponse(
    (
      <div style={{ width: 64, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fbf8f3', borderRadius: 14 }}>
        <svg viewBox="0 0 100 100" width="56" height="56">
          <g transform="translate(50 50)">
            {COLORS.map((c, i) => (
              <path key={c} d="M0 -44 C 6 -56, 24 -54, 22 -38 C 21 -27, 8 -18, 0 -12 C -8 -18, -21 -27, -22 -38 C -24 -54, -6 -56, 0 -44 Z" fill={c} transform={`rotate(${i * 72})`} />
            ))}
            <path d="M0 -17 L5 -6 L17 -5 L8 3 L10.5 15 L0 9 L-10.5 15 L-8 3 L-17 -5 L-5 -6 Z" fill="#ffffff" />
          </g>
        </svg>
      </div>
    ),
    size,
  );
}
