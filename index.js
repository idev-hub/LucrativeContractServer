const express = require("express");
const https = require('https');
const http = require('http');
const app = express();

const bodyParser = require("body-parser");
const config = require("./config");
const cors = require('cors');
const bcrypt = require('bcryptjs');
const fs = require( "fs" );

const RouterApi = require("./app/routers/api");
const RouterMain = require('./app/routers/public');

app.enable('trust proxy');
app.use(cors());
app.use(bodyParser.json());

app.use (function (req, res, next) {
    if (req.secure) {
        next();
    } else {
        res.redirect('https://' + req.headers.host + req.url);
    }
});

app.use("/static", express.static('static'));
app.use("/api", RouterApi);
app.use(RouterMain);

const sequelize = require("./config/sequelize");
sequelize.sync({force: config.app.force}).then(() => {
    if (config.app.force) {

        sequelize.models._System.create({
            name: "Выгодный контракт",
            phone: "+79000295514",
            email: "feon.ru@gmail.com"
        });

        sequelize.models._Type.bulkCreate([
            {name: "Заказчик 44-ФЗ"},
            {name: "Заказчик 223-ФЗ"},
            {name: "Иные"},
            {name: "Поставщик"}
        ]);

        sequelize.models._Advantage.bulkCreate([
            {
                name: `СМП и СОНКО`,
                description: `(субъектам малого предпринимательства, социально ориентированным некоммерческим организациям)`
            },
            {
                name: `УИС`,
                description: `(учреждениям и предприятиям уголовно - исполнительной системы)`
            },
            {
                name: `ОИ`,
                description: `(организациям инвалидов)`
            }
        ]);

        sequelize.models._Unit.bulkCreate([
            {full_name: 'единиц', name: 'ед'},
            {full_name: 'литров', name: 'л'},
            {full_name: 'миллилитров', name: 'млл'},
            {full_name: 'человек', name: 'чел'},
            {full_name: 'метров', name: 'м'},
            {full_name: 'сантиметров', name: 'см'},
            {full_name: 'километров', name: 'км'},
            {full_name: 'миллиметры', name: 'млм'},
            {full_name: 'часов', name: 'час'},
        ]);

        sequelize.models._Method.bulkCreate([
            {name: "Первый"},
            {name: "Второй"},
        ]);

        sequelize.models._Status.bulkCreate([
            {name: "Удален", code: '#7A0000'},
            {name: "Завершен", code: '#1D8A34'},
            {name: "Проект", code: '#000000'},
            {name: "Передан в работу", code: '#000000'},
            {name: "Подготовка", code: '#000000'},
            {name: "На утверждении", code: '#000000'},
            {name: "Ждёт размещения", code: '#000000'},
            {name: "Подана", code: '#000000'},
            {name: "Подача заявок", code: '#000000'},
            {name: "Аукцион", code: '#000000'},
            {name: "Подведение итогов", code: '#000000'},
            {name: "Заключение договора", code: '#000000'},
            {name: "Исполнение", code: '#000000'}
        ]);


        sequelize.models.User.create({
            name: 'Lester',
            surname: 'Rohan',
            patronymic: 'Zulauf',
            login: 'admin',
            password: bcrypt.hashSync('123123'),
            email: 'Elena_Morissette48@yahoo.com',
            position: 'Pizza',
            permission: 20,
            user_types: [
                { type_id: '1' },
                { type_id: '3' }
            ],
            user_banks: [{
                name: 'Тинькофф',
                payment_account: '1234567890123456',
                correspondent_account: '1234567890123456',
                bank_identification_code: '123456789'
            }],
            user_companies: [{
                name: 'DevIs',
                address: 'Chelyabinsk',
                taxpayer_identification_number: '1234567890',
                code_reason: '123456789'
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
        })


    }
}).catch(err => console.error(err));

http.createServer(app).listen(80, () => console.log("HTTP server start: http://localhost:80/"));
https.createServer({
    key: fs.readFileSync('server.key'),
    cert: fs.readFileSync('server.cert')
}, app).listen(443, () => console.log("HTTP server start: https://localhost:443/"));