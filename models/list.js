'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class List extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.Users.hasOne(models.List);
      models.List.belongsTo(models.Users, {
        foreignKey: 'id',
        onDelete: 'CASCADE'
      });

      models.List.hasMany(models.Items);
      models.Items.belongsTo(models.List, {
        foreignKey: 'id',
        onDelete: 'CASCADE'
      });
    }
  }
  List.init({
    listName: DataTypes.STRING,
    shortDesc: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'List',
  });
  return List;
};