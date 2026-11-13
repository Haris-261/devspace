import { Controller, Get } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

const DB_STATES: Record<number, string> = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };

/** Public status endpoint: GET /api/health. Exposes no secrets or connection details. */
@Controller('health')
export class HealthController {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  @Get()
  async check() {
    const state = this.connection.readyState;
    let ping = false;
    if (state === 1 && this.connection.db) {
      try {
        await this.connection.db.admin().ping();
        ping = true;
      } catch {
        ping = false;
      }
    }
    return {
      status: ping ? 'ok' : 'error',
      database: { status: DB_STATES[state] ?? 'unknown', ping },
      uptime: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
    };
  }
}
