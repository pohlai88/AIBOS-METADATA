/**
 * Bootstrap Step 2: Load Glossary
 * Loads predefined glossary terms and categories
 */

import { glossaryService } from '../services/glossary.service';
import { GlossaryTerm } from '../schemas/glossary.schema';

const GLOSSARY_TERMS: Partial<GlossaryTerm>[] = [
  // TODO: Define core business terms
  // Example structure shown below
];

export async function loadGlossary() {
  console.log(`Loading ${GLOSSARY_TERMS.length} glossary terms...`);

  for (const term of GLOSSARY_TERMS) {
    try {
      // Check if term exists
      const existing = await glossaryService.getTermById(term.id!);
      
      if (existing) {
        console.log(`  ⏭️  Term "${term.name}" already exists, skipping`);
        continue;
      }

      await glossaryService.createTerm(term);
      console.log(`  ✅ Loaded term: ${term.name}`);
    } catch (error) {
      console.error(`  ❌ Failed to load term "${term.name}":`, error);
      throw error;
    }
  }

  console.log('Glossary loaded successfully');
}

