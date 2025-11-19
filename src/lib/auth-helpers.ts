// Create new authentication helper file
import { NextRequest } from 'next/server';
import { db } from '@/db';
import { session } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { betterFetch } from '@better-fetch/fetch';

/**
 * Validates user session from cookies (recommended for API routes)
 * Returns user object if authenticated, null otherwise
 */
export async function validateSessionFromCookies(request: NextRequest) {
  try {
    const { data: sessionData } = await betterFetch<any>(
      "/api/auth/get-session",
      {
        baseURL: request.nextUrl.origin,
        headers: {
          cookie: request.headers.get("cookie") || "",
        },
      }
    );

    if (!sessionData?.user) {
      return null;
    }

    return {
      userId: sessionData.user.id,
      email: sessionData.user.email,
      name: sessionData.user.name,
    };
  } catch (error) {
    console.error('Session validation error:', error);
    return null;
  }
}

/**
 * @deprecated Use validateSessionFromCookies instead
 * Legacy function for Bearer token authentication
 */
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