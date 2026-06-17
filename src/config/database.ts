import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';

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

const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
    host: dbHost,
    port: dbPort,
    dialect: 'mysql',
    logging: false, // Tắt log query trên terminal
});

const connectDB = async (): Promise<void> => {
    try {
        await sequelize.authenticate();
        console.log('Kết nối Database thành công!');
    } catch (error) {
        console.error('Kết nối Database thất bại:', error);
        throw error;
    }
};

export { sequelize, connectDB };
