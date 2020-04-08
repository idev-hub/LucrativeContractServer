const {DataTypes, Model} = require('sequelize');
const sequelize = require('../../../config/sequelize');

class ChatHistory extends Model {
}

ChatHistory.init({
    title: {
        type: DataTypes.STRING(32),
        allowNull: false,
        validate: {
            len: [1, 32]
        }
    }
}, {
    sequelize,
    modelName: 'ChatHistory'
});

module.exports = ChatHistory;