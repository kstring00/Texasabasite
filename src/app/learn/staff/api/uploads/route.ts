import { createHash, randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { learnFlags } from '@/lib/learn/flags';
import { getStaffActor } from '@/lib/learn/staff/guard';
import { LC_MAX_UPLOAD_BYTES, LC_PPTX_MIME, LC_TOO_LARGE_MESSAGE, checkPptxBytes, checkPptxName, safeFileName } from '@/lib/learn/staff/pptx';
import { commitStaffStore, deleteUpload, getStaffStore, writeUpload } from '@/lib/learn/staff/store';
import { attachFile, type LcAsset } from '@/lib/learn/staff/submissions';

export const dynamic = 'force-dynamic';

const json = (status: number, message: string, extra: Record<string, unknown> = {}) => NextResponse.json({ ok: status < 300, message, ...extra }, { status, headers: { 'Cache-Control': 'no-store' } });

/**
 * Upload a PowerPoint to a draft. Demo only, local only. The file is checked on the server
 * from its real bytes, stored in the private `.learn-demo/uploads/` folder under a name we
 * generate, and attached only if the signed-in person owns an editable draft.
 */
export async function POST(request: Request) {
  // Fails closed: with the staff demo off (always the case on Vercel) this address does not exist.
  if (!learnFlags.demoStaff) return json(404, 'Not found.');
  const origin = request.headers.get('origin');
  if (origin && new URL(origin).host !== request.headers.get('host')) return json(403, 'This request did not come from the Learning Center.');
  const actor = await getStaffActor();
  if (!actor) return json(401, 'Your demo session has ended. Sign in again to continue.');
  if (Number(request.headers.get('content-length') ?? 0) > LC_MAX_UPLOAD_BYTES + 1024 * 1024) return json(413, LC_TOO_LARGE_MESSAGE, { code: 'too_large' });

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return json(400, 'The upload did not arrive in one piece. Check your connection and try again.');
  }
  const file = form.get('file');
  const submissionId = String(form.get('submissionId') ?? '');
  if (!(file instanceof File)) return json(400, 'Choose a PowerPoint file to upload.');

  const fileName = safeFileName(file.name);
  const nameCheck = checkPptxName(fileName);
  if (!nameCheck.ok) return json(415, nameCheck.message, { code: nameCheck.code });
  if (file.size > LC_MAX_UPLOAD_BYTES) return json(413, LC_TOO_LARGE_MESSAGE, { code: 'too_large' });
  const bytes = new Uint8Array(await file.arrayBuffer());
  const byteCheck = checkPptxBytes(bytes);
  if (!byteCheck.ok) return json(byteCheck.code === 'too_large' ? 413 : 415, byteCheck.message, { code: byteCheck.code });

  const assetId = randomUUID();
  const asset: LcAsset = {
    id: assetId, objectKey: `${assetId}.pptx`, fileName, mimeType: LC_PPTX_MIME, byteSize: bytes.length,
    sha256: createHash('sha256').update(bytes).digest('hex'), scanState: 'not_configured', uploadedBy: actor.id, createdAt: new Date().toISOString(), synthetic: false,
  };
  // Write first, then attach. If the rules refuse the attach, the bytes are removed again.
  writeUpload(asset.objectKey, bytes);
  const r = attachFile(getStaffStore(), actor, submissionId, asset, { now: asset.createdAt, newId: () => randomUUID() });
  if (!r.ok) {
    deleteUpload(asset.objectKey);
    return json(r.code === 'not_found' ? 404 : r.code === 'forbidden' ? 403 : 409, r.message);
  }
  if (r.value.replaced) deleteUpload(r.value.replaced.objectKey);
  commitStaffStore();
  return json(200, 'Uploaded and checked.', { rev: r.value.submission.rev, file: { name: asset.fileName, size: asset.byteSize } });
}
