const {DataTypes, Model} = require('sequelize');
const sequelize = require('../../../config/sequelize');

class PurchaseDocument extends Model {
}

PurchaseDocument.init({
    purchase_id: {
        type: DataTypes.INTEGER,
        references: {
            model: sequelize.models.Purchase,
            key: 'id'
        }
    },
    document_url: {
        type: DataTypes.STRING(128),
        allowNull: false,
        validate: {
            len: [3, 128]
        }
    }
}, {
    sequelize,
    modelName: 'PurchaseDocument'
});

module.exports = PurchaseDocument;