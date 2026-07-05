import { index, type RouteConfig, route, prefix } from '@react-router/dev/routes';

export default [
  ...prefix(':locale?', [
    index('./routes/home.tsx'),
    route('/about', './routes/about.tsx'),
    route('/holy-grail', './routes/holy-grail.tsx'),
    route('/ssr', './routes/ssr.tsx'),
    route('/hono-rpc', './routes/hono-rpc.tsx'),
    route('/errors', './routes/errors.tsx'),
    route('/errors/:code', './routes/errors.$code.tsx'), // Dynamic error code routes
    route('*', './routes/$.tsx'), // Catch-all 404 route
  ]),
] satisfies RouteConfig;
