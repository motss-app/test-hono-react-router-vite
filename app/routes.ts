import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("/about", "./routes/about.tsx"),
  route("/ssr", "./routes/ssr.tsx"),
  route("/errors", "./routes/errors.tsx"),
  route("/errors/:code", "./routes/errors.$code.tsx"), // Dynamic error code routes
  route("*", "./routes/$.tsx"), // Catch-all 404 route
] satisfies RouteConfig;
