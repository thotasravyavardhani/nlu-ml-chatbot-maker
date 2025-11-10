import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { chatSessions, workspaces } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspaceId');
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    if (!workspaceId) {
      return NextResponse.json(
        { error: 'workspaceId is required', code: 'MISSING_WORKSPACE_ID' },
        { status: 400 }
      );
    }

    const workspaceIdNum = parseInt(workspaceId);
    if (isNaN(workspaceIdNum)) {
      return NextResponse.json(
        { error: 'Invalid workspaceId', code: 'INVALID_WORKSPACE_ID' },
        { status: 400 }
      );
    }

    // Verify workspace exists and belongs to user
    const workspace = await db
      .select()
      .from(workspaces)
      .where(eq(workspaces.id, workspaceIdNum))
      .limit(1);

    if (workspace.length === 0) {
      return NextResponse.json(
        { error: 'Workspace not found', code: 'WORKSPACE_NOT_FOUND' },
        { status: 404 }
      );
    }

    if (workspace[0].userId !== user.id) {
      return NextResponse.json(
        { error: 'Access denied to this workspace', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    // Get chat sessions for the workspace
    const sessions = await db
      .select()
      .from(chatSessions)
      .where(eq(chatSessions.workspaceId, workspaceIdNum))
      .orderBy(desc(chatSessions.startedAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(sessions, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { workspaceId, nluModelId } = body;

    // Validate required fields
    if (!workspaceId) {
      return NextResponse.json(
        { error: 'workspaceId is required', code: 'MISSING_WORKSPACE_ID' },
        { status: 400 }
      );
    }

    if (typeof workspaceId !== 'number' || isNaN(workspaceId)) {
      return NextResponse.json(
        { error: 'workspaceId must be a valid number', code: 'INVALID_WORKSPACE_ID' },
        { status: 400 }
      );
    }

    // Validate nluModelId if provided
    if (nluModelId !== undefined && nluModelId !== null) {
      if (typeof nluModelId !== 'number' || isNaN(nluModelId)) {
        return NextResponse.json(
          { error: 'nluModelId must be a valid number', code: 'INVALID_NLU_MODEL_ID' },
          { status: 400 }
        );
      }
    }

    // Verify workspace exists and belongs to user
    const workspace = await db
      .select()
      .from(workspaces)
      .where(eq(workspaces.id, workspaceId))
      .limit(1);

    if (workspace.length === 0) {
      return NextResponse.json(
        { error: 'Workspace not found', code: 'WORKSPACE_NOT_FOUND' },
        { status: 404 }
      );
    }

    if (workspace[0].userId !== user.id) {
      return NextResponse.json(
        { error: 'Access denied to this workspace', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    // Create new chat session
    const newSession = await db
      .insert(chatSessions)
      .values({
        workspaceId,
        nluModelId: nluModelId ?? null,
        startedAt: new Date().toISOString(),
        endedAt: null,
      })
      .returning();

    return NextResponse.json(newSession[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}