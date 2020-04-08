const {DataTypes, Model} = require('sequelize');
const sequelize = require('../../../config/sequelize');

class UserHistory extends Model {
}

UserHistory.init({
    user_id: {
        type: DataTypes.INTEGER,
        references: {
            model: sequelize.models.User,
            key: 'id'
        }
    },
    title: {
        type: DataTypes.STRING(128),
        allowNull: false,
        validate: {
            len: [1, 128]
        }
    }
}, {
    sequelize,
    modelName: 'UserHistory'
});

module.exports = UserHistory;