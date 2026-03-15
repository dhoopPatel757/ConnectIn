// import jwt from "jsonwebtoken";

// const isAuth = async(req,res,next) => {
//     try{
//         let {token} = req.cookies;
//         if(!token) {
//             return res.status(401).json({message : "Unauthorized"});
//         }
//         let verifyToken = jwt.verify(token, process.env.JWT_SECRET);
//         if(!verifyToken){
//             return res.status(400).json({message : "user does not have valid token"});
//         }
//         req.userId = verifyToken.userId;
//         next();
//     }catch(err){
//         return res.status(401).json({message : "Session expired. Please log in again."});  // ✅
//     }
// }

// export default isAuth;

import jwt from "jsonwebtoken";

const isAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const token = authHeader.split(" ")[1];
        let verifyToken = jwt.verify(token, process.env.JWT_SECRET);
        if (!verifyToken) {
            return res.status(401).json({ message: "Invalid token" });
        }
        req.userId = verifyToken.userId;
        next();
    } catch (err) {
        return res.status(401).json({ message: "Session expired. Please log in again." });
    }
}

export default isAuth;
