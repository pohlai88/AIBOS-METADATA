/**
 * Tags Routes
 * Handles /tags/* endpoints
 */

import { Hono } from 'hono';
import { tagsService } from '../services/tags.service';

const tags = new Hono();

// GET /tags
tags.get('/', async (c) => {
  const result = await tagsService.getAllTags();
  return c.json(result);
});

// POST /tags
tags.post('/', async (c) => {
  const body = await c.req.json();
  const result = await tagsService.createTag(body);
  return c.json(result, 201);
});

// POST /tags/assign
tags.post('/assign', async (c) => {
  const body = await c.req.json();
  const result = await tagsService.assignTags(body);
  return c.json(result);
});

// DELETE /tags/:id
tags.delete('/:id', async (c) => {
  const id = c.req.param('id');
  await tagsService.deleteTag(id);
  return c.json({ success: true });
});

export default tags;

