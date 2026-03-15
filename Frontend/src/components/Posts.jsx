import React, { useState, useContext, useEffect } from "react";
import profilepicture from "../assets/profile.png";
import { FiThumbsUp, FiMessageCircle } from "react-icons/fi";
import moment from "moment";
import { AuthDataContext } from "../context/AuthContext";
import { UserDataContext } from "../context/UserContext";
import ConnectionButton from "./ConnectionButton";
import axios from "axios";


const Posts = ({ id, author, likes, comments, description, image, createdAt }) => {

    const { socket } = useContext(UserDataContext);

    const { serverUrl } = useContext(AuthDataContext);
    const { userData, handleGetProfile } = useContext(UserDataContext);
    const { getPosts } = useContext(UserDataContext);

    const [expanded, setExpanded] = useState(false);
    const [postLikes, setPostLikes] = useState(likes || []);
    const [postComments, setPostComments] = useState(comments || []);
    const [showComments, setShowComments] = useState(false);
    const [commentInput, setCommentInput] = useState("");

    const profileImage = author?.profileImage || profilepicture;
    // const name = author.firstname + " " + author.lastname;

    const name = author ? `${author.firstname} ${author.lastname}` : "Unknown User";
    const headline = author?.headline || "LinkedIn User";

    const maxLength = 300;

    // const isLongText = description.length > maxLength;

    // const displayedText = expanded
    //     ? description
    //     : description.substring(0, maxLength);

    const safeDescription = description || "";                 // ✅ fallback to empty string
    const isLongText = safeDescription.length > maxLength;
    const displayedText = expanded
        ? safeDescription
        : safeDescription.substring(0, maxLength);

    const isLiked = postLikes.includes(userData?._id);

    /* LIKE POST */
    // const handleLike = async () => {

    //     try {

    //         const result = await axios.post(
    //             serverUrl + "/api/posts/" + id + "/like",
    //             {},
    //             { withCredentials: true }
    //         );

    //         const userId = result.data.userId;

    //         if (postLikes.includes(userId)) {
    //             setPostLikes(prev => prev.filter(id => id !== userId));
    //         } else {
    //             setPostLikes(prev => [...prev, userId]);
    //         }

    //     } catch (err) {
    //         console.error("Error liking post:", err);
    //     }

    // };

    const handleLike = async () => {
        try {
            const result = await axios.post(
                `${serverUrl}/api/posts/${id}/like`,
                {},
                { withCredentials: true }
            );

            setPostLikes(result.data.likes);
        } catch (err) {
            console.error("Error liking post:", err);
        }
    };

    /* ADD COMMENT (Optimistic UI) */
    const handleComment = async (e) => {

        e.preventDefault();

        if (!commentInput.trim()) return;

        const newComment = {
            _id: Date.now(),
            content: commentInput,
            user: userData
        };

        try {

            await axios.post(
                serverUrl + "/api/posts/" + id + "/comment",
                { content: newComment.content },
                { withCredentials: true }
            );

            /* Instant UI update */
            setPostComments(prev => [...prev, newComment]);
            setCommentInput("");

        } catch (err) {

            console.error("Error adding comment:", err);

        }

    };

    // Listen for real-time like updates
    // useEffect(() => {
    //     if(!socket) return;
    //     socket.on("likeUpdated", ({ postId, likes }) => {
    //         if (postId === id) {
    //             setPostLikes(likes);
    //         }
    //     });
    //     socket.on("commentAdded", ({ postId, comm }) => {
    //         if (postId === id) {
    //             setPostComments(comm);
    //         }
    //     });

    //     return () => {
    //         socket.off("likeUpdated");
    //         socket.off("commentAdded");
    //     }
    // }, [id]);

    useEffect(() => {
    if(!socket) return;
    const handleLikeUpdated = ({ postId, likes }) => {
        if (postId === id) setPostLikes(likes);
    };
    const handleCommentAdded = ({ postId, comm }) => {
        if (postId === id) setPostComments(comm);
    };
    socket.on("likeUpdated", handleLikeUpdated);
    socket.on("commentAdded", handleCommentAdded);
    return () => {
        socket.off("likeUpdated", handleLikeUpdated);   // ✅
        socket.off("commentAdded", handleCommentAdded); // ✅
    }
}, [id, socket]);


    // useEffect(() => {
    //     getPosts();
    // }, [postLikes, setPostLikes, postComments, setPostComments]);

    return (

        <div className="w-full bg-white rounded-xl shadow-md overflow-hidden">

            {/* AUTHOR */}
            {/* <div className="flex items-center gap-3 p-4">

                <img
                    src={profileImage}
                    className="w-[48px] h-[48px] rounded-full object-cover"
                />

                <div className="flex flex-col">

                    <span className="font-semibold text-[15px] text-gray-800">
                        {name}
                    </span>

                    <span className="text-[13px] text-gray-500">
                        {headline}
                    </span>

                    <span className="text-[11px] text-gray-400">
                        {moment(createdAt).fromNow()}
                    </span>

                </div>

                <ConnectionButton/>

            </div> */}

            <div className="flex items-center justify-between p-4">

                {/* LEFT SIDE */}
                <div
                    className="flex items-center gap-3"
                    onClick={() => handleGetProfile(author.username)}
                    
                >

                    <img
                        src={profileImage}
                        className="w-[48px] h-[48px] rounded-full object-cover"
                    />

                    <div className="flex flex-col">

                        <span className="font-semibold text-[15px] text-gray-800">
                            {name}
                        </span>

                        <span className="text-[13px] text-gray-500">
                            {headline}
                        </span>

                        <span className="text-[11px] text-gray-400">
                            {moment(createdAt).fromNow()}
                        </span>

                    </div>

                </div>

                {/* RIGHT SIDE */}
                {/* {userData && userData._id !== author._id && (
                    <ConnectionButton userId={author._id} />
                )} */}

                {userData && author && userData._id !== author._id && (
    <ConnectionButton userId={author._id} />
)}
                
            </div>

            {/* POST TEXT */}
            <div className="px-4 pb-3 text-[15px] text-gray-800">

                {displayedText}

                {isLongText && !expanded && "... "}

                {isLongText && (
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="text-[#0A66C2] font-medium ml-1 hover:underline"
                    >
                        {expanded ? "Show less" : "Read more"}
                    </button>
                )}

            </div>

            {/* IMAGE */}
            {image && (
                <img
                    src={image}
                    className="w-full object-contain"
                />
            )}

            {/* LIKE / COMMENT COUNT */}
            <div className="flex justify-between text-[13px] text-gray-500 px-4 py-2 border-b">

                <span>{postLikes.length} Likes</span>

                <span>{postComments.length} Comments</span>

            </div>

            {/* ACTION BUTTONS */}
            <div className="flex justify-around items-center py-2">

                <button
                    onClick={handleLike}
                    className={`flex items-center gap-2 hover:bg-gray-100 px-4 py-2 rounded-md
                    ${isLiked ? "text-[#0A66C2]" : "text-gray-600"}`}
                >
                    <FiThumbsUp size={18} />
                    Like
                </button>

                <button
                    onClick={() => setShowComments(!showComments)}
                    className="flex items-center gap-2 hover:bg-gray-100 px-4 py-2 rounded-md text-gray-600"
                >
                    <FiMessageCircle size={18} />
                    Comment
                </button>

            </div>

            {/* COMMENTS */}
            {showComments && (

                <div>

                    {/* COMMENT INPUT */}
                    <div className="px-4 py-3 border-t">

                        <form className="flex items-center gap-3" onSubmit={handleComment}>

                            <img
                                src={userData?.profileImage || profilepicture}
                                className="w-[36px] h-[36px] rounded-full object-cover"
                            />

                            <input
                                type="text"
                                placeholder="Write a comment..."
                                className="flex-1 bg-gray-100 border border-gray-200 rounded-full px-4 py-2 outline-none"
                                value={commentInput}
                                onChange={(e) => setCommentInput(e.target.value)}
                            />

                            <button className="bg-[#0A66C2] text-white px-5 py-2 rounded-full">
                                Post
                            </button>

                        </form>

                    </div>

                    {/* COMMENT LIST */}
                    <div className="px-4 pb-4 flex flex-col gap-4">

                        {postComments.map((comm) => (

                            <div key={comm._id} className="flex items-start gap-3">

                                <img
                                    src={comm.user?.profileImage || profilepicture}
                                    className="w-[36px] h-[36px] rounded-full object-cover"
                                />

                                <div className="flex flex-col">

                                    <span className="text-[14px] font-semibold text-gray-800">
                                        {comm.user?.firstname} {comm.user?.lastname}
                                    </span>

                                    <span className="text-[12px] text-gray-500">
                                        {comm.user?.headline}
                                    </span>

                                    <div className="bg-gray-100 rounded-xl px-4 py-2 mt-1 text-[14px]">
                                        {comm.content}
                                    </div>

                                    <div className="text-[12px] text-gray-500">
                                        {moment(comm.createdAt).fromNow()}
                                    </div>

                                </div>

                            </div>

                        ))}

                    </div>

                </div>

            )}

        </div>

    );

};

export default Posts;



