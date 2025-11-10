import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { datasets } from '@/db/schema';
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

    const workspaceDatasets = await db.select()
      .from(datasets)
      .where(eq(datasets.workspaceId, parseInt(params.id)));

    return NextResponse.json(workspaceDatasets);
  } catch (error) {
    console.error('Fetch datasets error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
