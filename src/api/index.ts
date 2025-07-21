import { Hono } from "hono";
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';

// Import route modules
import { poolRoutes } from './routes/pools';
import { positionRoutes } from './routes/positions';
import { activityRoutes } from './routes/activities';
import { userRoutes } from './routes/users';
import { tokenRoutes } from './routes/tokens';
import { statsRoutes } from './routes/stats';
import { webhookRoutes } from './routes/webhooks';

const app = new Hono();

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
    message: 'Lending Pool API is healthy',
    timestamp: new Date().toISOString(),
    version: '2.0.0'
  });
});

// Mount route modules
app.route('/api', poolRoutes);
app.route('/api', positionRoutes);
app.route('/api', activityRoutes);
app.route('/api', userRoutes);
app.route('/api', tokenRoutes);
app.route('/api', statsRoutes);
app.route('/api', webhookRoutes);

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
