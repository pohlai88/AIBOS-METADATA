/**
 * Quality Routes
 * Handles /quality/* endpoints
 */

import { Hono } from 'hono';
import { qualityService } from '../services/quality.service';

const quality = new Hono();

// GET /quality/:entityId/score
quality.get('/:entityId/score', async (c) => {
  const entityId = c.req.param('entityId');
  const result = await qualityService.getQualityScore(entityId);
  return c.json(result);
});

// GET /quality/:entityId/profile
quality.get('/:entityId/profile', async (c) => {
  const entityId = c.req.param('entityId');
  const result = await qualityService.getProfile(entityId);
  return c.json(result);
});

// POST /quality/profile
quality.post('/profile', async (c) => {
  const body = await c.req.json();
  const result = await qualityService.runProfiler(body);
  return c.json(result, 201);
});

export default quality;

