import { ImageResponse } from 'next/og';
import { site } from '@/data/site';

export const alt = 'Texas ABA Centers: ABA therapy and autism evaluations across Texas';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const COLORS = ['#e2283a', '#8b2442', '#703068', '#32175a', '#1a2e52'];

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: 1200, height: 630, display: 'flex', background: 'linear-gradient(135deg, #fbf8f3 0%, #f7ecd6 100%)', padding: 72, fontFamily: 'Georgia, serif', color: '#1a2e52' }}>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <svg viewBox="0 0 100 100" width="84" height="84">
              <g transform="translate(50 50)">
                {COLORS.map((c, i) => (
                  <path key={c} d="M0 -44 C 6 -56, 24 -54, 22 -38 C 21 -27, 8 -18, 0 -12 C -8 -18, -21 -27, -22 -38 C -24 -54, -6 -56, 0 -44 Z" fill={c} transform={`rotate(${i * 72})`} />
                ))}
                <path d="M0 -17 L5 -6 L17 -5 L8 3 L10.5 15 L0 9 L-10.5 15 L-8 3 L-17 -5 L-5 -6 Z" fill="#ffffff" />
              </g>
            </svg>
            <div style={{ display: 'flex', flexDirection: 'column', fontFamily: 'Arial, sans-serif' }}>
              <span style={{ fontSize: 40, fontWeight: 800, letterSpacing: 2 }}>TEXAS</span>
              <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: 5, color: '#6e727a' }}>ABA CENTERS</span>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ fontSize: 60, lineHeight: 1.1, maxWidth: 1000 }}>{site.tagline}</div>
            <div style={{ fontSize: 28, color: '#34363b', fontFamily: 'Arial, sans-serif' }}>Austin · Cedar Hill · Katy · Pearland · Plano · Sugar Land</div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
