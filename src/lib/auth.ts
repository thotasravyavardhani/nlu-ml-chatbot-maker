import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { NextRequest } from 'next/server';
import { headers } from "next/headers"
import { db } from "@/db";
import { session } from "@/db/schema";
import { eq } from "drizzle-orm";
 
export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "sqlite",
	}),
	emailAndPassword: {    
		enabled: true,
		autoSignIn: false,
		sendResetPassword: async () => {},
		sendVerificationEmail: async () => {},
	},
});

// Session validation helper - supports both cookies and bearer tokens
export async function getCurrentUser(request: NextRequest) {
  // First, try cookie-based authentication (primary method)
  try {
    const authSession = await auth.api.getSession({ headers: await headers() });
    if (authSession?.user) {
      return authSession.user;
    }
  } catch (error) {
    console.log('Cookie auth failed, trying bearer token');
  }

  // Fallback to bearer token authentication
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);

  try {
    const sessionRecord = await db
      .select()
      .from(session)
      .where(eq(session.token, token))
      .limit(1);

    if (sessionRecord.length === 0) {
      return null;
    }

    const sess = sessionRecord[0];
    
    if (new Date(sess.expiresAt) < new Date()) {
      return null;
    }

    // Return user object with id (matching better-auth user shape)
    return { id: sess.userId };
  } catch (error) {
    console.error('Bearer token validation error:', error);
    return null;
  }
}

// Validate session from bearer token (for API routes)
export async function validateSession(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);

  try {
    const sessionRecord = await db
      .select()
      .from(session)
      .where(eq(session.token, token))
      .limit(1);

    if (sessionRecord.length === 0) {
      return null;
    }

    const sess = sessionRecord[0];
    
    if (new Date(sess.expiresAt) < new Date()) {
      return null;
    }

    return { userId: sess.userId };
  } catch (error) {
    console.error('Session validation error:', error);
    return null;
  }
}

// Legacy compatibility
export async function getAuthUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user ? { userId: session.user.id, email: session.user.email } : null;
}

export async function requireAuth() {
  const user = await getAuthUser();
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}