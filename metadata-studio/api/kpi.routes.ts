// metadata-studio/api/kpi.routes.ts
import { Hono } from 'hono';
import type { AuthContext } from '../middleware/auth.middleware';
import { and, eq } from 'drizzle-orm';
import { db } from '../db/client';
import {
  mdmKpiDefinition,
  mdmKpiComponent,
} from '../db/schema/kpi.tables';
import { applyKpiChange } from '../services/kpi.service';

export const kpiRouter = new Hono();

/**
 * POST /kpi
 *
 * Create or update a KPI (definition + components).
 * Body must follow MdmKpiDefinitionWithComponentsSchema.
 */
kpiRouter.post('/', async (c) => {
  const auth = c.get('auth') as AuthContext;
  const body = await c.req.json();

  const mergedBody = {
    ...body,
    definition: {
      ...body.definition,
      tenantId: body.definition?.tenantId ?? auth.tenantId,
      createdBy: body.definition?.createdBy ?? auth.userId,
      updatedBy: body.definition?.updatedBy ?? auth.userId,
    },
  };

  const result = await applyKpiChange({
    actorRole: auth.role,
    actorId: auth.userId,
    body: mergedBody,
  });

  const statusCode =
    (result as any).status === 'pending_approval' ? 202 : 200;

  return c.json(result, statusCode);
});

/**
 * GET /kpi
 *
 * List KPIs for tenant, optional filters:
 * - canonicalKey
 * - domain
 * - category
 * - status
 */
kpiRouter.get('/', async (c) => {
  const auth = c.get('auth') as AuthContext;
  const canonicalKey = c.req.query('canonicalKey');
  const domain = c.req.query('domain');
  const category = c.req.query('category');
  const status = c.req.query('status');

  let where: any = eq(mdmKpiDefinition.tenantId, auth.tenantId);

  if (canonicalKey) {
    where = and(where, eq(mdmKpiDefinition.canonicalKey, canonicalKey));
  }
  if (domain) {
    where = and(where, eq(mdmKpiDefinition.domain, domain));
  }
  if (category) {
    where = and(where, eq(mdmKpiDefinition.category, category));
  }
  if (status) {
    where = and(where, eq(mdmKpiDefinition.status, status));
  }

  const rows = await db
    .select()
    .from(mdmKpiDefinition)
    .where(where);

  return c.json(rows);
});

/**
 * GET /kpi/components?canonicalKey=...
 *
 * List components for a given KPI canonicalKey.
 */
kpiRouter.get('/components', async (c) => {
  const auth = c.get('auth') as AuthContext;
  const canonicalKey = c.req.query('canonicalKey');

  if (!canonicalKey) {
    return c.json(
      { error: 'Missing canonicalKey query parameter' },
      400,
    );
  }

  const [def] = await db
    .select()
    .from(mdmKpiDefinition)
    .where(
      and(
        eq(mdmKpiDefinition.tenantId, auth.tenantId),
        eq(mdmKpiDefinition.canonicalKey, canonicalKey),
      ),
    );

  if (!def) {
    return c.json({ error: 'KPI not found' }, 404);
  }

  const components = await db
    .select()
    .from(mdmKpiComponent)
    .where(
      and(
        eq(mdmKpiComponent.tenantId, auth.tenantId),
        eq(mdmKpiComponent.kpiId, def.id),
      ),
    );

  return c.json(components);
});

