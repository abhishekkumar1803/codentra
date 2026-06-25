'use client';

import { Button } from '@codentra/ui';

const contestTypes = [
  { value: '', label: 'All types' },
  { value: 'DSA', label: 'DSA' },
  { value: 'COMPETITIVE_PROGRAMMING', label: 'CP' },
  { value: 'SYSTEM_DESIGN', label: 'System Design' },
];

const contestStatuses = [
  { value: '', label: 'All statuses' },
  { value: 'SCHEDULED', label: 'Scheduled' },
  { value: 'LIVE', label: 'Live' },
  { value: 'ENDED', label: 'Ended' },
];

export function ContestFilters({
  type,
  status,
  onTypeChange,
  onStatusChange,
  hideTypeFilter = false,
}: {
  type: string;
  status: string;
  onTypeChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  hideTypeFilter?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {!hideTypeFilter && (
      <div className="flex flex-wrap gap-1">
        {contestTypes.map((t) => (
          <Button
            key={t.value || 'all-types'}
            size="sm"
            variant={type === t.value ? 'default' : 'outline'}
            onClick={() => onTypeChange(t.value)}
          >
            {t.label}
          </Button>
        ))}
      </div>
      )}
      <div className="flex flex-wrap gap-1">
        {contestStatuses.map((s) => (
          <Button
            key={s.value || 'all-statuses'}
            size="sm"
            variant={status === s.value ? 'default' : 'outline'}
            onClick={() => onStatusChange(s.value)}
          >
            {s.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
