import React, { useState, useContext, useEffect } from "react";
import Nav from "../components/Nav.jsx";
import profilepicture from "../assets/profile.png";
import { FiPlus, FiCamera } from "react-icons/fi";
import { UserDataContext } from "../context/UserContext.jsx";
import { useParams } from "react-router-dom";
import { LuPencil } from "react-icons/lu";
import EditProfile from "../components/EditProfile.jsx";
import ConnectionButton from "../components/ConnectionButton.jsx";
import { AuthDataContext } from "../context/AuthContext.jsx";
import axios from "axios";
import Posts from "../components/Posts.jsx";


const Profile = () => {

    const { userData, setUserData, edit, setEdit, postData, setPostData, profileData, setProfileData, handleGetProfile } = useContext(UserDataContext);

    const { username } = useParams();

    const [showConnections, setShowConnections] = useState(false);
    const [showPosts, setShowPosts] = useState(false);

    // new added states using AI
    const [connectionsList, setConnectionsList] = useState([]);
    const [connStatus, setConnStatus] = useState({}); // { userId: 'Connect'|'pending'|'Connected' }

    let [profilePosts, setProfilePosts] = useState([]);

    let [suggestedUser, setSuggestedUser] = useState([]);

    let { serverUrl } = useContext(AuthDataContext);


    let [userConnection, setUserConnection] = useState([]);

    const handleGetUserConnections = async () => {
        try {
            let result = await axios.get(serverUrl + "/api/connection/", { withCredentials: true });
            setUserConnection(result.data);
        } catch (error) {
            console.log(error);
        }
    }

    const handleSuggestedUsers = async () => {
        try {
            let result = await axios.get(`${serverUrl}/api/user/suggestions`, { withCredentials: true });
            setSuggestedUser(result.data);
        } catch (err) {
            console.log('Error fetching suggested users', err);
        }
    }

    // new added functions using AI
    const handleSendConnectionRequest = async (targetUserId) => {
        try {
            await axios.post(`${serverUrl}/api/connection/request/${targetUserId}`, {}, { withCredentials: true });
            setConnStatus(prev => ({ ...prev, [targetUserId]: 'pending' }));
        } catch (err) {
            console.error('Error sending connection request', err);
        }
    }

    // new added functions using AI
    const handleRemoveConnection = async (targetUserId) => {
        try {
            await axios.delete(`${serverUrl}/api/connection/remove/${targetUserId}`, { withCredentials: true });
            // update local userData.connection if present
            if (setUserData && userData) {
                setUserData(prev => ({ ...prev, connection: (prev.connection || []).filter(id => id !== targetUserId) }));
            }
            setConnStatus(prev => ({ ...prev, [targetUserId]: 'Connect' }));
        } catch (err) {
            console.error('Error removing connection', err);
        }
    }

    useEffect(() => {
        handleGetUserConnections();
        handleSuggestedUsers();
    }, []);

    // useEffect(() => {
    //     setProfilePosts(postData.filter((post) => post.author._id == profileData._id));
    // }, [])

    useEffect(() => {
        if (username) {
            handleGetProfile(username);
        }
    }, [username]);

    useEffect(() => {
        if (!profileData?._id) return;

        setProfilePosts(
            postData.filter(post => post.author._id === profileData._id)
        );
    }, [postData, profileData]);

    return (

        <div className="w-full min-h-screen bg-[#F4F2EE] pt-[90px]">
            {edit && <EditProfile />}
            <Nav />

            {/* PAGE CONTAINER */}

            <div className="max-w-[1200px] mx-auto px-[20px] flex gap-[20px]">

                {/* LEFT PROFILE CONTENT */}

                <div className="flex-1 max-w-[750px]">

                    {/* PROFILE CARD */}

                    <div className="bg-white rounded-xl shadow-md overflow-hidden">

                        {/* COVER IMAGE */}

                        <div className="h-[200px] bg-gray-300 relative">

                            {profileData?.coverImage && (
                                <img
                                    src={profileData.coverImage}
                                    className="w-full h-full object-cover"
                                />
                            )}

                            {/* PROFILE IMAGE */}

                            <div className="absolute -bottom-[40px] left-[30px] w-[100px] h-[100px]">

                                <img
                                    src={profileData?.profileImage || profilepicture}
                                    className="w-full h-full rounded-full border-4 border-white object-cover"
                                />

                            </div>

                        </div>

                        {/* PROFILE INFO */}

                        <div className="pt-[60px] pb-[30px] px-[30px]">

                            <div className="flex justify-between items-center">

                                <div>

                                    <div className="text-[22px] font-semibold">
                                        {profileData?.firstname} {profileData?.lastname}
                                    </div>

                                    <div className="text-gray-600">
                                        {profileData?.headline}
                                    </div>

                                    <div className="text-gray-500 text-sm">
                                        {profileData?.location}
                                    </div>

                                    <div className="border- border-gray-200 my-4"></div>

                                    {profileData?._id === userData?._id && (
                                        <button
                                            className="w-full py-2 border border-[#0A66C2] text-[#0A66C2] rounded-full text-sm font-medium hover:bg-[#E8F3FF] transition flex items-center justify-center gap-2"
                                            onClick={() => setEdit(true)}
                                        >
                                            Edit Profile
                                            <LuPencil size={16} />
                                        </button>
                                    )}

                                    {/* Show connect button when viewing someone else's profile */}
                                    {profileData?._id !== userData?._id && (
                                        <div className="mt-3">
                                            <ConnectionButton userId={profileData?._id} />
                                        </div>
                                    )}

                                </div>



                            </div>

                            {/* CONNECTIONS */}
                            {/* new added connections section using AI */}
                            <div
                                className="mt-4 text-[#0A66C2] cursor-pointer font-medium"
                                onClick={() => {
                                    // allow only if viewing own profile or viewer is connected with profile owner
                                    const isOwner = profileData?._id === userData?._id;
                                    const viewerConnected = userData?.connection?.includes(profileData?._id) || profileData?.connection?.some(c => c._id === userData?._id);
                                    if (!isOwner && !viewerConnected) {
                                        alert('You can view connections only if you are connected to this user.');
                                        return;
                                    }

                                    // populate connections list (profileData.connection should be populated)
                                    setConnectionsList(profileData?.connection || []);
                                    // initialize connStatus map
                                    const map = {};
                                    (profileData?.connection || []).forEach(conn => {
                                        const id = conn._id || conn;
                                        if (userData?.connection?.includes(id)) {
                                            map[id] = 'Connected';
                                        } else {
                                            map[id] = 'Connect';
                                        }
                                    });
                                    setConnStatus(map);
                                    setShowConnections(true);
                                }}
                            >
                                {`${(profileData?.connection || []).length} Connections`}
                            </div>

                            

                        </div>

                        

                    </div>


                    {/* CONNECTION POPUP */}

                    {showConnections && (

                        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-40 flex justify-center items-center">

                            <div className="bg-white w-[400px] rounded-lg p-[20px]">

                                <div className="flex justify-between mb-4">

                                    <h2 className="font-semibold">Connections</h2>

                                    <button onClick={() => setShowConnections(false)}>X</button>

                                </div>

                                {connectionsList.map((friend) => (

                                    <div key={friend._id} className="py-2 border-b flex items-center justify-between">

                                        <div className="flex items-center gap-3">
                                            <img src={friend.profileImage || profilepicture} className="w-[40px] h-[40px] rounded-full object-cover" />
                                            <div>
                                                <div className="font-medium">{friend.firstname} {friend.lastname}</div>
                                                <div className="text-sm text-gray-500">{friend.headline}</div>
                                            </div>
                                        </div>

                                    </div>

                                ))}

                            </div>

                        </div>

                    )}

                    {/* SKILLS */}

                    <div className="bg-white mt-[20px] rounded-xl shadow-md p-[20px]">

                        <div className="flex justify-between items-center mb-4">

                            <h2 className="font-semibold text-[18px]">Skills</h2>

                            <button
                                onClick={() => setEdit(true)}
                                className="flex items-center gap-1 text-[#0A66C2] hover:bg-[#E8F3FF] px-3 py-1 rounded-full transition"
                            >
                                <LuPencil size={16} />
                            </button>

                        </div>

                        <div className="flex flex-wrap gap-2">

                            {profileData?.skills?.map((skill, index) => (

                                <span
                                    key={index}
                                    className="bg-gray-200 px-3 py-1 rounded-full text-sm"
                                >
                                    {skill}
                                </span>

                            ))}

                        </div>

                    </div>



                    {/* EDUCATION */}

                    <div className="bg-white mt-[20px] rounded-xl shadow-md p-[20px]">

                        <div className="flex justify-between items-center mb-4">

                            <h2 className="font-semibold text-[18px]">Education</h2>

                            <button
                                onClick={() => setEdit(true)}
                                className="flex items-center gap-1 text-[#0A66C2] hover:bg-[#E8F3FF] px-3 py-1 rounded-full transition"
                            >
                                <LuPencil size={16} />
                            </button>

                        </div>

                        {profileData?.education?.map((edu, index) => (

                            <div key={index} className="mb-3">

                                <div className="font-medium">{edu.college}</div>
                                <div className="text-sm text-gray-500">{edu.degree}</div>
                                <div className="text-sm text-gray-500">{edu.fieldOfStudy}</div>
                                <div className="text-sm text-gray-500">GPA: {edu.GPA}.0</div>
                            </div>

                        ))}

                    </div>


                    {/* EXPERIENCE */}

                    <div className="bg-white mt-[20px] rounded-xl shadow-md p-[20px]">

                        <div className="flex justify-between items-center mb-4">

                            <h2 className="font-semibold text-[18px]">Experience</h2>

                            <button
                                onClick={() => setEdit(true)}
                                className="flex items-center gap-1 text-[#0A66C2] hover:bg-[#E8F3FF] px-3 py-1 rounded-full transition"
                            >
                                <LuPencil size={16} />
                            </button>

                        </div>

                        {profileData?.experience?.map((exp, index) => (

                            <div key={index} className="mb-3">

                                <div className="font-medium">{exp.company}</div>
                                <div className="text-sm text-gray-500">{exp.jobTitle}</div>

                            </div>

                        ))}

                    </div>



                    <br />

                    <div className="w-full h-[100px] flex items-center p-[20px] text-[22px] text-gray-600 bg-white font-semibold bg-shoadow-lg rounded-xl mb-5">
                        {`Post (${profilePosts.length})`}
                    </div>

                    {profilePosts.map((post) => (
                        <div className="mb-5" key={post._id}>

                            <Posts id={post._id} description={post.description} author={post.author} image={post.image} likes={post.likes} comments={post.comments} createdAt={post.createdAt} />
                        </div>
                    ))}

                    <br />
                    

                </div>


                {/* RIGHT PANEL */}

                <div className="hidden xl:block w-[300px]">

                    <div className="hidden xl:block xl:w-[300px] min-h-[200px] bg-white shadow-lg rounded-lg p-[20px] ">

                        <h1 className="text-[20px] text-gray-600 font-semibold mb-4">
                            Suggested Users
                        </h1>
                        {suggestedUser.length > 0 && (
                            <div className="flex flex-col gap-[10px]">
                                {suggestedUser.map((user, index) => (
                                    <div key={index} className="flex items-center gap-4 cursor-pointer" onClick={() => handleGetProfile(user.username)}>
                                        <div className="w-[40px] h-[40px] rounded-full overflow-hidden">
                                            <img src={user.profileImage || profilepicture} alt="profile" className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <div className="font-semibold text-sm">
                                                {user.firstname} {user.lastname}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {user.headline || "N/A"}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {suggestedUser.length === 0 && <div>No Suggested Users</div>}

                    </div>

                </div>

            </div>
 
        </div>
    );
};

export default Profile;
