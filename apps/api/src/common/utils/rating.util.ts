import { RatingType } from '@prisma/client';

const DSA_TIERS = [
  { min: 0, max: 999, title: 'Starter' },
  { min: 1000, max: 1199, title: 'Builder' },
  { min: 1200, max: 1399, title: 'Solver' },
  { min: 1400, max: 1599, title: 'Strategist' },
  { min: 1600, max: 1799, title: 'Expert' },
  { min: 1800, max: 9999, title: 'Legend' },
] as const;

const CP_TIERS = [
  { min: 0, max: 999, title: 'Rookie' },
  { min: 1000, max: 1199, title: 'Coder' },
  { min: 1200, max: 1399, title: 'Competitor' },
  { min: 1400, max: 1599, title: 'Challenger' },
  { min: 1600, max: 1799, title: 'Elite' },
  { min: 1800, max: 9999, title: 'Champion' },
] as const;

export function getRatingTitle(rating: number, type: RatingType): string {
  const tiers = type === RatingType.DSA ? DSA_TIERS : CP_TIERS;
  return (
    tiers.find((t) => rating >= t.min && rating <= t.max)?.title ?? 'Starter'
  );
}

/** Points gained on first AC in a contest problem. */
export function ratingDeltaForSolve(
  contestType: 'DSA' | 'COMPETITIVE_PROGRAMMING',
  difficulty: 'EASY' | 'MEDIUM' | 'HARD',
): number {
  const base = contestType === 'COMPETITIVE_PROGRAMMING' ? 12 : 8;
  const mult = difficulty === 'HARD' ? 2 : difficulty === 'MEDIUM' ? 1.5 : 1;
  return Math.round(base * mult);
}
