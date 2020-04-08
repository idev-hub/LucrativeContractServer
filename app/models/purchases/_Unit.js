const {DataTypes, Model} = require('sequelize');
const sequelize = require('../../../config/sequelize');

class _Unit extends Model {
}

_Unit.init({
    full_name: {
        type: DataTypes.STRING(32),
        allowNull: false,
        validate: {
            len: [1, 32]
        }
    },
    name: {
        type: DataTypes.STRING(7),
        allowNull: false,
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
    modelName: '_Unit'
});

module.exports = _Unit;