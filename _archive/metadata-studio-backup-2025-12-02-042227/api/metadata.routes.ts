/**
 * Metadata Routes
 * Handles /metadata/* endpoints
 */

import { Hono } from 'hono';
import { metadataService } from '../services/metadata.service';

const metadata = new Hono();

// GET /metadata/:id
metadata.get('/:id', async (c) => {
  const id = c.req.param('id');
  const result = await metadataService.getById(id);
  return c.json(result);
});

// POST /metadata
metadata.post('/', async (c) => {
  const body = await c.req.json();
  const result = await metadataService.create(body);
  return c.json(result, 201);
});

// PUT /metadata/:id
metadata.put('/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const result = await metadataService.update(id, body);
  return c.json(result);
});

// DELETE /metadata/:id
metadata.delete('/:id', async (c) => {
  const id = c.req.param('id');
  await metadataService.delete(id);
  return c.json({ success: true });
});

export default metadata;

