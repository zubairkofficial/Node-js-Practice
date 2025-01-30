const jwt = require('jsonwebtoken');
const user = require('../models/user.model');
const User = require('../models/user.model');

const authmiddleware = async (req , res , next) => {
    try {
        const authToken = req.headers.authorization;
        if (!authToken || !authToken.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Unauthorized'});
        }

        const token = authToken.split(' ')[1];

        //verify token
        const decoded = jwt.verify(token , process.env.JWT_SECRET);

        console.log(decoded);
        const tokenExp = decoded.exp;
        const currentTime = Math.floor(Date.now() / 1000);
        const timeUntilExp = tokenExp - currentTime;


        //get user from database
        const user = await User.findByPk(decoded.userId);
        if (!user) {
            return res.status(401).json({ message: 'User not found'});
        }


        //Add user to user object
        req.user = user;
        req.tokenExp = tokenExp;
        if(timeUntilExp < 300) {
            res.set('X-token-expiry-warning' , 'Token will expire soon');
        }
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                message: 'Token expired',
                error : "authentication error",
                expiredAt : new Date(err.expiredAt).toISOString()
            });
        }

        throw error;
    }
}
module.exports = authmiddleware;