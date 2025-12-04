import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const pythonUrl = process.env.PYTHON_BACKEND_URL || 'http://localhost:5000';
    
    // Attempt to connect to the Python backend
    const response = await fetch(`${pythonUrl}/health`);
    
    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      { 
        status: 'error', 
        message: 'Python backend unreachable',
        details: (error as Error).message
      },
      { status: 503 }
    );
  }
}
