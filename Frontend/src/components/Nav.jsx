import React from 'react'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLinkedin } from "@fortawesome/free-brands-svg-icons";
import { IoSearchSharp } from "react-icons/io5";
import { TiHome } from "react-icons/ti";
import { FaUsers } from "react-icons/fa";
import { IoIosNotifications } from "react-icons/io";
import profilepicture from "../assets/profile.png";
import { useState, useContext, useEffect, useRef } from "react";
import { UserDataContext } from "../context/UserContext.jsx";
import { AuthDataContext } from "../context/AuthContext.jsx";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { IoIosNotificationsOutline } from "react-icons/io";
import { IoChevronDown } from "react-icons/io5";

const Nav = () => {

  let [activeSearch, setActiveSearch] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loadingResults, setLoadingResults] = useState(false);
  const dropdownRef = useRef();

  let { userData, setUserData } = useContext(UserDataContext);

  let [showPopup, setShowPopup] = useState(false);

  // let { serverUrl } = useContext(AuthDataContext);

  let { serverUrl, authHeader } = useContext(AuthDataContext);


  let navigate = useNavigate();

  const { logout } = useContext(UserDataContext);
  
  // const handleLogout = async () => {
  //   try {
  //     let result = await axios.get(serverUrl + "/api/auth/logout", { withCredentials: true });
  //     console.log(result);
  //     setUserData(null);
  //     navigate("/login");
  //   } catch (err) {
  //     console.log("Error : ", err);
  //   }
  // }

  const handleLogout = async () => {
    try {
        await axios.get(serverUrl + "/api/auth/logout", authHeader());
        logout();
        navigate("/login");
    } catch(err) {
        console.log("Error:", err);
    }
}


  useEffect(() => {
    // click outside to close dropdown
    const onDocClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setActiveSearch(false);
      }
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const id = setTimeout(async () => {
      setLoadingResults(true);
      try {
        // const res = await axios.get(`${serverUrl}/api/user/search?q=${encodeURIComponent(query)}`, { withCredentials: true });
        const res = await axios.get(`${serverUrl}/api/user/search?q=${encodeURIComponent(query)}`, authHeader());
        setResults(res.data || []);
      } catch (err) {
        console.error('Search error', err);
      } finally {
        setLoadingResults(false);
      }
    }, 300);

    return () => clearTimeout(id);
  }, [query]);

  return (
    <>
      {/* NAVBAR */}
      <div className="w-full h-[70px] bg-white fixed top-0 left-0 z-[100] border-b border-gray-200">

        <div onClick={() => setShowPopup(false)}></div>

        {/* CENTERED CONTAINER (LIKE REAL LINKEDIN) */}
        <div className="h-full max-w-[1128px] mx-auto flex items-center justify-between px-4">

          {/* LEFT */}
          <div className="flex items-center gap-4">
            <FontAwesomeIcon
              icon={faLinkedin}
              className="text-[#0A66C2] text-4xl cursor-pointer"
              onClick={() => navigate("/")}
            />

            {/* Desktop Search */}
            <div className="hidden md:flex items-center bg-[#EEF3F8] px-4 rounded-full w-[300px] h-[42px] relative">
              <IoSearchSharp className="text-gray-600 mr-3 text-lg" />
              <input
                type="text"
                placeholder="Search"
                className="bg-transparent outline-none text-sm w-full"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setActiveSearch(true)}
              />

              {activeSearch && (query.trim() || loadingResults) && (
                <div ref={dropdownRef} className="absolute left-0 top-[48px] w-full bg-white rounded-md shadow-lg border border-gray-200 z-50">
                  {loadingResults ? (
                    <div className="p-3 text-sm text-gray-500">Searching...</div>
                  ) : results.length === 0 ? (
                    <div className="p-3 text-sm text-gray-500">No results</div>
                  ) : (
                    results.map(user => (
                      <div key={user._id} className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer" onClick={() => { navigate(`/profile/${user.username}`); setActiveSearch(false); setQuery(""); }}>
                        <img src={user.profileImage || profilepicture} className="w-[36px] h-[36px] rounded-full object-cover" />
                        <div>
                          <div className="font-medium text-sm">{user.firstname} {user.lastname}</div>
                          <div className="text-xs text-gray-500">{user.headline}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* CENTER - Desktop */}
          <div className="hidden md:flex items-center gap-10 text-gray-600">
            <div className="flex flex-col items-center cursor-pointer hover:text-black transition">
              <TiHome className="text-2xl text-gray-700" onClick={() => navigate("/")} />
              <span className="text-xs" onClick={() => navigate("/")} >
                Home
              </span>
            </div>

            <div className="flex flex-col items-center cursor-pointer hover:text-black transition">
              <FaUsers className="text-2xl text-gray-700" onClick={() => navigate("/network")} />
              <span className="text-xs" onClick={() => navigate("/network")}>
                Network
              </span>
            </div>

            <div className="flex flex-col items-center cursor-pointer hover:text-black transition">
              <IoIosNotifications className="text-2xl text-gray-700" onClick={() => navigate("/notifications")} />
              <span className="text-xs" onClick={() => navigate("/notifications")}>
                Notifications
              </span>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-6 relative">

            {/* Mobile Search */}
            <button
              className="md:hidden"
              onClick={() => setActiveSearch(true)}
            >
              <IoSearchSharp className="text-2xl text-gray-700" />
            </button>

            <button className="md:hidden">
              <FaUsers className="text-2xl text-gray-700" onClick={() => navigate("/network")} />
            </button>


            {/* Mobile Notification */}
            <button className="md:hidden">
              <IoIosNotifications className="text-2xl text-gray-700" onClick={() => navigate("/notifications")} />
            </button>

            {/* Profile */}
            <div
              className="flex flex-col items-center cursor-pointer"
              onClick={() => setShowPopup(!showPopup)}
            >

              <div className="w-[30px] h-[30px] rounded-full overflow-hidden border border-gray-300">
                <img
                  src={userData.profileImage || profilepicture}
                  alt="profile"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex items-center text-[12px] text-gray-600">
                Me
                <IoChevronDown className="ml-1 text-[12px]" />
              </div>

            </div>



            {/* Popup */}
            {showPopup && (
              <div className="absolute right-0 top-[65px] w-[280px] bg-white rounded-xl shadow-xl border border-gray-200 p-5">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-[55px] h-[55px] rounded-full overflow-hidden">
                    <img
                      src={userData.profileImage || profilepicture}
                      alt="profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="font-semibold text-sm">
                      {userData.firstname} {userData.lastname}
                    </div>
                    <div className="text-xs text-gray-500">
                      {userData.headline || "N/A"}
                    </div>
                  </div>
                </div>

                <button className="w-full py-2 border border-[#0A66C2] text-[#0A66C2] rounded-full text-sm hover:bg-[#E8F3FF] transition"
                  onClick={() => navigate("/profile")}
                >
                  View Profile
                </button>

                <div className="border-t border-gray-200 my-4"></div>

                <button
                  onClick={handleLogout}
                  className="w-full py-2 border border-red-500 text-red-500 rounded-full text-sm hover:bg-red-50 transition"
                >
                  Log Out
                </button>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* MOBILE SEARCH OVERLAY */}
      {activeSearch && (
        <div className="fixed top-0 left-0 w-full h-[70px] bg-white flex items-center px-4 z-[200] border-b border-gray-200 md:hidden">
          <IoSearchSharp className="text-xl text-gray-600 mr-3" />
          <input
            type="text"
            placeholder="Search"
            className="flex-1 outline-none text-sm"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setActiveSearch(true)}
          />
          <button
            className="ml-3 text-sm text-[#0A66C2]"
            onClick={() => { setActiveSearch(false); setQuery(""); setResults([]); }}
          >
            Cancel
          </button>
        </div>
      )}

      {/* Mobile search results dropdown */}
      {activeSearch && (query.trim() || loadingResults) && (
        <div className="md:hidden fixed top-[70px] left-0 w-full z-[200] px-4">
          <div className="bg-white rounded-md shadow-lg border border-gray-200">
            {loadingResults ? (
              <div className="p-3 text-sm text-gray-500">Searching...</div>
            ) : results.length === 0 ? (
              <div className="p-3 text-sm text-gray-500">No results</div>
            ) : (
              results.map(user => (
                <div key={user._id} className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer" onClick={() => { navigate(`/profile/${user.username}`); setActiveSearch(false); setQuery(""); }}>
                  <img src={user.profileImage || profilepicture} className="w-[36px] h-[36px] rounded-full object-cover" />
                  <div>
                    <div className="font-medium text-sm">{user.firstname} {user.lastname}</div>
                    <div className="text-xs text-gray-500">{user.headline}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default Nav



