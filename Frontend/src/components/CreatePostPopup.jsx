import React, { useState, useRef } from "react";
import profilepicture from "../assets/profile.png";
import { FiX, FiImage } from "react-icons/fi";
import { useContext } from "react";
import { AuthDataContext } from "../context/AuthContext.jsx";
import { UserDataContext } from "../context/UserContext.jsx";
import axios from "axios";

const CreatePostPopup = ({ userData, showPopup, setShowPopup }) => {

    let { serverUrl, authHeader } = useContext(AuthDataContext);
    const imageInput = useRef(null);
    let {setPostData} = useContext(UserDataContext);
    let [frontendImage, setFrontendImage] = useState(null);
    let [backendImage, setBackendImage] = useState(null);
    let [description, setDescription] = useState("");

    let [posting, setPosting] = useState(false);

    let handleImage = (e) => {
        let file = e.target.files[0];
        if (!file) return;

        setBackendImage(file);
        setFrontendImage(URL.createObjectURL(file));
    };

    async function handleUploadPost() {
        setPosting(true);
        try {
            let formdata = new FormData();
            formdata.append("description", description);

            if (backendImage) {
                formdata.append("image", backendImage);
            }

            // change karyo api/post/create
            let result = await axios.post(serverUrl + "/api/posts", formdata, authHeader());

            // Refresh posts so UI updates without manual refresh
            try {
                // change karyo /api/post/all
                const posts = await axios.get(serverUrl + "/api/posts", authHeader());
                setPostData(posts.data);
            } catch (fetchErr) {
                console.error("Failed to refresh posts:", fetchErr);
            }

            // reset UI
            setDescription("");
            setBackendImage(null);
            setFrontendImage(null);
            setShowPopup(false);
        } catch (err) {
            console.log(err);
            setPosting(false);  // ✅ re-enable button on error
        }
    }

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">

            {/* Popup */}
            <div className="w-[95%] sm:w-[550px] md:w-[700px] bg-white rounded-xl shadow-xl flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b">

                    <div className="flex items-center gap-3">
                        <img
                            src={userData.profileImage || profilepicture}
                            alt="profile"
                            className="w-[45px] h-[45px] rounded-full object-cover"
                        />

                        <div className="font-semibold text-gray-800">
                            {userData.firstname} {userData.lastname}
                        </div>
                    </div>

                    <button
                        onClick={() => setShowPopup(false)}
                        className="text-gray-500 hover:text-black"
                    >
                        <FiX size={22} />
                    </button>

                </div>

                {/* Content Area */}
                <div className="px-6 py-4 flex flex-col gap-4 overflow-y-auto">

                    {/* Textarea */}
                    <textarea
                        placeholder="What do you want to talk about?"
                        className="w-full min-h-[180px] resize-none outline-none text-[18px] text-gray-700"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />

                    {/* Image Preview */}
                    {frontendImage && (
                        <img
                            src={frontendImage}
                            alt="preview"
                            className="w-full max-h-[900px] object-cover rounded-lg"
                        />
                    )}

                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-6 py-4 border-t">

                    {/* Hidden file input */}
                    <input
                        type="file"
                        ref={imageInput}
                        hidden
                        onChange={handleImage}
                    />

                    <button
                        onClick={() => imageInput.current.click()}
                        className="flex items-center gap-2 text-gray-600 hover:text-black"
                    >
                        <FiImage size={20} />
                        Photo
                    </button>

                    <button className="bg-[#0A66C2] text-white px-6 py-2 rounded-full hover:bg-[#084c96] transition" disabled = {posting} onClick={handleUploadPost}>
                        {posting ? "Posting..." : "Post"}
                    </button>

                </div>

            </div>

        </div>
    );
};

export default CreatePostPopup;
