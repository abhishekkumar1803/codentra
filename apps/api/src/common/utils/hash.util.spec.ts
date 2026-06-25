import { generateToken, hashToken } from './hash.util';

describe('hash.util', () => {
  it('hashToken produces consistent SHA-256 hex', () => {
    expect(hashToken('test-token')).toBe(hashToken('test-token'));
    expect(hashToken('test-token')).toHaveLength(64);
  });

  it('generateToken produces unique values', () => {
    const a = generateToken();
    const b = generateToken();
    expect(a).not.toBe(b);
    expect(a).toHaveLength(64);
  });
});
