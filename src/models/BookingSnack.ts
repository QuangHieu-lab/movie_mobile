import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface BookingSnackAttributes {
    booking_snack_id: number;
    booking_id: number;
    snack_id: number;
    quantity: number;
    price_at_purchase: number;
}

type BookingSnackCreationAttributes = Optional<BookingSnackAttributes, 'booking_snack_id' | 'quantity'>;

class BookingSnack extends Model<BookingSnackAttributes, BookingSnackCreationAttributes> implements BookingSnackAttributes {
    public booking_snack_id!: number;
    public booking_id!: number;
    public snack_id!: number;
    public quantity!: number;
    public price_at_purchase!: number;
}

BookingSnack.init(
    {
        booking_snack_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        booking_id: { type: DataTypes.INTEGER, allowNull: false },
        snack_id: { type: DataTypes.INTEGER, allowNull: false },
        quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
        price_at_purchase: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    },
    { sequelize, modelName: 'BookingSnack', tableName: 'Booking_Snacks', timestamps: false },
);

export default BookingSnack;
