import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { annotations, nluModels, workspaces, session } from '@/db/schema';
import { eq, like, or, and, desc } from 'drizzle-orm';

// Helper function to validate session and get user ID
async function authenticateRequest(request: NextRequest): Promise<{ userId: string } | null> {
  const authHeader = request.headers.get('Authorization');
  
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
    
    // Check if session is expired
    if (sess.expiresAt < new Date()) {
      return null;
    }
    
    return { userId: sess.userId };
  } catch (error) {
    console.error('Session validation error:', error);
    return null;
  }
}

// Helper function to verify workspace ownership
async function verifyWorkspaceOwnership(nluModelId: number, userId: string): Promise<{ authorized: boolean; modelExists: boolean }> {
  try {
    const result = await db.select({
      modelId: nluModels.id,
      workspaceUserId: workspaces.userId
    })
      .from(nluModels)
      .innerJoin(workspaces, eq(nluModels.workspaceId, workspaces.id))
      .where(eq(nluModels.id, nluModelId))
      .limit(1);
    
    if (result.length === 0) {
      return { authorized: false, modelExists: false };
    }
    
    const authorized = result[0].workspaceUserId === parseInt(userId);
    return { authorized, modelExists: true };
  } catch (error) {
    console.error('Workspace verification error:', error);
    return { authorized: false, modelExists: false };
  }
}

export async function GET(request: NextRequest) {
  try {
    // Authenticate request
    const auth = await authenticateRequest(request);
    if (!auth) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'UNAUTHORIZED' 
      }, { status: 401 });
    }
    
    const { userId } = auth;
    const { searchParams } = new URL(request.url);
    
    // Validate required nluModelId parameter
    const nluModelIdParam = searchParams.get('nluModelId');
    if (!nluModelIdParam) {
      return NextResponse.json({ 
        error: 'nluModelId is required',
        code: 'MISSING_NLU_MODEL_ID' 
      }, { status: 400 });
    }
    
    const nluModelId = parseInt(nluModelIdParam);
    if (isNaN(nluModelId)) {
      return NextResponse.json({ 
        error: 'Valid nluModelId is required',
        code: 'INVALID_NLU_MODEL_ID' 
      }, { status: 400 });
    }
    
    // Verify workspace ownership
    const { authorized, modelExists } = await verifyWorkspaceOwnership(nluModelId, userId);
    
    if (!modelExists) {
      return NextResponse.json({ 
        error: 'NLU model not found',
        code: 'MODEL_NOT_FOUND' 
      }, { status: 404 });
    }
    
    if (!authorized) {
      return NextResponse.json({ 
        error: 'You do not have permission to access this model',
        code: 'FORBIDDEN' 
      }, { status: 403 });
    }
    
    // Parse pagination parameters
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');
    
    // Build query
    let query = db.select().from(annotations);
    
    if (search) {
      const searchCondition = or(
        like(annotations.text, `%${search}%`),
        like(annotations.intent, `%${search}%`)
      );
      
      query = query.where(
        and(
          eq(annotations.nluModelId, nluModelId),
          searchCondition
        )
      );
    } else {
      query = query.where(eq(annotations.nluModelId, nluModelId));
    }
    
    const results = await query
      .orderBy(desc(annotations.createdAt))
      .limit(limit)
      .offset(offset);
    
    return NextResponse.json(results, { status: 200 });
    
  } catch (error) {
    console.error('GET annotations error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate request
    const auth = await authenticateRequest(request);
    if (!auth) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'UNAUTHORIZED' 
      }, { status: 401 });
    }
    
    const { userId } = auth;
    const body = await request.json();
    
    // Validate required fields
    const { nluModelId, text, intent, entitiesJson } = body;
    
    if (!nluModelId) {
      return NextResponse.json({ 
        error: 'nluModelId is required',
        code: 'MISSING_NLU_MODEL_ID' 
      }, { status: 400 });
    }
    
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json({ 
        error: 'text is required and must be a non-empty string',
        code: 'MISSING_TEXT' 
      }, { status: 400 });
    }
    
    const parsedNluModelId = parseInt(nluModelId);
    if (isNaN(parsedNluModelId)) {
      return NextResponse.json({ 
        error: 'Valid nluModelId is required',
        code: 'INVALID_NLU_MODEL_ID' 
      }, { status: 400 });
    }
    
    // Verify workspace ownership
    const { authorized, modelExists } = await verifyWorkspaceOwnership(parsedNluModelId, userId);
    
    if (!modelExists) {
      return NextResponse.json({ 
        error: 'NLU model not found',
        code: 'MODEL_NOT_FOUND' 
      }, { status: 404 });
    }
    
    if (!authorized) {
      return NextResponse.json({ 
        error: 'You do not have permission to create annotations for this model',
        code: 'FORBIDDEN' 
      }, { status: 403 });
    }
    
    // Prepare annotation data
    const annotationData: {
      nluModelId: number;
      text: string;
      intent: string | null;
      entitiesJson: any;
      createdAt: string;
      updatedAt: string;
    } = {
      nluModelId: parsedNluModelId,
      text: text.trim(),
      intent: intent && typeof intent === 'string' ? intent.trim() : null,
      entitiesJson: entitiesJson || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Insert annotation
    const newAnnotation = await db.insert(annotations)
      .values(annotationData)
      .returning();
    
    return NextResponse.json(newAnnotation[0], { status: 201 });
    
  } catch (error) {
    console.error('POST annotation error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}