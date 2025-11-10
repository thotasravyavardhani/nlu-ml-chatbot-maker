import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { chatMessages, chatSessions, workspaces, session } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(request: NextRequest) {
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
      .from(session)
      .where(eq(session.token, token))
      .limit(1);

    if (sessionRecord.length === 0) {
      return NextResponse.json(
        { error: 'Invalid authentication token', code: 'INVALID_TOKEN' },
        { status: 401 }
      );
    }

    // Check if session is expired
    const currentSession = sessionRecord[0];
    if (new Date(currentSession.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: 'Session expired', code: 'SESSION_EXPIRED' },
        { status: 401 }
      );
    }

    const userId = currentSession.userId;

    // Parse request body
    const body = await request.json();
    const { chatSessionId, messageText, isUser, intentDetected, confidenceScore } = body;

    // Validate required fields
    if (!chatSessionId) {
      return NextResponse.json(
        { error: 'chatSessionId is required', code: 'MISSING_CHAT_SESSION_ID' },
        { status: 400 }
      );
    }

    if (!messageText) {
      return NextResponse.json(
        { error: 'messageText is required', code: 'MISSING_MESSAGE_TEXT' },
        { status: 400 }
      );
    }

    if (typeof isUser !== 'boolean') {
      return NextResponse.json(
        { error: 'isUser must be a boolean', code: 'INVALID_IS_USER' },
        { status: 400 }
      );
    }

    // Validate chatSessionId is a valid integer
    const sessionId = parseInt(chatSessionId.toString());
    if (isNaN(sessionId)) {
      return NextResponse.json(
        { error: 'chatSessionId must be a valid integer', code: 'INVALID_CHAT_SESSION_ID' },
        { status: 400 }
      );
    }

    // Verify chat session exists and get its workspace
    const chatSessionRecord = await db
      .select({
        sessionId: chatSessions.id,
        workspaceId: chatSessions.workspaceId,
      })
      .from(chatSessions)
      .where(eq(chatSessions.id, sessionId))
      .limit(1);

    if (chatSessionRecord.length === 0) {
      return NextResponse.json(
        { error: 'Chat session not found', code: 'SESSION_NOT_FOUND' },
        { status: 404 }
      );
    }

    const { workspaceId } = chatSessionRecord[0];

    // Verify workspace belongs to authenticated user
    const workspaceRecord = await db
      .select()
      .from(workspaces)
      .where(and(eq(workspaces.id, workspaceId), eq(workspaces.userId, userId)))
      .limit(1);

    if (workspaceRecord.length === 0) {
      return NextResponse.json(
        { error: 'Forbidden: workspace does not belong to user', code: 'WORKSPACE_ACCESS_DENIED' },
        { status: 403 }
      );
    }

    // Validate optional fields
    if (confidenceScore !== undefined && confidenceScore !== null) {
      const score = parseFloat(confidenceScore.toString());
      if (isNaN(score)) {
        return NextResponse.json(
          { error: 'confidenceScore must be a valid number', code: 'INVALID_CONFIDENCE_SCORE' },
          { status: 400 }
        );
      }
    }

    // Prepare message data
    const messageData: {
      chatSessionId: number;
      messageText: string;
      isUser: number;
      intentDetected?: string;
      confidenceScore?: number;
      createdAt: string;
    } = {
      chatSessionId: sessionId,
      messageText: messageText.trim(),
      isUser: isUser ? 1 : 0,
      createdAt: new Date().toISOString(),
    };

    // Add optional fields if provided
    if (intentDetected) {
      messageData.intentDetected = intentDetected.trim();
    }

    if (confidenceScore !== undefined && confidenceScore !== null) {
      messageData.confidenceScore = parseFloat(confidenceScore.toString());
    }

    // Insert message into database
    const newMessage = await db
      .insert(chatMessages)
      .values(messageData)
      .returning();

    // Convert isUser back to boolean for response
    const responseMessage = {
      ...newMessage[0],
      isUser: newMessage[0].isUser === 1,
    };

    return NextResponse.json(responseMessage, { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}