'use strict';
const {
  Model, Op, Validator
} = require('sequelize');
const bcrypt = require("bcryptjs");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {

    toSafeObject() {
      const { id, username, email } = this; // context will be the User instance
      return { id, username, email };
    };

    validatePassword(password) {
      return bcrypt.compareSync(password, this.hashedPassword.toString());
    };

    static async getCurrentUserById(id) {
      return await User.scope("currentUser").findByPk(id);
    };

    static async login({credential, password}) {
      const user = await User.scope("loginUser").findOne({
        where: {
          [Op.or]: [
            {username: credential},
            {email: credential}
          ]
        }
      }
      );
      if (user && user.validatePassword(password)) {
        return await User.getCurrentUserById(user.getDataValue("id"));
      } else {
        return false;
      };
    };

    static async signUp({username, email, password}) {
      const newUser = await User.create({
        username,
        email,
        hashedPassword: bcrypt.hashSync(password)
      });

      return await User.getCurrentUserById(newUser.getDataValue("id"));
    };

    static associate(models) {
    }
  }
  User.init({
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        len: [4, 30],
        isNotEmail(value) {
          if (Validator.isEmail(value)) {
            throw new Error("Cannot be an email.");
          }
        }
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        len: [3, 256],
        isEmail: true
      }
    },
    hashedPassword: {
      type: DataTypes.STRING.BINARY,
      allowNull: false,
      validate: {
        len: [60, 60]
      }
    }
  }, {
    sequelize,
    modelName: 'User',
    defaultScope: {
      attributes: {
        exclude: ["hashedPassword", "email", "updatedAt", "createdAt"],
        include: ["username"]
      }
    },
    scopes: {
      currentUser: {
        attributes: {exclude: ["hashedPassword"]}
      },
      loginUser: {
        attributes: {}
      }
    }
  });
  return User;
};
