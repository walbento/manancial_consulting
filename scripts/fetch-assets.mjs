import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = process.env.SITE_ROOT
  ? path.resolve(process.env.SITE_ROOT)
  : fs.existsSync(path.join(__dirname, '..', 'frontend', 'wp-content'))
    ? path.join(__dirname, '..', 'frontend')
    : path.join(__dirname, '..', 'site', 'www.ofconsultores.com');
const ORIGIN = 'https://www.ofconsultores.com';

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else files.push(full);
  }
  return files;
}

function collectAssetPaths(content) {
  const paths = new Set();
  const patterns = [
    /\/wp-content\/[a-zA-Z0-9_\-./%?=&#+]+\.(?:png|jpe?g|gif|webp|svg|ico|woff2?|ttf|eot)/gi,
    /\/wp-content\/uploads\/[^"'\\)\s]+/gi,
    /url\(["']?(\/wp-content\/[^"')]+)["']?\)/gi,
  ];
  for (const pattern of patterns) {
    for (const match of content.matchAll(pattern)) {
      let p = (match[1] || match[0]).split(/[#?]/)[0];
      p = decodeURIComponent(p);
      paths.add(p);
    }
  }
  return paths;
}

const allFiles = walk(SITE_ROOT);
const needed = new Set();
for (const file of allFiles) {
  if (!/\.(html|css|js)$/i.test(file)) continue;
  const content = fs.readFileSync(file, 'utf8');
  for (const p of collectAssetPaths(content)) needed.add(p);
}

let downloaded = 0;
let skipped = 0;
let failed = 0;

for (const assetPath of needed) {
  const local = path.join(SITE_ROOT, assetPath);
  if (fs.existsSync(local)) {
    skipped++;
    continue;
  }
  fs.mkdirSync(path.dirname(local), { recursive: true });
  const url = ORIGIN + encodeURI(assetPath).replace(/%25/g, '%');
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!res.ok) {
      console.warn('FAIL', res.status, url);
      failed++;
      continue;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(local, buf);
    downloaded++;
    if (downloaded % 20 === 0) console.log('Downloaded', downloaded, '...');
  } catch (e) {
    console.warn('ERR', url, e.message);
    failed++;
  }
}

console.log(`Assets: ${needed.size} referenced, ${downloaded} downloaded, ${skipped} existed, ${failed} failed.`);
