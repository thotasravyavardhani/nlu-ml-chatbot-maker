import { NextRequest, NextResponse } from 'next/server';

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const response = await fetch(`${ML_SERVICE_URL}/train`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(
        { error: data.detail || 'Training failed' },
        { status: response.status }
      );
    }

    // Normalize Python backend response format
    const normalizedResults = data.results?.map((result: any) => ({
      algorithmId: result.algorithm,
      algorithm: result.algorithm,
      modelPath: result.model_path,
      model_path: result.model_path,
      accuracy: result.metrics?.accuracy || result.metrics?.silhouette_score || 0,
      precision: result.metrics?.precision,
      recall: result.metrics?.recall,
      f1Score: result.metrics?.f1_score,
      f1_score: result.metrics?.f1_score,
      confusionMatrix: result.metrics?.confusion_matrix,
      confusion_matrix: result.metrics?.confusion_matrix,
      silhouetteScore: result.metrics?.silhouette_score,
      nClusters: result.metrics?.n_clusters,
      inertia: result.metrics?.inertia,
      clusterSizes: result.metrics?.cluster_sizes,
      featureNames: result.feature_names,
      targetColumn: result.target_column,
      trainingDuration: 0,
      success: !result.error,
      error: result.error,
    })) || [];

    return NextResponse.json({
      ...data,
      results: normalizedResults,
    });
  } catch (error: any) {
    console.error('ML training proxy error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to connect to ML service' },
      { status: 500 }
    );
  }
}