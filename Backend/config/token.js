import jwt from "jsonwebtoken";

const generateToken = (userId) => {
    try{
        const token = jwt.sign({userId}, process.env.JWT_SECRET, {expiresIn: "7d"});
        return token;
    }catch(err) {
        console.log("Error of token generation : ", err);
    }
}

export default generateToken;
