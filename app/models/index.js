const models = {
    _Type: require('./users/_Type'),
    _Status: require('./purchases/_Status'),
    _Advantage: require('./purchases/_Advantage'),
    _Method: require('./purchases/_Method'),
    _Unit: require('./purchases/_Unit'),
    _ResponsiblePerson: require('./purchases/_ResponsiblePerson'),

    User: require('./users/User'),
    Purchase: require('./purchases/Purchase'),

    UserType: require('./users/UserType'),
    UserBank: require('./users/UserBank'),
    UserCompany: require('./users/UserCompany'),
    UserHistory: require('./users/UserHistory'),
    UserToken: require('./users/UserToken'),

    PurchaseAdvantage: require('./purchases/PurchaseAdvantage'),
    PurchaseDocument: require('./purchases/PurchaseDocument'),
    PurchaseHistory: require('./purchases/PurchaseHistory'),

    Chat: require('./chats/Chat'),
    ChatHistory: require('./chats/ChatHistory'),
    ChatMessage: require('./chats/ChatMessage'),


    _System: require('./System')
};


// models.User.hasMany(models.Chat);
// models.Chat.belongsTo(models.User);

// models.Chat.hasMany(models.ChatHistory);
// models.ChatHistory.belongsTo(models.Chat);

// models.User.hasMany(models.ChatHistory);
// models.ChatHistory.belongsTo(models.User);

// models.Chat.hasMany(models.ChatMessage);
// models.ChatMessage.belongsTo(models.Chat);

// models.User.hasMany(models.ChatMessage);
// models.ChatMessage.belongsTo(models.User);


models.User.hasMany(models.UserToken);
models.UserToken.belongsTo(models.User);




models.User.hasMany(models.UserHistory, {as: 'user_histories'});
models.UserHistory.belongsTo(models.User);

models.User.hasMany(models.UserBank, {as: 'user_banks'});
models.UserBank.belongsTo(models.User);

models.User.hasMany(models.UserCompany, {as: 'user_companies'});
models.UserCompany.belongsTo(models.User);

models.User.hasMany(models.UserType, {as: 'user_types'});
models.UserType.belongsTo(models.User);


// models._Type.hasOne(models.UserType, {as: 'type'});
models.UserType.belongsTo(models._Type, { as: 'type'});

models.User.hasMany(models.Purchase);
models.Purchase.belongsTo(models.User);

models._ResponsiblePerson.belongsTo(models.User);

models.User.hasMany(models.Purchase);
models.Purchase.belongsTo(models.User, {foreignKey: 'user_id', as: 'user'});
models.Purchase.belongsTo(models.User, {foreignKey: 'responsible_id', as: 'responsible'});

models.Purchase.hasMany(models.PurchaseAdvantage, {as: 'advantages'});
models.PurchaseAdvantage.belongsTo(models.Purchase);

models.Purchase.hasMany(models.PurchaseDocument, {as: 'documents'});
models.PurchaseDocument.belongsTo(models.Purchase);

models.User.hasMany(models.PurchaseHistory);
models.PurchaseHistory.belongsTo(models.User, {as: 'user'});

models.Purchase.hasMany(models.PurchaseHistory, {as: 'histories'});
models.PurchaseHistory.belongsTo(models.Purchase);

models._Advantage.hasOne(models.PurchaseAdvantage);
models.PurchaseAdvantage.belongsTo(models._Advantage, {as: 'advantage'});

models._Method.hasOne(models.Purchase);
models.Purchase.belongsTo(models._Method, {as: 'method'});

models._Status.hasOne(models.Purchase);
models.Purchase.belongsTo(models._Status, {as: 'status'});

models._Unit.hasOne(models.Purchase);
models.Purchase.belongsTo(models._Unit, {as: 'unit'});

module.exports = models;