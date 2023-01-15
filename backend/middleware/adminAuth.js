const Admin = require("../model/Admin");
const jwt = require("jsonwebtoken");

const adminAuth = async (req, res, next) => {
    try {
        const authorization = req.headers.authorization;
        if (authorization && authorization.startsWith("Bearer")) {

            const token = authorization.split(" ")[1];
            const { _id } = jwt.verify(token, process.env.SECRET_KEY);
            const rootAdmin = await Admin.findOne({ _id: _id });

            if (!rootAdmin) { throw new Error('User Not found') }

            req.token = token;
            req.rootAdmin = rootAdmin;
            req.adminID = rootAdmin._id;
            next();
        }

    } catch (err) {
        console.log(err);
        res.status(401).send('Unauthorized:No token provided')
    }
}


module.exports = adminAuth;