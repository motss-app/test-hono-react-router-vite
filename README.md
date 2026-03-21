# Welcome to React Router!

A modern, production-ready template for building full-stack React applications using React Router.

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/remix-run/react-router-templates/tree/main/default)

## Documentation

- **[📖 Full Documentation](docs.md)** - Complete project guide
- **[📚 Detailed Guides](docs/)** - In-depth documentation for specific topics

## Features

- 🚀 Server-side rendering
- ⚡️ Hot Module Replacement (HMR)
- 📦 Asset bundling and optimization
- 🔄 Data loading and mutations
- 🔒 TypeScript by default
- 🎨 StyleX for styling
- 📖 [React Router docs](https://reactrouter.com/)

## Getting Started

### Installation

Install the dependencies:

```bash
deno install
```

### Development

Start the development server with HMR:

```bash
deno task dev
```

Your application will be available at `http://localhost:5173`.

## Building for Production

Create a production build:

```bash
deno task build
```

## Deployment

### Docker Deployment

To build and run using Docker:

```bash
docker build -t my-app .

# Run the container
docker run -p 3000:3000 my-app
```

The containerized application can be deployed to any platform that supports Docker, including:

- AWS ECS
- Google Cloud Run
- Azure Container Apps
- Digital Ocean App Platform
- Fly.io
- Railway

### Deno Deploy

This project is configured for deployment on [Deno Deploy](https://deno.com/deploy).

1. Install the Deno CLI if you haven't already:

   ```bash
   curl -fsSL https://deno.land/install.sh | sh
   ```

2. Authenticate with Deno Deploy:

   ```bash
   deno deploy login
   ```

3. Deploy to production:

   ```bash
   deno task deploy
   ```

   Or directly:

   ```bash
   deno task build && deno deploy
   ```

The application will be deployed to Deno Deploy and you'll receive a production URL.

### DIY Deployment

If you're familiar with deploying Node applications, the built-in app server is production-ready.

Make sure to deploy the output of `deno task build`

```
├── package.json
├── deno.json
├── deno.lock
├── build/
│   ├── client/    # Static assets
│   └── server/    # Server-side code
```

## Styling

This project uses [StyleX](https://stylexjs.com/) for styling and theming. Global styling is expressed through StyleX tokens, utilities, and components rather than a global CSS framework.

---

Built with ❤️ using React Router.
