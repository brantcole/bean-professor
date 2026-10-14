// Local static Expo preview for acceptance tests; never proxies to external services.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
const root = resolve('apps/mobile/dist');
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.ttf': 'font/ttf', '.json': 'application/json', '.ico': 'image/x-icon' };
const server = createServer(async (request, response) => {
  try {
    const path = decodeURIComponent(new URL(request.url ?? '/', 'http://localhost').pathname);
    let file = resolve(root, `.${path}`);
    if (file !== root && !file.startsWith(root + sep)) { response.writeHead(403).end(); return; }
    const info = await stat(file).catch(() => null);
    if (!info?.isFile()) {
      if (extname(path)) { response.writeHead(404).end(); return; }
      file = resolve(root, 'index.html');
    }
    response.writeHead(200, { 'Content-Type': mime[extname(file)] ?? 'application/octet-stream' });
    response.end(await readFile(file));
  } catch { response.writeHead(500).end('Export the web app before previewing.'); }
});
server.listen(4173, '127.0.0.1', () => console.log('Local acceptance preview started on port 4173'));
