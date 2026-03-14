import jwt from "jsonwebtoken";

const isAuth = async(req,res,next) => {
    try{
        let {token} = req.cookies;
        console.log(token);
        if(!token) {
            return res.status(400).json({message : "user does not have token"})
        }
        let verifyToken = jwt.verify(token, process.env.JWT_SECRET);
        if(!verifyToken){
            return res.status(400).json({message : "user does not have valid token"});
        }
        console.log(verifyToken);
        req.userId = verifyToken.userId;
        next();
    }catch(err){
        return res.status(500).json({message : "auth error"});
    }
}

export default isAuth;
