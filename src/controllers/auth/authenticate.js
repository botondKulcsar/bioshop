const jwt = require('jsonwebtoken');

module.exports = async (req, res, next) => {

    const authHeader = req.headers?.authorization;
    
    if (!authHeader) {
        return res.sendStatus(401);
    }
    // Bearer tasf4523fastwerfasdf
    const token = authHeader.split(' ')[1];
    
    try {
    // we check the token
    const { _id } = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    if (!_id) {
        return res.sendStatus(403);
    }
    
    req.customerId = _id;

    next();

    } catch (err) {
        console.log(err.message);
        if (err.message === 'jwt expired') {
            return res.sendStatus(403);
        } 
        res.sendStatus(500);
    }
}