#!/usr/bin/env node
/**
 * Script to add "use client" directive to all Radix UI component files
 * that are missing it.
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const componentsDir = join(__dirname, '../src/components');
const radixComponents = [
  'accessible-icon.tsx',
  'alert-dialog.tsx',
  'aspect-ratio.tsx',
  'avatar.tsx',
  'checkbox.tsx',
  'collapsible.tsx',
  'context-menu.tsx',
  'dialog.tsx',
  'dropdown-menu.tsx',
  'hover-card.tsx',
  'label.tsx',
  'menubar.tsx',
  'navigation-menu.tsx',
  'one-time-password-field.tsx',
  'password-toggle-field.tsx',
  'popover.tsx',
  'portal.tsx',
  'progress.tsx',
  'radio-group.tsx',
  'scroll-area.tsx',
  'select.tsx',
  'separator.tsx',
  'slider.tsx',
  'slot.tsx',
  'switch.tsx',
  'tabs.tsx',
  'toast.tsx',
  'toggle-group.tsx',
  'toggle.tsx',
  'toolbar.tsx',
  'tooltip.tsx',
  'visually-hidden.tsx',
];

let fixed = 0;
let skipped = 0;

for (const file of radixComponents) {
  const filePath = join(componentsDir, file);
  
  try {
    let content = readFileSync(filePath, 'utf8');
    
    // Check if already has "use client"
    if (content.includes('"use client"')) {
      console.log(`✓ ${file} - already has "use client"`);
      skipped++;
      continue;
    }
    
    // Find the first import or comment line
    const lines = content.split('\n');
    let insertIndex = 0;
    
    // Skip leading comments
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line && !line.startsWith('//') && !line.startsWith('/*')) {
        insertIndex = i;
        break;
      }
    }
    
    // Insert "use client" directive
    lines.splice(insertIndex, 0, '"use client";');
    if (insertIndex > 0) {
      lines.splice(insertIndex + 1, 0, ''); // Add blank line after directive
    }
    
    content = lines.join('\n');
    writeFileSync(filePath, content, 'utf8');
    
    console.log(`✓ ${file} - added "use client"`);
    fixed++;
  } catch (error) {
    console.error(`✗ ${file} - error: ${error.message}`);
  }
}

console.log(`\n✅ Fixed: ${fixed} files`);
console.log(`⏭️  Skipped: ${skipped} files (already had "use client")`);

