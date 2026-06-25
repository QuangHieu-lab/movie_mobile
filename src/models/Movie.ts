import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export type MovieStatus = 'UPCOMING' | 'NOW_SHOWING' | 'ENDED';

interface MovieAttributes {
    movie_id: number;
    api_movie_id: string;
    title: string;
    genre?: string | null;
    rating?: string | null;
    description?: string | null;
    director?: string | null;
    cast?: string[] | null;
    language?: string | null;
    first_showing?: string | null;
    poster_url?: string | null;
    color_primary?: string | null;
    color_secondary?: string | null;
    status: MovieStatus;
    duration_minutes?: number | null;
    age_restriction?: number;
    created_at?: Date;
}

type MovieCreationAttributes = Optional<MovieAttributes, 'movie_id' | 'genre' | 'rating' | 'description' | 'director' | 'cast' | 'language' | 'first_showing' | 'poster_url' | 'color_primary' | 'color_secondary' | 'status' | 'duration_minutes' | 'age_restriction' | 'created_at'>;

class Movie extends Model<MovieAttributes, MovieCreationAttributes> implements MovieAttributes {
    public movie_id!: number;
    public api_movie_id!: string;
    public title!: string;
    public genre!: string | null;
    public rating!: string | null;
    public description!: string | null;
    public director!: string | null;
    public cast!: string[] | null;
    public language!: string | null;
    public first_showing!: string | null;
    public poster_url!: string | null;
    public color_primary!: string | null;
    public color_secondary!: string | null;
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
        genre: { type: DataTypes.STRING(255), allowNull: true },
        rating: { type: DataTypes.STRING(20), allowNull: true },
        description: { type: DataTypes.TEXT, allowNull: true },
        director: { type: DataTypes.STRING(255), allowNull: true },
        cast: { type: DataTypes.JSON, allowNull: true },
        language: { type: DataTypes.STRING(255), allowNull: true },
        first_showing: { type: DataTypes.STRING(100), allowNull: true },
        poster_url: { type: DataTypes.STRING(500), allowNull: true },
        color_primary: { type: DataTypes.STRING(20), allowNull: true },
        color_secondary: { type: DataTypes.STRING(20), allowNull: true },
        status: { type: DataTypes.ENUM('UPCOMING', 'NOW_SHOWING', 'ENDED'), defaultValue: 'UPCOMING' },
        duration_minutes: { type: DataTypes.INTEGER, allowNull: true },
        age_restriction: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    { sequelize, modelName: 'Movie', tableName: 'Movies', timestamps: false },
);

export default Movie;
