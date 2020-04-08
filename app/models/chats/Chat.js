const {DataTypes, Model} = require('sequelize');
const sequelize = require('../../../config/sequelize');

class Chat extends Model {
}

Chat.init({
    title: {
        type: DataTypes.STRING(32),
        allowNull: false,
        validate: {
            len: [1, 32]
        }
    }
}, {
    sequelize,
    modelName: 'Chat'
});

module.exports = Chat;