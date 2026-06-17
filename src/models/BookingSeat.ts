import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface BookingSeatAttributes {
    booking_seat_id: number;
    booking_id: number;
    showtime_id: number;
    seat_id: number;
    price: number;
}

type BookingSeatCreationAttributes = Optional<BookingSeatAttributes, 'booking_seat_id'>;

class BookingSeat extends Model<BookingSeatAttributes, BookingSeatCreationAttributes> implements BookingSeatAttributes {
    public booking_seat_id!: number;
    public booking_id!: number;
    public showtime_id!: number;
    public seat_id!: number;
    public price!: number;
}

BookingSeat.init(
    {
        booking_seat_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        booking_id: { type: DataTypes.INTEGER, allowNull: false },
        showtime_id: { type: DataTypes.INTEGER, allowNull: false },
        seat_id: { type: DataTypes.INTEGER, allowNull: false },
        price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    },
    {
        sequelize,
        modelName: 'BookingSeat',
        tableName: 'Booking_Seats',
        timestamps: false,
        indexes: [{ unique: true, fields: ['showtime_id', 'seat_id'] }],
    },
);

export default BookingSeat;
