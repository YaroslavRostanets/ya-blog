const { DataTypes } = require('sequelize');
const database = require('../config/database');
const withDateNoTz = require('sequelize-date-no-tz-postgres');
const updDataTypes = withDateNoTz(DataTypes);

const File = database.define('File', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    uuid: {
        type: DataTypes.UUIDV4,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4
    },
    name: {
        type: DataTypes.STRING(127),
        allowNull: false
    },
    type: {
        type: DataTypes.STRING(64),
        allowNull: false
    },
    size: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    path: {
        type: DataTypes.STRING(255),
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

module.exports = File;