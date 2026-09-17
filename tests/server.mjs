// Dependency-free static server for the test run (python http.server dropped requests under parallel load).
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const root = process.cwd(); const port = +(process.env.PORT || 4173);
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript', '.png': 'image/png', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.webp': 'image/webp', '.jpg': 'image/jpeg' };
http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname); if (p.endsWith('/')) p += 'index.html';
  const f = path.normalize(path.join(root, p)); if (!f.startsWith(root)) { res.writeHead(403); return res.end(); }
  fs.stat(f, (err, st) => {
    if (err || !st.isFile()) { res.writeHead(404); return res.end('not found'); }
    res.writeHead(200, { 'content-type': types[path.extname(f)] || 'application/octet-stream', 'content-length': st.size, 'cache-control': 'no-store' });
    fs.createReadStream(f).pipe(res);
  });
}).listen(port, '127.0.0.1', () => console.log('static server on', port));
