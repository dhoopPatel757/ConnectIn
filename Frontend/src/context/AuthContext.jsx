import React from "react";
import { createContext } from 'react';

export const AuthDataContext = createContext();

const AuthContext = ({ children }) => {
    const serverUrl = "http://localhost:8000"; // backend server url
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
