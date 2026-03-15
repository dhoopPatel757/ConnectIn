import React, { useState, useContext, useEffect } from "react";
import Nav from "../components/Nav.jsx";
import profilepicture from "../assets/profile.png";
import { FiPlus, FiCamera } from "react-icons/fi";
import { UserDataContext } from "../context/UserContext.jsx";
import { LuPencil } from "react-icons/lu";
import EditProfile from "../components/EditProfile.jsx";
import CreatePostPopup from "../components/CreatePostPopup.jsx";
import Posts from "../components/Posts.jsx";
import axios from "axios";
import { AuthDataContext } from "../context/AuthContext.jsx";


const Home = () => {
  const { serverUrl } = useContext(AuthDataContext);
  const { userData, edit, setEdit, postData, setPostData, handleGetProfile } = useContext(UserDataContext);
  const [showPopup, setShowPopup] = useState(false);

  let [suggestedUser, setSuggestedUser] = useState([]);

  const handleSuggestedUsers = async () => {
    try {
      let result = await axios.get(`${serverUrl}/api/user/suggestions`, { withCredentials: true });
      setSuggestedUser(result.data);
    } catch (err) {
      console.log(err);
    }
  }


  useEffect(() => {
    handleSuggestedUsers();
  }, [])


  return (

    // md:flex-row max-w-[1200px] mx-auto
    <div className="w-full min-h-[100vh] bg-[#F4F2EE] pt-[90px] lg:pt-[100px] flex items-start justify-center gap-[20px] px-[20px] flex-col md:flex-row max-w-[1200px] mx-auto">

      {edit && <EditProfile />}
      <Nav />

      {/* LEFT PROFILE CARD */}
      {/* <div className="w-full lg:w-[20%] bg-white rounded-xl shadow-md overflow-hidden"> */}
      <div className="w-full md:w-[300px] bg-white rounded-xl shadow-md overflow-hidden">

        {/* Cover */}
        <div className="relative">

          <div className="h-[90px] bg-gray-300 overflow-hidden">
            {userData.coverImage && (
              <img
                src={userData.coverImage}
                alt="cover"
                className="w-full h-full object-cover"
              />
            )}
          </div>

          {/* <div className="absolute top-4 right-4 bg-gray-800 text-white p-2 rounded-full cursor-pointer hover:scale-105 transition">
            <FiCamera size={16} />
          </div> */}

          {/* Profile */}
          <div className="absolute -bottom-8 left-6 w-[80px] h-[80px]">

            <div
              className="w-full h-full rounded-full border-4 border-white overflow-hidden cursor-pointer"
              onClick={() => setEdit(!edit)}
            >
              <img
                src={userData.profileImage || profilepicture}
                alt="profile"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="absolute bottom-0 right-0 w-[24px] h-[24px] bg-[#0A66C2] rounded-full flex items-center justify-center border-2 border-white cursor-pointer hover:scale-110 transition">
              <FiPlus size={14} className="text-white" onClick={() => setEdit(!edit)} />
            </div>

          </div>

        </div>

        {/* Profile Info */}
        <div className="pt-12 pb-6 px-6">

          <div className="text-lg font-semibold text-gray-800">
            {userData.firstname} {userData.lastname}
          </div>

          <div className="text-sm text-gray-600 mt-1">
            {userData.headline || "N/A"}
          </div>

          <div className="text-sm text-gray-500 mt-1">
            {userData.location || "N/A"}
          </div>

          <div className="border-t border-gray-200 my-4"></div>

          <button
            className="w-full py-2 border border-[#0A66C2] text-[#0A66C2] rounded-full text-sm font-medium hover:bg-[#E8F3FF] transition flex items-center justify-center gap-2"
            onClick={() => setEdit(true)}
          >
            Edit Profile
            <LuPencil size={16} />
          </button>

        </div>

      </div>

      {/* CENTER FEED */}
      {/* <div className="w-full lg:w-[30%] min-h-[200px] bg-[#F4F2EE]] mb-6"> */}
      <div className="flex-1 md:max-w-[550px] min-h-[200px] mb-6">

        <div className="w-full h-[110px] bg-white shadow-md rounded-2xl flex items-center gap-4 px-5 mb-6">

          <div className="w-[50px] h-[50px] rounded-full overflow-hidden">
            <img
              src={userData.profileImage || profilepicture}
              alt="profile"
              className="w-full h-full object-cover"
            />
          </div>

          <button
            onClick={() => setShowPopup(true)}
            className="flex-1 h-[48px] border border-gray-300 rounded-full text-left px-5 text-gray-500 hover:bg-gray-100 transition"
          >
            Start a post
          </button>

        </div>

        <div className="flex flex-col gap-[20px]">
          {postData.map((post) => (
            <Posts key={post._id} id={post._id} description={post.description} author={post.author} image={post.image} likes={post.likes} comments={post.comments} createdAt={post.createdAt} />
          ))}
        </div>




      </div>

      {/* RIGHT PANEL */}
      {/* <div className="w-full lg:w-[20%] min-h-[200px] bg-white shadow-lg rounded-lg p-[20px]"></div> */}
      <div className="hidden xl:block xl:w-[300px] min-h-[200px] bg-white shadow-lg rounded-lg p-[20px] sticky top-[100px]">
        <h1 className="text-[20px] text-gray-600 font-semibold mb-4">
          Suggested Users
        </h1>
        {suggestedUser.length > 0 && 
        <div className = "flex flex-col gap-[10px]">

          {suggestedUser.map((user, index) => (
            <div key={index} className="flex items-center gap-4" onClick = {() => handleGetProfile(user.username)}>
              <div className="w-[40px] h-[40px] rounded-full overflow-hidden">
                <img
                  src={user.profileImage || profilepicture}
                  alt="profile"
                  className="w-full h-full object-cover"
                />
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
        </div>}

        {suggestedUser.length === 0 && <div>
          No Suggested Users
        </div>}

      </div>


      {/* POST POPUP */}
      {showPopup && (
        <CreatePostPopup
          userData={userData}
          showPopup={showPopup}
          setShowPopup={setShowPopup}
        />
      )}

    </div>

  );
};

export default Home;



