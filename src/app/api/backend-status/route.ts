import { NextResponse } from 'next/server';

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';
const RASA_SERVICE_URL = process.env.RASA_SERVICE_URL || 'http://localhost:8001';
const RASA_SERVER_URL = process.env.RASA_SERVER_URL || 'http://localhost:5005';

async function checkService(url: string, timeout: number = 3000): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    const response = await fetch(`${url}/health`, {
      method: 'GET',
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    return false;
  }
}

export async function GET() {
  const [mlAvailable, rasaAvailable, rasaServerAvailable] = await Promise.all([
    checkService(ML_SERVICE_URL),
    checkService(RASA_SERVICE_URL),
    checkService(RASA_SERVER_URL),
  ]);

  return NextResponse.json({
    mlService: {
      available: mlAvailable,
      url: ML_SERVICE_URL,
      status: mlAvailable ? 'connected' : 'offline',
    },
    rasaService: {
      available: rasaAvailable,
      url: RASA_SERVICE_URL,
      status: rasaAvailable ? 'connected' : 'offline',
    },
    rasaServer: {
      available: rasaServerAvailable,
      url: RASA_SERVER_URL,
      status: rasaServerAvailable ? 'connected' : 'offline',
    },
    timestamp: new Date().toISOString(),
  });
}