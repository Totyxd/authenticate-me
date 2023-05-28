const jwt = require('jsonwebtoken');
const { jwtConfig } = require('../config');
const { User } = require('../db/models');
const { secret, expiresIn } = jwtConfig;

// Sends a JWT Cookie
const setTokenCookie = (res, user) => {
    const data = user.toSafeObject();
    const jsonWebToken = jwt.sign({data}, secret, {expiresIn: parseInt(expiresIn)});

    const isProduction = process.env.NODE_ENV === "production";

    res.cookie("token", jsonWebToken, {
        maxAge: expiresIn * 1000,
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction && "Lax"
    });

    return jsonWebToken;
};

const restoreUser = (req, res, next) => {
    // token parsed from cookies
    const { token } = req.cookies;

    return jwt.verify(token, secret, null, async (err, jwtPayload) => {
      if (err) {
        return next();
      }

      try {
        const { id } = jwtPayload.data;
        req.user = await User.scope('currentUser').findByPk(id);
      } catch (e) {
        res.clearCookie('token');
        return next();
      }

      if (!req.user) res.clearCookie('token');

      return next();
    });
};

const requireAuth = [
    restoreUser,
    function (req, _res, next) {
        if (req.user) {
            return next();
        } else {
            const err = new Error('Unauthorized');
            err.title = 'Unauthorized';
            err.errors = ['Unauthorized'];
            err.status = 401;
            return next(err);
        };
    }
];

module.exports = {setTokenCookie, restoreUser, requireAuth};
