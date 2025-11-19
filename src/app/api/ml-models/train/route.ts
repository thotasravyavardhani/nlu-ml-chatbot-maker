import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { mlModels, datasets } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { validateSessionFromCookies } from '@/lib/auth-helpers';

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
    const user = await validateSessionFromCookies(request);
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

    // Require Python backend results
    if (!pythonResults || !Array.isArray(pythonResults) || pythonResults.length === 0) {
      return NextResponse.json(
        { 
          error: 'Python ML backend is required for training. Please start the Python backend service.',
          code: 'PYTHON_BACKEND_REQUIRED',
          hint: 'Run: cd python-backend && ./start.sh'
        },
        { status: 503 }
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
    
    // Use Python results
    const results = pythonResults;
    console.log('✅ Using Python ML Backend results');

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
      
      // Python backend returns 'algorithm', not 'algorithmId'
      const algorithmId = result.algorithm || result.algorithmId;
      
      const modelData: any = {
        workspaceId: parseInt(workspaceId),
        datasetId: parseInt(datasetId),
        modelName: `${algorithmNames[algorithmId]} - ${new Date().toLocaleString()}`,
        algorithmType: algorithmId,
        targetColumn: targetColumn || 'unsupervised',
        featureColumnsJson: datasetRecord.columnsJson,
        modelFilePath: result.modelPath || result.model_path,
        accuracy: result.accuracy,
        trainingDuration: result.trainingDuration || 0,
        isSelected: false,
        trainedAt: now,
        updatedAt: now,
      };

      if (problemType !== 'clustering') {
        modelData.precisionScore = result.precision;
        modelData.recallScore = result.recall;
        modelData.f1Score = result.f1Score || result.f1_score;
        modelData.confusionMatrixJson = JSON.stringify(result.confusionMatrix || result.confusion_matrix);
      }

      const [savedModel] = await db.insert(mlModels).values(modelData).returning();
      
      savedResults.push({
        ...result,
        algorithmId: algorithmId,
        algorithmName: algorithmNames[algorithmId] || algorithmId,
        modelId: savedModel.id,
        selected: false,
        success: true,
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
      backend: 'python',
    }, { status: 201 });

  } catch (error) {
    console.error('Training error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}