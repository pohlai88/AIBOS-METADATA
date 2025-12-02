#!/usr/bin/env node
// Quick test of improved extraction on a single page

import { fetchPage } from "./extract-docs.mjs";

async function testExtraction() {
  console.log("🧪 Testing improved extraction on installation/using-vite...\n");
  
  const page = await fetchPage("installation/using-vite");
  
  console.log(`Title: ${page.title}`);
  console.log(`Content length: ${page.content?.length || 0} characters`);
  console.log(`Code blocks: ${page.codeBlocks?.length || 0}`);
  console.log(`\nFirst 500 chars of content:\n${page.content?.substring(0, 500) || "No content"}`);
  console.log(`\nCode blocks found: ${page.codeBlocks?.length || 0}`);
  if (page.codeBlocks && page.codeBlocks.length > 0) {
    console.log(`\nFirst code block (first 200 chars):\n${page.codeBlocks[0].substring(0, 200)}`);
  }
}

testExtraction().catch(console.error);

