import { db } from '@/db';
import { datasets } from '@/db/schema';

async function main() {
    const now = new Date();
    const twentyFourDaysAgo = new Date(now.getTime() - 24 * 24 * 60 * 60 * 1000);
    const nineteenDaysAgo = new Date(now.getTime() - 19 * 24 * 60 * 60 * 1000);
    const fifteenDaysAgo = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000);

    const sampleDatasets = [
        {
            workspaceId: 1,
            name: 'Support Tickets Dataset',
            filePath: '/uploads/datasets/support_tickets.csv',
            fileSize: 2457600,
            rowCount: 5000,
            columnCount: 8,
            columnsJson: JSON.stringify(['ticket_id', 'customer_message', 'category', 'priority', 'status', 'sentiment', 'response_time', 'resolved']),
            uploadedAt: twentyFourDaysAgo.toISOString(),
            updatedAt: twentyFourDaysAgo.toISOString(),
        },
        {
            workspaceId: 2,
            name: 'Customer Reviews Dataset',
            filePath: '/uploads/datasets/customer_reviews.csv',
            fileSize: 5242880,
            rowCount: 10000,
            columnCount: 6,
            columnsJson: JSON.stringify(['review_id', 'product_name', 'review_text', 'rating', 'sentiment', 'verified_purchase']),
            uploadedAt: nineteenDaysAgo.toISOString(),
            updatedAt: nineteenDaysAgo.toISOString(),
        },
        {
            workspaceId: 2,
            name: 'Social Media Comments',
            filePath: '/uploads/datasets/social_comments.csv',
            fileSize: 3145728,
            rowCount: 7500,
            columnCount: 5,
            columnsJson: JSON.stringify(['comment_id', 'text', 'likes', 'sentiment', 'timestamp']),
            uploadedAt: fifteenDaysAgo.toISOString(),
            updatedAt: fifteenDaysAgo.toISOString(),
        },
    ];

    await db.insert(datasets).values(sampleDatasets);
    
    console.log('✅ Datasets seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});