import Post from "../models/post.model.js";
import uploadOnCloudinary from "../config/cloudinary.js";
import {io, userSocketMap} from "../index.js";
import Notification from "../models/notification.model.js";

export const createPost = async (req, res) => {
    try {
        let { description } = req.body;
        let newPost;
        if (req.file) {
            let image = await uploadOnCloudinary(req.file.path);
            newPost = await Post.create({
                author: req.userId,
                description,
                image
            })
        } else {
            newPost = await Post.create({
                author: req.userId,
                description
            })
        }

        res.status(201).json(newPost);
    } catch (err) {
        console.error("createPost error:", err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
}


export const getPosts = async (req, res) => {
    try {
        const posts = await Post.find().populate("author", "firstname lastname username profileImage headline")
        .populate("comments.user", "firstname lastname username profileImage headline")
        .sort({ createdAt: -1 });
        res.status(200).json(posts);
    } catch (err) {
        console.error("getPosts error:", err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
}

export const like = async (req, res) => {
    try {

        let postId = req.params.id;
        let userId = req.userId;

        let post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({ message: "Post not found!" });
        }

        if (post.likes.includes(userId)) {
            post.likes = post.likes.filter(
                (id) => id.toString() !== userId
            );
        } else {
            post.likes.push(userId);
            let created = await Notification.create({
                receiver : post.author,
                type : "like",
                relatedUser : userId,
                relatedPost : postId
            });

            try{
                let populated = await Notification.findById(created._id)
                    .populate("relatedUser", "firstname lastname username profileImage headline")
                    .populate("relatedPost", "image description");
                let receiverSocketId = userSocketMap.get(post.author.toString());
                if(receiverSocketId){
                    io.to(receiverSocketId).emit('newNotification', populated);
                }
            }catch(e){
                console.error('emit notification error', e);
            }
        }

        await post.save();

        io.emit("likeUpdated", { postId, likes: post.likes});

        res.status(200).json({
            userId,
            likes: post.likes
        });

    } catch (err) {
        console.error("like error:", err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
}

export const comment = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.userId;
        const { content } = req.body;

        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({ message: "Post not found!" });
        }

        post.comments.push(
            {
                content,
                user: userId
            }
        );

        await post.save();

        const updatedPost = await Post.findById(postId)
            .populate("author", "firstname lastname profileImage headline")
            .populate("comments.user", "firstname lastname profileImage headline");
        
        let created = await Notification.create({
            receiver : post.author,
            type : "comment",
            relatedUser : userId,
            relatedPost : postId,
            commentText: content
        });
        try{
            let populated = await Notification.findById(created._id)
                .populate("relatedUser", "firstname lastname username profileImage headline")
                .populate("relatedPost", "image description");
            let receiverSocketId = userSocketMap.get(post.author.toString());
            if(receiverSocketId){
                io.to(receiverSocketId).emit('newNotification', populated);
            }
        }catch(e){
            console.error('emit notification error', e);
        }
        
        io.emit("commentAdded", {postId, comm: updatedPost.comments});

        res.status(200).json(updatedPost);

    } catch (err) {
        console.error("comment error:", err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
}


