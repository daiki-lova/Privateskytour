/**
 * Cancellation Policy Utilities
 *
 * Calculates cancellation fees based on days before the reservation.
 */

/**
 * Cancellation policy tiers
 * Each tier defines the fee percentage for a specific timeframe
 */
export interface CancellationTier {
  /** Days before reservation (minimum threshold) */
  daysBeforeMin: number;
  /** Days before reservation (maximum threshold, null = no upper limit) */
  daysBeforeMax: number | null;
  /** Fee percentage (0-100) */
  feePercentage: number;
  /** Human-readable description */
  description: string;
  /** English description */
  descriptionEn: string;
}

/**
 * Default cancellation policy tiers
 * Configurable through environment or database in the future
 */
export const DEFAULT_CANCELLATION_TIERS: CancellationTier[] = [
  {
    daysBeforeMin: 8,
    daysBeforeMax: null,
    feePercentage: 0,
    description: '8日以上前: キャンセル料なし',
    descriptionEn: '8+ days before: No cancellation fee',
  },
  {
    daysBeforeMin: 4,
    daysBeforeMax: 7,
    feePercentage: 30,
    description: '4-7日前: 30%',
    descriptionEn: '4-7 days before: 30%',
  },
  {
    daysBeforeMin: 2,
    daysBeforeMax: 3,
    feePercentage: 50,
    description: '2-3日前: 50%',
    descriptionEn: '2-3 days before: 50%',
  },
  {
    daysBeforeMin: 1,
    daysBeforeMax: 1,
    feePercentage: 80,
    description: '前日: 80%',
    descriptionEn: '1 day before: 80%',
  },
  {
    daysBeforeMin: 0,
    daysBeforeMax: 0,
    feePercentage: 100,
    description: '当日: 100%',
    descriptionEn: 'Same day: 100%',
  },
];

/**
 * Calculate days until reservation
 */
export function calculateDaysUntil(reservationDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const reservation = new Date(reservationDate);
  reservation.setHours(0, 0, 0, 0);

  const diffTime = reservation.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

/**
 * Find applicable cancellation tier
 */
export function findApplicableTier(
  daysUntil: number,
  tiers: CancellationTier[] = DEFAULT_CANCELLATION_TIERS
): CancellationTier | null {
  // If reservation is in the past, return 100% fee
  if (daysUntil < 0) {
    return {
      daysBeforeMin: 0,
      daysBeforeMax: 0,
      feePercentage: 100,
      description: '予約日を過ぎています',
      descriptionEn: 'Reservation date has passed',
    };
  }

  for (const tier of tiers) {
    const matchesMin = daysUntil >= tier.daysBeforeMin;
    const matchesMax = tier.daysBeforeMax === null || daysUntil <= tier.daysBeforeMax;

    if (matchesMin && matchesMax) {
      return tier;
    }
  }

  // Default: 100% fee if no tier matches
  return {
    daysBeforeMin: 0,
    daysBeforeMax: 0,
    feePercentage: 100,
    description: '規定外: 100%',
    descriptionEn: 'Not covered: 100%',
  };
}

/**
 * Calculate cancellation fee
 */
export interface CancellationFeeResult {
  /** Original total price */
  totalPrice: number;
  /** Fee percentage applied */
  feePercentage: number;
  /** Calculated cancellation fee amount */
  cancellationFee: number;
  /** Refund amount */
  refundAmount: number;
  /** Days until reservation */
  daysUntil: number;
  /** Applied policy tier */
  tier: CancellationTier;
  /** Whether cancellation is allowed */
  canCancel: boolean;
  /** Reason if cancellation is not allowed */
  reason?: string;
}

/**
 * Calculate cancellation fee for a reservation
 *
 * @param totalPrice - Total price of the reservation
 * @param reservationDate - Reservation date in YYYY-MM-DD format
 * @param status - Current reservation status
 * @returns Cancellation fee calculation result
 */
export function calculateCancellationFee(
  totalPrice: number,
  reservationDate: string,
  status: string
): CancellationFeeResult {
  // Check if reservation can be cancelled
  const nonCancellableStatuses = ['cancelled', 'completed', 'no_show'];
  if (nonCancellableStatuses.includes(status)) {
    const tier = DEFAULT_CANCELLATION_TIERS[0];
    return {
      totalPrice,
      feePercentage: 0,
      cancellationFee: 0,
      refundAmount: 0,
      daysUntil: 0,
      tier,
      canCancel: false,
      reason:
        status === 'cancelled'
          ? 'この予約は既にキャンセルされています'
          : status === 'completed'
            ? 'この予約は既に完了しています'
            : 'この予約はキャンセルできません',
    };
  }

  const daysUntil = calculateDaysUntil(reservationDate);
  const tier = findApplicableTier(daysUntil);

  if (!tier) {
    return {
      totalPrice,
      feePercentage: 100,
      cancellationFee: totalPrice,
      refundAmount: 0,
      daysUntil,
      tier: DEFAULT_CANCELLATION_TIERS[4],
      canCancel: true,
    };
  }

  const cancellationFee = Math.floor(totalPrice * (tier.feePercentage / 100));
  const refundAmount = totalPrice - cancellationFee;

  return {
    totalPrice,
    feePercentage: tier.feePercentage,
    cancellationFee,
    refundAmount,
    daysUntil,
    tier,
    canCancel: true,
  };
}

/**
 * Get all cancellation policy tiers for display
 */
export function getCancellationPolicyTiers(): CancellationTier[] {
  return DEFAULT_CANCELLATION_TIERS;
}
