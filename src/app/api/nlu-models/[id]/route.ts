import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { nluModels, workspaces, session } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

async function authenticateRequest(request: NextRequest): Promise<string | null> {
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

    const sess = sessionRecord[0];
    if (new Date(sess.expiresAt) < new Date()) {
      return null;
    }

    return sess.userId;
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

async function verifyModelOwnership(modelId: number, userId: string): Promise<any | null> {
  try {
    const result = await db.select({
      model: nluModels,
      workspace: workspaces
    })
      .from(nluModels)
      .innerJoin(workspaces, eq(nluModels.workspaceId, workspaces.id))
      .where(eq(nluModels.id, modelId))
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    const { model, workspace } = result[0];
    
    if (workspace.userId.toString() !== userId) {
      return null;
    }

    return model;
  } catch (error) {
    console.error('Ownership verification error:', error);
    return null;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await authenticateRequest(request);
    if (!userId) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'UNAUTHORIZED' 
      }, { status: 401 });
    }

    const { id } = await params;
    const modelId = parseInt(id);
    if (isNaN(modelId)) {
      return NextResponse.json({ 
        error: 'Valid model ID is required',
        code: 'INVALID_ID' 
      }, { status: 400 });
    }

    const model = await verifyModelOwnership(modelId, userId);
    
    if (!model) {
      return NextResponse.json({ 
        error: 'NLU model not found',
        code: 'MODEL_NOT_FOUND' 
      }, { status: 404 });
    }

    return NextResponse.json(model, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await authenticateRequest(request);
    if (!userId) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'UNAUTHORIZED' 
      }, { status: 401 });
    }

    const { id } = await params;
    const modelId = parseInt(id);
    if (isNaN(modelId)) {
      return NextResponse.json({ 
        error: 'Valid model ID is required',
        code: 'INVALID_ID' 
      }, { status: 400 });
    }

    const model = await verifyModelOwnership(modelId, userId);
    
    if (!model) {
      return NextResponse.json({ 
        error: 'NLU model not found',
        code: 'MODEL_NOT_FOUND' 
      }, { status: 404 });
    }

    const body = await request.json();
    const { name, rasaModelPath, intentsJson, entitiesJson, trainingDataPath, accuracy } = body;

    const updates: any = {};
    let hasUpdates = false;

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim() === '') {
        return NextResponse.json({ 
          error: 'Name must be a non-empty string',
          code: 'INVALID_NAME' 
        }, { status: 400 });
      }
      updates.name = name.trim();
      hasUpdates = true;
    }

    if (rasaModelPath !== undefined) {
      updates.rasaModelPath = rasaModelPath;
      hasUpdates = true;
    }

    if (intentsJson !== undefined) {
      updates.intentsJson = intentsJson;
      hasUpdates = true;
    }

    if (entitiesJson !== undefined) {
      updates.entitiesJson = entitiesJson;
      hasUpdates = true;
    }

    if (trainingDataPath !== undefined) {
      updates.trainingDataPath = trainingDataPath;
      hasUpdates = true;
    }

    if (accuracy !== undefined) {
      if (typeof accuracy !== 'number' || accuracy < 0 || accuracy > 1) {
        return NextResponse.json({ 
          error: 'Accuracy must be a number between 0 and 1',
          code: 'INVALID_ACCURACY' 
        }, { status: 400 });
      }
      updates.accuracy = accuracy;
      hasUpdates = true;
    }

    if (!hasUpdates) {
      return NextResponse.json({ 
        error: 'No fields provided to update',
        code: 'NO_UPDATES' 
      }, { status: 400 });
    }

    updates.updatedAt = new Date().toISOString();

    const updated = await db.update(nluModels)
      .set(updates)
      .where(eq(nluModels.id, modelId))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ 
        error: 'Failed to update NLU model',
        code: 'UPDATE_FAILED' 
      }, { status: 500 });
    }

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await authenticateRequest(request);
    if (!userId) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'UNAUTHORIZED' 
      }, { status: 401 });
    }

    const { id } = await params;
    const modelId = parseInt(id);
    if (isNaN(modelId)) {
      return NextResponse.json({ 
        error: 'Valid model ID is required',
        code: 'INVALID_ID' 
      }, { status: 400 });
    }

    const model = await verifyModelOwnership(modelId, userId);
    
    if (!model) {
      return NextResponse.json({ 
        error: 'NLU model not found',
        code: 'MODEL_NOT_FOUND' 
      }, { status: 404 });
    }

    const deleted = await db.delete(nluModels)
      .where(eq(nluModels.id, modelId))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ 
        error: 'Failed to delete NLU model',
        code: 'DELETE_FAILED' 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'NLU model deleted successfully',
      model: deleted[0]
    }, { status: 200 });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}