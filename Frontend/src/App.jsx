import { Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import { UserDataContext } from "./context/UserContext";
import Network from "./pages/Network";
import Profile from "./pages/Profile";
import Notification from "./pages/Notification";

const App = () => {
  const { userData } = useContext(UserDataContext);

  return (
    <Routes>
      <Route path="/" element={userData ? <Home /> : <Navigate to="/login" />} />
      <Route path="/login" element={userData ? <Navigate to="/" /> : <Login />} />
      <Route path="/signup" element={userData ? <Navigate to="/" /> : <Signup />} />
      <Route path="/network" element={userData ? <Network /> : <Navigate to="/login" />} />
      <Route
        path="/profile"
        element={userData ? <Navigate to={`/profile/${userData.username}`} /> : <Navigate to="/login" />}
      />
      <Route path="/profile/:username" element={userData ? <Profile /> : <Navigate to="/login" />} />

      <Route path = "/notifications" element={userData ? <Notification /> : <Navigate to="/login" />} />
    </Routes>
  );
};

export default App;

