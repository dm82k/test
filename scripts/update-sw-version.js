#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Path to service worker
const swPath = path.join(__dirname, '../public/sw.js');

try {
  // Read current service worker
  let swContent = fs.readFileSync(swPath, 'utf8');

  // Find current version
  const versionMatch = swContent.match(
    /const CACHE_NAME = 'sales-tracker-v(\d+)'/
  );

  if (versionMatch) {
    const currentVersion = parseInt(versionMatch[1]);
    const newVersion = currentVersion + 1;

    // Replace version
    swContent = swContent.replace(
      /const CACHE_NAME = 'sales-tracker-v\d+'/,
      `const CACHE_NAME = 'sales-tracker-v${newVersion}'`
    );

    // Write updated service worker
    fs.writeFileSync(swPath, swContent);

    console.log(
      `✅ Updated service worker cache version: v${currentVersion} → v${newVersion}`
    );
  } else {
    console.log('⚠️  Could not find cache version in service worker');
  }
} catch (error) {
  console.error('❌ Failed to update service worker version:', error);
  process.exit(1);
}
