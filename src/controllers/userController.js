require('dotenv').config();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Users } = require('../../database/models');
const userValidation = require('../middleware/userValidation');
const uploadHelper = require('../helpers/multerHelper');
const fileHelper = require('../helpers/fileHelper');

const secretKey = process.env.JWT_SECRET_KEY;
const refreshSecretKey = process.env.JWT_REFRESH_SECRET_KEY;

const UserController = {
  async getAllUsers(req, res) {
    try {
      const users = await Users.findAll({
        attributes: { exclude: ['password'] },
      });

      if (!users) {
        res.status(404).json({
          status: 'failed',
          message: 'No users found',
          data: null,
        });
      }

      return res.status(200).json({
        status: 'success',
        message: 'Users retrieved successfully',
        data: users,
      });
    } catch (error) {
      return res.status(500).json({
        status: 'failed',
        message: error.message,
      });
    }
  },

  async getUserDetail(req, res) {
    try {
      const { email } = res.locals;
      const user = await Users.findOne({
        where: { email },
        attributes: { exclude: ['password', 'accessToken'] },
      });

      if (!user) {
        return res.status(404).json({
          status: 'failed',
          message: 'User not found',
          data: null,
        });
      }

      return res.status(200).json({
        status: 'success',
        data: user,
      });
    } catch (error) {
      return res.status(500).json({
        status: 'failed',
        message: `Internal server error: ${error.message}`,
      });
    }
  },

  async registerUser(req, res) {
    try {
      await uploadHelper(req, res);
      const { email } = req.body;
      const user = await Users.findOne({ where: { email } });

      if (user) {
        return res.status(400).json({
          status: 'failed',
          message: 'Email is already registered',
        });
      }

      // let fileUrl = null;

      // if (req.file) {
      //   const upload = await fileHelper.uploadFile(req.file, 'users');

      //   if (upload.status === 'failed') {
      //     return res.status(400).json({
      //       status: 'failed',
      //       message: 'File upload failed',
      //     });
      //   }

      //   fileUrl = upload.fileUrl;
      // }

      const userData = userValidation(req.body, 'register');
      const newUser = await Users.create({
        firstName: userData.firstName,
        lastName: userData.lastName,
        profilePicture: null,
        email: userData.email,
        password: await bcrypt.hash(userData.password, 10),
        accessToken: userData.accessToken,
      });

      delete newUser.dataValues.password;
      return res.status(201).json({
        status: 'success',
        message: 'User added successfully',
        data: newUser,
      });
    } catch (error) {
      if (error.status && error.status === 400) {
        return res.status(400).json({
          status: 'failed',
          message: error.message,
          error: error.error,
        });
      }

      return res.status(500).json({
        status: 'failed',
        message: `Internal server error: ${error.message}`,
      });
    }
  },

  async loginUser(req, res) {
    try {
      const { email, password } = req.body;
      let user = await Users.findOne({ where: { email } });

      if (!user) {
        return res.status(401).json({
          status: 'failed',
          message: 'Email not found',
        });
      }

      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
        return res.status(401).json({
          status: 'failed',
          message: 'Invalid password',
        });
      }

      const accessToken = jwt.sign(
        { id: user.id, email: user.email },
        secretKey,
        {
          expiresIn: '1h',
        },
      );

      const refreshToken = jwt.sign(
        { id: user.id, email: user.email },
        refreshSecretKey,
        {
          expiresIn: '1d',
        },
      );

      user.accessToken = refreshToken;
      await user.save();

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        secure: true,
      });

      user = {
        ...user.dataValues,
        accessToken,
      };

      delete user.password;
      delete user.createdAt;
      delete user.updatedAt;

      return res.status(200).json({
        status: 'success',
        message: 'User logged in successfully',
        data: user,
      });
    } catch (error) {
      return res.status(500).json({
        status: 'failed',
        message: `Internal server error: ${error.message}`,
      });
    }
  },

  async logoutUser(req, res) {
    try {
      const refreshToken = req.cookies?.refreshToken;

      if (!refreshToken) {
        return res.status(200).json({
          status: 'success',
          message: 'User logged out successfully',
        });
      }

      const user = await Users.findOne({
        where: { accessToken: refreshToken },
      });

      if (!user) {
        res.clearCookie('refreshToken');
        return res.status(200).json({
          status: 'success',
          message: 'User logged out successfully',
        });
      }

      await Users.update(
        { accessToken: null },
        {
          where: { accessToken: refreshToken },
        },
      );

      res.clearCookie('refreshToken');
      return res.status(200).json({
        status: 'success',
        message: 'User logged out successfully',
      });
    } catch (error) {
      return res.status(500).json({
        status: 'failed',
        message: `Internal server error: ${error.message}`,
      });
    }
  },

  async updateUser(req, res) {
    try {
      const { id } = res.locals;
      const user = await Users.findByPk(id, { attributes: { exclude: ['email', 'password', 'accessToken'] } });
      await uploadHelper(req, res);

      if (!user) {
        return res.status(404).json({
          status: 'failed',
          message: 'User not found',
          data: null,
        });
      }

      let fileUrl = user.profilePicture;

      if (req.file) {
        const upload = await fileHelper.uploadFile(req.file, 'users');

        if (upload.status === 'failed') {
          return res.status(400).json({
            status: 'failed',
            message: 'File upload failed',
          });
        }

        if (user.profilePicture) {
          const deleteResult = await fileHelper.deleteFile(user.profilePicture);

          if (deleteResult.status === 'failed') {
            console.error('Error:', deleteResult.message);
          }
        }

        fileUrl = upload.fileUrl;
      }

      const userData = userValidation(req.body, 'update');
      userData.profilePicture = fileUrl;

      await Users.update(userData, {
        where: { id },
      });

      return res.status(200).json({
        status: 'success',
        message: 'User updated successfully',
        user: userData,
      });
    } catch (error) {
      if (error.status && error.status === 400) {
        return res.status(400).json({
          status: 'failed',
          message: error.message,
          error: error.error,
        });
      }

      return res.status(500).json({
        status: 'failed',
        message: `Internal server error: ${error.message}`,
      });
    }
  },

  async changePassword(req, res) {
    try {
      const { id } = res.locals;
      const user = await Users.findByPk(id, { attributes: ['password'] });

      console.log(id);

      if (!user) {
        return res.status(404).json({
          status: 'failed',
          message: 'User not found',
          data: null,
        });
      }

      const userData = userValidation(req.body, 'change');
      const passwordMatch = await bcrypt.compare(userData.oldPassword, user.password);

      if (!passwordMatch) {
        return res.status(401).json({
          status: 'failed',
          message: 'Old password is invalid',
        });
      }

      const hashPassword = await bcrypt.hash(userData.newPassword, 10);

      await Users.update({ password: hashPassword }, {
        where: { id },
      });

      return res.status(200).json({
        status: 'success',
        message: 'Password changed successfully',
      });
    } catch (error) {
      if (error.status && error.status === 400) {
        return res.status(400).json({
          status: 'failed',
          message: error.message,
          error: error.error,
        });
      }

      return res.status(500).json({
        status: 'failed',
        message: `Internal server error: ${error.message}`,
      });
    }
  },

  async deleteUser(req, res) {
    try {
      const { id } = req.params;
      const deleted = await Users.findByPk(id);

      const deleteResult = await fileHelper.deleteFile(deleted.profilePicture);

      if (deleteResult.status === 'failed') {
        console.error('Error:', deleteResult.message);
      }

      await Users.destroy({
        where: { id },
      });

      if (!deleted) {
        return res.status(404).json({
          status: 'failed',
          message: 'User not found',
          data: null,
        });
      }

      return res.status(200).json({
        status: 'success',
        message: 'User deleted successfully',
      });
    } catch (error) {
      return res.status(500).json({
        status: 'failed',
        message: `Internal server error: ${error.message}`,
      });
    }
  },
};

module.exports = UserController;
