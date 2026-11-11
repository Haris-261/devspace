import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import cookieParser = require('cookie-parser');
import { rateLimit } from 'express-rate-limit';
import { AppModule } from './app.module';

function validateEnvironment(): void {
  const required = ['MONGODB_URI', 'JWT_SECRET'];
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    const errorMsg = `[CRITICAL CONFIG ERROR] Missing required environment variable(s): ${missing.join(', ')}. Set them in Vercel Project Settings.`;
    console.error(errorMsg);
    if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
      throw new Error(errorMsg);
    }
  }
}

function parseAllowedOrigins(): string[] {
  const origins = new Set<string>();
  origins.add('http://localhost:3000');
  origins.add('http://localhost:3001');

  if (process.env.ALLOWED_ORIGINS) {
    process.env.ALLOWED_ORIGINS.split(',').forEach((orig) => {
      const clean = orig.trim().replace(/\/+$/, '');
      if (clean) origins.add(clean);
    });
  }

  if (process.env.FRONTEND_URL) {
    const clean = process.env.FRONTEND_URL.trim().replace(/\/+$/, '');
    if (clean) origins.add(clean);
  }

  if (process.env.ADMIN_URL) {
    const clean = process.env.ADMIN_URL.trim().replace(/\/+$/, '');
    if (clean) origins.add(clean);
  }

  return Array.from(origins);
}

let cachedServer: { app: NestExpressApplication; expressApp: any } | null = null;

export async function bootstrapServer(): Promise<{ app: NestExpressApplication; expressApp: any }> {
  if (cachedServer) {
    return cachedServer;
  }

  validateEnvironment();

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // STEP 1: Fix trust proxy setting for Vercel BEFORE any middleware or rate-limiter
  // Vercel is exactly one proxy hop. Never use true, use 1.
  app.set('trust proxy', 1);

  const expressApp = app.getHttpAdapter().getInstance();
  if (expressApp && typeof expressApp.set === 'function') {
    expressApp.set('trust proxy', 1);
  }

  app.setGlobalPrefix('api');

  app.use(helmet());
  app.use(cookieParser());

  // STEP 1: Rate limiter on login route (10 attempts / 15 mins per IP, skip OPTIONS preflight)
  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.method === 'OPTIONS',
    message: {
      statusCode: 429,
      message: 'Too many login attempts from this IP, please try again in 15 minutes',
      error: 'Too Many Requests',
    },
  });
  app.use('/api/auth/login', loginLimiter);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  // STEP 2: CORS configuration
  const allowedOrigins = parseAllowedOrigins();
  app.enableCors({
    origin: (origin, callback) => {
      // Allow non-browser requests (e.g. server-to-server, curl, Postman)
      if (!origin) return callback(null, true);

      const normalizedOrigin = origin.trim().replace(/\/+$/, '');
      if (allowedOrigins.includes(normalizedOrigin)) {
        return callback(null, true);
      }

      console.warn(`[CORS] Blocked request from origin: "${origin}". Allowed origins:`, allowedOrigins);
      return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
    exposedHeaders: ['Set-Cookie'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  await app.init();
  cachedServer = { app, expressApp };
  return cachedServer;
}

// Serverless entry handler for Vercel
export default async function handler(req: any, res: any) {
  const { expressApp } = await bootstrapServer();
  return expressApp(req, res);
}

// Only listen locally, NEVER execute app.listen() on Vercel serverless
if (!process.env.VERCEL) {
  bootstrapServer()
    .then(async ({ app }) => {
      const port = process.env.PORT || 4000;
      await app.listen(port);
      console.log(`Backend server running on http://localhost:${port}/api`);
    })
    .catch((err) => {
      console.error('Fatal bootstrap error:', err);
      process.exit(1);
    });
}
