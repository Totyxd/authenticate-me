'use strict';
const bcrypt = require("bcryptjs");
const { Op } = require("sequelize");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Users', [{
        username: 'JohnDoe',
        email: "JohnDoe@gmail.com",
        hashedPassword: bcrypt.hashSync("password")
      },
      {
        email: 'user1@user.io',
        username: 'FakeUser1',
        hashedPassword: bcrypt.hashSync('password2')
      },
      {
        email: 'user2@user.io',
        username: 'FakeUser2',
        hashedPassword: bcrypt.hashSync('password3')
      }
    ],
  {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Users", {
      username: {[Op.in]: ["JohnDoe", "FakeUser1", "FakeUser2"]}
    }, {});
  }
};
