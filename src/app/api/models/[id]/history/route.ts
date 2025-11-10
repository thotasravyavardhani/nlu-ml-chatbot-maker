import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { trainingHistory } from '@/db/schema';
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

    const history = await db.select()
      .from(trainingHistory)
      .where(eq(trainingHistory.mlModelId, parseInt(params.id)))
      .orderBy(trainingHistory.epochNumber);

    return NextResponse.json(history);
  } catch (error) {
    console.error('Fetch training history error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
