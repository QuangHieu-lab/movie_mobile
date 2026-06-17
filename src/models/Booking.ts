import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export type PaymentMethod = 'CREDIT_CARD' | 'E_WALLET' | 'BANK_TRANSFER' | 'CASH';
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
export type BookingStatus = 'RESERVED' | 'CONFIRMED' | 'CANCELLED';

interface BookingAttributes {
    booking_id: number;
    user_id: number;
    showtime_id: number;
    total_amount: number;
    payment_method: PaymentMethod;
    payment_status: PaymentStatus;
    booking_status: BookingStatus;
    created_at?: Date;
}

type BookingCreationAttributes = Optional<BookingAttributes, 'booking_id' | 'payment_status' | 'booking_status' | 'created_at'>;

class Booking extends Model<BookingAttributes, BookingCreationAttributes> implements BookingAttributes {
    public booking_id!: number;
    public user_id!: number;
    public showtime_id!: number;
    public total_amount!: number;
    public payment_method!: PaymentMethod;
    public payment_status!: PaymentStatus;
    public booking_status!: BookingStatus;
    public created_at!: Date;
}

Booking.init(
    {
        booking_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        user_id: { type: DataTypes.INTEGER, allowNull: false },
        showtime_id: { type: DataTypes.INTEGER, allowNull: false },
        total_amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
        payment_method: { type: DataTypes.ENUM('CREDIT_CARD', 'E_WALLET', 'BANK_TRANSFER', 'CASH'), allowNull: false },
        payment_status: { type: DataTypes.ENUM('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'), defaultValue: 'PENDING' },
        booking_status: { type: DataTypes.ENUM('RESERVED', 'CONFIRMED', 'CANCELLED'), defaultValue: 'RESERVED' },
        created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    { sequelize, modelName: 'Booking', tableName: 'Bookings', timestamps: false },
);

export default Booking;
