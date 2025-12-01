import { DecimalString } from "../../core/types";

/**
 * Naive decimal helpers for skeleton & tests.
 * ❗ TODO: Replace with a precise decimal implementation
 * aligned with your PRD rounding rules.
 */
export const Decimal = {
    zero(): DecimalString {
        return "0.00";
    },

    from(n: number | string): DecimalString {
        const num = typeof n === "number" ? n : Number(n);
        return num.toFixed(2);
    },

    add(a: DecimalString, b: DecimalString): DecimalString {
        return (Number(a) + Number(b)).toFixed(2);
    },

    subtract(a: DecimalString, b: DecimalString): DecimalString {
        return (Number(a) - Number(b)).toFixed(2);
    },

    isZero(a: DecimalString): boolean {
        return Number(a) === 0;
    },

    equal(a: DecimalString, b: DecimalString): boolean {
        return Number(a) === Number(b);
    },

    isPositive(a: DecimalString): boolean {
        return Number(a) > 0;
    },
};

