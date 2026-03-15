import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLinkedin } from "@fortawesome/free-brands-svg-icons";
import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {AuthDataContext} from "../context/AuthContext.jsx";
import { UserDataContext } from "../context/UserContext.jsx";

const Signup = () => {
  let [show, setShow] = useState(false);
  let navigate = useNavigate();
  let { serverUrl } = useContext(AuthDataContext);

  let [firstname, setFirstName] = useState("");
  let [lastname, setLastName] = useState("");
  let [username, setUserName] = useState("");
  let [email, setEmail] = useState("");
  let [password, setPassword] = useState("");

  let [loading, setLoading] = useState(false);
  let [err, setErr] = useState("");
  let {userData,setUserData} = useContext(UserDataContext);

  // const handleSignup = async(event) => {
  //   event.preventDefault(); // preventing from refreshing the page on form submission.
  //   setLoading(true);
  //   try{
  //     let result = await axios.post(serverUrl + "/api/auth/signup", {
  //       firstname, lastname, username, email, password
  //     }, {withCredentials : true});
  //     console.log(result);

  //     setUserData(result.data);
  //     navigate("/");
  //     setFirstName("");
  //     setLastName("");
  //     setUserName("");
  //     setEmail("");
  //     setPassword("");
  //     setLoading(false);
  //     setErr("");
    
  //   }catch(error) {
  //     setErr(error.response?.data?.message || "Something went wrong. Please try again.");  // ✅
  //     setLoading(false);
  //   }
  // }

  const handleSignup = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
        let result = await axios.post(serverUrl + "/api/auth/signup", {
            firstname, lastname, username, email, password
        });
        localStorage.setItem("token", result.data.token);
        setUserData(result.data.user);
        navigate("/");
        setFirstName(""); setLastName(""); setUserName(""); setEmail(""); setPassword("");
        setLoading(false); setErr("");
    } catch(error) {
        setErr(error.response?.data?.message || "Something went wrong. Please try again.");
        setLoading(false);
    }
}

  return (
    <div className="w-full h-screen bg-white flex flex-col items-center justify-start">

      <div className="w-full px-6 pt-6 flex items-center">
        <span className="text-3xl font-extrabold text-[#0A66C2]">
          Connect
        </span>

        <FontAwesomeIcon
          icon={faLinkedin}
          className="text-[#0A66C2] text-4xl"
        />
      </div>

      <br></br>
      <br></br>

      <form onSubmit = {handleSignup} className="mt-10 w-[90%] max-w-[400px] h-[600px] md:shadow-2xl rounded-2xl bg-white flex flex-col justify-center gap-[15px] p-[15px]">
        <h1 className="text-[#0A66C2] text-[30px] font-bold text-center mb-[30px]">Sign Up</h1>
        <input className="w-[100%] h-[50px] border-2 border-gray-600 text-gray-800 text-[18px] px-[15px] py-[10px] rounded-2xl" type="text" placeholder="Firstname" required value = {firstname} onChange = {(event) => setFirstName(event.target.value)}/>
        <input className="w-[100%] h-[50px] border-2 border-gray-600 text-gray-800 text-[18px] px-[15px] py-[10px] rounded-2xl" type="text" placeholder="Lastname" required value = {lastname} onChange = {(event) => setLastName(event.target.value)}/>
        <input className="w-[100%] h-[50px] border-2 border-gray-600 text-gray-800 text-[18px] px-[15px] py-[10px] rounded-2xl" type="text" placeholder="Username" required value = {username} onChange = {(event) => setUserName(event.target.value)}/>
        <input className="w-[100%] h-[50px] border-2 border-gray-600 text-gray-800 text-[18px] px-[15px] py-[10px] rounded-2xl" type="email" placeholder="Email" required value = {email} onChange = {(event) => setEmail(event.target.value)} />

        <div className="w-[100%] h-[50px] border-2 border-gray-600 text-gray-800 text-[18px] rounded-2xl overflow-hidden relative">
          <input className="w-full h-full border-none text-gray-800 text-[18px] px-[15px] py-[10px] rounded-2xl" type={show ? "text" : "password"} placeholder="Password" required value = {password} onChange = {(event) => setPassword(event.target.value)}/>
          <span onClick={() => { setShow(prev => !prev) }} className="absolute right-[20px] top-[10px] text-[#0A66C2] cursor-pointer">{show ? "hide" : "show"}</span>
        </div>

        {err && <p className = "text-[red] text-center">{err}</p>}

        <button className="w-[100%] h-[50px] rounded-full bg-[#2980d7] text-[white] mt-[20px]" disabled = {loading}>{loading?"Loading":"Sign Up"}</button>

        <p className="text-center cursor-progress" onClick={() => navigate("/login")}>Already have an account? <span className="text-[#0A66C2]" >Login</span></p>
      </form>

    </div>
  );
};

export default Signup;
