import { db } from '@/db';
import { datasets } from '@/db/schema';

async function main() {
    const now = new Date();
    const daysAgo = (days: number) => {
        const date = new Date(now);
        date.setDate(date.getDate() - days);
        return date.toISOString();
    };

    const sampleDatasets = [
        {
            workspaceId: 1,
            name: 'Support Tickets Dataset',
            filePath: '/uploads/datasets/support_tickets_2024.csv',
            fileSize: 3145728,
            rowCount: 7856,
            columnCount: 6,
            columnsJson: [
                'ticket_id',
                'customer_name',
                'issue_type',
                'priority',
                'status',
                'resolution_time'
            ],
            fileFormat: 'csv',
            uploadedAt: daysAgo(18),
            updatedAt: daysAgo(18),
        },
        {
            workspaceId: 1,
            name: 'Customer Reviews Dataset',
            filePath: '/uploads/datasets/customer_reviews_q1.json',
            fileSize: 4194304,
            rowCount: 9342,
            columnCount: 7,
            columnsJson: [
                'review_id',
                'product_name',
                'rating',
                'review_text',
                'sentiment',
                'reviewer_location',
                'review_date'
            ],
            fileFormat: 'json',
            uploadedAt: daysAgo(22),
            updatedAt: daysAgo(22),
        },
        {
            workspaceId: 2,
            name: 'Social Media Comments',
            filePath: '/uploads/datasets/social_comments_march.yml',
            fileSize: 2621440,
            rowCount: 5623,
            columnCount: 5,
            columnsJson: [
                'comment_id',
                'post_type',
                'comment_text',
                'engagement_score',
                'timestamp'
            ],
            fileFormat: 'yml',
            uploadedAt: daysAgo(15),
            updatedAt: daysAgo(15),
        },
    ];

    await db.insert(datasets).values(sampleDatasets);
    
    console.log('✅ Datasets seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});