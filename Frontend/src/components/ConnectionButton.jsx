import React from 'react';
import { useContext } from 'react';
import { AuthDataContext } from '../context/AuthContext';
import { UserDataContext } from '../context/UserContext';
import axios from 'axios';
import { useEffect, useState } from 'react';
// socket is provided by UserDataContext
import { useNavigate } from 'react-router-dom';


const ConnectionButton = ({ userId }) => {
    let { serverUrl, authHeader } = useContext(AuthDataContext);
    let { userData, setUserData, socket } = useContext(UserDataContext);
    let [status, setStatus] = useState("Connect");
    let [error, setError] = useState("");
    let navigate = useNavigate();

    const handleSendConnection = async () => {
        if (!userData) return;
        if (userData._id === userId) {
            setError("You cannot send connection request to yourself.");
            return;
        }
        try {
            setError("");
            // const result = await axios.post(`${serverUrl}/api/connection/request/${userId}`, {}, { withCredentials: true });
            const result = await axios.post(`${serverUrl}/api/connection/request/${userId}`, {}, authHeader());
            console.log(result.data);
            await handleGetStatus();
        } catch (err) {
            const msg = err.response?.data?.message || err.message;
            console.error("Send connection error:", msg);
            setError(msg);
        }
    }

    // const handleRemoveConnection = async () => {
    //     try {
    //         let result = await axios.delete(`${serverUrl}/api/connection/remove/${userId}`, { withCredentials: true });
    //         console.log("Connection request sent:", result.data);
    //         setStatus("Connect");

    //         socket.emit("statusUpdate", {
    //             updatedUserId: userId,
    //             newStatus: "Connect"
    //         });
    //     } catch (err) {
    //         console.log("Error sending connection request:", err);
    //     }
    // }

    const handleRemoveConnection = async () => {
    try {
        let result = await axios.delete(`${serverUrl}/api/connection/remove/${userId}`, authHeader());
        setStatus("Connect");  // ✅ UI updates fine, server handles the socket
    } catch (err) {
        console.log("Error removing connection:", err);
    }
}

    const handleGetStatus = async () => {
        if (!userId || !serverUrl) return;
        try {
            let result = await axios.get(`${serverUrl}/api/connection/status/${userId}`, authHeader());
            console.log("Connection status fetched:", result.data);
            setStatus(result.data.status);
        } catch (err) {
            console.log("Error fetching connection status:", err);
        }
    }

    useEffect(() => {
        if (!userData || !serverUrl || !userId || !socket) return;

        socket.emit("register", userData._id);
        handleGetStatus();
        const handleStatusUpdate = ({ updatedUserId, newStatus }) => {
            if (updatedUserId === userId) { setStatus(newStatus); }
        };
        socket.on("statusUpdate", handleStatusUpdate);
        return () => { socket.off("statusUpdate", handleStatusUpdate); }
        
    }, [userId, userData, serverUrl]);
    

//     useEffect(() => {
//     if (!userData || !serverUrl || !userId || !socket) return;

//     socket.emit("register", userData._id);
//     handleGetStatus();

//     const handler = ({ updatedUserId, newStatus }) => {
//         if (updatedUserId === userId) {
//             setStatus(newStatus);
//         }
//     };

//     socket.on("statusUpdate", handler);

//     return () => {
//         socket.off("statusUpdate", handler);
//     };
// }, [userId, userData, serverUrl, socket]);
    

    const handleClick = async () => {

        if (status === "Connected") {
            await handleRemoveConnection();
            setStatus("Connect");
        } else if (status === "Connect") {
            await handleSendConnection();
        } else if (status === "pending") {
            // pending: request sent by current user
            navigate("/network");
        } else if (status === "received") {
            // user has received a request — navigate to requests/accept page
            navigate("/network");
        }
    };
    return (

        <button className="min-w-[100px] py-2 border border-[#0A66C2] text-[#0A66C2] rounded-full text-sm hover:bg-[#E8F3FF] transition" onClick={handleClick}>
            {status}

            {/* {status === "Connected" ? "disconnect" : status} */}
        </button>

    )
}

export default ConnectionButton
