import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { mlModels, workspaces, session } from '@/db/schema';
import { eq, like, and, desc } from 'drizzle-orm';

async function authenticateRequest(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);

  try {
    const sessions = await db
      .select()
      .from(session)
      .where(eq(session.token, token))
      .limit(1);

    if (sessions.length === 0) {
      return null;
    }

    const userSession = sessions[0];

    // Check if session is expired
    if (new Date(userSession.expiresAt) < new Date()) {
      return null;
    }

    return userSession.userId;
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

async function verifyWorkspaceOwnership(workspaceId: number, userId: string) {
  const workspace = await db
    .select()
    .from(workspaces)
    .where(eq(workspaces.id, workspaceId))
    .limit(1);

  if (workspace.length === 0) {
    return { exists: false, authorized: false };
  }

  return {
    exists: true,
    authorized: workspace[0].userId.toString() === userId
  };
}

export async function GET(request: NextRequest) {
  try {
    const userId = await authenticateRequest(request);
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspaceId');
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');

    if (!workspaceId) {
      return NextResponse.json(
        { error: 'workspaceId is required', code: 'MISSING_WORKSPACE_ID' },
        { status: 400 }
      );
    }

    const workspaceIdInt = parseInt(workspaceId);
    if (isNaN(workspaceIdInt)) {
      return NextResponse.json(
        { error: 'Invalid workspaceId', code: 'INVALID_WORKSPACE_ID' },
        { status: 400 }
      );
    }

    const ownership = await verifyWorkspaceOwnership(workspaceIdInt, userId);

    if (!ownership.exists) {
      return NextResponse.json(
        { error: 'Workspace not found', code: 'WORKSPACE_NOT_FOUND' },
        { status: 404 }
      );
    }

    if (!ownership.authorized) {
      return NextResponse.json(
        { error: 'You do not have access to this workspace', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    let query = db
      .select()
      .from(mlModels)
      .where(eq(mlModels.workspaceId, workspaceIdInt));

    if (search) {
      query = db
        .select()
        .from(mlModels)
        .where(
          and(
            eq(mlModels.workspaceId, workspaceIdInt),
            like(mlModels.modelName, `%${search}%`)
          )
        );
    }

    const results = await query
      .orderBy(desc(mlModels.trainedAt))
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
    const userId = await authenticateRequest(request);
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      workspaceId,
      datasetId,
      modelName,
      algorithmType,
      targetColumn,
      featureColumnsJson,
      modelFilePath,
      accuracy,
      precisionScore,
      recallScore,
      f1Score,
      confusionMatrixJson,
      trainingDuration,
      isSelected
    } = body;

    // Validate required fields
    if (!workspaceId) {
      return NextResponse.json(
        { error: 'workspaceId is required', code: 'MISSING_WORKSPACE_ID' },
        { status: 400 }
      );
    }

    if (!modelName) {
      return NextResponse.json(
        { error: 'modelName is required', code: 'MISSING_MODEL_NAME' },
        { status: 400 }
      );
    }

    if (!algorithmType) {
      return NextResponse.json(
        { error: 'algorithmType is required', code: 'MISSING_ALGORITHM_TYPE' },
        { status: 400 }
      );
    }

    if (!targetColumn) {
      return NextResponse.json(
        { error: 'targetColumn is required', code: 'MISSING_TARGET_COLUMN' },
        { status: 400 }
      );
    }

    const workspaceIdInt = parseInt(workspaceId);
    if (isNaN(workspaceIdInt)) {
      return NextResponse.json(
        { error: 'Invalid workspaceId', code: 'INVALID_WORKSPACE_ID' },
        { status: 400 }
      );
    }

    const ownership = await verifyWorkspaceOwnership(workspaceIdInt, userId);

    if (!ownership.exists) {
      return NextResponse.json(
        { error: 'Workspace not found', code: 'WORKSPACE_NOT_FOUND' },
        { status: 404 }
      );
    }

    if (!ownership.authorized) {
      return NextResponse.json(
        { error: 'You do not have access to this workspace', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    const now = new Date().toISOString();

    const insertData: any = {
      workspaceId: workspaceIdInt,
      modelName: modelName.trim(),
      algorithmType: algorithmType.trim(),
      targetColumn: targetColumn.trim(),
      trainedAt: now,
      updatedAt: now,
      isSelected: isSelected !== undefined ? isSelected : false
    };

    if (datasetId !== undefined && datasetId !== null) {
      insertData.datasetId = parseInt(datasetId);
    }

    if (featureColumnsJson !== undefined && featureColumnsJson !== null) {
      insertData.featureColumnsJson = featureColumnsJson;
    }

    if (modelFilePath !== undefined && modelFilePath !== null) {
      insertData.modelFilePath = modelFilePath.trim();
    }

    if (accuracy !== undefined && accuracy !== null) {
      insertData.accuracy = parseFloat(accuracy);
    }

    if (precisionScore !== undefined && precisionScore !== null) {
      insertData.precisionScore = parseFloat(precisionScore);
    }

    if (recallScore !== undefined && recallScore !== null) {
      insertData.recallScore = parseFloat(recallScore);
    }

    if (f1Score !== undefined && f1Score !== null) {
      insertData.f1Score = parseFloat(f1Score);
    }

    if (confusionMatrixJson !== undefined && confusionMatrixJson !== null) {
      insertData.confusionMatrixJson = confusionMatrixJson;
    }

    if (trainingDuration !== undefined && trainingDuration !== null) {
      insertData.trainingDuration = parseInt(trainingDuration);
    }

    const newModel = await db.insert(mlModels).values(insertData).returning();

    return NextResponse.json(newModel[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}