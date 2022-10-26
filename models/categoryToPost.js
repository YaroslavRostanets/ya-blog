const { DataTypes } = require('sequelize');
const database = require('../config/database');
const withDateNoTz = require('sequelize-date-no-tz-postgres');
const updDataTypes = withDateNoTz(DataTypes);
const CategoryDictionary = require('./categoryDictionary');

const CategoryToPost = database.define('CategoryToPost', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    postId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    categoryDictionaryId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    createdAt: {
        allowNull: false,
        type: updDataTypes.DATE_NO_TZ,
    },
    updatedAt: {
        allowNull: false,
        type: updDataTypes.DATE_NO_TZ,
    }
}, {
    freezeTableName: true
});

CategoryToPost.sync({ alter: true});
CategoryToPost.belongsTo(CategoryDictionary, {
    foreignKey: 'categoryDictionaryId'
});

module.exports = CategoryToPost;