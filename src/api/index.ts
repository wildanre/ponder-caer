import { Hono } from "hono";
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { createYoga } from 'graphql-yoga';
import { schema } from './graphql';

const app = new Hono();

// Create GraphQL Yoga instance
const yoga = createYoga({
  schema,
  graphqlEndpoint: '/api/graphql',
  landingPage: false,
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:8080'],
    credentials: true,
  },
});

// Middleware
app.use('*', cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:8080'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

app.use('*', logger());

// Helper function to convert BigInt to string for JSON serialization
export const serializeBigInt = (obj: any): any => {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'bigint') return obj.toString();
  if (Array.isArray(obj)) return obj.map(serializeBigInt);
  if (typeof obj === 'object') {
    const serialized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      serialized[key] = serializeBigInt(value);
    }
    return serialized;
  }
  return obj;
};

// Add global BigInt serialization support
(BigInt.prototype as any).toJSON = function() { return this.toString(); };

// Health check
app.get('/api/health', (c) => {
  return c.json({
    success: true,
    message: 'Lending Pool GraphQL API is healthy',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    graphql: {
      endpoint: '/api/graphql',
      playground: '/api/graphql'
    }
  });
});

// GraphQL endpoint
app.all('/api/graphql', async (c) => {
  const request = new Request(c.req.url, {
    method: c.req.method,
    headers: c.req.header(),
    body: c.req.method !== 'GET' && c.req.method !== 'HEAD' ? await c.req.text() : undefined,
  });

  const response = await yoga.fetch(request);
  
  // Convert Response to Hono Response
  const headers: Record<string, string> = {};
  response.headers.forEach((value, key) => {
    headers[key] = value;
  });

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
});

// 404 handler
app.notFound((c) => {
  return c.json({
    success: false,
    error: 'Not found',
    message: 'The requested endpoint does not exist'
  }, 404);
});

// Error handler
app.onError((error, c) => {
  console.error('API Error:', error);
  return c.json({
    success: false,
    error: 'Internal server error',
    message: error.message
  }, 500);
});

export default app;
