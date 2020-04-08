const {DataTypes, Model} = require('sequelize');
const sequelize = require('../../../config/sequelize');

class UserCompany extends Model {
}

UserCompany.init({
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
    address: {
        type: DataTypes.STRING(128),
        allowNull: false,
        validate: {
            len: [3, 128]
        }
    },
    taxpayer_identification_number: {
        type: DataTypes.STRING(12),
        allowNull: false,
        validate: {
            len: [10, 12]
        }
    },
    code_reason: {
        type: DataTypes.STRING(9),
        allowNull: false,
        validate: {
            len: [9, 9]
        }
    }
}, {
    sequelize,
    modelName: 'UserCompany'
});

module.exports = UserCompany;