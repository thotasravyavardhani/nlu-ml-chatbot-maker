import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { nluModels } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getAuthUser } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await getAuthUser();
    
    if (!authUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const workspaceNluModels = await db.select()
      .from(nluModels)
      .where(eq(nluModels.workspaceId, parseInt(params.id)))
      .orderBy(nluModels.trainedAt);

    return NextResponse.json(workspaceNluModels);
  } catch (error) {
    console.error('Fetch NLU models error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
