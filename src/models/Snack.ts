import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export type SnackType = 'POPCORN' | 'DRINK' | 'COMBO';
export type SnackStatus = 'AVAILABLE' | 'OUT_OF_STOCK';

interface SnackAttributes {
    snack_id: number;
    name: string;
    type: SnackType;
    price: number;
    status: SnackStatus;
}

type SnackCreationAttributes = Optional<SnackAttributes, 'snack_id' | 'status'>;

class Snack extends Model<SnackAttributes, SnackCreationAttributes> implements SnackAttributes {
    public snack_id!: number;
    public name!: string;
    public type!: SnackType;
    public price!: number;
    public status!: SnackStatus;
}

Snack.init(
    {
        snack_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        name: { type: DataTypes.STRING(100), allowNull: false },
        type: { type: DataTypes.ENUM('POPCORN', 'DRINK', 'COMBO'), allowNull: false },
        price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
        status: { type: DataTypes.ENUM('AVAILABLE', 'OUT_OF_STOCK'), defaultValue: 'AVAILABLE' },
    },
    { sequelize, modelName: 'Snack', tableName: 'Snacks', timestamps: false },
);

export default Snack;
