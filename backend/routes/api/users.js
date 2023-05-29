//For routes begginig with api/users
const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { User } = require('../../db/models');
const {check} = require("express-validator");
const {handleValidationErrors} = require("../../utils/validation");
const router = require("express").Router();

const validateSignup = [
    check('username')
        .exists({ checkFalsy: true })
        .notEmpty()
        .isLength({min: 4})
        .withMessage("Please provide a username with at least 4 characters."),
    check('username')
        .not()
        .isEmail()
        .withMessage("Username should not be an email."),
    check('email')
        .exists({ checkFalsy: true })
        .notEmpty()
        .isEmail()
        .withMessage("Please provide a valid email."),
    check("password")
        .exists({ checkFalsy: true })
        .notEmpty()
        .isLength({min: 6})
        .withMessage("Please provide a password with 6 or more characters"),
    handleValidationErrors
];

router.post("/", validateSignup, async (req, res) => {
    const {username, email, password} = req.body;
    const newUser = await User.signUp({username, email, password});
    setTokenCookie(res, newUser);
    return res.json(newUser);
});

router.get("/", requireAuth, (req, res) => {
    res.json({user: req.user.toSafeObject()});
});

module.exports = router;
