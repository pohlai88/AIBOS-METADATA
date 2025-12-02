/**
 * Lineage Routes
 * Handles /lineage/* endpoints
 */

import { Hono } from 'hono';
import { lineageService } from '../services/lineage.service';

const lineage = new Hono();

// GET /lineage/:entityId/upstream
lineage.get('/:entityId/upstream', async (c) => {
  const entityId = c.req.param('entityId');
  const depth = c.req.query('depth') ? parseInt(c.req.query('depth')!) : 5;
  const result = await lineageService.getUpstream(entityId, depth);
  return c.json(result);
});

// GET /lineage/:entityId/downstream
lineage.get('/:entityId/downstream', async (c) => {
  const entityId = c.req.param('entityId');
  const depth = c.req.query('depth') ? parseInt(c.req.query('depth')!) : 5;
  const result = await lineageService.getDownstream(entityId, depth);
  return c.json(result);
});

// POST /lineage
lineage.post('/', async (c) => {
  const body = await c.req.json();
  const result = await lineageService.createLineage(body);
  return c.json(result, 201);
});

export default lineage;

