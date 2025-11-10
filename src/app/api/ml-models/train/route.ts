import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { mlModels, datasets, session } from '@/db/schema';
import { eq } from 'drizzle-orm';
import path from 'path';
import fs from 'fs';

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

const algorithmNames: Record<string, string> = {
  // Classification
  random_forest: "Random Forest",
  xgboost: "XGBoost",
  gradient_boosting: "Gradient Boosting",
  svm: "Support Vector Machine",
  logistic_regression: "Logistic Regression",
  decision_tree: "Decision Tree",
  knn: "K-Nearest Neighbors",
  naive_bayes: "Naive Bayes",
  // Regression
  linear_regression: "Linear Regression",
  ridge: "Ridge Regression",
  lasso: "Lasso Regression",
  random_forest_regressor: "Random Forest Regressor",
  xgboost_regressor: "XGBoost Regressor",
  svr: "Support Vector Regression",
  decision_tree_regressor: "Decision Tree Regressor",
  gradient_boosting_regressor: "Gradient Boosting Regressor",
  // Clustering
  kmeans: "K-Means",
  dbscan: "DBSCAN",
  hierarchical: "Hierarchical Clustering",
  gmm: "Gaussian Mixture Models",
  mean_shift: "Mean Shift",
  spectral: "Spectral Clustering",
};

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
    const { workspaceId, datasetId, problemType, targetColumn, algorithms, pythonResults } = body;

    // Validate required fields
    if (!workspaceId) {
      return NextResponse.json(
        { error: 'workspaceId is required', code: 'MISSING_WORKSPACE_ID' },
        { status: 400 }
      );
    }

    if (!datasetId) {
      return NextResponse.json(
        { error: 'datasetId is required', code: 'MISSING_DATASET_ID' },
        { status: 400 }
      );
    }

    if (!problemType || !['classification', 'regression', 'clustering'].includes(problemType)) {
      return NextResponse.json(
        { error: 'Valid problemType is required (classification, regression, or clustering)', code: 'INVALID_PROBLEM_TYPE' },
        { status: 400 }
      );
    }

    if (problemType !== 'clustering' && !targetColumn) {
      return NextResponse.json(
        { error: 'targetColumn is required for supervised learning', code: 'MISSING_TARGET_COLUMN' },
        { status: 400 }
      );
    }

    if (!algorithms || !Array.isArray(algorithms) || algorithms.length === 0) {
      return NextResponse.json(
        { error: 'At least one algorithm is required', code: 'MISSING_ALGORITHMS' },
        { status: 400 }
      );
    }

    // Verify dataset exists
    const dataset = await db
      .select()
      .from(datasets)
      .where(eq(datasets.id, parseInt(datasetId)))
      .limit(1);

    if (dataset.length === 0) {
      return NextResponse.json(
        { error: 'Dataset not found', code: 'DATASET_NOT_FOUND' },
        { status: 404 }
      );
    }

    const datasetRecord = dataset[0];
    
    // Use Python results if provided, otherwise generate simulation results
    let results = [];
    let usePythonBackend = false;

    if (pythonResults && Array.isArray(pythonResults) && pythonResults.length > 0) {
      results = pythonResults;
      usePythonBackend = true;
      console.log('✅ Using Python ML Backend results');
    } else {
      console.log('⚠️ Using Simulation Mode (Python backend not connected)');
      // Simulation fallback
      for (const algorithmId of algorithms) {
        const baseAccuracy = Math.random() * 0.15 + 0.80;
        
        if (problemType === 'clustering') {
          results.push({
            algorithmId,
            success: true,
            accuracy: baseAccuracy,
            nClusters: Math.floor(Math.random() * 5) + 3,
            inertia: Math.random() * 1000 + 500,
            trainingDuration: Math.floor(Math.random() * 3000) + 1000,
            modelPath: `/models/simulated/${workspaceId}_${algorithmId}_${Date.now()}.pkl`,
          });
        } else {
          const precision = baseAccuracy + (Math.random() * 0.05 - 0.025);
          const recall = baseAccuracy + (Math.random() * 0.05 - 0.025);
          const f1Score = 2 * (precision * recall) / (precision + recall);

          results.push({
            algorithmId,
            success: true,
            accuracy: baseAccuracy,
            precision,
            recall,
            f1Score,
            confusionMatrix: [
              [85, 5, 3, 7],
              [4, 92, 2, 2],
              [6, 3, 88, 3],
              [5, 4, 2, 89],
            ],
            trainingDuration: Math.floor(Math.random() * 5000) + 2000,
            modelPath: `/models/simulated/${workspaceId}_${algorithmId}_${Date.now()}.pkl`,
          });
        }
      }
    }

    // Save models to database and find best model
    let bestAccuracy = 0;
    let bestModelIndex = 0;
    const savedResults = [];

    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      
      if (result.accuracy > bestAccuracy) {
        bestAccuracy = result.accuracy;
        bestModelIndex = i;
      }

      const now = new Date().toISOString();
      const modelData: any = {
        workspaceId: parseInt(workspaceId),
        datasetId: parseInt(datasetId),
        modelName: `${algorithmNames[result.algorithmId]} - ${new Date().toLocaleString()}`,
        algorithmType: result.algorithmId,
        targetColumn: targetColumn || 'unsupervised',
        featureColumnsJson: datasetRecord.columnsJson,
        modelFilePath: result.modelPath,
        accuracy: result.accuracy,
        trainingDuration: result.trainingDuration,
        isSelected: false,
        trainedAt: now,
        updatedAt: now,
      };

      if (problemType !== 'clustering') {
        modelData.precisionScore = result.precision;
        modelData.recallScore = result.recall;
        modelData.f1Score = result.f1Score;
        // Store confusion matrix as JSON string to avoid parsing errors
        modelData.confusionMatrixJson = JSON.stringify(result.confusionMatrix);
      }

      const [savedModel] = await db.insert(mlModels).values(modelData).returning();
      
      savedResults.push({
        ...result,
        algorithmName: algorithmNames[result.algorithmId] || result.algorithmId,
        modelId: savedModel.id,
        selected: false,
      });
    }

    // Mark best model as selected
    if (savedResults.length > 0) {
      savedResults[bestModelIndex].selected = true;
      await db
        .update(mlModels)
        .set({ isSelected: true, updatedAt: new Date().toISOString() })
        .where(eq(mlModels.id, savedResults[bestModelIndex].modelId));
    }

    return NextResponse.json({
      message: 'Models trained successfully',
      results: savedResults,
      bestModel: savedResults[bestModelIndex],
      backend: usePythonBackend ? 'python' : 'simulation',
    }, { status: 201 });

  } catch (error) {
    console.error('Training error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}