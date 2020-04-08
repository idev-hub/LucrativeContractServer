const {DataTypes, Model} = require('sequelize');
const sequelize = require('../../../config/sequelize');

class _ResponsiblePerson extends Model {
}

_ResponsiblePerson.init({
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    sequelize,
    modelName: '_ResponsiblePerson'
});

module.exports = _ResponsiblePerson;