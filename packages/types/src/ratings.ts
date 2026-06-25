export type RatingType = 'DSA' | 'CP';

export type RatingTier = {
  min: number;
  max: number;
  title: string;
  color: string;
};

/** Codentra DSA rating titles (not Codeforces-style). */
export const DSA_TIERS: RatingTier[] = [
  { min: 0, max: 999, title: 'Starter', color: '#94a3b8' },
  { min: 1000, max: 1199, title: 'Builder', color: '#22c55e' },
  { min: 1200, max: 1399, title: 'Solver', color: '#3b82f6' },
  { min: 1400, max: 1599, title: 'Strategist', color: '#8b5cf6' },
  { min: 1600, max: 1799, title: 'Expert', color: '#f59e0b' },
  { min: 1800, max: 9999, title: 'Legend', color: '#ef4444' },
];

/** Codentra CP rating titles (not CodeChef-style). */
export const CP_TIERS: RatingTier[] = [
  { min: 0, max: 999, title: 'Rookie', color: '#94a3b8' },
  { min: 1000, max: 1199, title: 'Coder', color: '#22c55e' },
  { min: 1200, max: 1399, title: 'Competitor', color: '#3b82f6' },
  { min: 1400, max: 1599, title: 'Challenger', color: '#8b5cf6' },
  { min: 1600, max: 1799, title: 'Elite', color: '#f59e0b' },
  { min: 1800, max: 9999, title: 'Champion', color: '#ef4444' },
];

export function getRatingTier(
  rating: number,
  type: RatingType,
): RatingTier {
  const tiers = type === 'DSA' ? DSA_TIERS : CP_TIERS;
  return (
    tiers.find((t) => rating >= t.min && rating <= t.max) ??
    tiers[0]!
  );
}
