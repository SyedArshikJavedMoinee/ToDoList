'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Users extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.Users.hasOne(models.List);
      models.List.belongsTo(Users, {
        foreignKey: 'id',
      });

      models.Users.hasMany(models.Items);
      models.Items.belongsTo(models.Users, {
        foreignKey: 'id',
        onDelete: 'CASCADE'
      });
      
    }
  }
  Users.init({
    username: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    verified: DataTypes.BOOLEAN,
  }, {
    sequelize,
    modelName: 'Users',
  });
  return Users;
};