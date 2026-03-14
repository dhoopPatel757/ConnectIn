import User from "../models/user.model.js";
import uploadOnCloudinary from "../config/cloudinary.js";

export const getCurrentUser = async (req, res) => {
    try {
        let id = req.userId;
        let user = await User.findById(id).select("-password");

        if (!user) {
            return res.status(400).json({ message: "user does not found" });
        }
        return res.status(200).json(user);
    } catch (err) {
        console.log(err);
        return res.status(400).json({ message: "curruser error" });
    }
}

export const updateProfile = async (req, res) => {
    try {
        let id = req.userId;
        let { firstname, lastname, username, headline, location, gender, skills, education, experience } = req.body;

        skills = skills ? JSON.parse(skills) : [];
        education = education ? JSON.parse(education) : [];
        experience = experience ? JSON.parse(experience) : [];

        let profileImage;
        let coverImage;

        if (req.files?.profileImage) {
            profileImage = await uploadOnCloudinary(req.files.profileImage[0].path);
        }

        if (req.files?.coverImage) {
            coverImage = await uploadOnCloudinary(req.files.coverImage[0].path);
        }

        let user = await User.findByIdAndUpdate(id, {
            firstname, lastname, username, headline, location, gender, skills, education, experience, profileImage, coverImage
        }, { new: true }).select("-password");



        if (!user) {
            return res.status(400).json({ message: "user does not found" });
        }

        return res.status(200).json(user);
    } catch (err) {
        console.log(err);
        return res.status(400).json({ message: "update profile error" });
    }
}


export const getProfile = async(req,res) => {
    try{
        let {username} = req.params;

        let user = await User.findOne({ username }).select("-password").populate("connection", "firstname lastname profileImage headline username");
        
        if(!user){
            return res.status(400).json({ message: "user does not found" });
        }


        return res.status(200).json(user);
    }catch(err){
        console.log(err);
        return res.status(400).json({ message: "get profile error" });
    }
}




export const searchUsers = async (req, res) => {
    try {
        const q = req.query.q || "";
        if (!q.trim()) return res.status(200).json([]);

        // case-insensitive partial match on firstname, lastname, username, headline
        const regex = new RegExp(q, 'i');

        const users = await User.find({
            $or: [
                { firstname: { $regex: regex } },
                { lastname: { $regex: regex } },
                { username: { $regex: regex } },
                { headline: { $regex: regex } }
            ]
        })
        .select('firstname lastname username profileImage headline')
        .limit(10);

        return res.status(200).json(users);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

export const search = async(req,res) => {
    try{
        let { query } = req.query;
        
        let users = await User.find({
            $or: [
                { firstname: { $regex: query, $options: "i" } },
                { lastname: { $regex: query, $options: "i" } },
                { username: { $regex: query, $options: "i" } },
                { headline: { $regex: query, $options: "i" } },
                { skills: { $in: [query] } }
            ]
        }).select("firstname lastname username profileImage headline");

        return res.status(200).json(users);
    }catch(err){
        console.log(err);
        return res.status(400).json({ message: "search error" });
    }
}

export const getSuggestedUser = async(req,res) => {
    try{
        // If user is authenticated, exclude self and existing connections
        if (req.userId) {
            const currentUser = await User.findById(req.userId).select("connection");
            const excluded = [req.userId, ...(currentUser?.connection || [])];
            const suggestedUsers = await User.find({ _id: { $nin: excluded } })
                .select('firstname lastname username profileImage headline')
                .limit(10);
            return res.status(200).json(suggestedUsers);
        }

        // If not authenticated, return a general list (first 10 users)
        const suggestedUsers = await User.find()
            .select('firstname lastname username profileImage headline')
            .limit(10);
        return res.status(200).json(suggestedUsers);
    }catch(err){
        console.log(err);
        return res.status(400).json({ message: "suggested user error" });
    }
}