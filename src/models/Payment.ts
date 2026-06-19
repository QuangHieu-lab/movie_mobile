import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export type PaymentMethod = 'VNPAY' | 'MOMO' | 'ZALOPAY' | 'CREDIT_CARD' | 'CASH';
export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'EXPIRED' | 'REFUNDED';

interface PaymentAttributes {
    payment_id: number;
    booking_id: number;
    order_id: string;
    transaction_reference?: string | null;
    amount: number;
    payment_method: PaymentMethod;
    payment_status: PaymentStatus;
    gateway_response_code?: string | null;
    raw_response_log?: object | null; // Sử dụng object để chứa chuỗi JSON từ Webhook
    paid_at?: Date | null;
    created_at?: Date;
    updated_at?: Date;
}

// Chỉ định các trường không bắt buộc khi tạo (create) một record mới
type PaymentCreationAttributes = Optional<
    PaymentAttributes, 
    'payment_id' | 'transaction_reference' | 'payment_status' | 'gateway_response_code' | 'raw_response_log' | 'paid_at' | 'created_at' | 'updated_at'
>;

class Payment extends Model<PaymentAttributes, PaymentCreationAttributes> implements PaymentAttributes {
    public payment_id!: number;
    public booking_id!: number;
    public order_id!: string;
    public transaction_reference!: string | null;
    public amount!: number;
    public payment_method!: PaymentMethod;
    public payment_status!: PaymentStatus;
    public gateway_response_code!: string | null;
    public raw_response_log!: object | null;
    public paid_at!: Date | null;
    public created_at!: Date;
    public updated_at!: Date;
}

Payment.init(
    {
        payment_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        booking_id: { type: DataTypes.INTEGER, allowNull: false },
        order_id: { type: DataTypes.STRING(100), allowNull: false, unique: true },
        transaction_reference: { type: DataTypes.STRING(255), unique: true, allowNull: true },
        
        // Sequelize lưu DECIMAL, nhưng khi lấy ra có thể trả về string để tránh sai số dấu phẩy động
        amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false }, 
        
        payment_method: { 
            type: DataTypes.ENUM('VNPAY', 'MOMO', 'ZALOPAY', 'CREDIT_CARD', 'CASH'), 
            allowNull: false 
        },
        payment_status: { 
            type: DataTypes.ENUM('PENDING', 'SUCCESS', 'FAILED', 'EXPIRED', 'REFUNDED'), 
            defaultValue: 'PENDING' 
        },
        gateway_response_code: { type: DataTypes.STRING(50), allowNull: true },
        raw_response_log: { type: DataTypes.JSON, allowNull: true },
        paid_at: { type: DataTypes.DATE, allowNull: true },
        created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
        updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    { 
        sequelize, 
        modelName: 'Payment', 
        tableName: 'Payments', 
        timestamps: false // Tắt tự động timestamps vì đã define thủ công created_at/updated_at
    }
);

export default Payment;