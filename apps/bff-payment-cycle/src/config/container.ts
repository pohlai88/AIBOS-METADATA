/**
 * Dependency Injection Container
 *
 * Lazy-initialized container for bff-payment-cycle services.
 */

import { getDatabase } from "./database";
import { getConfig } from "./env";

// Repositories
import {
  PaymentRequestRepository,
  PaymentApprovalRepository,
  PaymentDisbursementRepository,
  PaymentSlipRepository,
  PaymentAuditRepository,
} from "../repositories";

// Services
import { PaymentService, DisbursementService } from "../services";

// ─────────────────────────────────────────
// EVENT BUS INTERFACE
// ─────────────────────────────────────────

export interface DomainEvent {
  type: string;
  version: string;
  timestamp: string;
  source: string;
  correlationId: string;
  tenantId?: string;
  payload: Record<string, unknown>;
}

export interface IEventBus {
  publish(event: DomainEvent): Promise<void>;
}

/**
 * Console Event Bus (Development)
 */
class ConsoleEventBus implements IEventBus {
  async publish(event: DomainEvent): Promise<void> {
    console.log(
      `📡 [EVENT] ${event.type} - ${event.correlationId.slice(0, 8)}... | ${JSON.stringify(event.payload).slice(0, 100)}`
    );
  }
}

// ─────────────────────────────────────────
// CONTAINER
// ─────────────────────────────────────────

class Container {
  // Repositories
  private _paymentRequestRepo?: PaymentRequestRepository;
  private _paymentApprovalRepo?: PaymentApprovalRepository;
  private _paymentDisbursementRepo?: PaymentDisbursementRepository;
  private _paymentSlipRepo?: PaymentSlipRepository;
  private _paymentAuditRepo?: PaymentAuditRepository;

  // Services
  private _paymentService?: PaymentService;
  private _disbursementService?: DisbursementService;

  // Infrastructure
  private _eventBus?: IEventBus;

  // ─────────────────────────────────────────
  // REPOSITORIES
  // ─────────────────────────────────────────

  get paymentRequestRepository(): PaymentRequestRepository {
    if (!this._paymentRequestRepo) {
      this._paymentRequestRepo = new PaymentRequestRepository(getDatabase());
    }
    return this._paymentRequestRepo;
  }

  get paymentApprovalRepository(): PaymentApprovalRepository {
    if (!this._paymentApprovalRepo) {
      this._paymentApprovalRepo = new PaymentApprovalRepository(getDatabase());
    }
    return this._paymentApprovalRepo;
  }

  get paymentDisbursementRepository(): PaymentDisbursementRepository {
    if (!this._paymentDisbursementRepo) {
      this._paymentDisbursementRepo = new PaymentDisbursementRepository(getDatabase());
    }
    return this._paymentDisbursementRepo;
  }

  get paymentSlipRepository(): PaymentSlipRepository {
    if (!this._paymentSlipRepo) {
      this._paymentSlipRepo = new PaymentSlipRepository(getDatabase());
    }
    return this._paymentSlipRepo;
  }

  get paymentAuditRepository(): PaymentAuditRepository {
    if (!this._paymentAuditRepo) {
      this._paymentAuditRepo = new PaymentAuditRepository(getDatabase());
    }
    return this._paymentAuditRepo;
  }

  // ─────────────────────────────────────────
  // SERVICES
  // ─────────────────────────────────────────

  get paymentService(): PaymentService {
    if (!this._paymentService) {
      this._paymentService = new PaymentService(
        this.paymentRequestRepository,
        this.paymentApprovalRepository,
        this.paymentAuditRepository,
        this.eventBus
      );
    }
    return this._paymentService;
  }

  get disbursementService(): DisbursementService {
    if (!this._disbursementService) {
      this._disbursementService = new DisbursementService(
        this.paymentRequestRepository,
        this.paymentDisbursementRepository,
        this.paymentSlipRepository,
        this.paymentAuditRepository,
        this.eventBus
      );
    }
    return this._disbursementService;
  }

  // ─────────────────────────────────────────
  // INFRASTRUCTURE
  // ─────────────────────────────────────────

  get eventBus(): IEventBus {
    if (!this._eventBus) {
      this._eventBus = new ConsoleEventBus();
    }
    return this._eventBus;
  }

  /**
   * Get configuration
   */
  getConfig() {
    return getConfig();
  }
}

// Singleton export
export const container = new Container();

