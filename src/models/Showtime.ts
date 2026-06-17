import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface ShowtimeAttributes {
    showtime_id: number;
    movie_id: number;
    room_id: number;
    start_time: Date;
    end_time: Date;
    price: number;
}

type ShowtimeCreationAttributes = Optional<ShowtimeAttributes, 'showtime_id'>;

class Showtime extends Model<ShowtimeAttributes, ShowtimeCreationAttributes> implements ShowtimeAttributes {
    public showtime_id!: number;
    public movie_id!: number;
    public room_id!: number;
    public start_time!: Date;
    public end_time!: Date;
    public price!: number;
}

Showtime.init(
    {
        showtime_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        movie_id: { type: DataTypes.INTEGER, allowNull: false },
        room_id: { type: DataTypes.INTEGER, allowNull: false },
        start_time: { type: DataTypes.DATE, allowNull: false },
        end_time: { type: DataTypes.DATE, allowNull: false },
        price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    },
    {
        sequelize,
        modelName: 'Showtime',
        tableName: 'Showtimes',
        timestamps: false,
        indexes: [
            { fields: ['movie_id', 'start_time'] },
            { fields: ['room_id', 'start_time'] },
        ],
    },
);

export default Showtime;
