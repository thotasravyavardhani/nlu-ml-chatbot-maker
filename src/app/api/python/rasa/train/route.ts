import { NextRequest, NextResponse } from 'next/server';

const RASA_SERVICE_URL = process.env.RASA_SERVICE_URL || 'http://localhost:8001';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const response = await fetch(`${RASA_SERVICE_URL}/train`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(
        { error: data.detail || 'Rasa training failed' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Rasa training proxy error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to connect to Rasa service' },
      { status: 500 }
    );
  }
}
