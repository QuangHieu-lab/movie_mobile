import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export type SeatType = 'STANDARD' | 'VIP' | 'COUPLE';
export type SeatPhysicalStatus = 'ACTIVE' | 'MAINTENANCE';

interface SeatAttributes {
    seat_id: number;
    room_id: number;
    row_name: string;
    seat_number: number;
    type: SeatType;
    physical_status: SeatPhysicalStatus;
}

type SeatCreationAttributes = Optional<SeatAttributes, 'seat_id' | 'type' | 'physical_status'>;

class Seat extends Model<SeatAttributes, SeatCreationAttributes> implements SeatAttributes {
    public seat_id!: number;
    public room_id!: number;
    public row_name!: string;
    public seat_number!: number;
    public type!: SeatType;
    public physical_status!: SeatPhysicalStatus;
}

Seat.init(
    {
        seat_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        room_id: { type: DataTypes.INTEGER, allowNull: false },
        row_name: { type: DataTypes.STRING(5), allowNull: false },
        seat_number: { type: DataTypes.INTEGER, allowNull: false },
        type: { type: DataTypes.ENUM('STANDARD', 'VIP', 'COUPLE'), defaultValue: 'STANDARD' },
        physical_status: { type: DataTypes.ENUM('ACTIVE', 'MAINTENANCE'), defaultValue: 'ACTIVE' },
    },
    {
        sequelize,
        modelName: 'Seat',
        tableName: 'Seats',
        timestamps: false,
        indexes: [{ unique: true, fields: ['room_id', 'row_name', 'seat_number'] }],
    },
);

export default Seat;
