import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

// Load biến môi trường
dotenv.config();

let sequelize: Sequelize;

// Ưu tiên 1: Dùng chuỗi kết nối tổng (thường dùng trên các Cloud như Render)
if (process.env.DATABASE_URL) {
    sequelize = new Sequelize(process.env.DATABASE_URL, {
        dialect: 'mysql',
        logging: false, // Tắt log query trên terminal
    });
} else {
    // Ưu tiên 2: Dùng các biến lẻ (thường dùng khi chạy dưới localhost)
    const dbName = process.env.DB_NAME;
    const dbUser = process.env.DB_USER;
    const dbPassword = process.env.DB_PASSWORD;
    const dbHost = process.env.DB_HOST;
    const dbPort = Number(process.env.DB_PORT || 3306);

    if (!dbName || !dbUser || !dbHost) {
        throw new Error('Missing database config. Please set DATABASE_URL or DB_NAME, DB_USER, and DB_HOST in .env');
    }

    sequelize = new Sequelize(dbName, dbUser, dbPassword, {
        host: dbHost,
        port: dbPort,
        dialect: 'mysql',
        logging: false, 
    });
}

export { sequelize };

export const connectDB = async (): Promise<void> => {
    try {
        await sequelize.authenticate();
        console.log('Kết nối Database thành công!');
    } catch (error) {
        console.error('Kết nối Database thất bại:', error);
        throw error; // Ném lỗi để server có thể bắt được và dừng lại nếu cần
    }
};