const express = require("express");
const router = express.Router();

router.get("/feed/:user", function (req, res) {
    res.render("feed", {t: req.params.user});
});

router.get("/connexion", function (req, res) {
    res.render("connection");
});

router.get("/inscription", function (req, res) {
    res.render("inscription");
});

module.exports = router;