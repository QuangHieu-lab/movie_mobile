import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
dotenv.config();

import { connectDB } from '../config/database';
import '../models';
import User from '../models/User';

async function seed() {
    await connectDB();

    const accounts = [
        { full_name: 'Test User', email: 'user@gmail.com', password: 'user', role: 'USER' as const, date_of_birth: '2000-01-01' },
        { full_name: 'Admin CineBook', email: 'admin@gmail.com', password: 'admin', role: 'ADMIN' as const, date_of_birth: '1990-01-01' },
    ];

    for (const acc of accounts) {
        const existing = await User.findOne({ where: { email: acc.email } });
        if (existing) {
            await existing.update({
                password_hash: await bcrypt.hash(acc.password, 10),
                role: acc.role,
                is_active: true,
            });
            console.log(`Updated: ${acc.email} (${acc.role})`);
        } else {
            await User.create({
                full_name: acc.full_name,
                email: acc.email,
                password_hash: await bcrypt.hash(acc.password, 10),
                role: acc.role,
                date_of_birth: acc.date_of_birth,
                is_active: true,
            });
            console.log(`Created: ${acc.email} (${acc.role})`);
        }
    }

    console.log('\nDone! Test accounts:');
    console.log('  user@gmail.com  / user  (USER)');
    console.log('  admin@gmail.com / admin (ADMIN)');
    process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
