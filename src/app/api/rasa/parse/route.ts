import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { session } from '@/db/schema';
import { eq } from 'drizzle-orm';

async function validateSession(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);

  try {
    const sessionRecord = await db
      .select()
      .from(session)
      .where(eq(session.token, token))
      .limit(1);

    if (sessionRecord.length === 0) {
      return null;
    }

    const sess = sessionRecord[0];
    
    if (new Date(sess.expiresAt) < new Date()) {
      return null;
    }

    return { userId: sess.userId };
  } catch (error) {
    console.error('Session validation error:', error);
    return null;
  }
}

// Simulated intent detection
function simulateIntentDetection(text: string) {
  const lowerText = text.toLowerCase();
  
  const intents = [
    { keywords: ['hello', 'hi', 'hey', 'greetings'], intent: 'greet', response: 'Hello! How can I help you today?' },
    { keywords: ['bye', 'goodbye', 'see you', 'later'], intent: 'goodbye', response: 'Goodbye! Have a great day!' },
    { keywords: ['thanks', 'thank you', 'appreciate'], intent: 'thank', response: 'You\'re welcome!' },
    { keywords: ['help', 'assist', 'support'], intent: 'help', response: 'I\'m here to help! What do you need?' },
    { keywords: ['weather', 'temperature', 'forecast'], intent: 'ask_weather', response: 'I can help with weather information!' },
    { keywords: ['price', 'cost', 'expensive'], intent: 'ask_price', response: 'Let me check the pricing for you.' },
  ];

  for (const { keywords, intent, response } of intents) {
    if (keywords.some(keyword => lowerText.includes(keyword))) {
      return {
        intent,
        confidence: Math.random() * 0.2 + 0.75,
        response,
        entities: [],
      };
    }
  }

  return {
    intent: 'unknown',
    confidence: 0.3,
    response: 'I\'m not sure I understand. Could you rephrase that?',
    entities: [],
  };
}

export async function POST(request: NextRequest) {
  try {
    const user = await validateSession(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { text, modelId } = body;

    if (!text) {
      return NextResponse.json(
        { error: 'text is required' },
        { status: 400 }
      );
    }

    // Try Python Rasa service
    const rasaServiceUrl = process.env.RASA_SERVICE_URL;
    let result;
    let usePythonBackend = false;

    if (rasaServiceUrl) {
      try {
        const rasaResponse = await fetch(`${rasaServiceUrl}/parse`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text }),
        });

        if (rasaResponse.ok) {
          result = await rasaResponse.json();
          usePythonBackend = true;
          console.log('✅ Using Python Rasa Backend for parsing');
        } else {
          console.warn('Rasa service unavailable, using simulation');
        }
      } catch (error) {
        console.warn('Rasa service error, using simulation:', error);
      }
    }

    // Fallback to simulation
    if (!usePythonBackend) {
      console.log('⚠️ Using Simulation Mode for NLU parsing');
      result = simulateIntentDetection(text);
    }

    return NextResponse.json({
      ...result,
      backend: usePythonBackend ? 'rasa' : 'simulation',
    }, { status: 200 });

  } catch (error) {
    console.error('Rasa parse error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}