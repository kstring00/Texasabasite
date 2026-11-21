import fs from 'node:fs';
import path from 'node:path';
import { randomBytes } from 'node:crypto';
import { buildDemoStaffStore } from '@/data/learn/demo/staff-seed';
import { learnFlags } from '../flags';
import type { LcStaffStore } from './submissions';

/**
 * The local demo store. SERVER ONLY, and only when LEARN_DEMO_STAFF is on, which is refused
 * whenever the code runs on Vercel. Everything is kept in one gitignored folder on this
 * computer: `.learn-demo/store.json`, `.learn-demo/uploads/` and a signing secret.
 * Nothing is ever written under `public/`, and nothing is written on a deployment.
 *
 * A real deployment replaces this file with organization-approved private storage, malware
 * scanning and a database. The functions in submissions.ts do not change.
 */
// The browser tests keep their own copy in a subfolder, so running them never wipes a demo someone has set up by hand.
const DIR = path.join(process.cwd(), '.learn-demo', process.env.LEARN_DEMO_STORE === 'e2e' ? 'e2e' : '');
const UPLOADS = path.join(DIR, 'uploads');
const STORE_FILE = path.join(DIR, 'store.json');
const SECRET_FILE = path.join(DIR, 'secret');

type Globals = { __lcStaffStore?: LcStaffStore; __lcStaffSecret?: string };
const g = globalThis as Globals;

function assertDemo() {
  if (!learnFlags.demoStaff) throw new Error('The staff demo is switched off.');
}

function ensureDirs() {
  fs.mkdirSync(UPLOADS, { recursive: true });
}

/** A stored file name is always one we generated: letters, numbers and hyphens, ending .pptx. */
function uploadPath(objectKey: string): string {
  if (!/^[a-z0-9-]{1,80}\.pptx$/.test(objectKey)) throw new Error('Bad object key.');
  return path.join(UPLOADS, objectKey);
}

function seed(): LcStaffStore {
  const { store, files } = buildDemoStaffStore();
  for (const [key, bytes] of files) fs.writeFileSync(uploadPath(key), bytes);
  return store;
}

export function getStaffStore(): LcStaffStore {
  assertDemo();
  if (g.__lcStaffStore) return g.__lcStaffStore;
  ensureDirs();
  let store: LcStaffStore | null = null;
  try {
    const parsed = JSON.parse(fs.readFileSync(STORE_FILE, 'utf8')) as LcStaffStore;
    if (parsed && parsed.v === 1 && Array.isArray(parsed.submissions)) {
      // A store written before modules existed gains an empty list.
      if (!Array.isArray(parsed.modules)) parsed.modules = [];
      // A store written before training listings existed gains the seeded examples.
      if (!Array.isArray(parsed.listings) || !Array.isArray(parsed.reports)) {
        const fresh = buildDemoStaffStore().store;
        parsed.listings = fresh.listings;
        parsed.reports = fresh.reports;
        parsed.audit.push(...fresh.audit.filter((a) => a.targetType !== 'submission'));
      }
      store = parsed;
    }
  } catch {
    store = null;
  }
  if (!store) {
    store = seed();
    fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2));
  }
  g.__lcStaffStore = store;
  return store;
}

/** Write the store to disk after a change. Written to a temporary file first so a crash cannot leave half a file. */
export function commitStaffStore(): void {
  assertDemo();
  ensureDirs();
  const tmp = `${STORE_FILE}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(getStaffStore(), null, 2));
  fs.renameSync(tmp, STORE_FILE);
}

/** Put the demo back to its seeded state and remove every uploaded file. */
export function resetStaffStore(): void {
  assertDemo();
  ensureDirs();
  for (const name of fs.readdirSync(UPLOADS)) fs.rmSync(path.join(UPLOADS, name), { force: true });
  g.__lcStaffStore = seed();
  commitStaffStore();
}

export function writeUpload(objectKey: string, bytes: Uint8Array): void {
  assertDemo();
  ensureDirs();
  fs.writeFileSync(uploadPath(objectKey), bytes);
}

export function readUpload(objectKey: string): Buffer | null {
  assertDemo();
  try {
    return fs.readFileSync(uploadPath(objectKey));
  } catch {
    return null;
  }
}

export function deleteUpload(objectKey: string): void {
  assertDemo();
  try {
    fs.rmSync(uploadPath(objectKey), { force: true });
  } catch {
    /* already gone */
  }
}

/** The secret that signs the demo session cookie. Made once, kept in the gitignored folder. */
export function getSessionSecret(): string {
  assertDemo();
  if (g.__lcStaffSecret) return g.__lcStaffSecret;
  ensureDirs();
  let secret = '';
  try {
    secret = fs.readFileSync(SECRET_FILE, 'utf8').trim();
  } catch {
    secret = '';
  }
  if (secret.length < 32) {
    secret = randomBytes(32).toString('hex');
    fs.writeFileSync(SECRET_FILE, secret, { mode: 0o600 });
  }
  g.__lcStaffSecret = secret;
  return secret;
}
