module.exports = function (req, res, next) {

    if (req.token === null) return res.status(403).json({message: 'Ошибка авторизации'});
    return next()

};
