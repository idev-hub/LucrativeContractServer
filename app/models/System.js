const { DataTypes, Model } = require('sequelize');
const sequelize = require('../../config/sequelize');

class _System extends Model {

}

_System.init({
    name: {
        type: DataTypes.STRING(64),
        allowNull: false,
        validate: {
            len: [1, 64]
        }
    },
    phone: {
        type: DataTypes.STRING(16),
        allowNull: false,
        validate: {
            len: [1, 16]
        }
    },
    email: {
        type: DataTypes.STRING(64),
        allowNull: false,
        validate: {
            isEmail: true
        }
    }
}, {
    sequelize,
    modelName: '_System'
});

module.exports = _System;