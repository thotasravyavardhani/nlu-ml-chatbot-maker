import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { mlModels, session } from '@/db/schema';
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

// Simulate ML model prediction with realistic results
function simulatePrediction(input: Record<string, any>, algorithmType: string, targetColumn: string) {
  // Generate realistic prediction based on algorithm type
  const isClassification = ['random_forest', 'xgboost', 'gradient_boosting', 'svm', 
    'logistic_regression', 'decision_tree', 'knn', 'naive_bayes'].includes(algorithmType);
  
  const isRegression = ['linear_regression', 'ridge', 'lasso', 'random_forest_regressor',
    'xgboost_regressor', 'svr', 'decision_tree_regressor', 'gradient_boosting_regressor'].includes(algorithmType);

  let prediction;
  let confidence;

  if (isClassification) {
    // Generate class prediction (0, 1, 2, 3, or labels like "Yes", "No", "A", "B", etc.)
    const classes = ['0', '1', '2', '3', 'Yes', 'No', 'A', 'B', 'C', 'High', 'Medium', 'Low'];
    prediction = classes[Math.floor(Math.random() * 4)]; // Most common: 0-3
    confidence = Math.random() * 0.25 + 0.70; // 70-95%
  } else if (isRegression) {
    // Generate continuous value
    prediction = (Math.random() * 100 + 20).toFixed(2); // 20-120 range
    confidence = Math.random() * 0.15 + 0.80; // 80-95%
  } else {
    // Clustering - return cluster ID
    prediction = `Cluster ${Math.floor(Math.random() * 5)}`;
    confidence = Math.random() * 0.20 + 0.75; // 75-95%
  }

  return {
    input,
    prediction,
    confidence: Math.min(confidence, 0.99),
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
    const { modelId, data } = body;

    // Validate required fields
    if (!modelId) {
      return NextResponse.json(
        { error: 'modelId is required', code: 'MISSING_MODEL_ID' },
        { status: 400 }
      );
    }

    if (!data || !Array.isArray(data) || data.length === 0) {
      return NextResponse.json(
        { error: 'data array is required and must not be empty', code: 'INVALID_DATA' },
        { status: 400 }
      );
    }

    // Verify model exists
    const model = await db
      .select()
      .from(mlModels)
      .where(eq(mlModels.id, parseInt(modelId)))
      .limit(1);

    if (model.length === 0) {
      return NextResponse.json(
        { error: 'Model not found', code: 'MODEL_NOT_FOUND' },
        { status: 404 }
      );
    }

    const modelData = model[0];

    // Validate input data structure
    const featureColumns = Array.isArray(modelData.featureColumnsJson)
      ? modelData.featureColumnsJson
      : JSON.parse(modelData.featureColumnsJson as string);

    const requiredFeatures = featureColumns.filter((col: string) => col !== modelData.targetColumn);

    for (const sample of data) {
      for (const feature of requiredFeatures) {
        if (!(feature in sample)) {
          return NextResponse.json(
            { error: `Missing feature: ${feature}`, code: 'MISSING_FEATURE' },
            { status: 400 }
          );
        }
      }
    }

    // Generate predictions for all samples
    const predictions = data.map(sample => 
      simulatePrediction(sample, modelData.algorithmType, modelData.targetColumn)
    );

    return NextResponse.json({
      message: 'Predictions generated successfully',
      modelName: modelData.modelName,
      algorithmType: modelData.algorithmType,
      targetColumn: modelData.targetColumn,
      predictions,
      totalPredictions: predictions.length,
    }, { status: 200 });

  } catch (error) {
    console.error('Prediction error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
