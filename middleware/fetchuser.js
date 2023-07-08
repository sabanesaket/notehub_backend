//middleware for fetching logged in user details

var jwt = require('jsonwebtoken'); //to generate login key(jwt = jsonwebtoken)
const JWT_SECRET = '$eCrET' //JWT Secret

const fetchuser = (req,res,next) =>{
    // Get the user from the jwt token and add it to req object
    const token = req.header('auth-token');
    console.log(token)
    if(!token){
        res.status(401).send({error:"UNAUTHORIZED"}) //if no token
    }
    try {
        const data = jwt.verify(token,JWT_SECRET);
        console.log(data);
        req.user = data.user;
    } catch (error) {
        // req.user.id = null;
        console.log(req.user)
        console.log("In catch block of fetchuser")
        res.status(401).send({error:"UNAUTHORIZED"}) //if invalid token
    }
    next()
}

module.exports = fetchuser;