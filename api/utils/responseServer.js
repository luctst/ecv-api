/**
 * Function who define the response header and return the response body.
 * @param {Object} response - A nodejs HTTPServerResponse object.
 * @param {Number} code - The http status response code.
 * @param {Object} [data = {}] - An object who contains the http response body, and others data who modify the function behavior.
 * @param {Object} [data.modifyResponse = {}] - An object who overrides if present the response.
 * @param {Object} [data.serverHeader = {}] - An object of header properties to add on some request.
 * @param {String} [data.content = ""] - A string to send to the user, if nothing is defined a default message will be send
 */
module.exports = (response, code, data = {}) => {
    let error;
    const defaultHeader = {
        "Access-Control-Allow-Origin": "http://localhost:3000",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Expose-Headers":
            "Authorization ,ETag, Link, Location, Retry-After, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset, X-OAuth-Scopes, X-Accepted-OAuth-Scopes, X-Poll-Interval",
        "Cache-Control": "max-age=0, s-maxage=86400",
        "content-type": "application/json; charset=utf-8",
        "Content-Security-Policy": "default-src 'none'",
        Status: code,
        Vary: "Origin",
        "X-XSS-Protection": "1;mode=block",
        "Referrer-Policy": "origin-when-cross-origin, strict-origin-when-cross-origin",
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "deny",
        "X-RateLimit-Limit": 60
    };

    // Server error
    if (!code || code >= 500) {
        error = new Error("Server error");
    }

    if (code === 405) {
        defaultHeader.Allow = data.content;
    }

    if (code === 401 || code === 403) {
        defaultHeader["WWW-Authenticate"] = "Bearer";
    }

    const httpCode = {
        200: {
            message: data.content ? data.content : "Ok"
        },
        201: {
            message: data.content ? data.content : "Created"
        },
        400: {
            error: true,
            message: data.content ? data.content : "Bad request"
        },
        401: {
            error: true,
            message: data.content ? data.content : "You don't have access here."
        },
        403: {
            error: true,
            message: data.content ? data.content : "User unknown"
        },
        405: {
            error: true,
            message: `This route can only be access with ${data.content} method.`
        },
        406: {
            error: true,
            message: "This route can only be access by JSON data."
        },
        409: {
            error: true,
            message: data.content ? data.content : "Conclict"
        },
        422: {
            error: true,
            message: data.content ? data.content : "Missing data in body"
        },
        500: {
            error: true,
            message: error && error.message,
            file: error && error.stack
        },
        502: {
            error: true,
            message: data.content ? data.content : "Error server, try later or contact us."
        }
    };

    response.set({
        ...defaultHeader,
        ...data.serverHeader
    });

    if (data.modifyResponse) {
        httpCode[code] = { ...data.modifyResponse };
    }

    if (code === 204) {
        response.end();
    } else {
        response.status(code).json(httpCode[code]);
    }
};
