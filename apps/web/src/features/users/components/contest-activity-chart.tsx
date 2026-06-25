'use client';

import type { ContestHistoryEntry } from '@codentra/types';
import Link from 'next/link';

const TYPE_COLORS: Record<string, string> = {
  DSA: '#3b82f6',
  COMPETITIVE_PROGRAMMING: '#8b5cf6',
  QUIZ: '#f59e0b',
  SYSTEM_DESIGN: '#10b981',
};

export function ContestActivityChart({
  history,
}: {
  history: ContestHistoryEntry[];
}) {
  if (history.length === 0) {
    return (
      <div className="rounded-lg border p-4">
        <p className="text-sm font-medium text-muted-foreground">
          Contest activity
        </p>
        <p className="mt-4 text-sm text-muted-foreground">
          No contests joined yet.{' '}
          <Link href="/contests" className="text-primary underline">
            Join a contest
          </Link>{' '}
          to build your graph.
        </p>
      </div>
    );
  }

  const width = 480;
  const height = 160;
  const padding = { top: 16, right: 16, bottom: 36, left: 36 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const maxScore = Math.max(...history.map((h) => h.score), 100);
  const barWidth = Math.min(32, chartW / history.length - 4);

  return (
    <div className="rounded-lg border p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            Contest activity
          </p>
          <p className="text-2xl font-bold">{history.length} contests</p>
        </div>
        <p className="text-xs text-muted-foreground">
          Score per participation
        </p>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        role="img"
        aria-label="Contest participation chart"
      >
        <line
          x1={padding.left}
          y1={padding.top + chartH}
          x2={width - padding.right}
          y2={padding.top + chartH}
          stroke="currentColor"
          className="text-border"
        />
        {history.map((entry, i) => {
          const barH = (entry.score / maxScore) * chartH;
          const x =
            padding.left +
            i * (chartW / history.length) +
            (chartW / history.length - barWidth) / 2;
          const y = padding.top + chartH - barH;
          const color = TYPE_COLORS[entry.contestType] ?? '#6b7280';

          return (
            <g key={entry.id}>
              <title>
                {entry.contestTitle}: {entry.score} pts
                {entry.rank ? ` · rank #${entry.rank}` : ''}
              </title>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(barH, 2)}
                rx={3}
                fill={color}
                opacity={0.85}
              />
              {(history.length <= 8 || i % Math.ceil(history.length / 8) === 0) && (
                <text
                  x={x + barWidth / 2}
                  y={height - 8}
                  textAnchor="middle"
                  className="fill-muted-foreground text-[8px]"
                >
                  {new Date(entry.startTime).toLocaleDateString('en-IN', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
        {Object.entries(TYPE_COLORS).map(([type, color]) => (
          <span key={type} className="flex items-center gap-1">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: color }}
            />
            {type === 'COMPETITIVE_PROGRAMMING' ? 'CP' : type}
          </span>
        ))}
      </div>
    </div>
  );
}
