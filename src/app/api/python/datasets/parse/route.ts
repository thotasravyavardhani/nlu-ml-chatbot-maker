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

    const formData = await request.formData();
    
    // Forward to Python backend
    const pythonResponse = await fetch(`${PYTHON_BACKEND_URL}/api/datasets/parse`, {
      method: 'POST',
      body: formData,
    });

    const data = await pythonResponse.json();

    if (!pythonResponse.ok) {
      return NextResponse.json(
        { error: data.error || 'Failed to parse dataset' },
        { status: pythonResponse.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Dataset parse error:', error);
    return NextResponse.json(
      { error: 'Failed to connect to Python backend. Make sure it is running on port 5000.' },
      { status: 500 }
    );
  }
}
