import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { chatMessages, chatSessions, workspaces, session as sessionTable } from '@/db/schema';
import { eq, and, asc } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Extract and validate Bearer token
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'MISSING_TOKEN' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // Validate session using better-auth
    const sessionRecord = await db
      .select()
      .from(sessionTable)
      .where(eq(sessionTable.token, token))
      .limit(1);

    if (sessionRecord.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or expired session', code: 'INVALID_SESSION' },
        { status: 401 }
      );
    }

    const userSession = sessionRecord[0];

    // Check if session is expired
    if (new Date(userSession.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: 'Session expired', code: 'SESSION_EXPIRED' },
        { status: 401 }
      );
    }

    const userId = userSession.userId;

    // Validate chat session ID
    const sessionId = params.id;
    if (!sessionId || isNaN(parseInt(sessionId))) {
      return NextResponse.json(
        { error: 'Valid session ID is required', code: 'INVALID_SESSION_ID' },
        { status: 400 }
      );
    }

    // Verify session exists and get workspace
    const chatSession = await db
      .select({
        id: chatSessions.id,
        workspaceId: chatSessions.workspaceId,
        workspace: {
          id: workspaces.id,
          userId: workspaces.userId,
        },
      })
      .from(chatSessions)
      .innerJoin(workspaces, eq(chatSessions.workspaceId, workspaces.id))
      .where(eq(chatSessions.id, parseInt(sessionId)))
      .limit(1);

    if (chatSession.length === 0) {
      return NextResponse.json(
        { error: 'Chat session not found', code: 'SESSION_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Verify workspace belongs to authenticated user
    if (chatSession[0].workspace.userId !== userId) {
      return NextResponse.json(
        { error: 'Access denied: workspace does not belong to user', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    // Get pagination parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '100'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    // Fetch messages for the chat session ordered chronologically
    const messages = await db
      .select({
        id: chatMessages.id,
        chatSessionId: chatMessages.chatSessionId,
        messageText: chatMessages.messageText,
        isUser: chatMessages.isUser,
        intentDetected: chatMessages.intentDetected,
        confidenceScore: chatMessages.confidenceScore,
        createdAt: chatMessages.createdAt,
      })
      .from(chatMessages)
      .where(eq(chatMessages.chatSessionId, parseInt(sessionId)))
      .orderBy(asc(chatMessages.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(messages, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}