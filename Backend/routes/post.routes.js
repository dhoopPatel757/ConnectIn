import express from "express";
import { createPost } from "../controllers/post.controllers.js";
import isAuth from "../middlewares/isAuth.js";
import upload from "../middlewares/multer.js";
import { getPosts } from "../controllers/post.controllers.js";
import { like } from "../controllers/post.controllers.js";
import { comment } from "../controllers/post.controllers.js";``
const postRouter = express.Router();


postRouter.post("/", isAuth, upload.single("image"), createPost);
postRouter.get("/", isAuth, getPosts);
postRouter.post("/:id/like", isAuth, like);
postRouter.post("/:id/comment", isAuth, comment);

export default postRouter;
