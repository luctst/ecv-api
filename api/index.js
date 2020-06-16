const express = require("express");
const router = express.Router();
const signUpFn = require("./routes/signup");

// router.use();


router.get("/signup", function (req, res) {
    const r = signUpFn(req, res);

    res.json(r);
});

module.exports = router;