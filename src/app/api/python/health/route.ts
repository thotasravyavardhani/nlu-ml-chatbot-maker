import { NextResponse } from 'next/server';

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';
const RASA_SERVICE_URL = process.env.RASA_SERVICE_URL || 'http://localhost:8001';

export async function GET() {
  const results = {
    ml_service: { status: 'unknown', url: ML_SERVICE_URL },
    rasa_service: { status: 'unknown', url: RASA_SERVICE_URL },
  };

  try {
    const mlResponse = await fetch(`${ML_SERVICE_URL}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    });
    results.ml_service.status = mlResponse.ok ? 'healthy' : 'unhealthy';
  } catch (error) {
    results.ml_service.status = 'offline';
  }

  try {
    const rasaResponse = await fetch(`${RASA_SERVICE_URL}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    });
    results.rasa_service.status = rasaResponse.ok ? 'healthy' : 'unhealthy';
  } catch (error) {
    results.rasa_service.status = 'offline';
  }

  const allHealthy = 
    results.ml_service.status === 'healthy' && 
    results.rasa_service.status === 'healthy';

  return NextResponse.json(
    {
      status: allHealthy ? 'healthy' : 'degraded',
      services: results,
      timestamp: new Date().toISOString(),
    },
    { status: allHealthy ? 200 : 503 }
  );
}
