const {DataTypes, Model} = require('sequelize');
const sequelize = require('../../../config/sequelize');

class PurchaseHistory extends Model {
}

PurchaseHistory.init({
    purchase_id: {
        type: DataTypes.INTEGER,
        references: {
            model: sequelize.models.Purchase,
            key: 'id'
        }
    },
    user_id: {
        type: DataTypes.INTEGER,
        references: {
            model: sequelize.models.User,
            key: 'id'
        }
    },
    title: {
        type: DataTypes.STRING(128),
        allowNull: false,
        validate: {
            len: [3, 128]
        }
    }
}, {
    sequelize,
    modelName: 'PurchaseHistory'
});

module.exports = PurchaseHistory;