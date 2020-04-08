const {DataTypes, Model} = require('sequelize');
const sequelize = require('../../../config/sequelize');

class _Method extends Model {
}

_Method.init({
    name: {
        type: DataTypes.STRING(32),
        allowNull: false,
        validate: {
            len: [1, 32]
        }
    },
    is_delete: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
}, {
    sequelize,
    modelName: '_Method'
});

module.exports = _Method;