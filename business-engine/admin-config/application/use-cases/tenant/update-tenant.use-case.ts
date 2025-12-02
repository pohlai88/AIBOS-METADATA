// business-engine/admin-config/application/use-cases/tenant/update-tenant.use-case.ts
import { Tenant } from '../../../domain/entities/tenant.entity';
import { AuditEvent } from '../../../domain/entities/audit-event.entity';
import type { ITenantRepository } from '../../ports/outbound/tenant.repository.port';
import type { IAuditRepository } from '../../ports/outbound/audit.repository.port';
import type { UpdateTenantInput } from '../../../contracts/tenant.contract';

/**
 * UpdateTenantUseCase
 * 
 * GRCD F-ORG-2: Allow Org Admin to edit their organization's profile.
 */
export interface UpdateTenantDependencies {
  tenantRepository: ITenantRepository;
  auditRepository: IAuditRepository;
}

export interface UpdateTenantCommand {
  tenantId: string;
  input: UpdateTenantInput;
  actorUserId: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface UpdateTenantResult {
  tenant: Tenant;
  auditEvent: AuditEvent;
}

export async function updateTenantUseCase(
  command: UpdateTenantCommand,
  deps: UpdateTenantDependencies,
): Promise<UpdateTenantResult> {
  const { tenantId, input, actorUserId, ipAddress, userAgent } = command;
  const { tenantRepository, auditRepository } = deps;

  // 1. Load existing tenant
  const tenant = await tenantRepository.findById(tenantId);
  if (!tenant) {
    throw new Error(`Tenant not found: ${tenantId}`);
  }

  // 2. Capture before state for audit
  const beforeState = tenant.toPersistence();

  // 3. Apply updates
  tenant.updateProfile({
    name: input.name,
    timezone: input.timezone,
    locale: input.locale,
    logoUrl: input.logoUrl,
    domain: input.domain,
    updatedBy: actorUserId,
  });

  // 4. Persist tenant
  const savedTenant = await tenantRepository.save(tenant);

  // 5. Get previous audit event for hash chain
  const prevAuditEvent = await auditRepository.getLatestByTraceId(
    savedTenant.traceId.toString(),
  );

  // 6. Create audit event
  const auditEvent = AuditEvent.create({
    traceId: savedTenant.traceId.toString(),
    resourceType: 'TENANT',
    resourceId: savedTenant.id!,
    action: 'UPDATE',
    actorUserId,
    metadataDiff: {
      before: beforeState,
      after: savedTenant.toPersistence(),
    },
    ipAddress,
    userAgent,
    prevHash: prevAuditEvent?.hash ?? null,
  });

  // 7. Persist audit event
  const savedAuditEvent = await auditRepository.save(auditEvent);

  return {
    tenant: savedTenant,
    auditEvent: savedAuditEvent,
  };
}

