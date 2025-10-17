FROM denoland/deno:latest AS base

FROM base AS build-env
COPY . /app
WORKDIR /app
RUN deno cache deno.json
RUN deno task build

FROM base
COPY --from=build-env /app/build /app/build
WORKDIR /app
ENV NODE_ENV=production
ENTRYPOINT ["deno", "run", "-P=start", "--check", "./build/server.js"]
