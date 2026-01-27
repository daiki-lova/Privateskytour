import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  calculateDaysUntil,
  findApplicableTier,
  calculateCancellationFee,
  getCancellationPolicyTiers,
  DEFAULT_CANCELLATION_TIERS,
} from '../policy';

describe('Cancellation Policy', () => {
  describe('calculateDaysUntil', () => {
    beforeEach(() => {
      // Mock current date to 2024-01-15
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-01-15T00:00:00.000Z'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should return 0 for same day', () => {
      expect(calculateDaysUntil('2024-01-15')).toBe(0);
    });

    it('should return 1 for tomorrow', () => {
      expect(calculateDaysUntil('2024-01-16')).toBe(1);
    });

    it('should return 7 for one week ahead', () => {
      expect(calculateDaysUntil('2024-01-22')).toBe(7);
    });

    it('should return negative for past dates', () => {
      expect(calculateDaysUntil('2024-01-14')).toBe(-1);
    });
  });

  describe('findApplicableTier', () => {
    it('should return 0% fee for 7+ days before', () => {
      const tier = findApplicableTier(10);
      expect(tier?.feePercentage).toBe(0);
    });

    it('should return 0% fee for exactly 7 days before', () => {
      const tier = findApplicableTier(7);
      expect(tier?.feePercentage).toBe(0);
    });

    it('should return 30% fee for 4-6 days before', () => {
      const tier = findApplicableTier(5);
      expect(tier?.feePercentage).toBe(30);
    });

    it('should return 50% fee for 2-3 days before', () => {
      const tier = findApplicableTier(3);
      expect(tier?.feePercentage).toBe(50);
    });

    it('should return 100% fee for 1 day before', () => {
      const tier = findApplicableTier(1);
      expect(tier?.feePercentage).toBe(100);
    });

    it('should return 100% fee for same day', () => {
      const tier = findApplicableTier(0);
      expect(tier?.feePercentage).toBe(100);
    });

    it('should return 100% fee for past dates', () => {
      const tier = findApplicableTier(-1);
      expect(tier?.feePercentage).toBe(100);
    });
  });

  describe('calculateCancellationFee', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-01-15T00:00:00.000Z'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should calculate no fee for 7+ days before', () => {
      const result = calculateCancellationFee(100000, '2024-01-25', 'confirmed');
      expect(result.feePercentage).toBe(0);
      expect(result.cancellationFee).toBe(0);
      expect(result.refundAmount).toBe(100000);
      expect(result.canCancel).toBe(true);
    });

    it('should calculate 30% fee for 4-6 days before', () => {
      const result = calculateCancellationFee(100000, '2024-01-20', 'confirmed');
      expect(result.feePercentage).toBe(30);
      expect(result.cancellationFee).toBe(30000);
      expect(result.refundAmount).toBe(70000);
      expect(result.canCancel).toBe(true);
    });

    it('should calculate 50% fee for 2-3 days before', () => {
      const result = calculateCancellationFee(100000, '2024-01-17', 'confirmed');
      expect(result.feePercentage).toBe(50);
      expect(result.cancellationFee).toBe(50000);
      expect(result.refundAmount).toBe(50000);
      expect(result.canCancel).toBe(true);
    });

    it('should calculate 100% fee for 1 day before', () => {
      const result = calculateCancellationFee(100000, '2024-01-16', 'confirmed');
      expect(result.feePercentage).toBe(100);
      expect(result.cancellationFee).toBe(100000);
      expect(result.refundAmount).toBe(0);
      expect(result.canCancel).toBe(true);
    });

    it('should calculate 100% fee for same day', () => {
      const result = calculateCancellationFee(100000, '2024-01-15', 'confirmed');
      expect(result.feePercentage).toBe(100);
      expect(result.cancellationFee).toBe(100000);
      expect(result.refundAmount).toBe(0);
      expect(result.canCancel).toBe(true);
    });

    it('should not allow cancellation for already cancelled reservations', () => {
      const result = calculateCancellationFee(100000, '2024-01-25', 'cancelled');
      expect(result.canCancel).toBe(false);
      expect(result.reason).toContain('既にキャンセル');
    });

    it('should not allow cancellation for completed reservations', () => {
      const result = calculateCancellationFee(100000, '2024-01-25', 'completed');
      expect(result.canCancel).toBe(false);
      expect(result.reason).toContain('既に完了');
    });

    it('should not allow cancellation for no_show reservations', () => {
      const result = calculateCancellationFee(100000, '2024-01-25', 'no_show');
      expect(result.canCancel).toBe(false);
    });

    it('should handle edge case at tier boundary (day 4)', () => {
      const result = calculateCancellationFee(100000, '2024-01-19', 'confirmed');
      expect(result.daysUntil).toBe(4);
      expect(result.feePercentage).toBe(30);
    });

    it('should handle edge case at tier boundary (day 6)', () => {
      const result = calculateCancellationFee(100000, '2024-01-21', 'confirmed');
      expect(result.daysUntil).toBe(6);
      expect(result.feePercentage).toBe(30);
    });

    it('should handle edge case at tier boundary (day 7)', () => {
      const result = calculateCancellationFee(100000, '2024-01-22', 'confirmed');
      expect(result.daysUntil).toBe(7);
      expect(result.feePercentage).toBe(0);
    });
  });

  describe('getCancellationPolicyTiers', () => {
    it('should return all default tiers', () => {
      const tiers = getCancellationPolicyTiers();
      expect(tiers.length).toBe(DEFAULT_CANCELLATION_TIERS.length);
      expect(tiers).toEqual(DEFAULT_CANCELLATION_TIERS);
    });

    it('should have descriptions in Japanese and English', () => {
      const tiers = getCancellationPolicyTiers();
      tiers.forEach((tier) => {
        expect(tier.description).toBeTruthy();
        expect(tier.descriptionEn).toBeTruthy();
      });
    });
  });
});
