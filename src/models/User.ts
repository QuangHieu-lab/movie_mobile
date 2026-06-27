import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface UserAttributes {
    user_id: number;
    full_name: string;
    email: string;
    phone?: string | null;
    date_of_birth?: Date | string | null;
    password_hash: string;
    role: 'USER' | 'ADMIN';
    is_active: boolean;
    created_at?: Date;
}

type UserCreationAttributes = Optional<UserAttributes, 'user_id' | 'phone' | 'date_of_birth' | 'created_at' | 'role' | 'is_active'>;

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
    public user_id!: number;
    public full_name!: string;
    public email!: string;
    public phone!: string | null;
    public date_of_birth!: Date | string | null;
    public password_hash!: string;
    public role!: 'USER' | 'ADMIN';
    public is_active!: boolean;
    public created_at!: Date;
}

User.init(
    {
        user_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        full_name: { type: DataTypes.STRING(100), allowNull: false },
        email: { type: DataTypes.STRING(100), allowNull: false, unique: true },
        phone: { type: DataTypes.STRING(20), allowNull: true, unique: true },
        password_hash: { type: DataTypes.STRING(255), allowNull: false },
        role: { type: DataTypes.ENUM('USER', 'ADMIN'), allowNull: false, defaultValue: 'USER' },
        is_active: { type: DataTypes.TINYINT, allowNull: false, defaultValue: 1 },
        date_of_birth: { type: DataTypes.DATEONLY, allowNull: true },
        created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    {
        sequelize,
        modelName: 'User',
        tableName: 'Users',
        timestamps: false,
    }
);

export default User;
