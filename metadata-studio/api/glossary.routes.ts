/**
 * Glossary Routes
 * Handles /glossary/* endpoints
 */

import { Hono } from 'hono';
import { glossaryService } from '../services/glossary.service';

const glossary = new Hono();

// GET /glossary/terms
glossary.get('/terms', async (c) => {
  const result = await glossaryService.getAllTerms();
  return c.json(result);
});

// GET /glossary/terms/:id
glossary.get('/terms/:id', async (c) => {
  const id = c.req.param('id');
  const result = await glossaryService.getTermById(id);
  return c.json(result);
});

// POST /glossary/terms
glossary.post('/terms', async (c) => {
  const body = await c.req.json();
  const result = await glossaryService.createTerm(body);
  return c.json(result, 201);
});

// PUT /glossary/terms/:id
glossary.put('/terms/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const result = await glossaryService.updateTerm(id, body);
  return c.json(result);
});

export default glossary;

