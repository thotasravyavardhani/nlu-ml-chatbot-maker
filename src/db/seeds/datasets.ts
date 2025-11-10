import { db } from '@/db';
import { datasets } from '@/db/schema';

async function main() {
    const now = new Date();
    const fifteenDaysAgo = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000);
    const twentyDaysAgo = new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000);
    const twentyFiveDaysAgo = new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000);

    const sampleDatasets = [
        {
            workspaceId: 1,
            name: 'Support Tickets Dataset',
            filePath: '/uploads/datasets/support_tickets_2024.csv',
            fileSize: 3145728,
            rowCount: 7500,
            columnCount: 7,
            columnsJson: JSON.stringify([
                'ticket_id',
                'customer_name',
                'issue_type',
                'priority',
                'status',
                'created_date',
                'resolved_date'
            ]),
            fileFormat: 'csv',
            uploadedAt: twentyFiveDaysAgo.toISOString(),
            updatedAt: twentyFiveDaysAgo.toISOString(),
        },
        {
            workspaceId: 1,
            name: 'Customer Reviews Dataset',
            filePath: '/uploads/datasets/customer_reviews_q1.json',
            fileSize: 4718592,
            rowCount: 9200,
            columnCount: 6,
            columnsJson: JSON.stringify([
                'review_id',
                'product_id',
                'customer_id',
                'rating',
                'review_text',
                'sentiment'
            ]),
            fileFormat: 'json',
            uploadedAt: twentyDaysAgo.toISOString(),
            updatedAt: twentyDaysAgo.toISOString(),
        },
        {
            workspaceId: 2,
            name: 'Social Media Comments Dataset',
            filePath: '/uploads/datasets/social_comments_march.csv',
            fileSize: 2621440,
            rowCount: 5800,
            columnCount: 8,
            columnsJson: JSON.stringify([
                'comment_id',
                'post_id',
                'user_id',
                'comment_text',
                'likes',
                'replies',
                'timestamp',
                'platform'
            ]),
            fileFormat: 'csv',
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