const {DataTypes, Model} = require('sequelize');
const sequelize = require('../../../config/sequelize');

class _Advantage extends Model {
}

_Advantage.init({
    name: {
        type: DataTypes.STRING(64),
        allowNull: false,
        validate: {
            len: [1, 64]
        }
    },
    description: {
        type: DataTypes.STRING(128),
        allowNull: false,
        validate: {
            len: [1, 128]
        }
    },
    is_delete: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
}, {
    sequelize,
    modelName: '_Advantage'
});

module.exports = _Advantage;