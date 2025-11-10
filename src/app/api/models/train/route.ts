import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { db } from '@/db';
import { mlModels } from '@/db/schema';
import { eq } from 'drizzle-orm';

// Simulated training results (in production, this would call actual ML training)
const algorithmNames: Record<string, string> = {
  random_forest: 'Random Forest',
  xgboost: 'XGBoost',
  svm: 'Support Vector Machine',
  logistic_regression: 'Logistic Regression',
  decision_tree: 'Decision Tree',
  knn: 'K-Nearest Neighbors',
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

    const { workspaceId, datasetId, targetColumn, algorithms } = await request.json();

    if (!workspaceId || !datasetId || !targetColumn || !algorithms) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const results = [];
    let bestAccuracy = 0;
    let bestModelId = null;

    for (const algorithm of algorithms) {
      // Simulate training with realistic metrics
      const accuracy = 0.82 + Math.random() * 0.15;
      const precision = accuracy - 0.02 + Math.random() * 0.04;
      const recall = accuracy - 0.03 + Math.random() * 0.06;
      const f1Score = (2 * precision * recall) / (precision + recall);

      const now = new Date().toISOString();
      const [model] = await db.insert(mlModels).values({
        workspaceId: parseInt(workspaceId),
        datasetId: parseInt(datasetId),
        modelName: `${algorithmNames[algorithm]} Model`,
        algorithmType: algorithm,
        targetColumn,
        featureColumnsJson: JSON.stringify([]),
        modelFilePath: `/models/${workspaceId}/${algorithm}_model.pkl`,
        accuracy,
        precisionScore: precision,
        recallScore: recall,
        f1Score,
        confusionMatrixJson: JSON.stringify([[85, 15], [12, 88]]),
        trainingDuration: Math.floor(60 + Math.random() * 180),
        isSelected: false,
        trainedAt: now,
        updatedAt: now,
      }).returning();

      if (accuracy > bestAccuracy) {
        bestAccuracy = accuracy;
        bestModelId = model.id;
      }

      results.push({
        algorithmName: algorithmNames[algorithm],
        accuracy,
        precision,
        recall,
        f1Score,
        success: true,
        selected: false,
      });
    }

    // Update best model
    if (bestModelId) {
      await db.update(mlModels)
        .set({ isSelected: true })
        .where(eq(mlModels.id, bestModelId));
      
      const bestIdx = results.findIndex(r => r.accuracy === bestAccuracy);
      if (bestIdx !== -1) {
        results[bestIdx].selected = true;
      }
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Model training error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}