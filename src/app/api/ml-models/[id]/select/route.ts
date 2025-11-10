import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { mlModels, workspaces, session } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Extract and validate authentication token
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'MISSING_TOKEN' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // Validate session
    const sessionRecord = await db
      .select()
      .from(session)
      .where(eq(session.token, token))
      .limit(1);

    if (sessionRecord.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or expired session', code: 'INVALID_SESSION' },
        { status: 401 }
      );
    }

    const userSession = sessionRecord[0];

    // Check if session is expired
    if (new Date(userSession.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: 'Session expired', code: 'SESSION_EXPIRED' },
        { status: 401 }
      );
    }

    const userId = userSession.userId;

    // Validate model ID parameter
    const { id: modelId } = await params;
    if (!modelId || isNaN(parseInt(modelId))) {
      return NextResponse.json(
        { error: 'Valid model ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Fetch the model and verify workspace ownership
    const modelResult = await db
      .select({
        model: mlModels,
        workspace: workspaces,
      })
      .from(mlModels)
      .innerJoin(workspaces, eq(mlModels.workspaceId, workspaces.id))
      .where(eq(mlModels.id, parseInt(modelId)))
      .limit(1);

    if (modelResult.length === 0) {
      return NextResponse.json(
        { error: 'Model not found', code: 'MODEL_NOT_FOUND' },
        { status: 404 }
      );
    }

    const { model, workspace } = modelResult[0];

    // Verify workspace belongs to authenticated user
    if (workspace.userId !== userId) {
      return NextResponse.json(
        { error: 'Model not found', code: 'MODEL_NOT_FOUND' },
        { status: 404 }
      );
    }

    const workspaceId = model.workspaceId;
    const now = new Date().toISOString();

    // Step 1: Deselect all models in the workspace
    await db
      .update(mlModels)
      .set({
        isSelected: false,
        updatedAt: now,
      })
      .where(eq(mlModels.workspaceId, workspaceId));

    // Step 2: Select the specified model
    const updatedModel = await db
      .update(mlModels)
      .set({
        isSelected: true,
        updatedAt: now,
      })
      .where(eq(mlModels.id, parseInt(modelId)))
      .returning();

    if (updatedModel.length === 0) {
      return NextResponse.json(
        { error: 'Failed to update model', code: 'UPDATE_FAILED' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Model selected successfully',
      model: updatedModel[0],
    });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}