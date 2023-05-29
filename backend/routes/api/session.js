//For routes begginig with api/session

const { setTokenCookie, restoreUser } = require('../../utils/auth');
const { User } = require('../../db/models');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const router = require("express").Router();
const validateLogin = [
    check('credential')
      .exists({ checkFalsy: true })
      .notEmpty()
      .withMessage('Please provide a valid email or username.'),
    check('password')
      .exists({ checkFalsy: true })
      .withMessage('Please provide a password.'),
    handleValidationErrors
];

router.post("/", validateLogin, async (req, res, next) => {
    if (req.cookies.token) {
        const err = new Error('Login failed');
        err.status = 401;
        err.title = 'Login failed';
        err.errors = ['Unaccesible route. You have already logged in'];
        next(err);
    };
    const {credential, password} = req.body;

    const userTriedToLog = await User.login({credential, password});

    if (userTriedToLog && userTriedToLog instanceof User) {
        setTokenCookie(res, userTriedToLog);
        res.json(userTriedToLog);
    } else {
        const err = new Error('Login failed');
        err.status = 401;
        err.title = 'Login failed';
        err.errors = ['The provided credentials were invalid.'];
        next(err);
    };
});


router.delete(
    '/',
    (_req, res) => {
      res.clearCookie('token');
      return res.json({ message: 'success' });
    }
);


module.exports = router;
