import { db } from '@/db';
import { trainingHistory } from '@/db/schema';

async function main() {
    const twentyDaysAgo = new Date();
    twentyDaysAgo.setDate(twentyDaysAgo.getDate() - 20);

    const sampleTrainingHistory = [
        {
            mlModelId: 2,
            epoch: 1,
            loss: 0.65,
            accuracy: 0.72,
            createdAt: new Date(twentyDaysAgo.getTime()).toISOString(),
        },
        {
            mlModelId: 2,
            epoch: 2,
            loss: 0.52,
            accuracy: 0.78,
            createdAt: new Date(twentyDaysAgo.getTime() + 1 * 60 * 60 * 1000).toISOString(),
        },
        {
            mlModelId: 2,
            epoch: 3,
            loss: 0.42,
            accuracy: 0.82,
            createdAt: new Date(twentyDaysAgo.getTime() + 2 * 60 * 60 * 1000).toISOString(),
        },
        {
            mlModelId: 2,
            epoch: 4,
            loss: 0.35,
            accuracy: 0.85,
            createdAt: new Date(twentyDaysAgo.getTime() + 3 * 60 * 60 * 1000).toISOString(),
        },
        {
            mlModelId: 2,
            epoch: 5,
            loss: 0.29,
            accuracy: 0.87,
            createdAt: new Date(twentyDaysAgo.getTime() + 4 * 60 * 60 * 1000).toISOString(),
        },
        {
            mlModelId: 2,
            epoch: 6,
            loss: 0.25,
            accuracy: 0.89,
            createdAt: new Date(twentyDaysAgo.getTime() + 5 * 60 * 60 * 1000).toISOString(),
        },
        {
            mlModelId: 2,
            epoch: 7,
            loss: 0.21,
            accuracy: 0.90,
            createdAt: new Date(twentyDaysAgo.getTime() + 6 * 60 * 60 * 1000).toISOString(),
        },
        {
            mlModelId: 2,
            epoch: 8,
            loss: 0.18,
            accuracy: 0.91,
            createdAt: new Date(twentyDaysAgo.getTime() + 7 * 60 * 60 * 1000).toISOString(),
        },
        {
            mlModelId: 2,
            epoch: 9,
            loss: 0.16,
            accuracy: 0.915,
            createdAt: new Date(twentyDaysAgo.getTime() + 8 * 60 * 60 * 1000).toISOString(),
        },
        {
            mlModelId: 2,
            epoch: 10,
            loss: 0.15,
            accuracy: 0.92,
            createdAt: new Date(twentyDaysAgo.getTime() + 9 * 60 * 60 * 1000).toISOString(),
        },
    ];

    await db.insert(trainingHistory).values(sampleTrainingHistory);
    
    console.log('✅ Training history seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});