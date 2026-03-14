import express from "express";
import {getCurrentUser, updateProfile} from "../controllers/user.controllers.js";
import isAuth from "../middlewares/isAuth.js";
import upload from "../middlewares/multer.js";
import { getProfile, searchUsers, getSuggestedUser } from "../controllers/user.controllers.js";

let userRouter = express.Router();

userRouter.get("/me", isAuth, getCurrentUser);
userRouter.put("/update", isAuth, upload.fields([
    {name: "profileImage", maxCount: 1},
    {name : "coverImage", maxCount: 1}
]), updateProfile);

userRouter.get("/profile/:username", isAuth, getProfile);
userRouter.get("/search", isAuth, searchUsers);
userRouter.get("/suggestions", isAuth, getSuggestedUser);


export default userRouter;