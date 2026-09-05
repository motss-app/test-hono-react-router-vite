import { index, layout, prefix, type RouteConfig, route } from '@react-router/dev/routes';

export default [
  ...prefix(':locale?', [
    route('/holy-grail', './routes/holy-grail.tsx'),
    layout('./routes/page-layout.tsx', [
      index('./routes/home.tsx'),
      route('/about', './routes/about.tsx'),
      route('/ssr', './routes/ssr.tsx'),
      route('/hono-rpc', './routes/hono-rpc.tsx'),
      route('/labs', './routes/labs.tsx'),
      route('/labs/mandelbrot', './routes/labs-mandelbrot.tsx'),
      route('/errors', './routes/errors.tsx'),
      route('/errors/:code', './routes/errors.$code.tsx'), // Dynamic error code routes
    ]),
    route('*', './routes/$.tsx'), // Catch-all 404 route (must be last)
  ]),
] satisfies RouteConfig;
