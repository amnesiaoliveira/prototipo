'use strict';

// Servidor de arquivos para demonstração local. Não contém APIs ou persistência.
const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');

const HOST = '127.0.0.1';
const ROOT = __dirname;
const rawPort = process.argv[2] || process.env.PORT || '4178';
const PORT = Number(rawPort);
const MIME = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.webp', 'image/webp'],
  ['.ico', 'image/x-icon'],
  ['.woff', 'font/woff'],
  ['.woff2', 'font/woff2'],
]);

if (!/^\d+$/.test(rawPort) || !Number.isInteger(PORT) || PORT < 1 || PORT > 65535) {
  console.error('Porta inválida. Use: node server.cjs 4178');
  process.exit(1);
}

function insideRoot(candidate) {
  const relative = path.relative(ROOT, candidate);
  return relative === '' || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative));
}

function reply(request, response, status, message, extraHeaders = {}) {
  const body = `${message}\n`;
  response.writeHead(status, {
    'Content-Type': 'text/plain; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    ...extraHeaders,
  });
  response.end(request.method === 'HEAD' ? undefined : body);
}

const server = http.createServer(async (request, response) => {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return reply(request, response, 405, 'Método não permitido.', { Allow: 'GET, HEAD' });
  }

  let decoded;
  try {
    const pathname = request.url.split(/[?#]/, 1)[0];
    if (!pathname.startsWith('/')) throw new Error('Invalid request path');
    decoded = decodeURIComponent(pathname).replaceAll('\\', '/');
    if (decoded.includes('\0') || decoded.split('/').includes('..')) {
      throw new Error('Invalid request path');
    }
  } catch {
    return reply(request, response, 400, 'Caminho inválido.');
  }

  const requestedPath = decoded === '/' ? '/index.html' : decoded;
  const filePath = path.resolve(ROOT, `.${requestedPath}`);
  const contentType = MIME.get(path.extname(filePath).toLowerCase());
  if (!insideRoot(filePath) || !contentType) {
    return reply(request, response, 404, 'Arquivo não encontrado.');
  }

  try {
    // Também bloqueia links simbólicos que apontem para fora da pasta do protótipo.
    const realPath = await fs.realpath(filePath);
    if (!insideRoot(realPath)) return reply(request, response, 404, 'Arquivo não encontrado.');
    const stat = await fs.stat(realPath);
    if (!stat.isFile()) return reply(request, response, 404, 'Arquivo não encontrado.');
    const body = request.method === 'HEAD' ? null : await fs.readFile(realPath);
    response.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': body ? body.length : stat.size,
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    });
    response.end(body);
  } catch (error) {
    if (['ENOENT', 'ENOTDIR', 'EACCES', 'EPERM'].includes(error.code)) {
      return reply(request, response, 404, 'Arquivo não encontrado.');
    }
    console.error('Falha ao servir arquivo:', error.code || error.message);
    reply(request, response, 500, 'Não foi possível ler o arquivo.');
  }
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`A porta ${PORT} está ocupada. Se o protótipo já estiver aberto, acesse http://${HOST}:${PORT}.`);
    console.error('Para usar outra porta: node server.cjs 4179');
  } else {
    console.error(`Não foi possível iniciar o servidor: ${error.message}`);
  }
  process.exitCode = 1;
});

server.listen(PORT, HOST, () => {
  console.log(`Protótipo de Protocolo Municipal: http://${HOST}:${PORT}`);
  console.log('Disponível apenas neste computador. Pressione Ctrl+C para encerrar.');
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
