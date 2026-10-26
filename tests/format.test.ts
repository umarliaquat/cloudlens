import { expect, it } from 'vitest';
import { percent, money } from '../src/lib/format';
it('renders unavailable numeric data safely and distinguishes a new baseline', () => {
  expect(percent(undefined)).toBe('—');
  expect(percent(Number.NaN)).toBe('—');
  expect(percent(null)).toBe('New');
  expect(percent(12.34, true)).toBe('+12.3%');
});
it('does not round adjacent chart ticks to the same label', () => {
  expect(money(150000, true)).not.toBe(money(200000, true));
});
