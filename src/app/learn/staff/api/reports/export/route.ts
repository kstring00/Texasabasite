import { NextResponse } from 'next/server';
import { getLcCategoryById } from '@/data/learn/categories';
import { learnFlags } from '@/lib/learn/flags';
import { getStaffActor } from '@/lib/learn/staff/guard';
import { LC_REPORT_BANNER, buildDashboard, canViewAnalytics, dashboardCsv, readReportQuery } from '@/lib/learn/staff/reports';
import { getStaffStore } from '@/lib/learn/staff/store';
import { formatCtShortDate } from '@/lib/learn/time';

export const dynamic = 'force-dynamic';

const gone = () => new NextResponse('Not found', { status: 404, headers: { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' } });

/**
 * The download: the same totals as the reporting page, as a spreadsheet file.
 * Closed unless the local staff demo is on, and only for a role that may see reporting.
 * Anyone else gets "not found", the same answer as an address that does not exist.
 */
export async function GET(request: Request) {
  if (!learnFlags.demoStaff) return gone();
  const actor = await getStaffActor();
  if (!actor || !canViewAnalytics(actor)) return gone();
  const now = new Date();
  const store = getStaffStore();
  const q = readReportQuery(Object.fromEntries(new URL(request.url).searchParams), now);
  const d = buildDashboard(store, actor, { from: q.range.from, to: q.range.to, categoryId: q.categoryId, trainingId: q.trainingId }, now);
  if (!d) return gone();
  const training = q.trainingId ? store.listings.find((l) => l.id === q.trainingId)?.training.title : null;
  const filters = [q.categoryId ? `Topic: ${getLcCategoryById(q.categoryId)?.name}` : 'All topics', training ? `Training: ${training}` : 'All trainings'].join('; ');
  const csv = dashboardCsv(d, { period: `${q.range.from} to ${q.range.to} (Central Time)`, filters, banner: LC_REPORT_BANNER, generatedOn: formatCtShortDate(now.toISOString()) });
  // The byte-order mark lets spreadsheet programs read the punctuation correctly.
  return new NextResponse(`﻿${csv}`, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="learning-center-participation-${q.range.from}-to-${q.range.to}.csv"`,
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
