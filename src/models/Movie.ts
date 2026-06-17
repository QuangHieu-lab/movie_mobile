import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export type MovieStatus = 'UPCOMING' | 'NOW_SHOWING' | 'ENDED';

interface MovieAttributes {
    movie_id: number;
    api_movie_id: string;
    title: string;
    status: MovieStatus;
    duration_minutes?: number | null;
    age_restriction: number;
    created_at?: Date;
}

type MovieCreationAttributes = Optional<MovieAttributes, 'movie_id' | 'status' | 'duration_minutes' | 'age_restriction' | 'created_at'>;

class Movie extends Model<MovieAttributes, MovieCreationAttributes> implements MovieAttributes {
    public movie_id!: number;
    public api_movie_id!: string;
    public title!: string;
    public status!: MovieStatus;
    public duration_minutes!: number | null;
    public age_restriction!: number;
    public created_at!: Date;
}

Movie.init(
    {
        movie_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        api_movie_id: { type: DataTypes.STRING(100), allowNull: false, unique: true },
        title: { type: DataTypes.STRING(255), allowNull: false },
        status: { type: DataTypes.ENUM('UPCOMING', 'NOW_SHOWING', 'ENDED'), defaultValue: 'UPCOMING' },
        duration_minutes: { type: DataTypes.INTEGER, allowNull: true },
        age_restriction: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    { sequelize, modelName: 'Movie', tableName: 'Movies', timestamps: false },
);

export default Movie;
