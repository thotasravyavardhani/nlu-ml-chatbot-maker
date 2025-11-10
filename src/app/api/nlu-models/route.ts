import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { nluModels, workspaces } from '@/db/schema';
import { eq, like, and, desc } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'UNAUTHORIZED' 
      }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const workspaceId = searchParams.get('workspaceId');
    const search = searchParams.get('search');
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    if (!workspaceId) {
      return NextResponse.json({ 
        error: 'workspaceId is required',
        code: 'MISSING_WORKSPACE_ID' 
      }, { status: 400 });
    }

    if (isNaN(parseInt(workspaceId))) {
      return NextResponse.json({ 
        error: 'Valid workspaceId is required',
        code: 'INVALID_WORKSPACE_ID' 
      }, { status: 400 });
    }

    const workspace = await db.select()
      .from(workspaces)
      .where(eq(workspaces.id, parseInt(workspaceId)))
      .limit(1);

    if (workspace.length === 0) {
      return NextResponse.json({ 
        error: 'Workspace not found',
        code: 'WORKSPACE_NOT_FOUND' 
      }, { status: 404 });
    }

    if (workspace[0].userId !== user.id) {
      return NextResponse.json({ 
        error: 'You do not have permission to access this workspace',
        code: 'FORBIDDEN' 
      }, { status: 403 });
    }

    let query = db.select()
      .from(nluModels)
      .where(eq(nluModels.workspaceId, parseInt(workspaceId)))
      .orderBy(desc(nluModels.trainedAt));

    if (search) {
      query = db.select()
        .from(nluModels)
        .where(
          and(
            eq(nluModels.workspaceId, parseInt(workspaceId)),
            like(nluModels.name, `%${search}%`)
          )
        )
        .orderBy(desc(nluModels.trainedAt));
    }

    const results = await query.limit(limit).offset(offset);

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'UNAUTHORIZED' 
      }, { status: 401 });
    }

    const body = await request.json();
    const { 
      workspaceId, 
      name, 
      rasaModelPath, 
      intentsJson, 
      entitiesJson, 
      trainingDataPath, 
      accuracy 
    } = body;

    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json({ 
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    if (!workspaceId) {
      return NextResponse.json({ 
        error: 'workspaceId is required',
        code: 'MISSING_WORKSPACE_ID' 
      }, { status: 400 });
    }

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ 
        error: 'name is required and must be a non-empty string',
        code: 'MISSING_NAME' 
      }, { status: 400 });
    }

    if (isNaN(parseInt(workspaceId))) {
      return NextResponse.json({ 
        error: 'Valid workspaceId is required',
        code: 'INVALID_WORKSPACE_ID' 
      }, { status: 400 });
    }

    const workspace = await db.select()
      .from(workspaces)
      .where(eq(workspaces.id, parseInt(workspaceId)))
      .limit(1);

    if (workspace.length === 0) {
      return NextResponse.json({ 
        error: 'Workspace not found',
        code: 'WORKSPACE_NOT_FOUND' 
      }, { status: 404 });
    }

    if (workspace[0].userId !== user.id) {
      return NextResponse.json({ 
        error: 'You do not have permission to create models in this workspace',
        code: 'FORBIDDEN' 
      }, { status: 403 });
    }

    const now = new Date().toISOString();

    const insertData: any = {
      workspaceId: parseInt(workspaceId),
      name: name.trim(),
      trainedAt: now,
      updatedAt: now
    };

    if (rasaModelPath !== undefined && rasaModelPath !== null) {
      insertData.rasaModelPath = typeof rasaModelPath === 'string' ? rasaModelPath.trim() : rasaModelPath;
    }

    if (intentsJson !== undefined && intentsJson !== null) {
      insertData.intentsJson = intentsJson;
    }

    if (entitiesJson !== undefined && entitiesJson !== null) {
      insertData.entitiesJson = entitiesJson;
    }

    if (trainingDataPath !== undefined && trainingDataPath !== null) {
      insertData.trainingDataPath = typeof trainingDataPath === 'string' ? trainingDataPath.trim() : trainingDataPath;
    }

    if (accuracy !== undefined && accuracy !== null) {
      if (typeof accuracy !== 'number' || isNaN(accuracy)) {
        return NextResponse.json({ 
          error: 'accuracy must be a valid number',
          code: 'INVALID_ACCURACY' 
        }, { status: 400 });
      }
      insertData.accuracy = accuracy;
    }

    const newModel = await db.insert(nluModels)
      .values(insertData)
      .returning();

    return NextResponse.json(newModel[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}