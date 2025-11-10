import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const status = {
    mlService: { available: false, url: process.env.PYTHON_ML_SERVICE_URL || 'not configured' },
    rasaService: { available: false, url: process.env.PYTHON_RASA_SERVICE_URL || 'not configured' },
    rasaServer: { available: false, url: process.env.RASA_SERVER_URL || 'not configured' },
  };

  // Check ML Service
  if (process.env.PYTHON_ML_SERVICE_URL) {
    try {
      const mlResponse = await fetch(`${process.env.PYTHON_ML_SERVICE_URL}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(2000),
      });
      status.mlService.available = mlResponse.ok;
    } catch (error) {
      // Service unavailable
    }
  }

  // Check Rasa Service
  if (process.env.PYTHON_RASA_SERVICE_URL) {
    try {
      const rasaResponse = await fetch(`${process.env.PYTHON_RASA_SERVICE_URL}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(2000),
      });
      status.rasaService.available = rasaResponse.ok;
    } catch (error) {
      // Service unavailable
    }
  }

  // Check Rasa Server
  if (process.env.RASA_SERVER_URL) {
    try {
      const serverResponse = await fetch(`${process.env.RASA_SERVER_URL}/status`, {
        method: 'GET',
        signal: AbortSignal.timeout(2000),
      });
      status.rasaServer.available = serverResponse.ok;
    } catch (error) {
      // Service unavailable
    }
  }

  return NextResponse.json(status, { status: 200 });
}
