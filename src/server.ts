const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

// Load biến môi trường
dotenv.config();

const dbName = process.env.DB_NAME as string;
const dbUser = process.env.DB_USER as string;
const dbPassword = process.env.DB_PASSWORD;
const dbHost = process.env.DB_HOST;

const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
    host: dbHost,
    dialect: 'mysql',
    logging: false, // Tắt log query trên terminal
});

const connectDB = async (): Promise<void> => {
    try {
        await sequelize.authenticate();
        console.log('✅ Kết nối Database thành công!');
    } catch (error) {
        console.error('❌ Kết nối Database thất bại:', error);
    }
};

module.exports = { sequelize, connectDB };