import type { CenterModel, Room } from '@/data/centerModels';

type S = { readonly [k: string]: string };

/**
 * Builds the CSS-3D miniature into `world`. Ported from the reference prototype's DOM builder.
 * Pure DOM so React never diffs the hundreds of faces; React owns everything around it.
 */
export function buildWorld(world: HTMLElement, model: CenterModel, styles: S) {
  world.innerHTML = '';
  const el = (cls: string) => {
    const d = document.createElement('div');
    d.className = cls;
    return d;
  };
  function box(x: number, y: number, z: number, w: number, d: number, h: number, c: string, parent: HTMLElement) {
    const b = el(styles.box);
    b.style.transform = `translate3d(${x}px,${y}px,${z}px)`;
    b.style.setProperty('--c', c);
    const mk = (cls: string, W: number, H: number, tf: string) => {
      const f = el(`${styles.face} ${cls}`);
      f.style.width = W + 'px';
      f.style.height = H + 'px';
      f.style.transform = tf;
      b.appendChild(f);
    };
    mk(styles.ft, w, d, `translateZ(${h}px)`);
    mk(styles.ff, w, h, `translate3d(0,${d}px,0) rotateX(90deg)`);
    mk(styles.fb, w, h, `rotateX(90deg)`);
    mk(styles.fl, d, h, `rotateZ(90deg) rotateX(90deg)`);
    mk(styles.fr, d, h, `translate3d(${w}px,0,0) rotateZ(90deg) rotateX(90deg)`);
    parent.appendChild(b);
    return b;
  }
  function flat(x: number, y: number, z: number, w: number, d: number, c: string, r: number, parent: HTMLElement, cls?: string) {
    const f = el(styles.flat + (cls ? ' ' + cls : ''));
    f.style.cssText = `width:${w}px;height:${d}px;background:${c};border-radius:${r || 0}px;transform:translate3d(${x}px,${y}px,${z}px)`;
    parent.appendChild(f);
    return f;
  }
  function shadow(x: number, y: number, w: number, d: number, parent: HTMLElement) {
    return flat(x + 3, y + 4, 2.8, w + 2, d + 2, 'var(--shadow)', 6, parent);
  }
  function piece(x: number, y: number, z: number, w: number, d: number, h: number, c: string, parent: HTMLElement) {
    if (z < 4) shadow(x, y, w, d, parent);
    return box(x, y, z, w, d, h, c, parent);
  }
  function tree(x: number, y: number, s: number, parent: HTMLElement) {
    const g = el(styles.grp);
    g.style.transform = `translate3d(${x}px,${y}px,0)`;
    flat(-s * 0.55, -s * 0.45, 0.5, s * 1.1, s * 0.9, 'var(--shadow)', 999, g);
    box(-2, -2, 0, 4, 4, s * 1.2, 'var(--wood-2)', g);
    flat(-s / 2, -s / 2, s * 0.75, s, s, 'color-mix(in srgb,var(--sage),#000 8%)', 999, g);
    flat(-s * 0.34, -s * 0.34, s * 1.05, s * 0.68, s * 0.68, 'var(--sage)', 999, g);
    flat(-s * 0.18, -s * 0.18, s * 1.3, s * 0.36, s * 0.36, 'color-mix(in srgb,var(--sage),#fff 25%)', 999, g);
    parent.appendChild(g);
  }

  /* ---- site ---- */
  const { w: BW, d: BD } = model.building;
  const site = el(styles.grp);
  flat(-520, -440, 0, BW + 1040, BD + 880, 'radial-gradient(70% 60% at 42% 36%, var(--ground) 0%, var(--ground-2) 100%)', 140, site);
  flat(-60, -50, 0.6, BW + 120, BD + 100, 'var(--shadow)', 40, site);
  flat(-230, 78, 1, 230, 48, 'color-mix(in srgb,var(--corridor),#fff 18%)', 8, site);
  flat(-300, -20, 1, 60, 60, 'color-mix(in srgb,var(--corridor),#fff 10%)', 999, site);
  [[-150, -90, 54], [-120, 330, 46], [790, 60, 58], [760, 400, 48], [300, -130, 44], [560, 560, 50], [80, 570, 42]].forEach((t) => tree(t[0], t[1], t[2], site));
  piece(-250, 150, 3, 50, 14, 10, 'var(--wood)', site);
  piece(-250, 20, 3, 50, 14, 10, 'var(--wood)', site);
  world.appendChild(site);

  /* ---- building: slab + corridor + walls ---- */
  const bld = el(`${styles.grp} ${styles.bld}`);
  flat(0, 0, 1.5, BW, BD, 'var(--plaster-in)', 4, bld);
  flat(4, 202, 2, BW - 8, 46, 'var(--corridor)', 0, bld);
  const WT = 5, HX = 64, HI = 44;
  const wallH = (x1: number, x2: number, y: number, h: number, c: string) => box(x1, y - WT / 2, 0, x2 - x1, WT, h, c, bld);
  const wallV = (y1: number, y2: number, x: number, h: number, c: string) => box(x - WT / 2, y1, 0, WT, y2 - y1, h, c, bld);
  const wallHGaps = (x1: number, x2: number, y: number, h: number, gaps: number[], c: string) => {
    let s = x1;
    gaps.sort((a, b) => a - b).forEach((g) => {
      wallH(s, g - 22, y, h, c);
      s = g + 22;
    });
    wallH(s, x2, y, h, c);
  };
  const P = 'var(--plaster)', PI = 'var(--plaster-in)';
  wallH(0, BW, 0, HX, P); wallH(0, BW, BD, HX, P); wallV(0, BD, BW, HX, P);
  wallV(0, 80, 0, HX, P); wallV(124, BD, 0, HX, P);
  [200, 360, 520].forEach((x) => wallV(0, 200, x, HI, PI));
  [180, 360, 520].forEach((x) => wallV(250, BD, x, HI, PI));
  wallHGaps(0, BW, 200, HI, [100, 280, 440, 600], PI);
  wallHGaps(0, BW, 250, HI, [90, 270, 440, 600], PI);
  flat(30, BD - 1, HX - 6, 620, 2, 'var(--teal)', 0, bld);
  world.appendChild(bld);

  /* ---- room furnishings: local coordinates, modular per room ---- */
  const FURN: Record<string, (g: HTMLElement) => void> = {
    welcome(g) { flat(14, 112, 2.5, 140, 76, 'color-mix(in srgb,var(--teal),var(--cream) 70%)', 10, g);
      piece(56, 40, 3, 92, 28, 30, 'var(--wood)', g); flat(60, 36, 33.5, 84, 6, 'var(--cream)', 3, g);
      piece(22, 128, 3, 78, 30, 20, 'var(--teal)', g); piece(22, 122, 23, 78, 8, 12, 'var(--teal)', g);
      piece(118, 134, 3, 28, 28, 18, 'var(--clay)', g); piece(154, 134, 3, 28, 28, 18, 'var(--clay)', g);
      flat(118, 118, 3, 64, 10, 'var(--wood-2)', 4, g);
      piece(40, 160, 3, 22, 22, 16, 'var(--wood-2)', g); flat(36, 156, 19.5, 30, 30, 'var(--wood)', 999, g);
      tree(176, 22, 26, g); },
    dtt(g) { piece(52, 78, 3, 56, 36, 24, 'var(--wood)', g);
      flat(60, 84, 27.5, 12, 10, 'var(--mustard)', 2, g); flat(76, 84, 27.5, 12, 10, 'var(--teal)', 2, g); flat(92, 84, 27.5, 12, 10, 'var(--clay)', 2, g);
      piece(70, 52, 3, 18, 18, 14, 'var(--charcoal)', g); piece(70, 122, 3, 18, 18, 14, 'var(--charcoal)', g);
      piece(14, 10, 3, 110, 18, 40, 'var(--cream)', g); flat(20, 12, 43.5, 30, 12, 'var(--mat)', 2, g); flat(56, 12, 43.5, 30, 12, 'var(--sage)', 2, g); flat(92, 12, 43.5, 24, 12, 'var(--mustard)', 2, g);
      piece(132, 150, 3, 18, 36, 30, 'var(--wood-2)', g); },
    circle(g) { flat(18, 46, 2.5, 124, 124, 'color-mix(in srgb,var(--sage),var(--cream) 55%)', 999, g);
      [[72, 58], [106, 76], [114, 112], [86, 138], [48, 126], [40, 92]].forEach((p) => piece(p[0], p[1], 3, 16, 16, 7, 'var(--clay)', g));
      piece(66, 92, 3, 28, 28, 9, 'var(--teal)', g);
      piece(60, 12, 3, 42, 4, 46, 'var(--wood-2)', g); flat(63, 12.5, 20, 36, 1, 'var(--cream)', 0, g);
      piece(132, 160, 3, 24, 24, 16, 'var(--wood)', g); },
    gym(g) { flat(10, 10, 2.5, 140, 180, 'color-mix(in srgb,var(--mat),var(--cream) 62%)', 14, g);
      piece(22, 28, 3, 52, 44, 32, 'var(--mat)', g); piece(22, 72, 3, 52, 24, 16, 'var(--mat)', g);
      piece(88, 120, 3, 62, 54, 12, 'var(--teal)', g);
      piece(30, 160, 3, 96, 10, 10, 'var(--wood)', g);
      piece(90, 36, 3, 56, 26, 26, 'var(--mustard)', g);
      flat(24, 112, 3, 38, 38, 'var(--clay)', 999, g); flat(30, 118, 3.2, 26, 26, 'var(--cream)', 999, g); },
    net(g) { flat(26, 54, 2.5, 132, 110, 'color-mix(in srgb,var(--mustard),var(--cream) 72%)', 12, g);
      piece(60, 92, 3, 18, 18, 16, 'var(--teal)', g); piece(62, 94, 19, 14, 14, 14, 'var(--mustard)', g); piece(64, 96, 33, 10, 10, 10, 'var(--clay)', g);
      piece(16, 10, 3, 70, 14, 28, 'var(--wood)', g); flat(20, 12, 31.5, 16, 10, 'var(--teal)', 1, g); flat(40, 12, 31.5, 16, 10, 'var(--clay)', 1, g); flat(60, 12, 31.5, 16, 10, 'var(--sage)', 1, g);
      piece(122, 140, 3, 38, 38, 16, 'var(--sage)', g);
      piece(100, 20, 3, 30, 22, 20, 'var(--cream)', g); piece(134, 20, 3, 30, 22, 20, 'var(--cream)', g);
      flat(110, 110, 3, 10, 10, 'var(--mat)', 999, g); flat(126, 98, 3, 8, 8, 'var(--mat)', 999, g); },
    enriched(g) { piece(18, 30, 3, 62, 42, 24, 'var(--wood)', g); piece(98, 118, 3, 62, 42, 24, 'var(--wood)', g);
      [[8, 60], [48, 60], [8, 10], [48, 10]].forEach((p) => piece(p[0] + 16, p[1] + 18, 3, 14, 14, 12, 'var(--charcoal)', g));
      [[108, 100], [136, 100], [108, 166], [136, 166]].forEach((p) => piece(p[0], p[1], 3, 14, 14, 12, 'var(--charcoal)', g));
      piece(96, 8, 3, 76, 14, 44, 'var(--cream)', g); flat(100, 10, 47.5, 20, 10, 'var(--teal)', 1, g); flat(124, 10, 47.5, 20, 10, 'var(--mustard)', 1, g); flat(148, 10, 47.5, 20, 10, 'var(--clay)', 1, g);
      piece(14, 180, 3, 110, 4, 40, 'var(--sage)', g);
      flat(24, 36, 27.5, 20, 14, 'var(--cream)', 2, g); flat(50, 36, 27.5, 14, 14, 'var(--mustard)', 999, g);
      flat(16, 120, 2.5, 60, 50, 'color-mix(in srgb,var(--mat),var(--cream) 70%)', 8, g); },
    kitchen(g) { piece(14, 8, 3, 122, 26, 34, 'var(--cream)', g); piece(14, 34, 3, 26, 96, 34, 'var(--cream)', g);
      flat(60, 12, 37.5, 28, 18, 'var(--charcoal)', 3, g); flat(100, 12, 37.5, 28, 18, 'var(--mat)', 4, g);
      piece(122, 8, 3, 30, 30, 62, 'var(--teal)', g);
      piece(60, 112, 3, 58, 40, 28, 'var(--wood)', g); piece(82, 92, 3, 16, 16, 13, 'var(--charcoal)', g); piece(82, 156, 3, 16, 16, 13, 'var(--charcoal)', g);
      flat(70, 120, 31.5, 16, 12, 'var(--cream)', 999, g); flat(92, 120, 31.5, 16, 12, 'var(--cream)', 999, g);
      flat(20, 40, 37.5, 14, 80, 'color-mix(in srgb,var(--cream),#000 8%)', 2, g);
      piece(134, 160, 3, 20, 26, 30, 'var(--wood-2)', g); },
    bedroom(g) { flat(16, 150, 2.5, 130, 40, 'color-mix(in srgb,var(--clay),var(--cream) 70%)', 8, g);
      piece(18, 28, 3, 72, 104, 18, 'var(--wood-2)', g); flat(22, 60, 21.5, 64, 68, 'var(--teal)', 4, g); piece(26, 34, 21, 56, 22, 8, 'var(--cream)', g);
      piece(98, 10, 3, 54, 24, 40, 'var(--wood)', g); flat(100, 12, 43.5, 50, 20, 'color-mix(in srgb,var(--wood),#fff 20%)', 2, g);
      piece(96, 44, 3, 22, 22, 24, 'var(--wood)', g); piece(100, 48, 27, 14, 14, 16, 'var(--mustard)', g);
      piece(120, 176, 3, 36, 4, 46, 'var(--charcoal)', g); flat(122, 176.5, 10, 32, 1, 'var(--cream)', 0, g);
      flat(28, 66, 22, 54, 10, 'var(--mustard)', 3, g); flat(28, 80, 22, 54, 10, 'var(--clay)', 3, g); },
  };

  model.rooms.forEach((r: Room) => {
    const g = el(`${styles.grp} ${styles.room}`);
    g.dataset.room = r.id;
    g.style.transform = `translate3d(${r.x}px,${r.y}px,0)`;
    flat(3, 3, 2, r.w - 6, r.d - 6, `linear-gradient(135deg, color-mix(in srgb,${r.floor},#fff 10%), ${r.floor})`, 2, g, styles.floor);
    FURN[r.id]?.(g);
    const l = el(styles.lbl);
    l.style.setProperty('--lx', r.w / 2 + 'px');
    l.style.setProperty('--ly', r.d / 2 + 'px');
    l.style.setProperty('--lz', '78px');
    const b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('aria-label', `${r.n} ${r.short}: open ${r.name}`);
    b.dataset.room = r.id;
    b.innerHTML = `<span class="${styles.n}">${r.n}</span> ${r.short}`;
    l.appendChild(b);
    g.appendChild(l);
    world.appendChild(g);
  });
}
