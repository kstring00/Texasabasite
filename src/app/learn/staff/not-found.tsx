import Link from 'next/link';

export default function LearnStaffNotFound() {
  return (
    <div className="lc-solid lc-empty">
      <h1 className="lc-empty-title">That page was not found</h1>
      <p className="lc-muted">It may not exist, or it may not be part of your role.</p>
      <Link href="/learn/staff" className="lc-btn lc-btn-primary">
        Go to the overview
      </Link>
    </div>
  );
}
