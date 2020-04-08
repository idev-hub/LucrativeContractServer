const {DataTypes, Model} = require('sequelize');
const sequelize = require('../../../config/sequelize');

class PurchaseAdvantage extends Model {
}

PurchaseAdvantage.init({
    purchase_id: {
        type: DataTypes.INTEGER
    },
    advantage_id: {
        type: DataTypes.INTEGER
    }
}, {
    sequelize,
    modelName: 'PurchaseAdvantage'
});

module.exports = PurchaseAdvantage;