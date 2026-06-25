import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

// Load biến môi trường
dotenv.config();

const dbName = process.env.DB_NAME;
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const dbHost = process.env.DB_HOST;
const dbPort = Number(process.env.DB_PORT || 3306);

if (!dbName || !dbUser || !dbHost) {
    throw new Error('Missing database config. Please set DB_NAME, DB_USER, and DB_HOST in .env');
}

export const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
    host: dbHost,
    port: dbPort,
    dialect: 'mysql',
    logging: false, // Tắt log query trên terminal
});

const ensureDatabaseExists = async (): Promise<void> => {
    const adminConnection = new Sequelize('', dbUser, dbPassword, {
        host: dbHost,
        port: dbPort,
        dialect: 'mysql',
        logging: false,
    });

    try {
        await adminConnection.query(
            `CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
        );
    } finally {
        await adminConnection.close();
    }
};

export const connectDB = async (): Promise<void> => {
    try {
        await sequelize.authenticate();
        console.log('Kết nối Database thành công!');
    } catch (error: any) {
        if (error?.original?.code === 'ER_BAD_DB_ERROR') {
            await ensureDatabaseExists();
            await sequelize.authenticate();
            console.log(`Đã tạo database ${dbName} và kết nối thành công!`);
            return;
        }

        console.error('Kết nối Database thất bại:', error);
        throw error;
    }
};
