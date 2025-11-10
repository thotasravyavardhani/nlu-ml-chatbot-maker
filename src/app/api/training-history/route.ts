import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { trainingHistory, mlModels, workspaces, session } from '@/db/schema';
import { eq, and, asc } from 'drizzle-orm';

async function authenticateRequest(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);

  try {
    const sessionData = await db
      .select()
      .from(session)
      .where(eq(session.token, token))
      .limit(1);

    if (sessionData.length === 0) {
      return null;
    }

    const userSession = sessionData[0];

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

async function verifyWorkspaceOwnership(userId: string, mlModelId: number) {
  try {
    const result = await db
      .select({
        workspaceUserId: workspaces.userId,
        modelId: mlModels.id,
      })
      .from(mlModels)
      .innerJoin(workspaces, eq(mlModels.workspaceId, workspaces.id))
      .where(eq(mlModels.id, mlModelId))
      .limit(1);

    if (result.length === 0) {
      return { exists: false, authorized: false };
    }

    return {
      exists: true,
      authorized: result[0].workspaceUserId === userId,
    };
  } catch (error) {
    console.error('Workspace verification error:', error);
    throw error;
  }
}

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const userId = await authenticateRequest(request);
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const mlModelId = searchParams.get('mlModelId');
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '100'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    // Validate mlModelId is provided
    if (!mlModelId || isNaN(parseInt(mlModelId))) {
      return NextResponse.json(
        { error: 'Valid mlModelId is required', code: 'MISSING_ML_MODEL_ID' },
        { status: 400 }
      );
    }

    const modelId = parseInt(mlModelId);

    // Verify model exists and user owns the workspace
    const ownership = await verifyWorkspaceOwnership(userId, modelId);

    if (!ownership.exists) {
      return NextResponse.json(
        { error: 'Model not found', code: 'MODEL_NOT_FOUND' },
        { status: 404 }
      );
    }

    if (!ownership.authorized) {
      return NextResponse.json(
        { error: 'Access denied to this workspace', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    // Get training history for the model
    const history = await db
      .select()
      .from(trainingHistory)
      .where(eq(trainingHistory.mlModelId, modelId))
      .orderBy(asc(trainingHistory.epochNumber))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(history, { status: 200 });
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
    // Authenticate user
    const userId = await authenticateRequest(request);
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { mlModelId, epochNumber, lossValue, accuracyValue } = body;

    // Validate required fields
    if (!mlModelId || typeof mlModelId !== 'number') {
      return NextResponse.json(
        { error: 'mlModelId is required and must be a number', code: 'MISSING_ML_MODEL_ID' },
        { status: 400 }
      );
    }

    if (epochNumber === undefined || epochNumber === null || typeof epochNumber !== 'number') {
      return NextResponse.json(
        { error: 'epochNumber is required and must be a number', code: 'MISSING_EPOCH_NUMBER' },
        { status: 400 }
      );
    }

    // Verify model exists and user owns the workspace
    const ownership = await verifyWorkspaceOwnership(userId, mlModelId);

    if (!ownership.exists) {
      return NextResponse.json(
        { error: 'Model not found', code: 'MODEL_NOT_FOUND' },
        { status: 404 }
      );
    }

    if (!ownership.authorized) {
      return NextResponse.json(
        { error: 'Access denied to this workspace', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    // Prepare training history entry
    const newEntry = {
      mlModelId,
      epochNumber,
      lossValue: lossValue !== undefined && lossValue !== null ? lossValue : null,
      accuracyValue: accuracyValue !== undefined && accuracyValue !== null ? accuracyValue : null,
      createdAt: new Date().toISOString(),
    };

    // Insert training history entry
    const result = await db
      .insert(trainingHistory)
      .values(newEntry)
      .returning();

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}