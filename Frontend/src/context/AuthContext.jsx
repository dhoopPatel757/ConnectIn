// import React from "react";
// import { createContext } from 'react';

// export const AuthDataContext = createContext();

// const AuthContext = ({ children }) => {
//     const serverUrl = "https://connectin-backend-w4o8.onrender.com"; // backend server url
//     let value = {serverUrl};

//     return (
//         <div>
//             <AuthDataContext.Provider value = {value}>
//                 {children}
//             </AuthDataContext.Provider>
//         </div>
//     )
// }

// export default AuthContext;

import React from "react";
import { createContext } from 'react';

export const AuthDataContext = createContext();

const AuthContext = ({ children }) => {
    const serverUrl = "https://connectin-backend-w4o8.onrender.com";

    const getToken = () => localStorage.getItem("token");

    const authHeader = () => ({
        headers: { Authorization: `Bearer ${getToken()}` }
    });

    const authHeaderMultipart = () => ({
        headers: {
            Authorization: `Bearer ${getToken()}`,
            "Content-Type": "multipart/form-data"
        }
    });

    let value = { serverUrl, getToken, authHeader, authHeaderMultipart };

    return (
        <AuthDataContext.Provider value={value}>
            {children}
        </AuthDataContext.Provider>
    )
}

export default AuthContext;
