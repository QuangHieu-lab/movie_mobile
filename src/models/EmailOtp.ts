import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface EmailOtpAttributes {
    email_otp_id: number;
    email: string;
    code_hash: string;
    expires_at: Date;
    attempts: number;
    created_at?: Date;
}

type EmailOtpCreationAttributes = Optional<EmailOtpAttributes, 'email_otp_id' | 'attempts' | 'created_at'>;

class EmailOtp extends Model<EmailOtpAttributes, EmailOtpCreationAttributes> implements EmailOtpAttributes {
    public email_otp_id!: number;
    public email!: string;
    public code_hash!: string;
    public expires_at!: Date;
    public attempts!: number;
    public created_at!: Date;
}

EmailOtp.init(
    {
        email_otp_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        email: { type: DataTypes.STRING(100), allowNull: false, unique: true },
        code_hash: { type: DataTypes.STRING(64), allowNull: false },
        expires_at: { type: DataTypes.DATE, allowNull: false },
        attempts: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    { sequelize, modelName: 'EmailOtp', tableName: 'Email_Otps', timestamps: false },
);

export default EmailOtp;
