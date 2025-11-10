import { db } from '@/db';
import { nluModels } from '@/db/schema';

async function main() {
    const twentyTwoDaysAgo = new Date();
    twentyTwoDaysAgo.setDate(twentyTwoDaysAgo.getDate() - 22);
    
    const seventeenDaysAgo = new Date();
    seventeenDaysAgo.setDate(seventeenDaysAgo.getDate() - 17);

    const sampleNluModels = [
        {
            workspaceId: 1,
            name: 'Support Bot NLU Model v1',
            rasaModelPath: '/models/nlu/support_bot_v1.tar.gz',
            intentsJson: JSON.stringify(['greet', 'goodbye', 'track_order', 'return_item', 'ask_refund', 'complain', 'thank', 'ask_human_agent']),
            entitiesJson: JSON.stringify(['order_id', 'product_name', 'date', 'amount', 'email']),
            trainingDataPath: '/training_data/support_bot_nlu.yml',
            accuracy: 0.93,
            trainedAt: twentyTwoDaysAgo.toISOString(),
            updatedAt: twentyTwoDaysAgo.toISOString(),
        },
        {
            workspaceId: 2,
            name: 'Sentiment NLU Model',
            rasaModelPath: '/models/nlu/sentiment_nlu_v1.tar.gz',
            intentsJson: JSON.stringify(['positive_feedback', 'negative_feedback', 'neutral_comment', 'feature_request', 'bug_report']),
            entitiesJson: JSON.stringify(['product_name', 'feature', 'issue_type', 'rating']),
            trainingDataPath: '/training_data/sentiment_nlu.yml',
            accuracy: 0.88,
            trainedAt: seventeenDaysAgo.toISOString(),
            updatedAt: seventeenDaysAgo.toISOString(),
        },
    ];

    await db.insert(nluModels).values(sampleNluModels);
    
    console.log('✅ NLU models seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});