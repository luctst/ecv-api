const express = require("express");
const responseServer = require("./utils/responseServer");
const mongo = require("./db/index");
const {hash} = require("bcrypt");
const {randomFillSync} = require("crypto");
const {sign} = require("jsonwebtoken");

const router = express.Router();
router.use(express.json());

router.post("/signup", async function (req, res) {
    const bodyArray = Object.keys(req.body);

    if (bodyArray.length === 0) {
        return responseServer(res, 400, {
            content: "Missing content-type request header."
        })
    }

    if (bodyArray.length > 2) {
        return responseServer(res, 400);
    }

    if (!bodyArray.includes("pseudo") || !bodyArray.includes("pswd")) {
        return responseServer(res, 400);
    }

    const mClient = await mongo();
    const usersCol = mClient.db().collection("users");

    if (await usersCol.findOne({pseudo: req.body.pseudo}) === null) {
        const key = randomFillSync(Buffer.alloc(16)).toString("hex");
        const pswdHashed = await hash(req.body.pswd, 10);
        const newUsers = await usersCol.insertOne({
            pseudo: req.body.pseudo,
            pswd: pswdHashed,
            key,
        });

        return responseServer(res, 200, {
            modifyResponse: {
                token: sign({iss: newUsers.insertedId}, key)
            }
        })
    }

    return responseServer(res, 409);
});

module.exports = router;