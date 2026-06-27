'use client';

import type { RatingHistoryEntry } from '@codentra/types';
import { getRatingTier, type RatingType } from '@codentra/types';

type Props = {
  title: string;
  type: RatingType;
  currentRating: number;
  history: RatingHistoryEntry[];
};

export function RatingChart({ title, type, currentRating, history }: Props) {
  const tier = getRatingTier(currentRating, type);
  const points =
    history.length > 0
      ? history
      : [
          {
            id: 'start',
            type,
            rating: currentRating,
            delta: 0,
            reason: null,
            createdAt: new Date().toISOString(),
          },
        ];

  const ratings = points.map((p) => p.rating);
  const min = Math.min(...ratings, currentRating) - 50;
  const max = Math.max(...ratings, currentRating) + 50;
  const range = Math.max(max - min, 100);

  const width = 320;
  const height = 120;
  const padding = 12;

  const coords = ratings.map((rating, i) => {
    const x =
      padding + (i / Math.max(ratings.length - 1, 1)) * (width - padding * 2);
    const y =
      height - padding - ((rating - min) / range) * (height - padding * 2);
    return { x, y, rating };
  });

  const linePath = coords
    .map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x} ${c.y}`)
    .join(' ');

  return (
    <div className="rounded-lg border p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{currentRating}</p>
        </div>
        <span
          className="rounded-full px-3 py-1 text-xs font-semibold text-white"
          style={{ backgroundColor: tier.color }}
        >
          {tier.title}
        </span>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full max-w-md"
        role="img"
        aria-label={`${title} rating history`}
      >
        <line
          x1={padding}
          y1={height - padding}
          x2={width - padding}
          y2={height - padding}
          stroke="currentColor"
          className="text-border"
        />
        {linePath && (
          <path
            d={linePath}
            fill="none"
            stroke={tier.color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
        {coords.map((c, i) => (
          <circle key={i} cx={c.x} cy={c.y} r="4" fill={tier.color} />
        ))}
      </svg>

      <p className="mt-2 text-xs text-muted-foreground">
        Rating progression over your recent contest activity.
      </p>
    </div>
  );
}
