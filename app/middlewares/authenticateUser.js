const jwt = require('jsonwebtoken');
const authenticateuser = (req, res, next) => {
    const header = req.headers['authorization'];
    if (!header) {
        return res.status(401).json({ error: 'token not provided' });
    }
    const token = header.startsWith('Bearer ') ? header.slice(7) : header;
    try {
        let tokenData = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = tokenData.userId;
        req.userRole = tokenData.role;
        req.user = { role: tokenData.role };
        next();
    } catch (err) {
        console.log(err);
        return res.status(401).json({ error: 'Invalid token' });
    }
};
module.exports = authenticateuser;
