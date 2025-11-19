import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { mlModels, workspaces, session } from '@/db/schema';
import { eq } from 'drizzle-orm';

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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await authenticateRequest(request);
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const modelId = parseInt(id);
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

    // Get format from query params (pickle or h5)
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'pickle';

    if (!['pickle', 'h5'].includes(format)) {
      return NextResponse.json(
        { error: 'Invalid format. Use "pickle" or "h5"', code: 'INVALID_FORMAT' },
        { status: 400 }
      );
    }

    // Check if model file exists
    if (!model.modelFilePath) {
      return NextResponse.json(
        { error: 'Model file not available for download', code: 'NO_FILE' },
        { status: 404 }
      );
    }

    // Call Python backend to export model
    const pythonBackendUrl = process.env.PYTHON_BACKEND_URL || 'http://localhost:8000';
    
    try {
      const exportResponse = await fetch(`${pythonBackendUrl}/models/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model_path: model.modelFilePath,
          export_format: format,
        }),
      });

      if (!exportResponse.ok) {
        const error = await exportResponse.json();
        return NextResponse.json(
          { error: error.detail || 'Failed to export model', code: 'EXPORT_FAILED' },
          { status: 500 }
        );
      }

      // Get the file content
      const fileBuffer = await exportResponse.arrayBuffer();
      const fileName = `${model.modelName}_${model.algorithmType}.${format === 'pickle' ? 'pkl' : 'h5'}`;

      // Return file as download
      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': format === 'pickle' ? 'application/octet-stream' : 'application/x-hdf',
          'Content-Disposition': `attachment; filename="${fileName}"`,
          'Content-Length': fileBuffer.byteLength.toString(),
        },
      });

    } catch (error) {
      console.error('Model export error:', error);
      return NextResponse.json(
        { error: 'Failed to download model: ' + (error as Error).message, code: 'DOWNLOAD_FAILED' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Download route error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
