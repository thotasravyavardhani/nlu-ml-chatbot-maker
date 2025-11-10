import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { mlModels, workspaces, session } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

async function authenticateRequest(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    
    const sessionRecord = await db
      .select()
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

    return userSession.userId;
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

async function verifyModelAccess(modelId: number, userId: string) {
  try {
    const result = await db
      .select({
        model: mlModels,
        workspace: workspaces,
      })
      .from(mlModels)
      .innerJoin(workspaces, eq(mlModels.workspaceId, workspaces.id))
      .where(eq(mlModels.id, modelId))
      .limit(1);

    if (result.length === 0) {
      return { authorized: false, model: null };
    }

    const { model, workspace } = result[0];

    if (workspace.userId.toString() !== userId) {
      return { authorized: false, model: null };
    }

    return { authorized: true, model };
  } catch (error) {
    console.error('Access verification error:', error);
    return { authorized: false, model: null };
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await authenticateRequest(request);
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const modelId = parseInt(params.id);
    if (isNaN(modelId)) {
      return NextResponse.json(
        { error: 'Valid model ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const { authorized, model } = await verifyModelAccess(modelId, userId);

    if (!authorized || !model) {
      return NextResponse.json(
        { error: 'ML model not found', code: 'MODEL_NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json(model, { status: 200 });
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
    const userId = await authenticateRequest(request);
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const modelId = parseInt(params.id);
    if (isNaN(modelId)) {
      return NextResponse.json(
        { error: 'Valid model ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const { authorized } = await verifyModelAccess(modelId, userId);

    if (!authorized) {
      return NextResponse.json(
        { error: 'ML model not found', code: 'MODEL_NOT_FOUND' },
        { status: 404 }
      );
    }

    const body = await request.json();
    
    const {
      modelName,
      algorithmType,
      targetColumn,
      datasetId,
      featureColumnsJson,
      modelFilePath,
      accuracy,
      precisionScore,
      recallScore,
      f1Score,
      confusionMatrixJson,
      trainingDuration,
      isSelected,
    } = body;

    const updates: Record<string, any> = {};

    if (modelName !== undefined) updates.modelName = modelName;
    if (algorithmType !== undefined) updates.algorithmType = algorithmType;
    if (targetColumn !== undefined) updates.targetColumn = targetColumn;
    if (datasetId !== undefined) updates.datasetId = datasetId;
    if (featureColumnsJson !== undefined) updates.featureColumnsJson = featureColumnsJson;
    if (modelFilePath !== undefined) updates.modelFilePath = modelFilePath;
    if (accuracy !== undefined) updates.accuracy = accuracy;
    if (precisionScore !== undefined) updates.precisionScore = precisionScore;
    if (recallScore !== undefined) updates.recallScore = recallScore;
    if (f1Score !== undefined) updates.f1Score = f1Score;
    if (confusionMatrixJson !== undefined) updates.confusionMatrixJson = confusionMatrixJson;
    if (trainingDuration !== undefined) updates.trainingDuration = trainingDuration;
    if (isSelected !== undefined) updates.isSelected = isSelected;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No fields provided to update', code: 'NO_UPDATES' },
        { status: 400 }
      );
    }

    updates.updatedAt = new Date().toISOString();

    const updated = await db
      .update(mlModels)
      .set(updates)
      .where(eq(mlModels.id, modelId))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { error: 'Failed to update ML model', code: 'UPDATE_FAILED' },
        { status: 500 }
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
    const userId = await authenticateRequest(request);
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const modelId = parseInt(params.id);
    if (isNaN(modelId)) {
      return NextResponse.json(
        { error: 'Valid model ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const { authorized, model } = await verifyModelAccess(modelId, userId);

    if (!authorized || !model) {
      return NextResponse.json(
        { error: 'ML model not found', code: 'MODEL_NOT_FOUND' },
        { status: 404 }
      );
    }

    const deleted = await db
      .delete(mlModels)
      .where(eq(mlModels.id, modelId))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json(
        { error: 'Failed to delete ML model', code: 'DELETE_FAILED' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: 'ML model deleted successfully',
        model: deleted[0],
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