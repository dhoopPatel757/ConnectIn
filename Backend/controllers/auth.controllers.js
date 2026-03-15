import generateToken from "../config/token.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

export const signup = async(req,res) => {
    try{
        let {firstname,lastname,username,email,password} = req.body;

        let existedUsername = await User.findOne({username});

        if(existedUsername){
            return res.status(400).json({message : "Username already exists!"});
        }

        let existedEmail = await User.findOne({email});
        if(existedEmail){
            return res.status(400).json({message : "Email already exists!"});
        }

        if(password.length < 8){
            return res.status(400).json({message : "Password must be at least 8-15 characters long"});
        }

        let hashedPassword = await bcrypt.hash(password,10); // bcrypt has hash function in which we can pass the user password and a salt rounds. Salt rounds make password more secure.

        const user = await User.create({
            firstname,
            lastname,
            username,
            email,
            password : hashedPassword
        });

        let token = generateToken(user._id);

        // parsing token into cookie.
        // res.cookie("token", token, {
        //     httpOnly: true,
        //     maxAge : 7*24*60*60*1000, // 7 days
        //     sameSite : "None",
        //     secure: process.env.NODE_ENVIRONMENT === "production"
        // });

        const isProduction = process.env.NODE_ENV === "production";

        res.cookie("token", token, {
          httpOnly: true,
          maxAge: 7 * 24 * 60 * 60 * 1000,
          sameSite: isProduction ? "None" : "Lax",
          secure: isProduction,
        });

        // return res.status(201).json(user);

        const { password: _, ...safeUser } = user.toObject();
        return res.status(201).json(safeUser);

    }catch(err) {
        console.log(err);
        return res.status(500).json({message: "error"});
    }
};


export const login = async(req,res) => {
    try{
       let {email,password} = req.body;

        let user = await User.findOne({email});
        if(!user){
            return res.status(400).json({message : "User does not exist!"});
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch){
            return res.status(400).json({message : "Your password is Invalid!"});
        }

        let token = generateToken(user._id);

        // res.cookie("token", token, {
        //     httpOnly: true,
        //     maxAge : 7*24*60*60*1000, // 7 days
        //     sameSite : "None",
        //     secure: process.env.NODE_ENVIRONMENT === "production"
        // });

        const isProduction = process.env.NODE_ENV === "production";

        res.cookie("token", token, {
          httpOnly: true,
          maxAge: 7 * 24 * 60 * 60 * 1000,
          sameSite: isProduction ? "None" : "Lax",
          secure: isProduction,
        });

        // return res.status(200).json(user);
        const { password: _, ...safeUser } = user.toObject();
        return res.status(200).json(safeUser);
    }catch(err) {
        return res.status(500).json({message : "error"});
    }
}

export const logout = (req,res) => {
    try{
        const isProduction = process.env.NODE_ENV === "production";
        res.clearCookie("token", {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "None" : "Lax"
    });
        return res.status(200).json({message : "Logout successful"});
    }catch(err) {
        console.log("Error : ", err);
        return res.status(500).json({message : "error"});
    }
}
