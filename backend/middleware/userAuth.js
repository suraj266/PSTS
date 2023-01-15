const jwt = require("jsonwebtoken");
const User = require("../model/UserReg")
let checkAuth;
const userAuth = async (req, res, next) => {
    try {
        const authorization = req.headers.authorization;
        if (authorization && authorization.startsWith("Bearer")) {

            const token =  authorization.split(" ")[1];
            const {_id} = jwt.verify(token, process.env.SECRET_KEY);
            const rootUser = await User.findOne({ _id: _id });

            if (!rootUser) { throw new Error('User Not found') }

            req.token = token;
            req.rootUser = rootUser;
            req.userID = rootUser._id;
            checkAuth='user';
            next();
        }

    } catch (err) {
        console.log(err);
        res.status(401).send('Unauthorized:No token provided')
    }
}

module.exports = userAuth;