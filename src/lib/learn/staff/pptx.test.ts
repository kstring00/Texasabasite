import { describe, expect, it } from 'vitest';
import { checkPptxBytes, checkPptxName, formatBytes, makeSyntheticPptx, safeFileName } from './pptx';

describe('PowerPoint file checks', () => {
  it('accepts only names ending in .pptx and explains the older format', () => {
    expect(checkPptxName('Deck.PPTX').ok).toBe(true);
    const old = checkPptxName('deck.ppt');
    expect(old.ok).toBe(false);
    if (!old.ok) expect(old.code).toBe('old_format');
    for (const n of ['deck.pdf', 'deck.pptx.exe', 'deck', 'deck.key']) expect(checkPptxName(n).ok).toBe(false);
  });
  it('accepts a real-shaped .pptx and the synthetic demo file', () => {
    expect(checkPptxBytes(makeSyntheticPptx('test'))).toEqual({ ok: true });
  });
  it('rejects empty, oversized, old-format, non-zip and damaged files by their bytes', () => {
    const code = (b: Uint8Array, max?: number) => { const r = checkPptxBytes(b, max); return r.ok ? 'ok' : r.code; };
    expect(code(new Uint8Array(0))).toBe('empty');
    expect(code(makeSyntheticPptx('x'), 100)).toBe('too_large');
    expect(code(new Uint8Array([0xd0, 0xcf, 0x11, 0xe0, 0, 0]))).toBe('old_format');
    expect(code(new TextEncoder().encode('just some text'))).toBe('wrong_type');
    expect(code(new Uint8Array([0x50, 0x4b, 0x03, 0x04, ...new Array(100).fill(0)]))).toBe('damaged');
  });
  it('makes file names safe to show and never keeps a folder path', () => {
    expect(safeFileName('../../etc/passwd')).toBe('passwd');
    expect(safeFileName('C:\\Users\\me\\My deck.pptx')).toBe('My deck.pptx');
    expect(safeFileName('a<b>:"c".pptx')).toBe('abc.pptx');
    expect(safeFileName('')).toBe('presentation.pptx');
    expect(safeFileName('x'.repeat(300)).length).toBe(120);
  });
  it('formats sizes in plain units', () => {
    expect(formatBytes(512)).toBe('512 bytes');
    expect(formatBytes(2048)).toBe('2 KB');
    expect(formatBytes(5 * 1024 * 1024)).toBe('5.0 MB');
  });
});
