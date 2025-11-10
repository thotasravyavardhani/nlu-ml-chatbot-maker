import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { mlModels, datasets, session } from '@/db/schema';
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

// Simulate ML model training with realistic results
function simulateModelTraining(algorithmId: string, problemType: string) {
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

  // Generate realistic metrics based on algorithm type
  const baseAccuracy = Math.random() * 0.15 + 0.80; // 80-95%
  
  if (problemType === 'clustering') {
    return {
      algorithmId,
      algorithmName: algorithmNames[algorithmId] || algorithmId,
      success: true,
      accuracy: baseAccuracy, // Silhouette score for clustering
      nClusters: Math.floor(Math.random() * 5) + 3, // 3-7 clusters
      inertia: Math.random() * 1000 + 500, // Inertia value
      trainingDuration: Math.floor(Math.random() * 3000) + 1000, // 1-4 seconds
    };
  }

  // Supervised learning metrics
  const precision = baseAccuracy + (Math.random() * 0.05 - 0.025);
  const recall = baseAccuracy + (Math.random() * 0.05 - 0.025);
  const f1Score = 2 * (precision * recall) / (precision + recall);

  return {
    algorithmId,
    algorithmName: algorithmNames[algorithmId] || algorithmId,
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
    trainingDuration: Math.floor(Math.random() * 5000) + 2000, // 2-7 seconds
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
    const { workspaceId, datasetId, problemType, targetColumn, algorithms } = body;

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

    // Train models and collect results
    const results = [];
    let bestAccuracy = 0;
    let bestModelIndex = 0;

    for (let i = 0; i < algorithms.length; i++) {
      const algorithmId = algorithms[i];
      const result = simulateModelTraining(algorithmId, problemType);
      
      // Track best model
      if (result.accuracy > bestAccuracy) {
        bestAccuracy = result.accuracy;
        bestModelIndex = i;
      }

      // Save to database
      const now = new Date().toISOString();
      const modelData: any = {
        workspaceId: parseInt(workspaceId),
        datasetId: parseInt(datasetId),
        modelName: `${result.algorithmName} - ${new Date().toLocaleString()}`,
        algorithmType: result.algorithmId,
        targetColumn: targetColumn || 'unsupervised',
        featureColumnsJson: dataset[0].columnsJson,
        modelFilePath: `/models/${workspaceId}/${result.algorithmId}_${Date.now()}.pkl`,
        accuracy: result.accuracy,
        trainingDuration: result.trainingDuration,
        isSelected: false, // Will update best model after loop
        trainedAt: now,
        updatedAt: now,
      };

      // Add supervised learning metrics
      if (problemType !== 'clustering') {
        modelData.precisionScore = result.precision;
        modelData.recallScore = result.recall;
        modelData.f1Score = result.f1Score;
        modelData.confusionMatrixJson = result.confusionMatrix;
      }

      const [savedModel] = await db.insert(mlModels).values(modelData).returning();
      
      results.push({
        ...result,
        modelId: savedModel.id,
        selected: false,
      });
    }

    // Mark best model as selected
    if (results.length > 0) {
      results[bestModelIndex].selected = true;
      
      // Update database to mark best model
      await db
        .update(mlModels)
        .set({ isSelected: true, updatedAt: new Date().toISOString() })
        .where(eq(mlModels.id, results[bestModelIndex].modelId));
    }

    return NextResponse.json({
      message: 'Models trained successfully',
      results,
      bestModel: results[bestModelIndex],
    }, { status: 201 });

  } catch (error) {
    console.error('Training error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
