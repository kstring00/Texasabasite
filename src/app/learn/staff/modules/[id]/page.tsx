import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CheckCheck, CircleCheck, Download, Eye, Info, Layers, Presentation } from 'lucide-react';
import { LcBack } from '@/components/learn/LcPageHead';
import { LC_MODULE_STATUS, LcModuleChip } from '@/components/learn/staff/LcModuleChip';
import { LcCollectButton, LcImportForm, LcPublishControl, LcSubmitModuleButton, LcWithdrawControl } from '@/components/learn/staff/LcProductionControls';
import { LcStatusChip } from '@/components/learn/staff/LcStatusChip';
import { getDemoStaff } from '@/data/learn/demo/staff';
import { demoGroupTrainingsPackageJson } from '@/data/learn/demo/group-trainings-module';
import { getStaffActor } from '@/lib/learn/staff/guard';
import { approvedSource, canOpenProduction, finalApproval, modulesOf, publishBlock } from '@/lib/learn/staff/pipeline';
import { formatBytes } from '@/lib/learn/staff/pptx';
import { can } from '@/lib/learn/staff/roles';
import { getStaffStore } from '@/lib/learn/staff/store';
import { LC_AUDIT_LABEL, LC_STATUS, viewSubmission } from '@/lib/learn/staff/submissions';
import { formatCtDateTime, formatCtShortDate } from '@/lib/learn/time';

export const metadata: Metadata = { title: 'Module workspace' };

export default async function LearnStaffModuleWorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const actor = await getStaffActor();
  if (!actor) return null;
  if (!canOpenProduction(actor)) notFound();
  const { id } = await params;
  const store = getStaffStore();
  // A producer can open this only once the source holds a clinical approval. Otherwise: not found.
  const view = viewSubmission(store, actor, id);
  const source = view ? approvedSource(store, id) : null;
  if (!view || !source) notFound();
  const { submission: s, audit } = view;
  const modules = modulesOf(store, id);
  const latest = modules.at(-1) ?? null;
  const asset = store.assets.find((a) => a.id === source.version.assetId) ?? null;
  const name = (personId: string | null | undefined) => getDemoStaff(personId)?.displayName ?? 'Staff member';
  const isProducer = can(actor, 'module.import');
  const isPublisher = can(actor, 'module.publish');
  const today = new Date().toISOString().slice(0, 10);

  return (
    <>
      <LcBack href="/learn/staff/modules" label="Modules" />
      <header className="lc-staff-head">
        <div>
          <p className="lc-eyebrow">Module workspace</p>
          <h1 className="lc-h1">{latest ? latest.manifest.title : s.title}</h1>
          <p className="lc-chips">
            <LcStatusChip status={s.status} />
            {latest && LC_MODULE_STATUS[latest.status].label !== LC_STATUS[s.status].label ? <LcModuleChip status={latest.status} /> : null}
          </p>
          <p className="lc-muted">{LC_STATUS[s.status].next}</p>
        </div>
      </header>

      <div className="lc-staff-cols">
        <div className="lc-staff-main-col">
          <section aria-labelledby="lc-ws-source" className="lc-solid lc-panel" data-cast="blue">
            <div className="lc-gate-strip">
              <h2 id="lc-ws-source" className="lc-gate-strip-title">
                <Presentation width={20} height={20} strokeWidth={1.75} aria-hidden="true" /> Gate 1 · Source PowerPoint
              </h2>
              <p className="lc-approval-line">
                <CircleCheck width={20} height={20} strokeWidth={1.75} aria-hidden="true" />
                <span>
                  Version {source.version.versionNumber} of “{s.title}” approved as a source by {name(source.review.reviewerId)} on {formatCtDateTime(source.review.decidedAt)}.
                </span>
              </p>
            </div>
            {asset ? (
              <div className="lc-file-row">
                <span className="lc-icon-tile" data-size="sm" aria-hidden="true">
                  <Presentation width={20} height={20} strokeWidth={1.75} />
                </span>
                <span className="lc-file-text">
                  <span className="lc-file-name">{asset.fileName}</span>
                  <span className="lc-muted">
                    {formatBytes(asset.byteSize)}
                    {asset.synthetic ? ' · Synthetic demo file, not a real presentation' : ''}
                  </span>
                </span>
                <a href={`/learn/staff/api/uploads/${asset.id}`} className="lc-btn lc-btn-secondary lc-btn-wrap" download>
                  <Download width={20} height={20} strokeWidth={1.75} aria-hidden="true" />
                  Download the approved source
                </a>
              </div>
            ) : null}
            {s.status === 'source_approved' ? (
              isProducer ? (
                <LcCollectButton submissionId={s.id} rev={s.rev} />
              ) : (
                <p className="lc-muted">Waiting for a producer to collect this for production.</p>
              )
            ) : null}
          </section>

          {s.status === 'in_production' ? (
            <section aria-labelledby="lc-ws-import" className="lc-solid lc-panel">
              <h2 id="lc-ws-import" className="lc-h2">
                {latest && latest.status !== 'draft' ? 'Import a new module version' : latest ? 'Replace the draft' : 'Import the module'}
              </h2>
              <p className="lc-note" data-cast="amber">
                <Info width={20} height={20} strokeWidth={1.75} aria-hidden="true" />
                <span>
                  The module is made outside this website, from the approved PowerPoint only. This website does not send anything to an AI service and has no “generate” button. Use only approved material with no client information.
                </span>
              </p>
              {isProducer ? <LcImportForm submissionId={s.id} rev={s.rev} sampleJson={demoGroupTrainingsPackageJson} today={today} /> : <p className="lc-muted">A producer imports the module here.</p>}
            </section>
          ) : null}

          <section aria-labelledby="lc-ws-versions" className="lc-solid lc-panel" data-cast="iris">
            <div className="lc-gate-strip">
              <h2 id="lc-ws-versions" className="lc-gate-strip-title">
                <Layers width={20} height={20} strokeWidth={1.75} aria-hidden="true" /> Gate 2 · Final module
              </h2>
              <p className="lc-muted">Each module version needs its own final approval, from someone other than the person who approved the source.</p>
            </div>
            {modules.length === 0 ? <p className="lc-muted">No module has been imported yet.</p> : null}
            <ul className="lc-versions">
              {[...modules].reverse().map((m) => {
                const approval = finalApproval(store, m);
                const block = m.status === 'final_approved' ? publishBlock(store, m) : null;
                return (
                  <li key={m.id}>
                    <div>
                      <p className="lc-versions-title">
                        Module version {m.versionNumber}
                        <LcModuleChip status={m.status} />
                      </p>
                      <p className="lc-muted">
                        Imported by {name(m.importedBy)} on {formatCtShortDate(m.importedAt)} · made from source version {store.versions.find((v) => v.id === m.sourceVersionId)?.versionNumber ?? '?'} · {m.manifest.lessons.length} lessons
                      </p>
                      {approval ? (
                        <p className="lc-approval-line">
                          <CheckCheck width={20} height={20} strokeWidth={1.75} aria-hidden="true" />
                          <span>
                            Final approval by {name(approval.reviewerId)} on {formatCtDateTime(approval.decidedAt)}.
                          </span>
                        </p>
                      ) : null}
                      {m.status === 'published' && m.publishedAt ? <p className="lc-muted">Published by {name(m.publishedBy)} on {formatCtDateTime(m.publishedAt)}.</p> : null}
                      {m.status === 'withdrawn' && m.withdrawnAt ? <p className="lc-muted">Withdrawn by {name(m.withdrawnBy)} on {formatCtDateTime(m.withdrawnAt)}. Reason: {m.withdrawnReason}</p> : null}
                      {m.status === 'draft' && isProducer ? <LcSubmitModuleButton moduleVersionId={m.id} rev={s.rev} /> : null}
                      {m.status === 'final_approved' ? (
                        isPublisher && !block ? <LcPublishControl moduleVersionId={m.id} rev={s.rev} title={m.manifest.title} /> : <p className="lc-muted">{block ?? 'Waiting for someone with permission to publish.'}</p>
                      ) : null}
                      {m.status === 'published' && isPublisher ? <LcWithdrawControl moduleVersionId={m.id} rev={s.rev} title={m.manifest.title} /> : null}
                      {m.status === 'published' ? (
                        <p>
                          <Link href={`/learn/modules/${m.manifest.slug}`} className="lc-link">
                            Open it in the Learning Library
                          </Link>
                        </p>
                      ) : null}
                    </div>
                    <Link href={`/learn/staff/modules/preview/${m.id}`} className="lc-btn lc-btn-secondary">
                      <Eye width={20} height={20} strokeWidth={1.75} aria-hidden="true" />
                      Preview<span className="lc-sr-only"> module version {m.versionNumber}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>

        <aside className="lc-staff-side-col" aria-label="History">
          <section aria-labelledby="lc-ws-history" className="lc-solid lc-panel">
            <h2 id="lc-ws-history" className="lc-h3">
              History
            </h2>
            <ol className="lc-history">
              {audit.map((e) => (
                <li key={e.id}>
                  <p className="lc-history-what">{LC_AUDIT_LABEL[e.action] ?? e.action}</p>
                  <p className="lc-muted">
                    {name(e.actorId)} · {formatCtDateTime(e.at)}
                    {e.note ? ` · ${e.note}` : ''}
                  </p>
                </li>
              ))}
            </ol>
            <p className="lc-muted">This record is read-only.</p>
          </section>
        </aside>
      </div>
    </>
  );
}
