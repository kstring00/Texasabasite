import Link from 'next/link';

export default function LearnStaffNotFound() {
  return (
    <div className="lc-solid lc-empty">
      <p className="lc-empty-title">That page was not found</p>
      <p className="lc-muted">It may not exist, or it may not be part of your role.</p>
      <Link href="/learn/staff" className="lc-btn lc-btn-primary">
        Go to the overview
      </Link>
    </div>
  );
}
