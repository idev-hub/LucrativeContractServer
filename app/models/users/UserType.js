const {DataTypes, Model} = require('sequelize');
const sequelize = require('../../../config/sequelize');

class UserType extends Model {
}

UserType.init({
    user_id: {
      type: DataTypes.INTEGER,
      references: {
          model: sequelize.models.User,
          key: 'id'
      }
    },
    type_id: {
        type: DataTypes.INTEGER,
        references: {
            model: sequelize.models._Type,
            key: 'id'
        }
    }
}, {
    sequelize,
    modelName: 'UserType'
});

module.exports = UserType;