import React from 'react'
import Nav from '../components/Nav.jsx';
import axios from 'axios';
import { useContext } from 'react';
import { AuthDataContext } from '../context/AuthContext.jsx';
import { useEffect } from 'react';
import profilepicture from "../assets/profile.png";

const Network = () => {

    let { serverUrl, authHeader } = useContext(AuthDataContext);

    let [connections, setConnections] = React.useState([]);

    const handleGetRequests = async () => {
        try {
            let result = await axios.get(`${serverUrl}/api/connection/requests`, authHeader());
            console.log(result.data);
            setConnections(result.data);
        } catch (err) {
            console.log(err);
        }
    }

    useEffect(() => {
        handleGetRequests();
    }, []);

    const handleAcceptConnection = async(requestId) => {
        try{
            let result = await axios.put(`${serverUrl}/api/connection/accept/${requestId}`, {}, authHeader());
            console.log("Connection accepted:", result.data);
            await handleGetRequests();
        }catch(err){
            console.log(err);
        }
    }

    const handleRejectConnection = async(requestId) => {
        try{
            let result = await axios.put(`${serverUrl}/api/connection/reject/${requestId}`, {}, authHeader());
            console.log("Connection rejected:", result.data);
            await handleGetRequests();
        }catch(err){
            console.log(err);
        }
    }

    return (
        <div className="w-screen min-h-screen bg-[#F4F2EE] pt-[100px] px-[20px] flex flex-col gap-[15px]">

            <Nav />

            {/* Invitations Header */}
            <div className="w-full h-[80px] bg-white shadow rounded-2xl flex items-center px-[20px] text-[22px] text-gray-700 font-semibold">
                Invitations ({connections.length})
            </div>

            {/* Requests List */}
            {connections.length > 0 &&
                <div className="w-full bg-white shadow rounded-2xl flex flex-col gap-[15px] p-[20px]">

                    {
                        connections.map((connection) => (

                            <div key={connection._id} className="flex items-center justify-between">

                                <div className="flex items-center gap-[12px]">

                                    <div className="w-[55px] h-[55px] rounded-full overflow-hidden">
                                        <img
                                            src={connection.sender?.profileImage || profilepicture}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    <div className="flex flex-col">

                                        <div className="font-semibold text-[16px]">
                                            {connection.sender?.firstname} {connection.sender?.lastname}
                                        </div>

                                        <div className="text-[13px] text-gray-500">
                                            {connection.sender?.headline}
                                        </div>

                                    </div>

                                </div>

                                <div className="flex gap-[10px]">

                                    <button onClick={() => handleAcceptConnection(connection._id)} className="bg-[#0A66C2] text-white px-[16px] py-[6px] rounded-full">
                                        Accept
                                    </button>

                                    <button onClick={() => handleRejectConnection(connection._id)} className="border px-[16px] py-[6px] rounded-full">
                                        Ignore
                                    </button>

                                </div>

                            </div>

                        ))
                    }

                </div>
            }

            {/* No Requests */}
            {connections.length === 0 &&
                <div className="w-full bg-white shadow rounded-2xl flex items-center justify-center min-h-[120px] text-[18px] text-gray-500">
                    No New Requests
                </div>
            }

        </div>
    )
}

export default Network;
