import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from '@/db/schema';

const client = createClient({
  url: process.env.TURSO_CONNECTION_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
  syncInterval: 60,
  fetch: (input: RequestInfo | URL, init?: RequestInit) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);
    
    return fetch(input, {
      ...init,
      signal: controller.signal,
    }).finally(() => clearTimeout(timeoutId));
  },
  intMode: 'number',
});

export const db = drizzle(client, { schema });

export type Database = typeof db;