import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { db } from '@/db';
import { session } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Get the session using better-auth (which uses cookies)
    const authSession = await auth.api.getSession({ 
      headers: await headers() 
    });

    if (!authSession?.user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Fetch the latest session token from the database
    const userSessions = await db
      .select()
      .from(session)
      .where(eq(session.userId, authSession.user.id))
      .orderBy(desc(session.createdAt))
      .limit(1);

    if (userSessions.length === 0) {
      return NextResponse.json(
        { error: 'No session found' },
        { status: 404 }
      );
    }

    const sessionData = userSessions[0];

    return NextResponse.json({
      token: sessionData.token,
      userId: authSession.user.id,
      email: authSession.user.email,
      expiresAt: sessionData.expiresAt,
    });
  } catch (error) {
    console.error('Session token error:', error);
    return NextResponse.json(
      { error: 'Failed to get session token' },
      { status: 500 }
    );
  }
}