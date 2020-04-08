const sequelize = require('../../config/sequelize');

// Получение всех пользователей
const getUsers = (req, res) => {
    if(req.permission >= 9){
        sequelize.models.User.findAll({
            order: [
                ['permission', 'DESC'],
                ['name', 'ASC'],
                ['surname', 'ASC'],
                ['patronymic', 'ASC']
            ],
            attributes: {
                exclude: ['password']
            },
            include: [
                {
                    model: sequelize.models.UserBank,
                    as: 'user_banks',
                },
                {
                    model: sequelize.models.UserCompany,
                    as: 'user_companies'
                },
                {
                    model: sequelize.models.UserType,
                    as: 'user_types',
                    include: [{
                        model: sequelize.models._Type,
                        as: 'type'
                    }]
                }
            ]
        }).then(user => {

            res.json(user)

        }).catch(err => res.status(400).json({message: err.message}))
    } else {
        res.status(403).json({
            code: 403,
            message: 'Not enough rights'
        })
    }
};


const getUser = (req, res) => {

    sequelize.models.User.findByPk(req.params.id, {
        attributes: {
            exclude: ['password']
        },
        include: [
            {
                model: sequelize.models.UserBank,
                as: 'user_banks',
            },
            {
                model: sequelize.models.UserCompany,
                as: 'user_companies'
            },
            {
                model: sequelize.models.UserType,
                as: 'user_types',
                include: [{
                    model: sequelize.models._Type,
                    as: 'type'
                }]
            }
        ]
    }).then(user => {

        res.json(user)

    }).catch(err => res.status(400).json({message: err.message}))

};



module.exports = {
    getUsers,
    getUser
};