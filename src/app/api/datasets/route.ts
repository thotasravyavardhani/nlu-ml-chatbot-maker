import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { datasets, workspaces } from '@/db/schema';
import { eq, like, and, desc } from 'drizzle-orm';
import { validateSessionFromCookies } from '@/lib/auth-helpers';

async function validateWorkspaceOwnership(workspaceId: number, userId: string) {
  try {
    const workspace = await db
      .select()
      .from(workspaces)
      .where(eq(workspaces.id, workspaceId))
      .limit(1);

    if (workspace.length === 0) {
      return { valid: false, notFound: true };
    }

    if (workspace[0].userId.toString() !== userId) {
      return { valid: false, notFound: false };
    }

    return { valid: true, notFound: false };
  } catch (error) {
    console.error('Workspace validation error:', error);
    throw error;
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await validateSessionFromCookies(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const workspaceId = searchParams.get('workspaceId');

    if (!workspaceId) {
      return NextResponse.json(
        { error: 'Workspace ID is required', code: 'MISSING_WORKSPACE_ID' },
        { status: 400 }
      );
    }

    const workspaceIdNum = parseInt(workspaceId);
    if (isNaN(workspaceIdNum)) {
      return NextResponse.json(
        { error: 'Invalid workspace ID', code: 'INVALID_WORKSPACE_ID' },
        { status: 400 }
      );
    }

    const ownership = await validateWorkspaceOwnership(workspaceIdNum, user.userId);
    
    if (ownership.notFound) {
      return NextResponse.json(
        { error: 'Workspace not found', code: 'WORKSPACE_NOT_FOUND' },
        { status: 404 }
      );
    }

    if (!ownership.valid) {
      return NextResponse.json(
        { error: 'Access denied to this workspace', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');

    let query = db
      .select()
      .from(datasets)
      .where(eq(datasets.workspaceId, workspaceIdNum));

    if (search) {
      query = db
        .select()
        .from(datasets)
        .where(
          and(
            eq(datasets.workspaceId, workspaceIdNum),
            like(datasets.name, `%${search}%`)
          )
        );
    }

    const results = await query
      .orderBy(desc(datasets.uploadedAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET datasets error:', error);
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
    const { 
      workspaceId, 
      name, 
      filePath, 
      fileSize, 
      rowCount, 
      columnCount, 
      columnsJson,
      fileFormat
    } = body;

    if (!workspaceId) {
      return NextResponse.json(
        { error: 'Workspace ID is required', code: 'MISSING_WORKSPACE_ID' },
        { status: 400 }
      );
    }

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json(
        { error: 'Dataset name is required', code: 'MISSING_NAME' },
        { status: 400 }
      );
    }

    const workspaceIdNum = parseInt(workspaceId);
    if (isNaN(workspaceIdNum)) {
      return NextResponse.json(
        { error: 'Invalid workspace ID', code: 'INVALID_WORKSPACE_ID' },
        { status: 400 }
      );
    }

    const ownership = await validateWorkspaceOwnership(workspaceIdNum, user.userId);
    
    if (ownership.notFound) {
      return NextResponse.json(
        { error: 'Workspace not found', code: 'WORKSPACE_NOT_FOUND' },
        { status: 404 }
      );
    }

    if (!ownership.valid) {
      return NextResponse.json(
        { error: 'Access denied to this workspace', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    const now = new Date().toISOString();

    const insertData: any = {
      workspaceId: workspaceIdNum,
      name: name.trim(),
      uploadedAt: now,
      updatedAt: now,
    };

    if (filePath !== undefined && filePath !== null) {
      insertData.filePath = filePath;
    }

    if (fileSize !== undefined && fileSize !== null) {
      const fileSizeNum = parseInt(fileSize);
      if (!isNaN(fileSizeNum)) {
        insertData.fileSize = fileSizeNum;
      }
    }

    if (rowCount !== undefined && rowCount !== null) {
      const rowCountNum = parseInt(rowCount);
      if (!isNaN(rowCountNum)) {
        insertData.rowCount = rowCountNum;
      }
    }

    if (columnCount !== undefined && columnCount !== null) {
      const columnCountNum = parseInt(columnCount);
      if (!isNaN(columnCountNum)) {
        insertData.columnCount = columnCountNum;
      }
    }

    if (columnsJson !== undefined && columnsJson !== null) {
      insertData.columnsJson = columnsJson;
    }

    if (fileFormat !== undefined && fileFormat !== null) {
      insertData.fileFormat = typeof fileFormat === 'string' ? fileFormat.trim() : fileFormat;
    }

    const newDataset = await db
      .insert(datasets)
      .values(insertData)
      .returning();

    return NextResponse.json(newDataset[0], { status: 201 });
  } catch (error) {
    console.error('POST datasets error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}