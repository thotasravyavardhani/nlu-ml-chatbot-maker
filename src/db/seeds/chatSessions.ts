import { db } from '@/db';
import { chatSessions } from '@/db/schema';

async function main() {
    const now = new Date();
    
    const tenDaysAgo = new Date(now);
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
    tenDaysAgo.setHours(10, 0, 0, 0);
    
    const tenDaysAgoEnd = new Date(tenDaysAgo);
    tenDaysAgoEnd.setMinutes(15);
    
    const eightDaysAgo = new Date(now);
    eightDaysAgo.setDate(eightDaysAgo.getDate() - 8);
    eightDaysAgo.setHours(14, 30, 0, 0);
    
    const eightDaysAgoEnd = new Date(eightDaysAgo);
    eightDaysAgoEnd.setMinutes(45);
    
    const fiveDaysAgo = new Date(now);
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
    fiveDaysAgo.setHours(11, 0, 0, 0);
    
    const fiveDaysAgoEnd = new Date(fiveDaysAgo);
    fiveDaysAgoEnd.setMinutes(20);
    
    const sampleChatSessions = [
        {
            workspaceId: 1,
            nluModelId: 1,
            startedAt: tenDaysAgo.toISOString(),
            endedAt: tenDaysAgoEnd.toISOString(),
        },
        {
            workspaceId: 1,
            nluModelId: 1,
            startedAt: eightDaysAgo.toISOString(),
            endedAt: eightDaysAgoEnd.toISOString(),
        },
        {
            workspaceId: 2,
            nluModelId: 2,
            startedAt: fiveDaysAgo.toISOString(),
            endedAt: fiveDaysAgoEnd.toISOString(),
        }
    ];

    await db.insert(chatSessions).values(sampleChatSessions);
    
    console.log('✅ Chat sessions seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});