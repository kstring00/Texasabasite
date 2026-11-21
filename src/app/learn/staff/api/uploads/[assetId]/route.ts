import { NextResponse } from 'next/server';
import { learnFlags } from '@/lib/learn/flags';
import { getStaffActor } from '@/lib/learn/staff/guard';
import { getStaffStore, readUpload } from '@/lib/learn/staff/store';
import { assetFor } from '@/lib/learn/staff/submissions';

export const dynamic = 'force-dynamic';

const notFound = () => new NextResponse('Not found.', { status: 404, headers: { 'Cache-Control': 'no-store' } });

/**
 * Download a stored PowerPoint. Only for someone who may see the submission it belongs to.
 * Every refusal looks the same (404), so the address reveals nothing about what exists.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ assetId: string }> }) {
  if (!learnFlags.demoStaff) return notFound();
  const actor = await getStaffActor();
  if (!actor) return notFound();
  const asset = assetFor(getStaffStore(), actor, (await params).assetId);
  const bytes = asset ? readUpload(asset.objectKey) : null;
  if (!asset || !bytes) return notFound();
  const asciiName = asset.fileName.replace(/[^\x20-\x7e]/g, '_').replace(/["\\]/g, '_');
  return new NextResponse(new Uint8Array(bytes), {
    headers: {
      'Content-Type': asset.mimeType,
      'Content-Length': String(bytes.length),
      'Content-Disposition': `attachment; filename="${asciiName}"; filename*=UTF-8''${encodeURIComponent(asset.fileName)}`,
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
