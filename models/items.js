'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Items extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      models.List.hasMany(models.Items);
      models.Items.belongsTo(models.List, {
        foreignKey: 'id',
        onDelete: 'CASCADE'
      });

      models.Users.hasMany(models.Items);
      models.Items.belongsTo(models.Users, {
        foreignKey: 'id',
        onDelete: 'CASCADE'
      });
    }
  }
  Items.init({
    title: DataTypes.STRING,
    description: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Items',
  });
  return Items;
};