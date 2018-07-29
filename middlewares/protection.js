const jwt = require('jsonwebtoken');
const apikey = require('../config/settings').secretKey;
module.exports.TokenSecurity = (request, response, next) => {
    let token = request.query.token;
    try {
        if (!token) {
            return response.status(401).json({
                status: false,
                statusCode: 401,
                msg: 'Unauthorized | Your token is not valid'
            });
        }
        // Verify token
        jwt.verify(token, apikey, (err, decoded) => {
            if (err) {
                return response.status(401).json({
                    status: false,
                    statusCode: 401,
                    msg: 'Unauthorized | Your token is not valid',
                    err
                });
            }
            request.data = decoded;
            next();
        });
    } catch (error) {
        throw error;
    }
}