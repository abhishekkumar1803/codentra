import { cn } from '@codentra/ui';

const statusStyles: Record<string, string> = {
  SCHEDULED: 'bg-blue-100 text-blue-800',
  LIVE: 'bg-green-100 text-green-800',
  ENDED: 'bg-gray-100 text-gray-800',
  DRAFT: 'bg-yellow-100 text-yellow-800',
};

const typeLabels: Record<string, string> = {
  DSA: 'DSA',
  COMPETITIVE_PROGRAMMING: 'Competitive Programming',
  SYSTEM_DESIGN: 'System Design',
  QUIZ: 'Quiz',
};

export function ContestTypeBadge({ type }: { type: string }) {
  return (
    <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
      {typeLabels[type] ?? type}
    </span>
  );
}

export function ContestStatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'rounded-full px-2.5 py-0.5 text-xs font-medium',
        statusStyles[status] ?? 'bg-muted text-muted-foreground',
        className,
      )}
    >
      {status}
    </span>
  );
}

export function formatContestDate(iso: string) {
  return new Date(iso).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
