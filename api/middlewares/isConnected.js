const {verify} = require("jsonwebtoken");

const responseServer = require("../utils/responseServer");
const mongo = require("../db/index");

module.exports = async function isConnected (req, res, next) {
    if (!req.headers.authorization) {
        return responseServer(res, 401);
    }

    const [b, token] = req.headers.authorization.split(" ");
    if (b !== "Bearer" || !token || token.split(".").length !== 3) {
        return responseServer(res, 400);
    }

    const mClient = await mongo();
    const usersCol = mClient.db().collection("users");

    const user = await usersCol.findOne({pseudo: req.params.id}, {projection: {key: 1}});

    if (user === null) {
        return responseServer(res, 401);
    }

    return verify(token, user.key, function (err) {
        if (err) return responseServer(res, 401);
        next();
    });
};