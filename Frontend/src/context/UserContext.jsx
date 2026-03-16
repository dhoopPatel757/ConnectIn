
// import { createContext } from "react";
// import { AuthDataContext } from './AuthContext';
// import {useState, useContext, useEffect} from "react";
// import axios from "axios";
// import { io } from 'socket.io-client';

// import { useNavigate } from 'react-router-dom';
// export const UserDataContext = createContext();

// const UserContext = ({ children }) => {

//     let [userData, setUserData] = useState(null);
//     let {serverUrl} = useContext(AuthDataContext);
//     let [edit, setEdit] = useState(false);

//     let [postData, setPostData] = useState([]);
//     let [socket, setSocket] = useState(null);


//     let [profileData, setProfileData] = useState(null);
//     let navigate = useNavigate();

//     let getCurrentUser = async() => {
//         try{
//             let result = await axios.get(serverUrl + "/api/user/me", {withCredentials : true});
//             setUserData(result.data);
//             if(socket){
//                 socket.emit('register', result.data._id);
//             }
//         }catch(err){
//             setUserData(null);
//         }   
//     }

    

//     const handleGetProfile = async(username) => {

//         try{
//             let result = await axios.get(serverUrl + "/api/user/profile/" + username, {withCredentials : true});
//             setProfileData(result.data);
//             navigate("/profile/" + username);
//         }catch(err){
//             console.error("Error fetching profile:", err);
//         }
//     }

//     const getPosts = async() => {
//         try{
//             // change karyo
//             let result = await axios.get(serverUrl + "/api/posts", {withCredentials : true});
//             console.log(result.data);

//             setPostData(result.data);

//         }catch(err){
//             console.error("Error fetching posts:", err);
//         }
//     }

//     useEffect(() => {
//         getCurrentUser();
//         getPosts();
//     }, []);

//     useEffect(() => {
//         if(!serverUrl) return;
//         const s = io(serverUrl);
//         setSocket(s);
//         return () => {
//             s.disconnect();
//         }
//     }, [serverUrl]);

//     useEffect(() => {
//         if(socket && userData){
//             socket.emit('register', userData._id);
//         }
//     }, [socket, userData]);

//     let value = {userData, setUserData, edit, setEdit, postData, setPostData, getPosts, socket, handleGetProfile, profileData, setProfileData};

//     return (
//         <div>
//             <UserDataContext.Provider value={value}>
//                 {children}
//             </UserDataContext.Provider>
//         </div>
//     )
// }

// export default UserContext;

import { createContext } from "react";
import { AuthDataContext } from './AuthContext';
import { useState, useContext, useEffect } from "react";
import axios from "axios";
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';

export const UserDataContext = createContext();

const UserContext = ({ children }) => {
    let [userData, setUserData] = useState(null);
    let { serverUrl, authHeader } = useContext(AuthDataContext);
    let [edit, setEdit] = useState(false);
    let [postData, setPostData] = useState([]);
    let [socket, setSocket] = useState(null);
    let [profileData, setProfileData] = useState(null);
    let navigate = useNavigate();

    let getCurrentUser = async () => {
        try {
            let result = await axios.get(serverUrl + "/api/user/me", authHeader());
            setUserData(result.data);
        } catch(err) {
            setUserData(null);
        }
    }

    const handleGetProfile = async (username) => {
        try {
            let result = await axios.get(serverUrl + "/api/user/profile/" + username, authHeader());
            setProfileData(result.data);
            navigate("/profile/" + username);
        } catch(err) {
            console.error("Error fetching profile:", err);
        }
    }

    const getPosts = async () => {
        try {
            let result = await axios.get(serverUrl + "/api/posts", authHeader());
            setPostData(result.data);
        } catch(err) {
            console.error("Error fetching posts:", err);
        }
    }

    const logout = () => {
        localStorage.removeItem("token");
        setUserData(null);
    }

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            getCurrentUser();
            getPosts();
        }
    }, []);

    useEffect(() => {
        if (!serverUrl) return;
        const s = io(serverUrl);
        setSocket(s);
        return () => { s.disconnect(); }
    }, [serverUrl]);

    useEffect(() => {
        if (socket && userData) {
            socket.emit('register', userData._id);
        }
    }, [socket, userData]);

    let value = { userData, setUserData, edit, setEdit, postData, setPostData, getPosts, getCurrentUser, socket, handleGetProfile, profileData, setProfileData, logout };

    return (
        <UserDataContext.Provider value={value}>
            {children}
        </UserDataContext.Provider>
    )
}

export default UserContext;
