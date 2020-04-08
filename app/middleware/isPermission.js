const { User } = require('../models');

// Проверка прав и авторизации
module.exports = function (req, res, next) {

    if (req.token === null) return res.status(401).json({
        code: 403,
        message: 'Ошибка авторизации'
    });

    User.findByPk(req.user_id).then(user => {
        req.permission = user.permission;
        return next();
    }).catch(err => {
        return res.status(403).json({ message: err })
    });

};