import { getContext } from 'hono/context-storage';

// Define the Hono context type with custom variables
type Env = {
  Variables: {
    honoData: {
      serverTimestamp: string;
      serverRegion: string;
      computedValue: string;
    };
  };
};

// Export getter for React Router loaders to access Hono context
export function getHonoContext() {
  try {
    const context = getContext<Env>();
    return context.var.honoData;
  } catch {
    // Context not available (e.g., during build or prerendering)
    return undefined;
  }
}
