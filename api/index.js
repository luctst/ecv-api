const express = require("express");
const {hash, compareSync} = require("bcrypt");
const {randomFillSync} = require("crypto");
const {sign} = require("jsonwebtoken");

const parseBody = require("./middlewares/parseBody");
const isConnected = require("./middlewares/isConnected");

const responseServer = require("./utils/responseServer");
const mongo = require("./db/index");

const router = express.Router();

router.use(express.json());
router.use("/signup", parseBody);
router.use("/login", parseBody);
router.use("/feed/:id", isConnected);

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


router.get("/feed/:id", async function (req, res) {
    const mClient = await mongo();
    const cardsCol = mClient.db().collection("cards");

    const cards = await cardsCol.find({}, {limit: 20}).toArray();
    return responseServer(res, 200, {
        modifyResponse: {
            posts: cards
        }
    });
});

router.post("/feed/:id", async function (req, res) {
    const bodyArray = Object.keys(req.body);

    if (bodyArray.length === 0) {
        return responseServer(res, 400, {
            content: "Missing content-type request header."
        })
    }

    if (bodyArray.length > 1) {
        return responseServer(res, 400);
    }

    if (bodyArray[0] !== "content") {
        return responseServer(res, 400);
    }

    const mClient = await mongo();
    const cardsCol = mClient.db().collection("cards");

    await cardsCol.insertOne({
        content: req.body.content,
        author: req.params.id
    });

    const cards = await cardsCol.find({}, {limit: 20});

    return responseServer(res, 200, {
        modifyResponse: {
            posts: cards
        }
    })
});

module.exports = router;