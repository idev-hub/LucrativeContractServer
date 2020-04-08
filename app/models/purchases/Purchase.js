const {DataTypes, Model} = require('sequelize');
const sequelize = require('../../../config/sequelize');

class Purchase extends Model {
}

Purchase.init({
    user_id: {
        type: DataTypes.INTEGER,
        references: {
            model: sequelize.models.User,
            key: 'id'
        }
    },
    responsible_id: {
        type: DataTypes.INTEGER,
        references: {
            model: sequelize.models.User,
            key: 'id'
        }
    },
    status_id: {
        type: DataTypes.INTEGER,
        references: {
            model: sequelize.models._Status,
            key: 'id'
        }
    },
    method_id: {
        type: DataTypes.INTEGER,
        references: {
            model: sequelize.models._Method,
            key: 'id'
        }
    },
    unit_id: {
        type: DataTypes.INTEGER,
        references: {
            model: sequelize.models._Unit,
            key: 'id'
        }
    },
    name: {
        type: DataTypes.STRING(32),
        allowNull: false,
        validate: {
            len: [1, 32]
        }
    },
    initial_maximum_contract_price: {
        type: DataTypes.DOUBLE(),
        allowNull: false
    },
    deadline: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        validate: {
            isDate: true
        }
    },
    quantity: {
        type: DataTypes.INTEGER(),
        allowNull: false,
        validate: {
            isInt: true
        }
    },
    delivery_time: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
            isDate: true
        }
    },
    delivery_address: {
        type: DataTypes.STRING(128),
        allowNull: false,
        validate: {
            len: [1, 128]
        }
    },
    execution_size: {
        type: DataTypes.DOUBLE(),
        allowNull: false
    },
    execution_percent: {
        type: DataTypes.DOUBLE(),
        allowNull: false
    }
}, {
    sequelize,
    modelName: 'Purchase'
});

module.exports = Purchase;