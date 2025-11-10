import { db } from '@/db';
import { mlModels } from '@/db/schema';

async function main() {
    const now = new Date();
    
    const sampleMlModels = [
        {
            workspaceId: 1,
            datasetId: 1,
            modelName: 'Support Ticket Classifier v1',
            algorithmType: 'random_forest',
            targetColumn: 'category',
            featureColumnsJson: JSON.stringify(['customer_message', 'priority', 'sentiment', 'response_time']),
            modelFilePath: '/models/ml/support_classifier_rf.pkl',
            accuracy: 0.89,
            precisionScore: 0.87,
            recallScore: 0.88,
            f1Score: 0.875,
            confusionMatrixJson: JSON.stringify([[450, 50], [45, 455]]),
            trainingDuration: 127,
            isSelected: false,
            trainedAt: new Date(now.getTime() - 23 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(now.getTime() - 23 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
            workspaceId: 1,
            datasetId: 1,
            modelName: 'Support Ticket Classifier v2',
            algorithmType: 'xgboost',
            targetColumn: 'category',
            featureColumnsJson: JSON.stringify(['customer_message', 'priority', 'sentiment', 'response_time']),
            modelFilePath: '/models/ml/support_classifier_xgb.pkl',
            accuracy: 0.92,
            precisionScore: 0.91,
            recallScore: 0.90,
            f1Score: 0.905,
            confusionMatrixJson: JSON.stringify([[470, 30], [35, 465]]),
            trainingDuration: 189,
            isSelected: true,
            trainedAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
            workspaceId: 2,
            datasetId: 2,
            modelName: 'Review Sentiment Analyzer',
            algorithmType: 'logistic_regression',
            targetColumn: 'sentiment',
            featureColumnsJson: JSON.stringify(['review_text', 'rating', 'verified_purchase']),
            modelFilePath: '/models/ml/review_sentiment_lr.pkl',
            accuracy: 0.87,
            precisionScore: 0.86,
            recallScore: 0.85,
            f1Score: 0.855,
            confusionMatrixJson: JSON.stringify([[800, 100, 50], [90, 850, 60], [45, 55, 900]]),
            trainingDuration: 95,
            isSelected: false,
            trainedAt: new Date(now.getTime() - 18 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(now.getTime() - 18 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
            workspaceId: 2,
            datasetId: 2,
            modelName: 'Review Sentiment Deep Learning',
            algorithmType: 'svm',
            targetColumn: 'sentiment',
            featureColumnsJson: JSON.stringify(['review_text', 'rating']),
            modelFilePath: '/models/ml/review_sentiment_svm.pkl',
            accuracy: 0.91,
            precisionScore: 0.90,
            recallScore: 0.89,
            f1Score: 0.895,
            confusionMatrixJson: JSON.stringify([[850, 80, 20], [75, 880, 45], [30, 40, 930]]),
            trainingDuration: 342,
            isSelected: true,
            trainedAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
            workspaceId: 2,
            datasetId: 3,
            modelName: 'Social Media Sentiment',
            algorithmType: 'decision_tree',
            targetColumn: 'sentiment',
            featureColumnsJson: JSON.stringify(['text', 'likes']),
            modelFilePath: '/models/ml/social_sentiment_dt.pkl',
            accuracy: 0.85,
            precisionScore: 0.84,
            recallScore: 0.83,
            f1Score: 0.835,
            confusionMatrixJson: JSON.stringify([[650, 100], [110, 640]]),
            trainingDuration: 67,
            isSelected: true,
            trainedAt: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000).toISOString(),
        },
    ];

    await db.insert(mlModels).values(sampleMlModels);
    
    console.log('✅ ML Models seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});