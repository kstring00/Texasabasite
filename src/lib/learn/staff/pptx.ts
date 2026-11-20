/**
 * Checks on an uploaded PowerPoint, run on the server against the real bytes.
 * The browser's file name and type are never trusted on their own.
 *
 * This is a format check only. It is not a malware scan and it cannot detect client
 * information inside a file. Real use needs both, through organization-approved services.
 */
export const LC_MAX_UPLOAD_BYTES = 40 * 1024 * 1024;
export const LC_MAX_UPLOAD_LABEL = '40 MB';
export const LC_PPTX_MIME = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';

export const LC_TOO_LARGE_MESSAGE = `That file is larger than ${LC_MAX_UPLOAD_LABEL}. Try compressing its pictures in PowerPoint, then upload it again.`;

export type LcFileCheck = { ok: true } | { ok: false; code: 'empty' | 'too_large' | 'wrong_type' | 'old_format' | 'damaged'; message: string };

const ZIP_MAGIC = [0x50, 0x4b, 0x03, 0x04];
const OLE_MAGIC = [0xd0, 0xcf, 0x11, 0xe0];

const startsWith = (bytes: Uint8Array, magic: number[]) => magic.every((b, i) => bytes[i] === b);

function includesAscii(bytes: Uint8Array, text: string): boolean {
  const needle = Array.from(text, (c) => c.charCodeAt(0));
  outer: for (let i = 0; i <= bytes.length - needle.length; i++) {
    for (let j = 0; j < needle.length; j++) if (bytes[i + j] !== needle[j]) continue outer;
    return true;
  }
  return false;
}

/** A display-safe file name: no folders, no control characters, a sensible length. */
export function safeFileName(raw: string): string {
  const base = raw.split(/[\\/]/).pop() ?? '';
  const clean = base.replace(/[\u0000-\u001f\u007f<>:"|?*]/g, '').trim().slice(0, 120);
  return clean || 'presentation.pptx';
}

export function checkPptxName(name: string): LcFileCheck {
  const lower = name.toLowerCase();
  if (lower.endsWith('.pptx')) return { ok: true };
  if (lower.endsWith('.ppt')) return { ok: false, code: 'old_format', message: 'This is an older .ppt file. Open it in PowerPoint, choose Save As, pick “PowerPoint Presentation (.pptx)”, then upload that file.' };
  return { ok: false, code: 'wrong_type', message: 'Please choose a PowerPoint file that ends in .pptx.' };
}

export function checkPptxBytes(bytes: Uint8Array, maxBytes = LC_MAX_UPLOAD_BYTES): LcFileCheck {
  if (bytes.length === 0) return { ok: false, code: 'empty', message: 'That file is empty. Please choose the presentation again.' };
  if (bytes.length > maxBytes) return { ok: false, code: 'too_large', message: LC_TOO_LARGE_MESSAGE };
  if (startsWith(bytes, OLE_MAGIC)) return { ok: false, code: 'old_format', message: 'This file is in the older PowerPoint format. Save it as .pptx in PowerPoint, then upload that file.' };
  // A .pptx is a zip archive that contains the presentation part.
  if (!startsWith(bytes, ZIP_MAGIC)) return { ok: false, code: 'wrong_type', message: 'This file is not a PowerPoint presentation, even though its name ends in .pptx.' };
  if (!includesAscii(bytes, '[Content_Types].xml') || !includesAscii(bytes, 'ppt/presentation.xml')) {
    return { ok: false, code: 'damaged', message: 'This file could not be read as a PowerPoint presentation. It may be damaged. Open it in PowerPoint, save it again, and upload the new copy.' };
  }
  return { ok: true };
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} bytes`;
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

/* ── Synthetic files for the demo and the tests ─────────────────────────── */

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(bytes: Uint8Array): number {
  let c = 0xffffffff;
  for (const b of bytes) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

/**
 * Build a tiny, clearly synthetic .pptx-shaped file: a valid zip holding the two parts the
 * format check looks for and a note saying what it is. It is a stand-in for the demo, not a
 * presentation PowerPoint will open.
 */
export function makeSyntheticPptx(note: string): Uint8Array {
  const enc = new TextEncoder();
  const entries: [string, string][] = [
    ['[Content_Types].xml', '<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"/>'],
    ['ppt/presentation.xml', '<?xml version="1.0" encoding="UTF-8"?><p:presentation xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"/>'],
    ['SYNTHETIC-DEMO-FILE.txt', `Synthetic demo file for the Caregiver Learning Center. Not a real presentation. ${note}`],
  ];
  const chunks: Uint8Array[] = [];
  const central: Uint8Array[] = [];
  let offset = 0;
  const u16 = (v: DataView, o: number, n: number) => v.setUint16(o, n, true);
  const u32 = (v: DataView, o: number, n: number) => v.setUint32(o, n, true);
  for (const [name, text] of entries) {
    const nameBytes = enc.encode(name);
    const data = enc.encode(text);
    const crc = crc32(data);
    const local = new Uint8Array(30 + nameBytes.length);
    const lv = new DataView(local.buffer);
    u32(lv, 0, 0x04034b50); u16(lv, 4, 20); u16(lv, 6, 0); u16(lv, 8, 0); u16(lv, 10, 0); u16(lv, 12, 0x21);
    u32(lv, 14, crc); u32(lv, 18, data.length); u32(lv, 22, data.length); u16(lv, 26, nameBytes.length); u16(lv, 28, 0);
    local.set(nameBytes, 30);
    const head = new Uint8Array(46 + nameBytes.length);
    const hv = new DataView(head.buffer);
    u32(hv, 0, 0x02014b50); u16(hv, 4, 20); u16(hv, 6, 20); u16(hv, 8, 0); u16(hv, 10, 0); u16(hv, 12, 0); u16(hv, 14, 0x21);
    u32(hv, 16, crc); u32(hv, 20, data.length); u32(hv, 24, data.length); u16(hv, 28, nameBytes.length);
    u32(hv, 42, offset);
    head.set(nameBytes, 46);
    chunks.push(local, data);
    central.push(head);
    offset += local.length + data.length;
  }
  const centralSize = central.reduce((n, c) => n + c.length, 0);
  const end = new Uint8Array(22);
  const ev = new DataView(end.buffer);
  u32(ev, 0, 0x06054b50); u16(ev, 8, entries.length); u16(ev, 10, entries.length); u32(ev, 12, centralSize); u32(ev, 16, offset);
  const all = [...chunks, ...central, end];
  const out = new Uint8Array(all.reduce((n, c) => n + c.length, 0));
  let at = 0;
  for (const c of all) { out.set(c, at); at += c.length; }
  return out;
}
