import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { datasets, workspaces, session } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

async function authenticateRequest(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    
    const sessions = await db
      .select()
      .from(session)
      .where(eq(session.token, token))
      .limit(1);

    if (sessions.length === 0) {
      return null;
    }

    const userSession = sessions[0];
    
    if (userSession.expiresAt < new Date()) {
      return null;
    }

    return userSession.userId;
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
    const userId = await authenticateRequest(request);
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const { id } = params;
    
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid dataset ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const datasetId = parseInt(id);

    const result = await db
      .select({
        dataset: datasets,
        workspace: workspaces,
      })
      .from(datasets)
      .innerJoin(workspaces, eq(datasets.workspaceId, workspaces.id))
      .where(
        and(
          eq(datasets.id, datasetId),
          eq(workspaces.userId, userId)
        )
      )
      .limit(1);

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Dataset not found or access denied', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const datasetData = result[0].dataset;

    return NextResponse.json(datasetData, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
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

    const { id } = params;
    
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid dataset ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const datasetId = parseInt(id);

    const existingDataset = await db
      .select({
        dataset: datasets,
        workspace: workspaces,
      })
      .from(datasets)
      .innerJoin(workspaces, eq(datasets.workspaceId, workspaces.id))
      .where(
        and(
          eq(datasets.id, datasetId),
          eq(workspaces.userId, userId)
        )
      )
      .limit(1);

    if (existingDataset.length === 0) {
      return NextResponse.json(
        { error: 'Dataset not found or access denied', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const deleted = await db
      .delete(datasets)
      .where(eq(datasets.id, datasetId))
      .returning();

    return NextResponse.json(
      {
        message: 'Dataset deleted successfully',
        dataset: deleted[0],
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