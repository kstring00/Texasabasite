/** A stylized Texas outline in a 0–100 box. Not a survey; a graphic. */
export const TEXAS_OUTLINE: [number, number][] = [
  [28, 2], [43, 2], [43, 32], [58, 31], [70, 25], [86, 24], [87, 44], [84, 52], [88, 56],
  [80, 62], [72, 72], [65, 82], [58, 98], [52, 90], [48, 82], [42, 72], [36, 76], [30, 72],
  [24, 64], [18, 58], [10, 54], [2, 52], [2, 36], [28, 36],
];

export const TEXAS_PATH = 'M' + TEXAS_OUTLINE.map(([x, y]) => `${x} ${y}`).join(' L') + ' Z';

function inside(x: number, y: number) {
  let hit = false;
  const n = TEXAS_OUTLINE.length;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const [xi, yi] = TEXAS_OUTLINE[i];
    const [xj, yj] = TEXAS_OUTLINE[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit;
  }
  return hit;
}

/** Dot-matrix fill: the map as a field of points, with room for the six centers to glow. */
export function texasDots(step = 3): [number, number][] {
  const dots: [number, number][] = [];
  for (let y = 1; y < 100; y += step) {
    for (let x = 1; x < 100; x += step) {
      if (inside(x + (Math.floor(y / step) % 2 ? step / 2 : 0), y)) dots.push([x + (Math.floor(y / step) % 2 ? step / 2 : 0), y]);
    }
  }
  return dots;
}
