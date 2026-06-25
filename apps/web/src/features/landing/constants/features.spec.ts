import { MEMBERSHIP_FEATURES, PLATFORM_FEATURES } from './features';

describe('landing features', () => {
  it('exposes eight platform features', () => {
    expect(PLATFORM_FEATURES).toHaveLength(8);
  });

  it('lists core membership benefits', () => {
    expect(MEMBERSHIP_FEATURES.length).toBeGreaterThanOrEqual(4);
    expect(MEMBERSHIP_FEATURES).toContain('Tech Quizzes');
  });
});
