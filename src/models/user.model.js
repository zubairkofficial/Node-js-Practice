const { DataTypes } = require('sequelize');
const sequelize = require('../Config/database');
const bcrypt = require('bcrypt');


const User = sequelize.define('User', {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
    },
    firstName: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'first_name'
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'last_name'
    },
    email: {
        type: DataTypes.STRING,
        field: 'email',
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: DataTypes.STRING,
        field: 'password',
        allowNull: false,
    },
    profilePicture: {
        type: DataTypes.STRING,
        field: 'profile_picture',
        allowNull: true,
    },
    resetOtp: {
        type : DataTypes.STRING,
        field: 'reset_otp',
        allowNull: true,
    },
    resetOtpExpires: {
        type: DataTypes.DATE,
        field: 'reset_otp_expires',
        allowNull: true,    
    },
    isVerified: {
        type: DataTypes.BOOLEAN,
        field: 'is_verified',
        allowNull: true,
    },
}, {
    tableName: 'user',
    timestamps: true,
    underscored: true,
    paranoided: true,
    hooks: {
        beforeCreate: async (user) => {
            if (user.password) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(user.password, salt);
            }
        }
    }
});

User.prototype.validatePassword = async function(password) {
    return await bcrypt.compare(password, this.password);
};


module.exports = User;