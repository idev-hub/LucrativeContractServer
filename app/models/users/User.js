const {DataTypes, Model} = require('sequelize');
const sequelize = require('../../../config/sequelize');

class User extends Model {
    getFullname () {
        return `${this.surname} ${this.name} ${this.patronymic}`;
    }
}

User.init({
    name: {
        type: DataTypes.STRING(32),
        allowNull: false,
        validate: {
            len: [2, 32]
        }
    },
    surname: {
        type: DataTypes.STRING(32),
        allowNull: false,
        validate: {
            len: [2, 32]
        }
    },
    patronymic: {
        type: DataTypes.STRING(32),
        allowNull: false,
        validate: {
            len: [2, 32]
        }
    },
    login: {
        type: DataTypes.STRING(32),
        allowNull: false,
        validate: {
            len: [3, 32]
        }
    },
    email: {
        type: DataTypes.STRING(128),
        allowNull: false,
        validate: {
            isEmail: true,
            len: [6, 128]
        }
    },
    password: {
        type: DataTypes.STRING(128),
        allowNull: false,
        validate: {
            len: [6, 128]
        }
    },
    image_url: {
        type: DataTypes.STRING(128),
        allowNull: true,
        validate: {
            len: [3, 128]
        }
    },
    position: {
        type: DataTypes.STRING(32),
        allowNull: false,
        validate: {
            len: [3, 32]
        }
    },
    is_block: {
        type: DataTypes.BOOLEAN(),
        defaultValue: false,
        allowNull: false
    },
    permission: {
        type: DataTypes.INTEGER(),
        defaultValue: 0,
        allowNull: false
    }
}, {
    sequelize,
    modelName: 'User'
});

module.exports = User;