const express = require("express");

const parseBody = require("./utils/parseBody");
const responseServer = require("./utils/responseServer");
const mongo = require("./db/index");
const {hash, compareSync} = require("bcrypt");
const {randomFillSync} = require("crypto");
const {sign} = require("jsonwebtoken");

const router = express.Router();

router.use(express.json());
router.use("/signup", parseBody);
router.use("/login", parseBody);


router.post("/signup", async function (req, res) {
    if (req.bodyArray.length > 2) {
        return responseServer(res, 400);
    }

    if (!req.bodyArray.includes("pseudo") || !req.bodyArray.includes("pswd")) {
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

router.post("/login", async function (req, res) {
    if (req.bodyArray.length > 2) {
        return responseServer(res, 400);
    }

    if (!req.bodyArray.includes("pseudo") || !req.bodyArray.includes("pswd")) {
        return responseServer(res, 400);
    }

    const mClient = await mongo();
    const usersCol = mClient.db().collection("users");

    const user = await usersCol.findOne({pseudo: req.body.pseudo});

    if (user === null) {
        return responseServer(res, 403);
    }

    if (!compareSync(req.body.pswd, user.pswd)) {
        return responseServer(res, 401)
    };

    return responseServer(res, 200, {
        modifyResponse: {
            token: sign({iss: user._id}, user.key)
        }
    })
});


router.get("/:id", function (req, res) {
    if (!req.headers.authorization) {
        return responseServer(res, 401);
    }

    const [b, token] = req.headers.authorization.split(" ");
    if (b !== "Bearer" || !token || token.split(".").length !== 3) {
        return responseServer(res, 400);
    }
});
module.exports = router;