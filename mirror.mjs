import scrape from 'website-scraper';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dest = path.join(__dirname, 'site');

const options = {
  urls: ['https://www.ofconsultores.com/'],
  directory: dest,
  recursive: true,
  maxRecursiveDepth: 5,
  maxDepth: 5,
  urlFilter: (url) => {
    try {
      const u = new URL(url);
      if (u.hostname !== 'www.ofconsultores.com' && u.hostname !== 'ofconsultores.com') {
        return false;
      }
      if (u.pathname.startsWith('/wp-admin')) return false;
      if (u.pathname.includes('xmlrpc')) return false;
      if (u.pathname.includes('/feed')) return false;
      if (u.pathname.includes('wp-json')) return false;
      return true;
    } catch {
      return false;
    }
  },
  request: {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; ManancialMirror/1.0)',
    },
  },
  filenameGenerator: 'bySiteStructure',
  prettifyUrls: true,
};

console.log('Mirroring https://www.ofconsultores.com/ ...');
await scrape(options);
console.log('Done.');
