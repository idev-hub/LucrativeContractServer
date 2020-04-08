const jwt = require("jsonwebtoken");
const bcrypt = require('bcryptjs');

const sequelize = require('../../config/sequelize');
const {Op} = require('sequelize');

const {secret} = require("../../config/app").jwt;
const authHelper = require("../helpers/authHelper");


const register = (req, res) => {
    sequelize.models.User.findOne({where: {[Op.or]: [{login: req.body.login}, {email: req.body.email}]}}).then(user => {
        if (user) return res.status(400).json({message: 'Этот логин или адрес электронной почты уже используется'});

        console.log(req.body);

        sequelize.models.User.create({
            name: req.body.name,
            surname: req.body.surname,
            patronymic: req.body.patronymic,
            login: req.body.login,
            password: bcrypt.hashSync(req.body.password),
            email: req.body.email,
            position: req.body.position,
            user_types: [{
                type_id: req.body.type_id
            }],
            user_banks: [{
                name: req.body.name_bank,
                payment_account: req.body.payment_account,
                correspondent_account: req.body.correspondent_account,
                bank_identification_code: req.body.bank_identification_code
            }],
            user_companies: [{
                name: req.body.name_company,
                address: req.body.address,
                taxpayer_identification_number: req.body.taxpayer_identification_number,
                code_reason: req.body.code_reason
            }],
            user_histories: [{
                title: 'Пользователь зарегистрировался'
            }]
        }, {
            include: [
                {
                    model: sequelize.models.UserType,
                    as: 'user_types'
                },
                {
                    model: sequelize.models.UserBank,
                    as: 'user_banks'
                },
                {
                    model: sequelize.models.UserCompany,
                    as: 'user_companies'
                },
                {
                    model: sequelize.models.UserHistory,
                    as: 'user_histories'
                }
            ]
        }).then(() => res.status(201).json('ok')).catch(err => res.status(400).json(err));
    });
};

// Обновление токена пользователя
const updateTokens = (userId) => {
    const accessToken = authHelper.generateAccessToken(userId)
    const refreshToken = authHelper.generateRefreshToken()

    return authHelper.replaceRefreshToken(refreshToken.id, userId).then(() => ({
        accessToken,
        refreshToken: refreshToken.token
    }))
};

// Авторизация пользователя
const login = (req, res) => {
    const { login, password } = req.body;

    sequelize.models.User.findOne({where: {login: login}}).then(user => {

        if (!user) return res.status(403).json({message: "Не верный логин или пароль"});

        const isValid = bcrypt.compareSync(password, user.password);

        if (isValid) {
            updateTokens(user.id).then(tokens => {

                sequelize.models.User.findByPk(user.id, {
                    attributes: {exclude: ['password']}
                }).then(u => {
                    return res.status(200).json({tokens: tokens, user: u})
                })

            })
        } else {
            return res.status(403).json({message: "Не верный логин или пароль"})
        }

    }).catch(err => res.status(403).json(err))
};

// Обновление Refresh токена
const refreshTokens = (req, res) => {
    const {refreshToken} = req.body;
    let payload;

    try {
        payload = jwt.verify(refreshToken, secret);
        if (payload.type !== 'refresh') {
            res.status(403).json({message: "Неправильный токен"});
            return
        }
    } catch (e) {
        if (e instanceof jwt.TokenExpiredError) {
            res.status(403).json({message: "Неправильный токен"});
            return
        } else if (e instanceof jwt.JsonWebTokenError) {
            res.status(403).json({message: "Неправильный токен"});
            return
        }
    }

    sequelize.models.UserToken.findOne({where: {token: payload.id}}).then(token => {
        if (!token) res.status(403).json({message: 'Неправильный токен'});
        return updateTokens(token.UserId)
    }).then(tokens => res.json(tokens)).catch(err => res.status(403).json(err))
};

module.exports = {
    login,
    register,
    refreshTokens
};