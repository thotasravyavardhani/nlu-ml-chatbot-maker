import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { datasets, workspaces } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { validateSessionFromCookies } from '@/lib/auth-helpers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await validateSessionFromCookies(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const { id } = await params;
    
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
          eq(workspaces.userId, user.userId)
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await validateSessionFromCookies(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const { id } = await params;
    
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
          eq(workspaces.userId, user.userId)
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