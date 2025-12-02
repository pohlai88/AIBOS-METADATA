/**
 * Impact Analysis Routes
 * Handles /impact/* endpoints
 */

import { Hono } from 'hono';
import { impactAnalysisService } from '../services/impact-analysis.service';

const impact = new Hono();

// GET /impact/:entityId
impact.get('/:entityId', async (c) => {
  const entityId = c.req.param('entityId');
  const result = await impactAnalysisService.analyze(entityId);
  return c.json(result);
});

// POST /impact/simulate
impact.post('/simulate', async (c) => {
  const body = await c.req.json();
  const result = await impactAnalysisService.simulate(body);
  return c.json(result);
});

export default impact;

