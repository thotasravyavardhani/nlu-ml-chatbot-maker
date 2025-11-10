import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

const PYTHON_BACKEND_URL = process.env.PYTHON_BACKEND_URL || 'http://localhost:5000';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Forward to Python backend
    const pythonResponse = await fetch(`${PYTHON_BACKEND_URL}/api/models/metadata`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await pythonResponse.json();

    if (!pythonResponse.ok) {
      return NextResponse.json(
        { error: data.error || 'Failed to get model metadata' },
        { status: pythonResponse.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Model metadata error:', error);
    return NextResponse.json(
      { error: 'Failed to connect to Python backend' },
      { status: 500 }
    );
  }
}
