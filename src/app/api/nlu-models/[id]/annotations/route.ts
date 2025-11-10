import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { annotations } from '@/db/schema';
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

    const modelAnnotations = await db.select()
      .from(annotations)
      .where(eq(annotations.nluModelId, parseInt(params.id)))
      .orderBy(annotations.createdAt);

    return NextResponse.json(modelAnnotations);
  } catch (error) {
    console.error('Fetch annotations error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
