import React from "react";
import { createContext } from 'react';

export const AuthDataContext = createContext();

const AuthContext = ({ children }) => {
    const serverUrl = "https://connectin-backend-w4o8.onrender.com"; // backend server url
    let value = {serverUrl};

    return (
        <div>
            <AuthDataContext.Provider value = {value}>
                {children}
            </AuthDataContext.Provider>
        </div>
    )
}

export default AuthContext;
