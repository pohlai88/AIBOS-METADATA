import { RealisedFxService } from "./services";
import {
    CurrencyCode,
    DecimalString,
} from "../../core/types";
import { Decimal } from "../gl/decimal-utils";

/**
 * RealisedFxServiceImpl
 * ---------------------
 * Implements PRD Domain F realised FX logic:
 *
 * Conceptual:
 * - originalAmount * originalRate = base exposure at recognition
 * - settlementAmount * settlementRate = base amount at settlement
 * - difference = realised gain/loss
 *
 * Sign convention:
 * - positive = gain
 * - negative = loss
 */
export class RealisedFxServiceImpl implements RealisedFxService {
    async computeRealisedGainLoss(params: {
        originalCurrency: CurrencyCode;
        baseCurrency: CurrencyCode;
        originalAmount: DecimalString;
        originalRate: DecimalString;
        settlementAmount: DecimalString;
        settlementRate: DecimalString;
    }): Promise<{ realisedGainLossBase: DecimalString }> {
        const {
            originalAmount,
            originalRate,
            settlementAmount,
            settlementRate,
        } = params;

        const originalBase = this.toBase(originalAmount, originalRate);
        const settlementBase = this.toBase(settlementAmount, settlementRate);

        const realised = Decimal.subtract(settlementBase, originalBase);

        return {
            realisedGainLossBase: realised,
        };
    }

    private toBase(
        amountForeign: DecimalString,
        rate: DecimalString
    ): DecimalString {
        // TODO: PRD F.3.x - adopt kernel-wide decimal / rounding rules here
        return Decimal.from(Number(amountForeign) * Number(rate));
    }
}

