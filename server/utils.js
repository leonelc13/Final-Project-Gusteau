const jwt = require('jsonwebtoken');
require('dotenv').config();
const authenticateUser = (userid) => {

    try {
        const token = jwt.sign({username: userid}, process.env.KEY, {expiresIn: '120s'});
        console.log('token', token);
        return token;
    } catch (err) {
        console.log('error', err.message);
    }
};

module.exports = { authenticateUser };