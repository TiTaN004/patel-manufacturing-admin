/**
 * Calculates the discount percentage between MRP and Sale Price.
 * Returns 0 if input is invalid or price >= mrp.
 */
export const calculateDiscount = (price?: number, mrp?: number): number => {
    if (!price || price <= 0 || !mrp || mrp <= 0 || price >= mrp) return 0;
    return Math.round(((mrp - price) / mrp) * 100);
};
