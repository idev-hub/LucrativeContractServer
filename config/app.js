// Настройки приложения
module.exports = {
    db_name: "z92271qa_system",
    db_host: "z92271qa.beget.tech",
    db_user: "z92271qa_system",
    db_password: "7vg7tek7sG",
    force: false,
    jwt: {
        secret: "Dev-is secret",
        tokens: {
            access: {
                type: "access",
                expiresIn: "16d"
            },
            refresh: {
                type: "refresh",
                expiresIn: "48d"
            }
        }
    }
};