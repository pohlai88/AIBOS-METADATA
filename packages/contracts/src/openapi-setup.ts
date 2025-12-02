// packages/contracts/src/openapi-setup.ts

/**
 * OpenAPI Setup
 * 
 * Extends Zod with OpenAPI metadata capabilities.
 * 
 * All contract files should import from this file instead of 'zod' directly.
 */

import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

// Extend Zod with OpenAPI methods
extendZodWithOpenApi(z);

export { z };

