import { db } from '@/db';
import { users } from '@/db/schema';

async function main() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const sampleUsers = [
        {
            email: 'demo@nluapp.com',
            passwordHash: '$2b$10$abcdefghijklmnopqrstuvwxyz123456',
            fullName: 'Demo User',
            createdAt: thirtyDaysAgo.toISOString(),
            updatedAt: thirtyDaysAgo.toISOString(),
        }
    ];

    await db.insert(users).values(sampleUsers);
    
    console.log('✅ Users seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});