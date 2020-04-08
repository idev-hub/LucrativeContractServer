module.exports = function (req, res, next) {
    if (Number(req.user_id) === Number(req.params.id) || req.permission >= 9)
        return next();
    else return res.status(403).json({message: 'Не хватает прав доступа'});
};
