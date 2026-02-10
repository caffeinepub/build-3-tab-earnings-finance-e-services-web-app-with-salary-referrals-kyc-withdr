// Currency utilities for BDT (Bangladeshi Taka)

/**
 * Format amount in cents to BDT display string
 * @param amountInCents - Amount in cents (100 cents = 1 BDT)
 * @returns Formatted string like "৳123.45"
 */
export function formatBDT(amountInCents: number | bigint): string {
  const amount = Number(amountInCents) / 100;
  return `৳${amount.toFixed(2)}`;
}

/**
 * Format amount in cents to BDT display string without symbol
 * @param amountInCents - Amount in cents (100 cents = 1 BDT)
 * @returns Formatted string like "123.45"
 */
export function formatBDTAmount(amountInCents: number | bigint): string {
  const amount = Number(amountInCents) / 100;
  return amount.toFixed(2);
}

/**
 * Parse BDT string to cents
 * @param bdtString - String like "123.45"
 * @returns Amount in cents
 */
export function parseBDTToCents(bdtString: string): bigint {
  const amount = parseFloat(bdtString);
  return BigInt(Math.floor(amount * 100));
}

/**
 * Calculate credited BDT from tap-to-earn coins
 * Conversion: 1000 coins = 8 BDT
 * @param coins - Number of coins
 * @returns Object with credited amount in cents and remainder coins
 */
export function calculateTapToEarnCredit(coins: number | bigint): {
  creditedCents: bigint;
  remainderCoins: bigint;
} {
  const totalCoins = BigInt(coins);
  const fullThousands = totalCoins / BigInt(1000);
  const remainder = totalCoins % BigInt(1000);
  const creditedCents = fullThousands * BigInt(800); // 8 BDT = 800 cents
  
  return {
    creditedCents,
    remainderCoins: remainder,
  };
}
