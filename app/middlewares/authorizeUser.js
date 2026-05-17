const authorizerUser = (roles) => {
    return (req, res, next) => {
        const role = req.userRole || (req.user && req.user.role);
        if (roles.includes(role)) {
            next();
        } else {
            res.status(403).json({ error: 'you are not authorized' });
        }
    };
};
module.exports = authorizerUser;
