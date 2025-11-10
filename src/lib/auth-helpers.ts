// Create new authentication helper file
import { NextRequest } from 'next/server';
import { db } from '@/db';
import { session } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function getCurrentUser(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    
    const sessionRecord = await db
      .select()
      .from(session)
      .where(eq(session.token, token))
      .limit(1);

    if (sessionRecord.length === 0) {
      return null;
    }

    const userSession = sessionRecord[0];
    
    if (new Date(userSession.expiresAt) < new Date()) {
      return null;
    }

    return { id: userSession.userId };
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}