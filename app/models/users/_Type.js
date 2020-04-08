const { DataTypes, Model } = require('sequelize');
const sequelize = require('../../../config/sequelize');

class _Type extends Model {

}

_Type.init({
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [3, 32]
        }
    },
    reserved: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    is_delete: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
}, {
    sequelize,
    modelName: '_Type'
});

module.exports = _Type;