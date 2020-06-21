const responseServer = require("../utils/responseServer");

module.exports = function (req, res, next) {
    const bodyArray = Object.keys(req.body);

    if (bodyArray.length === 0) {
        return responseServer(res, 400, {
            content: "Missing content-type request header."
        })
    }

    req.bodyArray = bodyArray;
    next();
}