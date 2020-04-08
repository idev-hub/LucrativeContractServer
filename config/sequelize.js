const Sequelize = require("sequelize");
const config = require("../config/app");

module.exports = new Sequelize(config.db_name, config.db_user, config.db_password, {
    dialect: "mysql",
    host: config.db_host,
    define: {
        underscored: true,
        freezeTableName: false
    }
});