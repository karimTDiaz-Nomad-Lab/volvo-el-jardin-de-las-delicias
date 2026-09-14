#!/usr/bin/env node
/**
 * Verify registered client packs have required assets on disk.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const registryPath = path.join(root, 'config', 'registry.ts');

const registrySrc = fs.readFileSync(registryPath, 'utf8');
const clientIds = [...registrySrc.matchAll(/^\s+([a-z][a-z0-9-]*):\s+\w+Manifest,/gm)].map((m) => m[1]);

if (clientIds.length === 0) {
  console.error('No clients found in config/registry.ts');
  process.exit(1);
}

let failed = false;

for (const clientId of clientIds) {
  const clientDir = path.join(root, 'config', 'clients', clientId);
  const manifestPath = path.join(clientDir, 'manifest.ts');
  const naturesPath = path.join(clientDir, 'natures.ts');
  const copyPath = path.join(clientDir, 'copy.ts');
  const promptsPath = path.join(clientDir, 'prompts.ts');
  const themePath = path.join(root, 'src', 'styles', 'themes', `${clientId}.css`);

  const checks = [
    [manifestPath, 'manifest'],
    [naturesPath, 'natures module'],
    [copyPath, 'copy module'],
    [promptsPath, 'prompts module'],
  ];

  console.log(`\n[${clientId}]`);
  for (const [filePath, label] of checks) {
    if (!fs.existsSync(filePath)) {
      console.error(`  ✗ missing ${label}: ${path.relative(root, filePath)}`);
      failed = true;
    } else {
      console.log(`  ✓ ${label}`);
    }
  }

  const naturesSrc = fs.existsSync(naturesPath) ? fs.readFileSync(naturesPath, 'utf8') : '';
  const natureIds = [...naturesSrc.matchAll(/id:\s*'([a-z-]+)'/g)].map((m) => m[1]);
  if (natureIds.length === 0) {
    console.error(`  ✗ natures has 0 items`);
    failed = true;
  } else {
    console.log(`  ✓ natures: ${natureIds.join(', ')}`);
  }

  for (const natureId of natureIds) {
    const thumb = path.join(root, 'public', 'referencias_tarjetas', `${natureId}.jpg`);
    if (!fs.existsSync(thumb)) {
      console.error(`  ✗ missing card image: ${path.relative(root, thumb)}`);
      failed = true;
    } else {
      console.log(`  ✓ card ${natureId}.jpg`);
    }
  }

  const lookFiles = [...naturesSrc.matchAll(/look\('([^']+)'\)/g)].map((match) => match[1]);
  if (lookFiles.length === 0) {
    console.error('  ✗ natures has no look() style references');
    failed = true;
  }
  for (const fileName of lookFiles) {
    const onDisk = path.join(root, 'public', 'referencia_producto_final', fileName);
    if (!fs.existsSync(onDisk)) {
      console.error(`  ✗ missing style look: ${path.relative(root, onDisk)}`);
      failed = true;
    } else {
      console.log(`  ✓ look ${fileName}`);
    }
  }

  const bg = path.join(root, 'public', 'referencias_tarjetas', 'select-bg.jpg');
  if (!fs.existsSync(bg)) {
    console.error(`  ✗ missing select-bg.jpg`);
    failed = true;
  } else {
    console.log('  ✓ select-bg.jpg');
  }

  const manifestSrc = fs.readFileSync(manifestPath, 'utf8');
  const themeMatch = manifestSrc.match(/theme:\s*'([^']+)'/);
  const themeName = themeMatch?.[1];
  if (themeName && themeName !== 'default' && themeName !== 'dark') {
    if (!fs.existsSync(themePath) && themeName === clientId) {
      console.error(`  ✗ missing theme css for "${themeName}"`);
      failed = true;
    } else if (fs.existsSync(path.join(root, 'src', 'styles', 'themes', `${themeName}.css`))) {
      console.log(`  ✓ theme: ${themeName}`);
    } else {
      console.error(`  ✗ missing theme css for "${themeName}"`);
      failed = true;
    }
  }
}

console.log('');
if (failed) {
  console.error('Client pack verification failed.');
  process.exit(1);
}
console.log('All registered client packs passed filesystem checks.');
