import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { mlModels } from '@/db/schema';
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

    const workspaceModels = await db.select()
      .from(mlModels)
      .where(eq(mlModels.workspaceId, parseInt(params.id)))
      .orderBy(mlModels.trainedAt);

    return NextResponse.json(workspaceModels);
  } catch (error) {
    console.error('Fetch models error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
