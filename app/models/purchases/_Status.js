const {DataTypes, Model} = require('sequelize');
const sequelize = require('../../../config/sequelize');

class _Status extends Model {
}

_Status.init({
    name: {
        type: DataTypes.STRING(32),
        allowNull: false,
        validate: {
            len: [3, 32]
        }
    },
    code: {
        type: DataTypes.STRING(7),
        allowNull: false,
        defaultValue: "#000000",
        validate: {
            len: [1, 7]
        }
    },
    is_delete: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
}, {
    sequelize,
    modelName: '_Status'
});

module.exports = _Status;