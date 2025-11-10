import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { annotations, nluModels, workspaces, session } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

async function authenticateRequest(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);

  try {
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

async function validateAnnotationOwnership(annotationId: number, userId: string) {
  try {
    const result = await db
      .select({
        annotationId: annotations.id,
        workspaceUserId: workspaces.userId,
      })
      .from(annotations)
      .innerJoin(nluModels, eq(annotations.nluModelId, nluModels.id))
      .innerJoin(workspaces, eq(nluModels.workspaceId, workspaces.id))
      .where(eq(annotations.id, annotationId))
      .limit(1);

    if (result.length === 0) {
      return { exists: false, authorized: false };
    }

    return {
      exists: true,
      authorized: result[0].workspaceUserId === userId,
    };
  } catch (error) {
    console.error('Ownership validation error:', error);
    throw error;
  }
}

export async function PUT(
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
    const annotationId = parseInt(id);
    
    if (isNaN(annotationId)) {
      return NextResponse.json(
        { error: 'Valid annotation ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const ownership = await validateAnnotationOwnership(annotationId, userId);
    
    if (!ownership.exists) {
      return NextResponse.json(
        { error: 'Annotation not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    if (!ownership.authorized) {
      return NextResponse.json(
        { error: 'Access denied to this annotation', code: 'FORBIDDEN' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { text, intent, entitiesJson } = body;

    if (text === undefined && intent === undefined && entitiesJson === undefined) {
      return NextResponse.json(
        { error: 'At least one field (text, intent, entitiesJson) must be provided', code: 'NO_FIELDS_TO_UPDATE' },
        { status: 400 }
      );
    }

    const updateData: Record<string, any> = {
      updatedAt: new Date().toISOString(),
    };

    if (text !== undefined) {
      if (typeof text !== 'string' || text.trim().length === 0) {
        return NextResponse.json(
          { error: 'Text must be a non-empty string', code: 'INVALID_TEXT' },
          { status: 400 }
        );
      }
      updateData.text = text.trim();
    }

    if (intent !== undefined) {
      if (intent !== null && typeof intent !== 'string') {
        return NextResponse.json(
          { error: 'Intent must be a string or null', code: 'INVALID_INTENT' },
          { status: 400 }
        );
      }
      updateData.intent = intent;
    }

    if (entitiesJson !== undefined) {
      updateData.entitiesJson = entitiesJson;
    }

    const updated = await db
      .update(annotations)
      .set(updateData)
      .where(eq(annotations.id, annotationId))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { error: 'Failed to update annotation', code: 'UPDATE_FAILED' },
        { status: 500 }
      );
    }

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    console.error('PUT annotation error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}

export async function DELETE(
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
    const annotationId = parseInt(id);
    
    if (isNaN(annotationId)) {
      return NextResponse.json(
        { error: 'Valid annotation ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const ownership = await validateAnnotationOwnership(annotationId, userId);
    
    if (!ownership.exists) {
      return NextResponse.json(
        { error: 'Annotation not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    if (!ownership.authorized) {
      return NextResponse.json(
        { error: 'Access denied to this annotation', code: 'FORBIDDEN' },
        { status: 404 }
      );
    }

    const deleted = await db
      .delete(annotations)
      .where(eq(annotations.id, annotationId))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json(
        { error: 'Failed to delete annotation', code: 'DELETE_FAILED' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: 'Annotation deleted successfully',
        annotation: deleted[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE annotation error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}