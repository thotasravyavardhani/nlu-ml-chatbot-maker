import { db } from '@/db';
import { annotations } from '@/db/schema';

async function main() {
    const now = new Date();
    const baseDate = new Date(now.getTime() - (21 * 24 * 60 * 60 * 1000)); // 21 days ago

    const sampleAnnotations = [
        {
            nluModelId: 1,
            text: 'Hello, I need help with my order',
            intent: 'greet',
            entitiesJson: null,
            createdAt: new Date(baseDate.getTime()).toISOString(),
            updatedAt: new Date(baseDate.getTime()).toISOString(),
        },
        {
            nluModelId: 1,
            text: 'I want to track my order #12345',
            intent: 'track_order',
            entitiesJson: JSON.stringify([{ entity: 'order_id', value: '12345', start: 26, end: 31 }]),
            createdAt: new Date(baseDate.getTime() + (1 * 24 * 60 * 60 * 1000)).toISOString(),
            updatedAt: new Date(baseDate.getTime() + (1 * 24 * 60 * 60 * 1000)).toISOString(),
        },
        {
            nluModelId: 1,
            text: 'How do I return my laptop?',
            intent: 'return_item',
            entitiesJson: JSON.stringify([{ entity: 'product_name', value: 'laptop', start: 19, end: 25 }]),
            createdAt: new Date(baseDate.getTime() + (2 * 24 * 60 * 60 * 1000)).toISOString(),
            updatedAt: new Date(baseDate.getTime() + (2 * 24 * 60 * 60 * 1000)).toISOString(),
        },
        {
            nluModelId: 1,
            text: 'I need a refund for $150',
            intent: 'ask_refund',
            entitiesJson: JSON.stringify([{ entity: 'amount', value: '150', start: 20, end: 24 }]),
            createdAt: new Date(baseDate.getTime() + (3 * 24 * 60 * 60 * 1000)).toISOString(),
            updatedAt: new Date(baseDate.getTime() + (3 * 24 * 60 * 60 * 1000)).toISOString(),
        },
        {
            nluModelId: 1,
            text: 'Thank you for your help!',
            intent: 'thank',
            entitiesJson: null,
            createdAt: new Date(baseDate.getTime() + (4 * 24 * 60 * 60 * 1000)).toISOString(),
            updatedAt: new Date(baseDate.getTime() + (4 * 24 * 60 * 60 * 1000)).toISOString(),
        },
        {
            nluModelId: 1,
            text: 'Can I speak to a human agent?',
            intent: 'ask_human_agent',
            entitiesJson: null,
            createdAt: new Date(baseDate.getTime() + (5 * 24 * 60 * 60 * 1000)).toISOString(),
            updatedAt: new Date(baseDate.getTime() + (5 * 24 * 60 * 60 * 1000)).toISOString(),
        },
        {
            nluModelId: 2,
            text: 'This product is amazing! Best purchase ever',
            intent: 'positive_feedback',
            entitiesJson: null,
            createdAt: new Date(baseDate.getTime() + (6 * 24 * 60 * 60 * 1000)).toISOString(),
            updatedAt: new Date(baseDate.getTime() + (6 * 24 * 60 * 60 * 1000)).toISOString(),
        },
        {
            nluModelId: 2,
            text: 'The camera quality is terrible and disappointing',
            intent: 'negative_feedback',
            entitiesJson: JSON.stringify([{ entity: 'feature', value: 'camera quality', start: 4, end: 18 }]),
            createdAt: new Date(baseDate.getTime() + (7 * 24 * 60 * 60 * 1000)).toISOString(),
            updatedAt: new Date(baseDate.getTime() + (7 * 24 * 60 * 60 * 1000)).toISOString(),
        },
        {
            nluModelId: 2,
            text: 'Please add dark mode to the app',
            intent: 'feature_request',
            entitiesJson: JSON.stringify([{ entity: 'feature', value: 'dark mode', start: 11, end: 20 }]),
            createdAt: new Date(baseDate.getTime() + (8 * 24 * 60 * 60 * 1000)).toISOString(),
            updatedAt: new Date(baseDate.getTime() + (8 * 24 * 60 * 60 * 1000)).toISOString(),
        },
        {
            nluModelId: 2,
            text: 'The app crashes when I upload photos',
            intent: 'bug_report',
            entitiesJson: JSON.stringify([{ entity: 'issue_type', value: 'crashes', start: 8, end: 15 }]),
            createdAt: new Date(baseDate.getTime() + (9 * 24 * 60 * 60 * 1000)).toISOString(),
            updatedAt: new Date(baseDate.getTime() + (9 * 24 * 60 * 60 * 1000)).toISOString(),
        },
    ];

    await db.insert(annotations).values(sampleAnnotations);

    console.log('✅ Annotations seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});