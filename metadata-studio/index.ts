/**
 * Metadata Studio - Main Entry Point
 * Nexus Metadata Studio for centralized metadata management
 */

export * from './schemas/mdm-global-metadata.schema';
export * from './schemas/observability.schema';
export * from './schemas/standard-pack.schema';
export * from './schemas/lineage.schema';
export * from './schemas/glossary.schema';
export * from './schemas/tags.schema';
export * from './schemas/kpi.schema';

export * from './services/metadata.service';
export * from './services/lineage.service';
export * from './services/impact-analysis.service';
export * from './services/glossary.service';
export * from './services/tags.service';
export * from './services/quality.service';
export * from './services/usage.service';

export * from './api/metadata.routes';
export * from './api/lineage.routes';
export * from './api/impact.routes';
export * from './api/glossary.routes';
export * from './api/tags.routes';
export * from './api/quality.routes';
export * from './api/usage.routes';

export * from './mcp/tools/metadata.tools';
export * from './mcp/tools/lineage.tools';
export * from './mcp/tools/impact.tools';
export * from './mcp/tools/glossary.tools';
export * from './mcp/tools/quality.tools';
export * from './mcp/tools/usage.tools';

export { bootstrap } from './bootstrap';

// SDK Version & Controlled Vocabulary
export * from './sdk/version';
export * from './glossary/controlled-vocabulary';

