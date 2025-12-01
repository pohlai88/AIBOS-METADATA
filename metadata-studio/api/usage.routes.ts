/**
 * Usage Routes
 * Handles /usage/* endpoints
 */

import { Hono } from 'hono';
import { usageService } from '../services/usage.service';

const usage = new Hono();

// GET /usage/:entityId
usage.get('/:entityId', async (c) => {
  const entityId = c.req.param('entityId');
  const result = await usageService.getUsageStats(entityId);
  return c.json(result);
});

// POST /usage/track
usage.post('/track', async (c) => {
  const body = await c.req.json();
  const result = await usageService.trackUsage(body);
  return c.json(result, 201);
});

// GET /usage/popular
usage.get('/popular', async (c) => {
  const limit = c.req.query('limit') ? parseInt(c.req.query('limit')!) : 10;
  const result = await usageService.getPopularEntities(limit);
  return c.json(result);
});

export default usage;

