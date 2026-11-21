'use client';

import { useEffect, useRef, useState } from 'react';
import { CategoryScale, Chart as ChartJS, Legend, LineElement, LinearScale, PointElement, Tooltip, type ChartData, type ChartOptions } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { ChartLine, Table } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

export type LcChartPoint = { label: string; held: number; registrations: number | null; attendances: number | null; registrationsText: string; attendancesText: string };

/**
 * Participation over time: one chart, with the same figures as a table one press away.
 * The table is what the page renders first, so the numbers are readable before any script runs
 * and by anyone who cannot use a chart. A period with no number has no point on the line.
 */
export function LcParticipationChart({ points, unit, summary }: { points: LcChartPoint[]; unit: string; summary: string }) {
  const box = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<'table' | 'chart'>('table');
  const [look, setLook] = useState<{ iris: string; blue: string; ink: string; muted: string; grid: string; font: string; still: boolean } | null>(null);
  const hasNumbers = points.some((p) => p.registrations !== null || p.attendances !== null);

  useEffect(() => {
    if (!box.current) return;
    const css = getComputedStyle(box.current);
    const token = (name: string, fallback: string) => css.getPropertyValue(name).trim() || fallback;
    setLook({
      iris: token('--lc-iris-600', '#5b4fd6'), blue: token('--lc-blue-700', '#1d5fa8'), ink: token('--lc-ink', '#172138'), muted: token('--lc-ink-muted', '#55607a'), grid: token('--lc-border', '#e3e7ef'),
      font: css.fontFamily, still: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    });
    if (hasNumbers) setMode('chart');
  }, [hasNumbers]);

  const data: ChartData<'line'> | null = look
    ? {
        labels: points.map((p) => p.label),
        datasets: [
          { label: 'Attendances', data: points.map((p) => p.attendances), borderColor: look.iris, backgroundColor: look.iris, borderWidth: 2.5, pointRadius: 5, pointHoverRadius: 7, pointStyle: 'circle', spanGaps: true, tension: 0.25 },
          { label: 'Registrations submitted', data: points.map((p) => p.registrations), borderColor: look.blue, backgroundColor: '#ffffff', borderWidth: 2, borderDash: [6, 5], pointRadius: 5, pointHoverRadius: 7, pointStyle: 'rectRot', pointBorderWidth: 2, spanGaps: true, tension: 0.25 },
        ],
      }
    : null;
  const options: ChartOptions<'line'> | null = look
    ? {
        responsive: true, maintainAspectRatio: false, animation: look.still ? false : { duration: 400 },
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { position: 'bottom', labels: { usePointStyle: true, color: look.ink, font: { family: look.font, size: 14 }, padding: 18 } },
          tooltip: { titleFont: { family: look.font }, bodyFont: { family: look.font } },
        },
        scales: {
          x: { grid: { display: false }, ticks: { color: look.muted, font: { family: look.font, size: 13 }, maxRotation: 0, autoSkipPadding: 12 } },
          y: { beginAtZero: true, grid: { color: look.grid }, border: { display: false }, ticks: { color: look.muted, font: { family: look.font, size: 13 }, precision: 0 } },
        },
      }
    : null;

  return (
    <div ref={box} className="lc-chart">
      {look && hasNumbers ? (
        <div className="lc-toggle" role="group" aria-label="How to show participation over time">
          <button type="button" aria-pressed={mode === 'chart'} onClick={() => setMode('chart')}>
            <ChartLine width={18} height={18} strokeWidth={1.75} aria-hidden="true" />
            View as chart
          </button>
          <button type="button" aria-pressed={mode === 'table'} onClick={() => setMode('table')}>
            <Table width={18} height={18} strokeWidth={1.75} aria-hidden="true" />
            View as table
          </button>
        </div>
      ) : null}
      {mode === 'chart' && data && options ? (
        <div className="lc-chart-canvas">
          <Line data={data} options={options} aria-label={summary} />
        </div>
      ) : (
        <div className="lc-numbers-box">
          <div className="lc-table-wrap">
            <table className="lc-table lc-table-numbers">
              <caption className="lc-sr-only">Participation by {unit}</caption>
              <thead>
                <tr>
                  <th scope="col">{unit === 'week' ? 'Week starting' : 'Month'}</th>
                  <th scope="col">Trainings held</th>
                  <th scope="col">Registrations submitted</th>
                  <th scope="col">Attendances</th>
                </tr>
              </thead>
              <tbody>
                {points.map((p) => (
                  <tr key={p.label}>
                    <th scope="row">{p.label}</th>
                    <td data-label="Trainings held">{p.held}</td>
                    <td data-label="Registrations">{p.registrationsText}</td>
                    <td data-label="Attendances">{p.attendancesText}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
