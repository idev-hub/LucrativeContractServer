const jwt = require('jsonwebtoken');
const uuid = require('uuid/v4');
const { secret, tokens } = require("../../config/app").jwt;
const sequelize = require('../../config/sequelize');


// Генерация нового access токена
const generateAccessToken = (userId) => {
    const payload = {
        userId,
        type: tokens.access.type
    };
    const options = { expiresIn: tokens.access.expiresIn };

    return jwt.sign(payload, secret, options)
};

// Генерация нового refresh токена
const generateRefreshToken = () => {
    const payload = {
        id: uuid(),
        type: tokens.refresh.type
    };
    const options = { expiresIn: tokens.refresh.expiresIn };

    return {
        id: payload.id,
        token: jwt.sign(payload, secret, options)
    }
};


// Замена токена у пользователя в базе данных
const replaceRefreshToken = (tokenId, userId) => sequelize.models.User.findByPk(userId).then(user => {
    sequelize.models.UserToken.destroy({ where: { user_id: userId } }).then( () => user.createUserToken({ token: tokenId }) )
});


module.exports = {
    generateAccessToken,
    generateRefreshToken,
    replaceRefreshToken
};