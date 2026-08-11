import { describe, it, expect } from 'vitest';
import {
  MONTHLY_REWARDS,
  getCurrentMonthKey,
  getPreviousMonthKey,
  getDaysRemainingInMonth,
  isLastWeekendOfMonth,
  checkMonthlyRewardStatus
} from './monthlyReward';

describe('monthlyReward utils', () => {
  it('should specify correct rewards for top 3 ranks', () => {
    expect(MONTHLY_REWARDS[1].coins).toBe(5000);
    expect(MONTHLY_REWARDS[2].coins).toBe(2500);
    expect(MONTHLY_REWARDS[3].coins).toBe(1000);
  });

  it('should format month key correctly', () => {
    const d = new Date(2026, 7, 15); // Aug 15 2026
    expect(getCurrentMonthKey(d)).toBe('2026-08');
    expect(getPreviousMonthKey(d)).toBe('2026-07');
  });

  it('should calculate remaining days in month', () => {
    const endOfMonth = new Date(2026, 7, 31); // Aug 31 2026
    expect(getDaysRemainingInMonth(endOfMonth)).toBe(0);
  });

  it('should check monthly reward claim eligibility', () => {
    const status = checkMonthlyRewardStatus({ lastMonthlyRewardMonth: '2026-07' });
    expect(status.canClaim).toBe(false);
  });
});
