const router = require("express").Router();
const auth = require("../controllers/auth");
const jwt = require('jsonwebtoken');
const {secret} = require('../../config/app').jwt;
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const bcrypt = require('bcryptjs');

const sequelize = require('../../config/sequelize');

const isLogin = require('../middleware/isLogin');
const isPermission = require('../middleware/isPermission');
const isAccess = require('../middleware/isAccess');

const user = require('../controllers/user');

const fs = require('fs');

const fileUpload = require('express-fileupload');
const Jimp = require('jimp');

router.use(fileUpload({
    limits: {fileSize: 50 * 1024 * 1024}
}));

// Стандарный middleware на добавление токена и user_id если имеються
router.use(function (req, res, next) {
    let token = req.get('Authorization') || null;
    req.token = token;

    if (token !== null) {
        jwt.verify(token.replace('Bearer ', ''), secret, function (err, decoded) {
            if (err) req.token = null;
            else req.user_id = decoded.userId;
        })
    }

    return next()
});


// Авторизация пользователя
router.post("/login", auth.login);

// Обновление текущего токена по refresh-токену
router.post("/refresh-tokens", auth.refreshTokens);

// Получение информации о системе
router.get("/system", (req, res) => {
    sequelize.models._System.findByPk(1).then(system => {
        res.json(system);
    }).catch(err => res.json(err));
});

// Обновление информации о системе
router.post("/system", isPermission, isAccess, (req, res) => {
    sequelize.models._System.update(req.body, { where: { id: 1 } }).then(system => {
        res.json(system);
    }).catch(err => res.json(err));
});


// ########################################################
// #################### USERS API #########################
// ########################################################

// Получение всех пользователей
router.get("/dev/users", isPermission, user.getUsers);

// Получение данных о пользователе по ID
router.get("/user/:id", isPermission, user.getUser);

// Добавление пользователя
router.post("/user", auth.register);

// Редактирование полей пользователя по ID
router.put("/user/main/:id", isPermission, isAccess, (req, res) => {
    sequelize.models.User.findByPk(req.params.id).then(user => {
        user.update(req.body).then(() => res.status(201).json('ok')).catch(err => res.status(400).json(err))
    }).catch(err => res.status(400).json(err));
});

// Смена пароля пользователя по ID
router.put("/user/password/:id", isPermission, isAccess, (req, res) => {
    sequelize.models.User.findByPk(req.params.id).then(user => {
        bcrypt.compare(req.body.oldPassword, user.password).then(p => {
            if (p === true) {
                if (req.body.newPassword) {
                    user.update({
                        password: bcrypt.hashSync(req.body.newPassword)
                    }).then(() => res.status(201).json('ok')).catch((err) => res.status(400).json(err));
                } else res.status(403).json({message: 'New password not passed'});
            } else res.status(403).json({message: 'Invalid old password'});
        });
    }).catch((err) => res.status(400).json(err));
});

// Редактирование полей БАНКА пользователя по ID
router.put("/user/bank/:id", isPermission, isAccess, (req, res) => {
    sequelize.models.UserBank.update(req.body, {
        where: {id: req.params.id}
    }).then(() => res.status(201).json('ok')).catch((err) => res.status(400).json({message: err.message}));
});


// Редактирование полей ORGANIZATION пользователя по ID
router.put("/user/company/:id", isPermission, isAccess, (req, res) => {
    sequelize.models.UserCompany.update(req.body, {
        where: {id: req.params.id}
    }).then(() => res.status(201).json('ok')).catch((err) => res.status(400).json({message: err.message}));
});


// Редактирование полей Types пользователя по ID
router.put("/user/types/:id", isPermission, isAccess, (req, res) => {
    if (Number(req.body.check) === 0) {

        sequelize.models.UserType.destroy({
            where: {
                user_id: Number(req.params.id),
                type_id: Number(req.body.id)
            }
        }).then(() => res.status(201).json('ok')).catch(err => res.status(400).json(err));

    } else {

        sequelize.models.UserType.create({
            user_id: Number(req.params.id),
            type_id: Number(req.body.id)
        }).then(() => res.status(201).json('ok')).catch(err => res.status(400).json(err));

    }
});

// Загрузка фотографии пользователя
router.put('/user/photo/:id', isPermission, isAccess, (req, res) => {
    if (req.files) {
        if (req.files.file.mimetype === 'image/png' || req.files.file.mimetype === 'image/jpeg') {
            if (req.files.file.size < 5242880) {

                Jimp.read(req.files.file.data)
                    .then(file => {

                        let folder = "static/users";
                        let name = `${Date.now() * 100}.${file.getExtension()}`;

                        file
                            .cover(256, 256, Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_MIDDLE)
                            .write(`./${folder}/${name}`);

                        sequelize.models.User.update({
                            image_url: `${folder}/${name}`
                        }, {
                            where: {
                                id: req.params.id
                            }
                        }).then(() => {

                            res.status(200).json("ok");

                        }).catch(err => res.status(400).json(err));

                    })
                    .catch(err => {
                        res.status(400).json(err)
                    });

            } else res.status(400).json({message: 'Size exceeds 5 megabyte limit'});
        } else res.status(400).json({message: 'Invalid file format'});
    } else res.status(400).json({message: 'Files not transferred'});
});


// Выдача прав пользователю по ID
router.post("/user/:id/addPermission", isPermission, isAccess, (req, res) => {
    if(req.permission >= 20){
        sequelize.models.User.findByPk(req.params.id).then(user => {
            if(user.permission < 20){
                user.update({permission: 9}).then(() => {
                    res.status(201).json("ok");
                }).catch(err => res.status(400).json(err));
            } else {
                res.status(403).json({message: "У Вас недостаточно прав для совершения данной операции"});
            }
        });
    } else {
        res.status(403).json({message: "У Вас недостаточно прав для совершения данной операции"});
    }
});

// Удаление прав пользователя по ID
router.post("/user/:id/removePermission", isPermission, isAccess, (req, res) => {
    if(req.permission >= 20){
        sequelize.models.User.findByPk(req.params.id).then(user => {
            if(user.permission < 20){
                user.update({permission: 0}).then(() => {
                    res.status(201).json("ok");
                }).catch(err => res.status(400).json(err));
            } else {
                res.status(403).json({message: "У Вас недостаточно прав для совершения данной операции"});
            }
        });
    } else {
        res.status(403).json({message: "У Вас недостаточно прав для совершения данной операции"});
    }
});

// Блокировка пользователя по ID
router.post("/user/:id/blocked", isPermission, isAccess, (req, res) => {
    sequelize.models.User.findByPk(req.params.id).then(user => {
        if(user.permission < 20){
            user.update({is_block: true}).then(() => {
                res.status(201).json("ok");
            }).catch(err => res.status(400).json(err));
        } else {
            res.status(403).json({message: "У Вас недостаточно прав для совершения данной операции"});
        }
    });
});

// Разблокировка пользователя по ID
router.post("/user/:id/unblocked", isPermission, isAccess, (req, res) => {
    sequelize.models.User.findByPk(req.params.id).then(user => {
        user.update({is_block: false}).then(() => {
            res.status(201).json("ok");
        }).catch(err => res.status(400).json(err));
    });
});


// ########################################################
// #################### PURCHASES API #####################
// ########################################################
// Получение всех закупок
router.get('/purchases', isPermission, isAccess, (req, res) => {
    sequelize.models.Purchase.findAll({
        order: [
            ['created_at', 'DESC']
        ],
        attributes: {
            exclude: ['user_id', 'responsible_id', 'StatusId', 'MethodId', 'UserId', 'UnitId', 'statusId', 'status_id', 'method_id', 'unit_id', 'unitId']
        },
        include: [
            {
                model: sequelize.models.PurchaseHistory, as: 'histories', attributes: {
                    exclude: ['purchase_id', 'UserId', 'PurchaseId', 'userId', 'user_id']
                },
                include: [{
                    model: sequelize.models.User,
                    as: 'user',
                    attributes: ['name', 'surname', 'patronymic', 'id']
                }]
            },
            {
                model: sequelize.models.PurchaseAdvantage,
                as: 'advantages',
                attributes: ['id'],
                include: [{
                    model: sequelize.models._Advantage,
                    as: 'advantage',
                    attributes: {
                        exclude: ['updatedAt', 'createdAt']
                    }
                }]
            },
            {model: sequelize.models._Method, as: 'method', attributes: {exclude: ['updatedAt', 'createdAt']}},
            {model: sequelize.models._Unit, as: 'unit', attributes: {exclude: ['updatedAt', 'createdAt']}},
            {model: sequelize.models._Status, as: 'status', attributes: {exclude: ['updatedAt', 'createdAt']}},
            {model: sequelize.models.User, as: 'responsible', attributes: ['name', 'surname', 'patronymic', 'id']},
            {model: sequelize.models.User, as: 'user', attributes: ['name', 'surname', 'patronymic', 'id']},
        ]
    }).then(purchases => {
        res.json(purchases)
    }).catch(err => res.status(400).json({message: err.message}))
});

// Получение всех закупок пользователя
router.get('/purchases/:id', isPermission, isAccess, (req, res) => {
    sequelize.models.User.findByPk(req.params.id).then(user => {

        let where = req.query.where === 'all' ? {} : req.query.where === 'history' ? {
            [Op.or]: [{status_id: 1}, {status_id: 2}]
        } : {
            [Op.and]: [{status_id: {[Op.not]: 1}}, {status_id: {[Op.not]: 2}}]
        };

        user.getPurchases({
            where: where,
            order: [
                ['created_at', 'DESC']
            ],
            attributes: {
                exclude: ['user_id', 'responsible_id', 'StatusId', 'MethodId', 'UserId', 'UnitId', 'statusId', 'status_id', 'method_id', 'unit_id', 'unitId']
            },
            include: [
                {
                    model: sequelize.models.PurchaseHistory, as: 'histories', attributes: {
                        exclude: ['purchase_id', 'UserId', 'PurchaseId', 'userId', 'user_id']
                    },
                    include: [{
                        model: sequelize.models.User,
                        as: 'user',
                        attributes: ['name', 'surname', 'patronymic', 'id']
                    }]
                },
                {
                    model: sequelize.models.PurchaseAdvantage,
                    as: 'advantages',
                    attributes: ['id'],
                    include: [{
                        model: sequelize.models._Advantage,
                        as: 'advantage',
                        attributes: {
                            exclude: ['updatedAt', 'createdAt']
                        }
                    }]
                },
                {model: sequelize.models._Method, as: 'method', attributes: {exclude: ['updatedAt', 'createdAt']}},
                {model: sequelize.models._Unit, as: 'unit', attributes: {exclude: ['updatedAt', 'createdAt']}},
                {model: sequelize.models._Status, as: 'status', attributes: {exclude: ['updatedAt', 'createdAt']}},
                {model: sequelize.models.User, as: 'responsible', attributes: ['name', 'surname', 'patronymic', 'id']},
                {model: sequelize.models.User, as: 'user', attributes: ['name', 'surname', 'patronymic', 'id']},
            ]
        }).then(purchases => {
            res.json(purchases)
        }).catch(err => res.status(400).json({message: err.message}))


    }).catch(err => res.status(400).json({message: err.message}))
});

// Получение закупки по ID
router.get('/purchase/:user/:id', isPermission, (req, res) => {
    sequelize.models.User.findByPk(req.params.user).then(user => {
        user.getPurchases({
            where: {
                id: req.params.id
            },
            order: [
                ['histories', 'created_at', 'DESC']
            ],
            attributes: {
                exclude: ['user_id', 'responsible_id', 'StatusId', 'MethodId', 'UserId', 'UnitId', 'statusId', 'status_id', 'method_id', 'unit_id', 'unitId']
            },
            include: [
                {
                    model: sequelize.models.PurchaseDocument, as: 'documents', attributes: {
                        exclude: ['purchase_id', 'PurchaseId']
                    },
                },
                {
                    model: sequelize.models.PurchaseHistory, as: 'histories', attributes: {
                        exclude: ['purchase_id', 'UserId', 'PurchaseId', 'userId', 'user_id']
                    },
                    include: [{
                        model: sequelize.models.User,
                        as: 'user',
                        attributes: ['name', 'surname', 'patronymic', 'id']
                    }]
                },
                {
                    model: sequelize.models.PurchaseAdvantage,
                    as: 'advantages',
                    attributes: ['id'],
                    include: [{
                        model: sequelize.models._Advantage,
                        as: 'advantage',
                        attributes: {
                            exclude: ['updatedAt', 'createdAt']
                        }
                    }]
                },
                {model: sequelize.models._Method, as: 'method', attributes: {exclude: ['updatedAt', 'createdAt']}},
                {model: sequelize.models._Unit, as: 'unit', attributes: {exclude: ['updatedAt', 'createdAt']}},
                {model: sequelize.models._Status, as: 'status', attributes: {exclude: ['updatedAt', 'createdAt']}},
                {model: sequelize.models.User, as: 'responsible', attributes: ['name', 'surname', 'patronymic', 'id']},
                {model: sequelize.models.User, as: 'user', attributes: ['name', 'surname', 'patronymic', 'id']},
            ]
        }).then(purchases => {
            res.json(purchases[0])
        }).catch(err => res.status(400).json({message: err.message}))
    }).catch(err => res.status(400).json({message: err.message}))
});


// Добавление закупки
router.post('/purchase', isLogin, async (req, res) => {

    const {name, deadline, responsible_id, initial_maximum_contract_price, quantity, delivery_time, delivery_address, execution_size, execution_percent, advantages, unit_id, method_id, status_id} = req.body;

    const files = [];
    const fl = req.files?Object.values(req.files).map(v => v):[];


    if(fl.length > 0){
       fl.forEach((file) => {
            let folder = "static/docs";
            let name = `${Date.now() * 100 * Math.random() * (9000 - 1) + 1}`;
            let oldName = file.name.split(".");
            let mimeType = oldName[oldName.length - 1];
            let path = `${folder}/${name}.${mimeType}`;

            file.mv(path, (err) => {
                if(err) return res.status(403).json({message: "Ошибка загрузки файлов"});
            });

           files.push({ document_url: path })
        })
    }

    const adv = [];
    if (advantages) {
        if (advantages.length > 0) {
            await JSON.parse(advantages).forEach(advantage => {
                adv.push({
                    advantageId: advantage
                })
            })
        }
    }

    let date = new Date();

    await sequelize.models.Purchase.create({
        name: name || 'Нет названия',
        user_id: req.user_id,
        initial_maximum_contract_price: parseFloat(initial_maximum_contract_price) || 0,
        deadline: deadline || new Date( date.getFullYear(), date.getMonth(), date.getDate() + 7 ),
        responsible_id: responsible_id || req.user_id,
        quantity: quantity || 0,
        delivery_time: delivery_time || new Date( date.getFullYear(), date.getMonth(), date.getDate() + 7 ),
        delivery_address: delivery_address || 'Нет адреса',
        unit_id: Number(unit_id) || 1,
        method_id: Number(method_id) || 1,
        status_id: Number(status_id) || 3,
        execution_size: parseFloat(execution_size) || 0,
        execution_percent: parseFloat(execution_percent) || 0,
        advantages: [...adv] || [],
        documents: [...files] || []
    }, {
        include: [
            {
                model: sequelize.models.PurchaseDocument,
                as: 'documents'
            },
            {
                model: sequelize.models.PurchaseAdvantage,
                as: 'advantages',
                include: [{
                    model: sequelize.models._Advantage,
                    as: 'advantage'
                }]
            }
        ]
    }).then(purchase => {

        sequelize.models.PurchaseHistory.create({
            purchase_id: purchase.id,
            user_id: req.user_id,
            title: 'Создана закупка'
        }).then(() => {
            res.json(purchase)
        }).catch(err => res.status(400).json({message: err.message}));

    }).catch(err => res.status(400).json({message: err.message}));
});


// Редактирование закупки по ID
router.put('/purchase/:user/:id', isPermission, isAccess, (req, res) => {
    const {name, deadline, responsible_id, initial_maximum_contract_price, quantity, delivery_time, delivery_address, execution_size, execution_percent, advantages, unit_id, method_id, status_id} = req.body;



    sequelize.models.Purchase.findByPk(req.params.id).then(purchase => {

        purchase.update({
            name: name || 'Нет названия',
            initial_maximum_contract_price: initial_maximum_contract_price || 0,
            deadline: deadline || new Date(),
            responsible_id: responsible_id || user.id,
            quantity: quantity || 0,
            delivery_time: delivery_time || new Date(),
            delivery_address: delivery_address || 'Нет адреса',
            unit_id: Number(unit_id) || 1,
            method_id: Number(method_id) || 1,
            status_id: Number(status_id) || 3,
            execution_size: parseFloat(execution_size) || 0,
            execution_percent: parseFloat(execution_percent) || 0
        }, {
            where: {
                user_id: req.params.user,
                id: req.params.id
            }
        }).then(updatedPurchase => {
            return sequelize.models.PurchaseAdvantage.destroy({
                where: {
                    purchase_id: updatedPurchase.id
                }
            }).then(() => {

                const adv = [];
                if (advantages) {
                    if (advantages.length > 0) {
                        JSON.parse(advantages).forEach(advantage => {

                            adv.push({
                                purchase_id: Number(req.params.id),
                                advantage_id: advantage
                            })

                        })
                    }
                }

                sequelize.models.PurchaseAdvantage.bulkCreate(adv).then(() => {
                    sequelize.models.PurchaseHistory.create({
                        purchase_id: req.params.id,
                        user_id: req.user_id,
                        title: 'Отредактирована закупка'
                    }).then(() => {

                        res.json(purchase)

                    }).catch(err => res.status(400).json({message: err.message}))
                }).catch(err => res.status(400).json({message: err.message}))
            }).catch(err => res.status(400).json({message: err.message}))
        }).catch(err => res.status(400).json({message: err.message}))
    }).catch(err => res.status(400).json({message: err.message}))
});


// Удаление закупки по ID
router.delete('/purchase/:id', isPermission, (req, res) => {

    let where = {
        id: req.params.id,
        user_id: req.user_id
    };

    if (req.permission) where = {
        id: req.params.id
    };

    sequelize.models.Purchase.update({
        status_id: 1,
    }, {
        where: where
    }).then(() => {
        sequelize.models.PurchaseHistory.create({
            title: 'Закупка удалена',
            user_id: req.user_id,
            purchase_id: req.params.id
        }).then(d => {

            res.json(d)

        }).catch(err => res.status(400).json(err))
    }).catch(err => res.status(400).json(err))

});


// Восстановление закупки по ID
router.post('/purchase/:id/restore', isPermission, (req, res) => {
    let where = {
        id: req.params.id,
        user_id: req.user_id
    };

    if (req.permission) where = {
        id: req.params.id
    };

    sequelize.models.Purchase.update({
        status_id: 3,
    }, {
        where: where
    }).then(() => {
        sequelize.models.PurchaseHistory.create({
            title: 'Закупка восстановлена',
            user_id: req.user_id,
            purchase_id: req.params.id
        }).then(d => {

            res.json(d)

        }).catch(err => res.status(400).json(err))
    }).catch(err => res.status(400).json(err))

});


// ########################################################
// ####################  HANDBOOKS API ####################
// ########################################################

// HANDBOOK TYPES
// Получение справочника - Типы пользователей
router.get('/handbook/user/types', isLogin, (req, res) => {
    let where = req.query.all?{}:{is_delete: false};
    sequelize.models._Type.findAll({
        where: where,
        order: [
            ['created_at', 'ASC']
        ],
    }).then(types => {
        res.status(200).json(types)
    }).catch(err => res.status(400).json(err.message))
});

// Добавление справочника - Тип пользователя
router.post('/handbook/user/types', isPermission, isAccess, (req, res) => {
    sequelize.models._Type.create({
        name: req.body.name
    }).then(type => {
        res.status(201).json(type)
    }).catch(err => res.status(400).json(err.message))
});

// Удаление справочника по ID - Типы пользователей
router.delete('/handbook/user/types/:id', isPermission, isAccess, (req, res) => {
    sequelize.models._Type.update({
        is_delete: true
    }, {
        where: {
            id: req.params.id
        }
    }).then(type => {
        res.status(201).json(type)
    }).catch(err => res.status(400).json(err.message))
});

// Восстановление справочника по ID - Типы пользователей
router.post('/handbook/user/types/restore/:id', isPermission, isAccess, (req, res) => {
    sequelize.models._Type.update({
        is_delete: false
    }, {
        where: {
            id: req.params.id
        }
    }).then(type => {
        res.status(201).json(type)
    }).catch(err => res.status(400).json(err.message))
});


// HANDBOOK ADVANTAGES
// Получение справочника - Преимущества закупки
router.get('/handbook/purchase/advantages', isLogin, (req, res) => {
    let where = req.query.all?{}:{is_delete: false};
    sequelize.models._Advantage.findAll({
        where: where,
        order: [
            ['created_at', 'ASC']
        ],
    }).then(units => {
        res.status(200).json(units)
    }).catch(err => res.status(400).json(err.message))
});

// Добавление справочника - Преимущества закупки
router.post('/handbook/purchase/advantages', isPermission, isAccess, (req, res) => {
    sequelize.models._Advantage.create({
        name: req.body.name,
        description: req.body.description
    }).then(advantage => {
        res.status(201).json(advantage)
    }).catch(err => res.status(400).json(err));
});

// Удаление справочника по ID - Преимущества закупки
router.delete('/handbook/purchase/advantages/:id', isPermission, isAccess, (req, res) => {
    sequelize.models._Advantage.update({
        is_delete: true
    }, {
        where: {
            id: req.params.id
        }
    }).then(advantage => {
        res.status(201).json(advantage)
    }).catch(err => res.status(400).json(err.message))
});

// Восстановление справочника по ID - Преимущества закупки
router.post('/handbook/purchase/advantages/restore/:id', isPermission, isAccess, (req, res) => {
    sequelize.models._Advantage.update({
        is_delete: false
    }, {
        where: {
            id: req.params.id
        }
    }).then(advantage => {
        res.status(201).json(advantage)
    }).catch(err => res.status(400).json(err.message))
});


// HANDBOOK METHOD
// Получение справочника - Методы закупки
router.get('/handbook/purchase/methods', isLogin, (req, res) => {
    let where = req.query.all?{}:{is_delete: false};
    sequelize.models._Method.findAll({
        where: where,
        order: [
            ['created_at', 'ASC']
        ],
    }).then(methods => {
        res.status(200).json(methods)
    }).catch(err => res.status(400).json(err.message))
});

// Добавление справочника - Методы закупки
router.post('/handbook/purchase/methods', isPermission, isAccess, (req, res) => {
    sequelize.models._Method.create({
        name: req.body.name
    }).then(method => {
        res.status(201).json(method)
    }).catch(err => res.status(400).json(err));
});

// Удаление справочника по ID - Методы закупки
router.delete('/handbook/purchase/methods/:id', isPermission, isAccess, (req, res) => {
    sequelize.models._Method.update({
        is_delete: true
    }, {
        where: {
            id: req.params.id
        }
    }).then(method => {
        res.status(201).json(method)
    }).catch(err => res.status(400).json(err.message))
});

// Восстановление справочника по ID - Методы закупки
router.post('/handbook/purchase/methods/restore/:id', isPermission, isAccess, (req, res) => {
    sequelize.models._Method.update({
        is_delete: false
    }, {
        where: {
            id: req.params.id
        }
    }).then(method => {
        res.status(201).json(method)
    }).catch(err => res.status(400).json(err.message))
});


// HANDBOOK STATUS
// Получение справочника - Статус закупки
router.get('/handbook/purchase/statuses', isLogin, (req, res) => {
    let where = req.query.all?{}:{is_delete: false};
    sequelize.models._Status.findAll({
        where: where,
        order: [
            ['created_at', 'ASC']
        ],
    }).then(statuses => {
        res.status(200).json(statuses)
    }).catch(err => res.status(400).json(err.message))
});

// Добавление справочника - Статус закупки
router.post('/handbook/purchase/statuses', isPermission, isAccess, (req, res) => {
    sequelize.models._Status.create({
        name: req.body.name,
        color: req.body.color || '#000000'
    }).then(status => {
        res.status(201).json(status)
    }).catch(err => res.status(400).json(err.message))
});

// Удаление справочника по ID - Статус закупки
router.delete('/handbook/purchase/statuses/:id', isPermission, isAccess, (req, res) => {
    sequelize.models._Status.update({
        is_delete: true
    }, {
        where: {
            id: req.params.id
        }
    }).then(status => {
        res.status(201).json(status)
    }).catch(err => res.status(400).json(err.message))
});

// Восстановление справочника по ID - Статус закупки
router.post('/handbook/purchase/statuses/restore/:id', isPermission, isAccess, (req, res) => {
    sequelize.models._Status.update({
        is_delete: false
    }, {
        where: {
            id: req.params.id
        }
    }).then(status => {
        res.status(201).json(status)
    }).catch(err => res.status(400).json(err.message))
});


// HANDBOOK UNIT
// Получение справочника - Единицы измерения закупок
router.get('/handbook/purchase/units', isLogin, (req, res) => {
    let where = req.query.all?{}:{is_delete: false};
    sequelize.models._Unit.findAll({
        where: where,
        order: [
            ['created_at', 'ASC']
        ],
    }).then(units => {
        res.status(200).json(units)
    }).catch(err => res.status(400).json(err.message))
});

// Добавление справочника - Единицы измерения закупок
router.post('/handbook/purchase/units', isPermission, isAccess, (req, res) => {
    sequelize.models._Unit.create({
        name: req.body.name,
        full_name: req.body.full_name || req.body.name
    }).then(unit => {
        res.status(201).json(unit)
    }).catch(err => res.status(400).json(err.message))
});

// Удаление справочника по ID - Единицы измерения закупок
router.delete('/handbook/purchase/units/:id', isPermission, isAccess, (req, res) => {
    sequelize.models._Unit.update({
        is_delete: true
    }, {
        where: {
            id: req.params.id
        }
    }).then(unit => {
        res.status(201).json(unit)
    }).catch(err => res.status(400).json(err.message))
});

// Восстановление справочника по ID - Единицы измерения закупок
router.post('/handbook/purchase/units/restore/:id', isPermission, isAccess, (req, res) => {
    sequelize.models._Unit.update({
        is_delete: false
    }, {
        where: {
            id: req.params.id
        }
    }).then(unit => {
        res.status(201).json(unit)
    }).catch(err => res.status(400).json(err.message))
});


// HANDBOOK RESPONSIBLE PEOPLE
// Получение справочника - ответственные лица
router.get('/handbook/purchase/responsible_people', isLogin, (req, res) => {
    sequelize.models._ResponsiblePerson.findAll({
        order: [
            ['created_at', 'ASC']
        ],
        include: [
            {model: sequelize.models.User}
        ]
    }).then(people => {
        res.status(200).json(people)
    }).catch(err => res.status(400).json(err.message))
});

// Добавление справочника - ответственные лица
router.post('/handbook/purchase/responsible_people', isPermission, isAccess, (req, res) => {


    sequelize.models._ResponsiblePerson.findAll({
        where: {
            user_id: req.body.user_id
        }
    }).then(result => {
        if(result.length>0) return res.status(400).json({message: "Данный пользователь уже добавлен в список."})

        sequelize.models._ResponsiblePerson.create({
            user_id: req.body.user_id,
        }, {
        }).then(people => {

            sequelize.models._ResponsiblePerson.findByPk((people.id),{
                order: [
                    ['created_at', 'ASC']
                ],
                include: [
                    {model: sequelize.models.User}
                ]
            }).then(people => {

                res.status(200).json(people)

            }).catch(err => res.status(400).json({message: err.message}))
        }).catch(() => res.status(400).json({message: "Ошибка... Данного пользователя не существует"}))
    }).catch(err => res.status(400).json({message: err.message}))
});

// Удаление справочника по ID - ответственные лица
router.delete('/handbook/purchase/responsible_people/:id', isPermission, isAccess, (req, res) => {
    sequelize.models._ResponsiblePerson.destroy({
        where: {
            id: req.params.id
        }
    }).then(() => {
        res.status(201).json("ok")
    }).catch(err => res.status(400).json(err.message))
});


// ########################################################
// ####################  CHATS API ########################
// ########################################################


// Просмотр доступных чатов активного пользователя
router.get('/chats', isLogin, (req, res) => {
    res.status(200).json({message: "ok"})
});

// Просмотр чата
router.get('/chat/:id', isLogin, (req, res) => {
    res.status(200).json({message: "ok"})
});

// Добавление чата
router.post('/chat/:id', isLogin, (req, res) => {
    res.status(201).json({message: "ok"})
});

// Редактирование чата по ID
router.put('/chat/:id', isLogin, (req, res) => {
    res.status(201).json({message: "ok"})
});

// Удаление чата по ID
router.delete('/chat/:id', isLogin, (req, res) => {
    res.status(201).json({message: "ok"})
});


// CHATS MESSAGES
// Просмотр сообщений чата по ID чата
router.get('/chat/:id/messages', isLogin, (req, res) => {
    res.status(200).json({message: "ok"})
});

// Добавление сообщения в чат по ID чата
router.post('/chat/:id/message', isLogin, (req, res) => {
    res.status(201).json({message: "ok"})
});

// Просмотр сообщения в чате по ID чата и ID сообщения
router.get('/chat/:id/message/:messageId', isLogin, (req, res) => {
    res.status(200).json({message: "ok"})
});

// Удаление сообщения в чате по ID чата и ID сообщения
router.delete('/chat/:id/message/:messageId', isLogin, (req, res) => {
    res.status(201).json({message: "ok"})
});

// Редактирование сообщения в чате по ID чата и ID сообщения
router.put('/chat/:id/message/:messageId', isLogin, (req, res) => {
    res.status(201).json({message: "ok"})
});

router.use((req, res) => {
    res.status(404).json({
        code: 404,
        message: "Page not found"
    });
});

module.exports = router;