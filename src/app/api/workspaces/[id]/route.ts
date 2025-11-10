import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { workspaces, session } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

async function authenticateRequest(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);

  try {
    const sessionRecord = await db.select()
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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const { id } = params;

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
          eq(workspaces.userId, user.id)
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
  { params }: { params: { id: string } }
) {
  try {
    const user = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const { id } = params;

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
          eq(workspaces.userId, user.id)
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
          eq(workspaces.userId, user.id)
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
  { params }: { params: { id: string } }
) {
  try {
    const user = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const { id } = params;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid workspace ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const existingWorkspace = await db.select()
      .from(workspaces)
      .where(
        and(
          eq(workspaces.id, parseInt(id)),
          eq(workspaces.userId, user.id)
        )
      )
      .limit(1);

    if (existingWorkspace.length === 0) {
      return NextResponse.json(
        { error: 'Workspace not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const deleted = await db.delete(workspaces)
      .where(
        and(
          eq(workspaces.id, parseInt(id)),
          eq(workspaces.userId, user.id)
        )
      )
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json(
        { error: 'Workspace not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: 'Workspace deleted successfully',
        workspace: deleted[0]
      },
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