const {DataTypes, Model} = require('sequelize');
const sequelize = require('../../../config/sequelize');

class UserBank extends Model {
}

UserBank.init({
    user_id: {
        type: DataTypes.INTEGER,
        references: {
            model: sequelize.models.User,
            key: 'id'
        }
    },
    name: {
        type: DataTypes.STRING(32),
        allowNull: false,
        validate: {
            len: [3, 32]
        }
    },
    payment_account: {
        type: DataTypes.STRING(20),
        allowNull: false,
        validate: {
            len: [16, 20]
        }
    },
    correspondent_account: {
        type: DataTypes.STRING(20),
        allowNull: false,
        validate: {
            len: [16, 20]
        }
    },
    bank_identification_code: {
        type: DataTypes.STRING(9),
        allowNull: false,
        validate: {
            len: [9, 9]
        }
    }
}, {
    sequelize,
    modelName: 'UserBank'
});

module.exports = UserBank;