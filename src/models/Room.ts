import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface RoomAttributes {
    room_id: number;
    name: string;
    total_seats: number;
}

type RoomCreationAttributes = Optional<RoomAttributes, 'room_id'>;

class Room extends Model<RoomAttributes, RoomCreationAttributes> implements RoomAttributes {
    public room_id!: number;
    public name!: string;
    public total_seats!: number;
}

Room.init(
    {
        room_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        name: { type: DataTypes.STRING(50), allowNull: false, unique: true },
        total_seats: { type: DataTypes.INTEGER, allowNull: false },
    },
    { sequelize, modelName: 'Room', tableName: 'Rooms', timestamps: false },
);

export default Room;
