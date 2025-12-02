// business-engine/admin-config/application/use-cases/tenant/create-tenant.use-case.ts
import { Tenant } from '../../../domain/entities/tenant.entity';
import { AuditEvent } from '../../../domain/entities/audit-event.entity';
import type { ITenantRepository } from '../../ports/outbound/tenant.repository.port';
import type { IAuditRepository } from '../../ports/outbound/audit.repository.port';
import type { CreateTenantInput } from '../../../contracts/tenant.contract';

/**
 * CreateTenantUseCase
 * 
 * GRCD F-ORG-1: Allow Platform Admin to create a Tenant/Organization profile.
 */
export interface CreateTenantDependencies {
  tenantRepository: ITenantRepository;
  auditRepository: IAuditRepository;
}

export interface CreateTenantCommand {
  input: CreateTenantInput;
  actorUserId: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface CreateTenantResult {
  tenant: Tenant;
  auditEvent: AuditEvent;
}

export async function createTenantUseCase(
  command: CreateTenantCommand,
  deps: CreateTenantDependencies,
): Promise<CreateTenantResult> {
  const { input, actorUserId, ipAddress, userAgent } = command;
  const { tenantRepository, auditRepository } = deps;

  // 1. Validate slug uniqueness
  const slugExists = await tenantRepository.existsBySlug(input.slug);
  if (slugExists) {
    throw new Error(`Tenant slug already exists: ${input.slug}`);
  }

  // 2. Create tenant entity
  const tenant = Tenant.create({
    name: input.name,
    slug: input.slug,
    timezone: input.timezone,
    locale: input.locale,
    logoUrl: input.logoUrl,
    domain: input.domain,
    createdBy: actorUserId,
  });

  // 3. Persist tenant
  const savedTenant = await tenantRepository.save(tenant);

  // 4. Create audit event
  // GRCD F-TRACE-2: Every lifecycle action MUST generate an audit event
  const auditEvent = AuditEvent.create({
    traceId: savedTenant.traceId.toString(),
    resourceType: 'TENANT',
    resourceId: savedTenant.id!,
    action: 'CREATE',
    actorUserId,
    metadataDiff: {
      after: savedTenant.toPersistence(),
    },
    ipAddress,
    userAgent,
    prevHash: null, // First event in chain
  });

  // 5. Persist audit event
  const savedAuditEvent = await auditRepository.save(auditEvent);

  return {
    tenant: savedTenant,
    auditEvent: savedAuditEvent,
  };
}

