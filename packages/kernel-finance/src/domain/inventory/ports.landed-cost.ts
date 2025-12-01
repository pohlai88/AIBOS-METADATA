import {
    EntityId,
    TenantId,
} from "../../core/types";
import {
    ItemId,
    WarehouseId,
} from "./types";
import {
    LandedCostAllocationResultLine,
} from "./types";

/**
 * Represents one line of base document (e.g. GRN / PO receipt)
 * that landed cost will be allocated across.
 */
export interface LandedCostBaseLine {
    readonly lineId: string;
    readonly itemId: ItemId;
    readonly warehouseId: WarehouseId;

    readonly qty: string;  // DecimalString
    readonly baseValue: string; // DecimalString (qty * unit cost)
}

/**
 * Repository for base document details.
 * Implementation can read from GRN/PO tables.
 */
export interface LandedCostBaseDocumentRepository {
    getBaseLines(params: {
        tenantId: TenantId;
        entityId: EntityId;
        baseDocumentId: string;
    }): Promise<readonly LandedCostBaseLine[]>;
}

/**
 * Repository for applying landed cost to inventory valuation.
 * Could be implemented by:
 * - adjusting valuationRate & balanceValue of SLE
 * - or posting separate "Landed Cost" SLEs
 */
export interface LandedCostApplicationRepository {
    applyAllocation(
        params: {
            tenantId: TenantId;
            entityId: EntityId;
            baseDocumentId: string;
            allocations: readonly LandedCostAllocationResultLine[];
        }
    ): Promise<void>;
}

export interface LandedCostServiceDeps {
    baseRepo: LandedCostBaseDocumentRepository;
    applyRepo: LandedCostApplicationRepository;
}

