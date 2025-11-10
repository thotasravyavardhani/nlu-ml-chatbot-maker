import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';

// Mock RASA prediction
const intentResponses: Record<string, string[]> = {
  greet: ['Hello! How can I help you today?', 'Hi there! What can I do for you?'],
  goodbye: ['Goodbye! Have a great day!', 'See you later!'],
  track_order: ['Let me check that order for you.', 'I can help you track your order.'],
  return_item: ['I can assist you with returns.', 'Let me help you with that return.'],
  thank: ['You\'re welcome!', 'Happy to help!'],
  default: ['I\'m not sure I understand. Can you rephrase that?'],
};

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser();
    
    if (!authUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { modelId, text } = await request.json();

    // Mock intent detection
    const lowerText = text.toLowerCase();
    let intent = 'default';
    let confidence = 0.7;

    if (lowerText.includes('hello') || lowerText.includes('hi')) {
      intent = 'greet';
      confidence = 0.95;
    } else if (lowerText.includes('bye') || lowerText.includes('goodbye')) {
      intent = 'goodbye';
      confidence = 0.93;
    } else if (lowerText.includes('track') || lowerText.includes('order')) {
      intent = 'track_order';
      confidence = 0.89;
    } else if (lowerText.includes('return')) {
      intent = 'return_item';
      confidence = 0.87;
    } else if (lowerText.includes('thank')) {
      intent = 'thank';
      confidence = 0.96;
    }

    const responses = intentResponses[intent] || intentResponses.default;
    const response = responses[Math.floor(Math.random() * responses.length)];

    return NextResponse.json({
      intent,
      confidence,
      response,
    });
  } catch (error) {
    console.error('NLU prediction error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
