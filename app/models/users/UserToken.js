const {DataTypes, Model} = require('sequelize');
const sequelize = require('../../../config/sequelize');

class UserToken extends Model {
}

UserToken.init({
    user_id: {
        type: DataTypes.INTEGER,
        references: {
            model: sequelize.models.User,
            key: 'id'
        }
    },
    token: {
        type: DataTypes.STRING(128),
        allowNull: false,
        validate: {
            len: [1, 128]
        }
    }
}, {
    sequelize,
    modelName: 'UserToken'
});

module.exports = UserToken;