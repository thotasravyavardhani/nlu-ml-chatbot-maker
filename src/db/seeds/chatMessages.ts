import { db } from '@/db';
import { chatMessages } from '@/db/schema';

async function main() {
    const now = new Date();
    const tenDaysAgo = new Date(now);
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
    const eightDaysAgo = new Date(now);
    eightDaysAgo.setDate(eightDaysAgo.getDate() - 8);
    const fiveDaysAgo = new Date(now);
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

    const sampleChatMessages = [
        {
            chatSessionId: 1,
            messageText: 'Hi, I need help',
            isUser: true,
            intentDetected: 'greet',
            confidenceScore: 0.95,
            createdAt: new Date(tenDaysAgo.setHours(10, 0, 0, 0)).toISOString(),
        },
        {
            chatSessionId: 1,
            messageText: "Hello! I'm here to help. What can I do for you today?",
            isUser: false,
            intentDetected: null,
            confidenceScore: null,
            createdAt: new Date(tenDaysAgo.setHours(10, 0, 5, 0)).toISOString(),
        },
        {
            chatSessionId: 1,
            messageText: 'I want to track my order #12345',
            isUser: true,
            intentDetected: 'track_order',
            confidenceScore: 0.92,
            createdAt: new Date(tenDaysAgo.setHours(10, 1, 0, 0)).toISOString(),
        },
        {
            chatSessionId: 1,
            messageText: 'Let me check that for you. Your order #12345 is out for delivery and will arrive today.',
            isUser: false,
            intentDetected: null,
            confidenceScore: null,
            createdAt: new Date(tenDaysAgo.setHours(10, 1, 15, 0)).toISOString(),
        },
        {
            chatSessionId: 1,
            messageText: 'Thank you!',
            isUser: true,
            intentDetected: 'thank',
            confidenceScore: 0.97,
            createdAt: new Date(tenDaysAgo.setHours(10, 2, 0, 0)).toISOString(),
        },
        {
            chatSessionId: 1,
            messageText: "You're welcome! Is there anything else I can help with?",
            isUser: false,
            intentDetected: null,
            confidenceScore: null,
            createdAt: new Date(tenDaysAgo.setHours(10, 2, 5, 0)).toISOString(),
        },
        {
            chatSessionId: 2,
            messageText: 'How do I return an item?',
            isUser: true,
            intentDetected: 'return_item',
            confidenceScore: 0.89,
            createdAt: new Date(eightDaysAgo.setHours(14, 30, 0, 0)).toISOString(),
        },
        {
            chatSessionId: 2,
            messageText: 'I can help you with returns. Please provide your order number.',
            isUser: false,
            intentDetected: null,
            confidenceScore: null,
            createdAt: new Date(eightDaysAgo.setHours(14, 30, 10, 0)).toISOString(),
        },
        {
            chatSessionId: 2,
            messageText: 'Order #67890',
            isUser: true,
            intentDetected: 'track_order',
            confidenceScore: 0.78,
            createdAt: new Date(eightDaysAgo.setHours(14, 31, 0, 0)).toISOString(),
        },
        {
            chatSessionId: 3,
            messageText: 'The new feature is great!',
            isUser: true,
            intentDetected: 'positive_feedback',
            confidenceScore: 0.94,
            createdAt: new Date(fiveDaysAgo.setHours(11, 0, 0, 0)).toISOString(),
        },
        {
            chatSessionId: 3,
            messageText: "Thank you for your feedback! We're glad you like it.",
            isUser: false,
            intentDetected: null,
            confidenceScore: null,
            createdAt: new Date(fiveDaysAgo.setHours(11, 0, 8, 0)).toISOString(),
        },
        {
            chatSessionId: 3,
            messageText: 'Can you add dark mode?',
            isUser: true,
            intentDetected: 'feature_request',
            confidenceScore: 0.91,
            createdAt: new Date(fiveDaysAgo.setHours(11, 1, 0, 0)).toISOString(),
        },
    ];

    await db.insert(chatMessages).values(sampleChatMessages);
    
    console.log('✅ Chat messages seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});