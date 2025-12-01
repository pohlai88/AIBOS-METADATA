import {
    PaymentAllocationService,
    PaymentAllocationRequest,
    PaymentAllocationResult,
    AllocationStrategy,
} from "./services";
import {
    PaymentAllocationServiceDeps,
} from "./ports";
import {
    SubLedgerInvoice,
} from "./types";
import { Decimal } from "../gl/decimal-utils";
import { DecimalString, Ulid } from "../../core/types";

/**
 * PaymentAllocationServiceImpl
 * ----------------------------
 * Implements PRD Domain H:
 * - FIFO allocation
 * - Specific invoice allocation
 *
 * Notes:
 * - This service focuses on the allocation math.
 * - Persistence (updating open balances, statuses) can be done
 *   by the caller using the returned allocations, or by wiring
 *   PaymentRepository into this service.
 *
 * TODO markers:
 * - PRD H.1.x: rules for over/under-allocations
 * - PRD H.2.x: AP sign conventions vs AR
 */
export class PaymentAllocationServiceImpl
    implements PaymentAllocationService {
    private readonly deps: PaymentAllocationServiceDeps;

    constructor(deps: PaymentAllocationServiceDeps) {
        this.deps = deps;
    }

    async allocatePayment(
        request: PaymentAllocationRequest,
        strategy: AllocationStrategy
    ): Promise<PaymentAllocationResult> {
        const { payment } = request;

        // PRD H.2.x - sign policy: for now we assume positive amount means
        // "amount available for allocation" regardless of AR/AP.

        const totalAmount = payment.amount;

        if (!Decimal.isPositive(totalAmount)) {
            // No positive amount to allocate.
            return { allocations: [], unappliedAmount: totalAmount };
        }

        // Decide which invoices we're allowed to touch
        const invoices =
            strategy === "SPECIFIC"
                ? await this.getSpecificInvoices(request)
                : await this.getFifoInvoices(payment);

        // Core allocation logic
        const { allocations, unapplied } = this.allocateAcrossInvoices(
            invoices,
            payment.paymentId,
            totalAmount
        );

        // Convert to PaymentAllocation with createdAt
        const now = this.deps.clock.now();
        const paymentAllocations = allocations.map((alloc) => ({
            ...alloc,
            createdAt: now,
        }));

        // Optional: persist via PaymentRepository (if configured)
        if (this.deps.paymentRepo) {
            await this.deps.paymentRepo.saveAllocations(paymentAllocations);
            // PRD H.1.x - your adapter can also update invoice openBalance & status
        }

        return {
            allocations: paymentAllocations,
            unappliedAmount: unapplied,
        };
    }

    // ---------------------------------------------------------------------------
    // Invoice selection
    // ---------------------------------------------------------------------------

    private async getFifoInvoices(
        payment: PaymentAllocationRequest["payment"]
    ): Promise<readonly SubLedgerInvoice[]> {
        const invoices =
            await this.deps.invoiceRepo.findOpenInvoicesByParty({
                tenantId: payment.tenantId,
                entityId: payment.entityId,
                subLedgerType: payment.subLedgerType,
                partyId: payment.partyId,
            });

        // FIFO: oldest invoices first
        // PRD H.1.x - precise ordering: invoiceDate → dueDate → invoiceNumber
        return [...invoices].sort((a, b) => {
            if (a.invoiceDate < b.invoiceDate) return -1;
            if (a.invoiceDate > b.invoiceDate) return 1;
            if (a.dueDate < b.dueDate) return -1;
            if (a.dueDate > b.dueDate) return 1;
            return a.invoiceNumber.localeCompare(b.invoiceNumber);
        });
    }

    private async getSpecificInvoices(
        request: PaymentAllocationRequest
    ): Promise<readonly SubLedgerInvoice[]> {
        const { payment, targetInvoiceIds } = request;

        if (!targetInvoiceIds || !targetInvoiceIds.length) {
            // No specific targets — fall back to FIFO
            return this.getFifoInvoices(payment);
        }

        const invoices =
            await this.deps.invoiceRepo.findInvoicesByIds({
                tenantId: payment.tenantId,
                entityId: payment.entityId,
                invoiceIds: targetInvoiceIds as Ulid[],
            });

        // Maintain the order of targetInvoiceIds
        const orderIndex = new Map<string, number>();
        targetInvoiceIds.forEach((id, idx) => orderIndex.set(id, idx));

        return [...invoices].sort((a, b) => {
            const ai = orderIndex.get(a.invoiceId) ?? 0;
            const bi = orderIndex.get(b.invoiceId) ?? 0;
            return ai - bi;
        });
    }

    // ---------------------------------------------------------------------------
    // Core allocation math
    // ---------------------------------------------------------------------------

    private allocateAcrossInvoices(
        invoices: readonly SubLedgerInvoice[],
        paymentId: Ulid,
        totalAmount: DecimalString
    ): {
        allocations: readonly {
            allocationId: Ulid;
            paymentId: Ulid;
            invoiceId: Ulid;
            appliedAmount: DecimalString;
        }[];
        unapplied: DecimalString;
    } {
        let remaining = totalAmount;
        const allocations: {
            allocationId: Ulid;
            paymentId: Ulid;
            invoiceId: Ulid;
            appliedAmount: DecimalString;
        }[] = [];

        for (const invoice of invoices) {
            if (!Decimal.isPositive(remaining)) break;
            if (!Decimal.isPositive(invoice.openBalance)) continue;

            const toApply = this.min(remaining, invoice.openBalance);

            if (Decimal.isZero(toApply)) continue;

            allocations.push({
                allocationId: this.deps.idGenerator.generate(),
                paymentId,
                invoiceId: invoice.invoiceId,
                appliedAmount: toApply,
            });

            remaining = Decimal.subtract(remaining, toApply);
        }

        return {
            allocations,
            unapplied: remaining,
        };
    }

    private min(a: DecimalString, b: DecimalString): DecimalString {
        const an = Number(a);
        const bn = Number(b);
        return Decimal.from(Math.min(an, bn));
    }
}

