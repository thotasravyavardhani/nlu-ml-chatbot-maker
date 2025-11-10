import { db } from '@/db';
import { workspaces } from '@/db/schema';

async function main() {
    const twentyFiveDaysAgo = new Date();
    twentyFiveDaysAgo.setDate(twentyFiveDaysAgo.getDate() - 25);
    
    const twentyDaysAgo = new Date();
    twentyDaysAgo.setDate(twentyDaysAgo.getDate() - 20);

    const sampleWorkspaces = [
        {
            name: 'Customer Support Bot',
            description: 'AI-powered customer support chatbot with intent recognition and entity extraction',
            userId: 'user_01h4kxt2e8z9y3b1n7m6q5w8r4',
            createdAt: twentyFiveDaysAgo.toISOString(),
            updatedAt: twentyFiveDaysAgo.toISOString(),
        },
        {
            name: 'Sentiment Analysis Project',
            description: 'Machine learning project for analyzing customer sentiment from reviews',
            userId: 'user_01h4kxt2e8z9y3b1n7m6q5w8r4',
            createdAt: twentyDaysAgo.toISOString(),
            updatedAt: twentyDaysAgo.toISOString(),
        }
    ];

    await db.insert(workspaces).values(sampleWorkspaces);
    
    console.log('✅ Workspaces seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});