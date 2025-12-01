import {
    SubLedgerReconciliationService,
} from "./services";
import {
    SubLedgerReconciliationServiceDeps,
} from "./ports";
import { Decimal } from "../gl/decimal-utils";
import { DecimalString, EntityId, ISODate, TenantId } from "../../core/types";

/**
 * SubLedgerReconciliationServiceImpl
 * ----------------------------------
 * Implements PRD Domain H:
 * - Reconciles GL control accounts vs sub-ledger totals.
 *
 * Behaviour:
 * - For each control account, compare:
 *    GL balanceBase vs Sub-ledger balanceBase
 * - Reports differences per account.
 *
 * TODO markers:
 * - PRD H.4.x: tolerance threshold (e.g. ≤ 0.01 treated as zero)
 * - PRD H.4.x: treatment of foreign-currency accounts vs base
 */
export class SubLedgerReconciliationServiceImpl
    implements SubLedgerReconciliationService {
    private readonly deps: SubLedgerReconciliationServiceDeps;

    constructor(deps: SubLedgerReconciliationServiceDeps) {
        this.deps = deps;
    }

    async reconcileControlAccounts(params: {
        tenantId: string;
        entityId: string;
        asOfDate: ISODate;
        subLedgerType: "AR" | "AP";
    }): Promise<{
        isInBalance: boolean;
        differences: readonly {
            controlAccountId: string;
            controlAccountCode: string;
            controlBalance: string; // DecimalString base currency
            subLedgerBalance: string; // DecimalString base currency
        }[];
    }> {
        const { tenantId, entityId, asOfDate, subLedgerType } = params;

        const controlBalances =
            await this.deps.controlRepo.getControlBalances({
                tenantId: tenantId as TenantId,
                entityId: entityId as EntityId,
                subLedgerType,
                asOfDate,
            });

        const subLedgerBalances =
            await this.deps.subLedgerRepo.getSubLedgerBalances({
                tenantId: tenantId as TenantId,
                entityId: entityId as EntityId,
                subLedgerType,
                asOfDate,
            });

        const subMap = new Map<
            string,
            { balanceBase: DecimalString }
        >();
        for (const s of subLedgerBalances) {
            subMap.set(s.controlAccountId, {
                balanceBase: s.balanceBase,
            });
        }

        const differences: {
            controlAccountId: string;
            controlAccountCode: string;
            controlBalance: DecimalString;
            subLedgerBalance: DecimalString;
        }[] = [];

        for (const c of controlBalances) {
            const sub = subMap.get(c.controlAccountId);

            const subBalance = sub?.balanceBase ?? Decimal.zero();

            // PRD H.4.x: tolerance threshold
            const diff = Decimal.subtract(
                c.balanceBase,
                subBalance
            );
            const isZero = this.isWithinTolerance(diff);

            if (!isZero) {
                differences.push({
                    controlAccountId: c.controlAccountId,
                    controlAccountCode: c.controlAccountCode,
                    controlBalance: c.balanceBase,
                    subLedgerBalance: subBalance,
                });
            }
        }

        const isInBalance = differences.length === 0;

        return {
            isInBalance,
            differences,
        };
    }

    private isWithinTolerance(diff: DecimalString): boolean {
        // PRD H.4.x - you can configure tolerance here.
        // For now, exact zero.
        return Decimal.isZero(diff);
    }
}

