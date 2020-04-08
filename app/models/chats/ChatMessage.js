const {DataTypes, Model} = require('sequelize');
const sequelize = require('../../../config/sequelize');

class ChatMessage extends Model {
}

ChatMessage.init({
    message: {
        type: DataTypes.TEXT(),
        allowNull: false
    }
}, {
    sequelize,
    modelName: 'ChatMessage'
});

module.exports = ChatMessage;