import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { workspaces } from '@/db/schema';
import { eq, like, and, or, desc } from 'drizzle-orm';
import { validateSessionFromCookies } from '@/lib/auth-helpers';

export async function GET(request: NextRequest) {
  try {
    const user = await validateSessionFromCookies(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');

    let query = db.select().from(workspaces).where(eq(workspaces.userId, user.userId));

    if (search) {
      const searchCondition = or(
        like(workspaces.name, `%${search}%`),
        like(workspaces.description, `%${search}%`)
      );
      query = db
        .select()
        .from(workspaces)
        .where(and(eq(workspaces.userId, user.userId), searchCondition));
    }

    const results = await query
      .orderBy(desc(workspaces.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results, { status: 200 });
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
    const user = await validateSessionFromCookies(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Security check: reject if userId provided in body
    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json(
        {
          error: 'User ID cannot be provided in request body',
          code: 'USER_ID_NOT_ALLOWED',
        },
        { status: 400 }
      );
    }

    const { name, description } = body;

    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json(
        { error: 'Name is required and must be a non-empty string', code: 'MISSING_NAME' },
        { status: 400 }
      );
    }

    // Prepare insert data
    const now = new Date().toISOString();
    const insertData = {
      userId: user.userId,
      name: name.trim(),
      description: description ? description.trim() : null,
      createdAt: now,
      updatedAt: now,
    };

    const newWorkspace = await db.insert(workspaces).values(insertData).returning();

    return NextResponse.json(newWorkspace[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await validateSessionFromCookies(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Security check: reject if userId provided in body
    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json(
        {
          error: 'User ID cannot be provided in request body',
          code: 'USER_ID_NOT_ALLOWED',
        },
        { status: 400 }
      );
    }

    // Check if workspace exists and belongs to user
    const existing = await db
      .select()
      .from(workspaces)
      .where(and(eq(workspaces.id, parseInt(id)), eq(workspaces.userId, user.userId)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Workspace not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const { name, description } = body;

    // Build update object
    const updates: any = {
      updatedAt: new Date().toISOString(),
    };

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim() === '') {
        return NextResponse.json(
          { error: 'Name must be a non-empty string', code: 'INVALID_NAME' },
          { status: 400 }
        );
      }
      updates.name = name.trim();
    }

    if (description !== undefined) {
      updates.description = description ? description.trim() : null;
    }

    const updated = await db
      .update(workspaces)
      .set(updates)
      .where(and(eq(workspaces.id, parseInt(id)), eq(workspaces.userId, user.userId)))
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

export async function DELETE(request: NextRequest) {
  try {
    const user = await validateSessionFromCookies(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if workspace exists and belongs to user
    const existing = await db
      .select()
      .from(workspaces)
      .where(and(eq(workspaces.id, parseInt(id)), eq(workspaces.userId, user.userId)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Workspace not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const deleted = await db
      .delete(workspaces)
      .where(and(eq(workspaces.id, parseInt(id)), eq(workspaces.userId, user.userId)))
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
        workspace: deleted[0],
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