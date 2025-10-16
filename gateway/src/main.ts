import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import cors from 'cors';
import { config } from 'dotenv';
import { resolve } from 'path';

if (process.env.NODE_ENV !== 'production') {
  config({ path: resolve(__dirname, '../../.env') });
}

const app = express();
const PORT = process.env.PORT || 3000;
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:3002';
const MAIL_SERVICE_URL = process.env.MAIL_SERVICE_URL || 'http://localhost:3003';
const UI_SERVICE_URL = process.env.UI_SERVICE_URL || 'http://localhost:5173';

app.use(cors());

const createServiceProxy = (serviceName: string, targetUrl: string) => {
  return createProxyMiddleware({
    target: targetUrl,
    changeOrigin: true,
    logLevel: 'debug',
    pathRewrite: (path, req) => {
      return path.replace(`/api/${serviceName}`, '');
    },
    onProxyReq: (proxyReq, req, res) => {
      console.log(`[${serviceName.toUpperCase()} →] ${req.method} ${req.url} -> ${targetUrl}${req.url.replace(`/api/${serviceName}`, '')}`);
      
      if (req.body && Object.keys(req.body).length > 0) {
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader('Content-Type', 'application/json');
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
        console.log(`[${serviceName.toUpperCase()}] Body:`, req.body);
      }
    },
    onProxyRes: (proxyRes, req, res) => {
      const statusCode = proxyRes.statusCode || 0;
      if (statusCode >= 400) {
        console.log(`[${serviceName.toUpperCase()} ←] ${req.method} ${req.url} <- ${statusCode} ❌ Error`);
      } else {
        console.log(`[${serviceName.toUpperCase()} ←] ${req.method} ${req.url} <- ${statusCode} ✓ Success`);
      }
    },
    onError: (err, req, res) => {
      console.error(`[${serviceName.toUpperCase()} ERROR] ❌`, err.message);
      console.error(`[${serviceName.toUpperCase()} ERROR] Is the service running at ${targetUrl}?`);
      res.writeHead(500, {
        'Content-Type': 'application/json',
      });
      res.end(JSON.stringify({ error: `${serviceName} service unavailable` }));
    },
  });
};

app.use('/api/user', express.json(), createServiceProxy('user', USER_SERVICE_URL));

app.use('/', createProxyMiddleware({
  target: UI_SERVICE_URL,
  changeOrigin: true,
  ws: true,
  logLevel: 'silent',
  onError: (err, req, res) => {
    console.error('[UI PROXY ERROR]', err);
    res.writeHead(500, {
      'Content-Type': 'text/html',
    });
    res.end('<h1>UI service unavailable</h1>');
  },
}));

app.listen(PORT, () => {
  console.log(`🌙 Gateway ready at http://localhost:${PORT}`);
  console.log(`   /           → UI (${UI_SERVICE_URL})`);
  console.log(`   /api/user/* → User Service (${USER_SERVICE_URL})`);
  console.log(`   Mail Service (${MAIL_SERVICE_URL}) - Internal only`);
});

