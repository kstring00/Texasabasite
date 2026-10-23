import { ClientShell } from '@/components/layout/ClientShell';

export default function ClientPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div data-zone="families">
      <ClientShell>{children}</ClientShell>
    </div>
  );
}
