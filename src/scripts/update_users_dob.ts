import { User } from '../models';
import { connectDB, sequelize } from '../config/database';

const updateDob = async () => {
    try {
        await connectDB();
        
        // Cập nhật tất cả các user chưa có ngày sinh thành ngày 01/01/2000
        const [updatedCount] = await User.update(
            { date_of_birth: '2000-01-01' },
            { where: { date_of_birth: null } }
        );
        
        console.log(`✅ Đã cập nhật thành công ngày sinh (2000-01-01) cho ${updatedCount} user(s).`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Lỗi khi cập nhật:', error);
        process.exit(1);
    }
};

updateDob();
