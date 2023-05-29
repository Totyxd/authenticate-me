//For routes begginig with api/users

const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { User } = require('../../db/models');
const router = require("express").Router();

router.post("/", async (req, res, next) => {
    const {username, email, password} = req.body;
    const newUser = await User.signUp({username, email, password});
    setTokenCookie(res, newUser);
    return res.json(newUser);
});



module.exports = router;
