import { createProxyMiddleware } from 'http-proxy-middleware';

export default function proxy(app: any) {
  app.use(
    '/dashboard/users',
    createProxyMiddleware({
      target: 'http://localhost:8080',
      changeOrigin: true,
    })
  );

  app.use(
    '/dashboard/misc',
    createProxyMiddleware({
      target: 'http://localhost:8080',
      changeOrigin: true,
    })
  );
};