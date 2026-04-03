/**
 * Placeholder annual discount rates for HLV PV, by working-years horizon N (1–50).
 * Replace with HLV_Discount_Tier_Grid.csv (d_icici_aligned_pct) when supplied.
 */
const D_PCT_BY_N = [
  6.5, 6.53, 6.56, 6.59, 6.62, 6.65, 6.68, 6.71, 6.74, 6.77, 6.8, 6.83, 6.86, 6.89, 6.92, 6.95,
  6.98, 7.01, 7.04, 7.07, 7.1, 7.13, 7.16, 7.19, 7.22, 7.25, 7.28, 7.31, 7.34, 7.37, 7.4, 7.43,
  7.46, 7.49, 7.52, 7.55, 7.58, 7.61, 7.64, 7.67, 7.7, 7.73, 7.76, 7.79, 7.82, 7.85, 7.88, 7.91,
  7.94, 8.0,
];

/**
 * @param {number} N years until retirement (clamped 1–50 for grid lookup)
 * @returns {number} annual discount rate as decimal
 */
export function getHlvDiscountRateForHorizon(N) {
  const n = Math.min(Math.max(Math.floor(N), 1), 50);
  return D_PCT_BY_N[n - 1] / 100;
}
