import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { 
  workspaces, 
  datasets, 
  mlModels, 
  nluModels, 
  chatSessions, 
  chatMessages,
  trainingHistory,
  annotations 
} from '@/db/schema';
import { eq, and, inArray } from 'drizzle-orm';
import { validateSessionFromCookies } from '@/lib/auth-helpers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await validateSessionFromCookies(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid workspace ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const workspace = await db.select()
      .from(workspaces)
      .where(
        and(
          eq(workspaces.id, parseInt(id)),
          eq(workspaces.userId, user.userId)
        )
      )
      .limit(1);

    if (workspace.length === 0) {
      return NextResponse.json(
        { error: 'Workspace not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json(workspace[0], { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await validateSessionFromCookies(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid workspace ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, description } = body;

    if (name === undefined && description === undefined) {
      return NextResponse.json(
        { error: 'At least one field (name or description) must be provided', code: 'NO_FIELDS_TO_UPDATE' },
        { status: 400 }
      );
    }

    const existingWorkspace = await db.select()
      .from(workspaces)
      .where(
        and(
          eq(workspaces.id, parseInt(id)),
          eq(workspaces.userId, user.userId)
        )
      )
      .limit(1);

    if (existingWorkspace.length === 0) {
      return NextResponse.json(
        { error: 'Workspace not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const updates: Partial<{
      name: string;
      description: string | null;
      updatedAt: string;
    }> = {
      updatedAt: new Date().toISOString()
    };

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        return NextResponse.json(
          { error: 'Name must be a non-empty string', code: 'INVALID_NAME' },
          { status: 400 }
        );
      }
      updates.name = name.trim();
    }

    if (description !== undefined) {
      updates.description = description === null ? null : (typeof description === 'string' ? description.trim() : description);
    }

    const updated = await db.update(workspaces)
      .set(updates)
      .where(
        and(
          eq(workspaces.id, parseInt(id)),
          eq(workspaces.userId, user.userId)
        )
      )
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { error: 'Workspace not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await validateSessionFromCookies(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const workspaceId = parseInt(id);

    if (!id || isNaN(workspaceId)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    // 1. Verify Workspace Ownership
    const existing = await db.select()
      .from(workspaces)
      .where(and(eq(workspaces.id, workspaceId), eq(workspaces.userId, user.userId)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }

    // 2. CASCADE DELETE MANUALLY (Order is critical)
    
    // A. Delete Chat Messages (linked to Chat Sessions)
    const sessions = await db.select({ id: chatSessions.id })
      .from(chatSessions)
      .where(eq(chatSessions.workspaceId, workspaceId));
    
    if (sessions.length > 0) {
      const sessionIds = sessions.map(s => s.id);
      await db.delete(chatMessages).where(inArray(chatMessages.chatSessionId, sessionIds));
    }
    await db.delete(chatSessions).where(eq(chatSessions.workspaceId, workspaceId));

    // B. Delete Annotations (linked to NLU Models)
    const nluModelList = await db.select({ id: nluModels.id })
      .from(nluModels)
      .where(eq(nluModels.workspaceId, workspaceId));
      
    if (nluModelList.length > 0) {
      const nluIds = nluModelList.map(m => m.id);
      await db.delete(annotations).where(inArray(annotations.nluModelId, nluIds));
    }
    await db.delete(nluModels).where(eq(nluModels.workspaceId, workspaceId));

    // C. Delete Training History (linked to ML Models)
    const mlModelList = await db.select({ id: mlModels.id })
      .from(mlModels)
      .where(eq(mlModels.workspaceId, workspaceId));
      
    if (mlModelList.length > 0) {
      const mlIds = mlModelList.map(m => m.id);
      await db.delete(trainingHistory).where(inArray(trainingHistory.mlModelId, mlIds));
    }
    await db.delete(mlModels).where(eq(mlModels.workspaceId, workspaceId));

    // D. Delete Datasets
    await db.delete(datasets).where(eq(datasets.workspaceId, workspaceId));

    // E. Finally, Delete the Workspace
    const deleted = await db.delete(workspaces)
      .where(eq(workspaces.id, workspaceId))
      .returning();

    return NextResponse.json(
      { message: 'Workspace deleted successfully', workspace: deleted[0] },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
