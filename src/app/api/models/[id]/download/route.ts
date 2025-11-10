import { NextRequest, NextResponse } from 'next/server';
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

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'pickle';

    // In production, this would serve the actual model file
    const mockModelData = `Model ID: ${params.id}\nFormat: ${format}\nTrained by: User ${authUser.userId}`;

    return new NextResponse(mockModelData, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename=model_${params.id}.${format}`,
      },
    });
  } catch (error) {
    console.error('Download model error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
