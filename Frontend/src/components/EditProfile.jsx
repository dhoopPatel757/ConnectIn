import React, { useContext, useState, useRef } from "react";
import { RxCross1 } from "react-icons/rx";
import { FiPlus } from "react-icons/fi";
import { UserDataContext } from "../context/UserContext.jsx";
import axios from "axios";
import { AuthDataContext } from "../context/AuthContext.jsx";
import profilepicture from "../assets/profile.png";
import { FiCamera } from "react-icons/fi";

function EditProfile() {
  const { userData, setUserData, setEdit } = useContext(UserDataContext);
  const { serverUrl } = useContext(AuthDataContext);

  let [firstName, setFirstName] = useState(userData.firstname || "");
  let [lastName, setLastName] = useState(userData.lastname || "");
  let [username, setUsername] = useState(userData.username || "");
  let [headline, setHeadline] = useState(userData.headline || "");
  let [location, setLocation] = useState(userData.location || "");
  let [gender, setGender] = useState(userData.gender || "");

  let [skills, setSkills] = useState(userData.skills || []);
  let [newSkill, setNewSkill] = useState("");


  let [education, setEducation] = useState(userData.education || []);
  let [newEducation, setNewEducation] = useState({
    college: "",
    degree: "",
    fieldOfStudy: "",
    GPA: ""
  });

  let [experience, setExperience] = useState(userData.experience || []);
  let [newExperience, setNewExperience] = useState({
    jobTitle: "",
    company: "",
    yearsOfExperience: "",
    description: "",
  });

  const profileImage = useRef(null);
  const coverPictureRef = useRef(null);
  let [frontendProfileImage, setFrontendProfileImage] = useState(userData.profileImage || "");
  let [backendProfileImage, setBackendProfileImage] = useState(null);
  const [coverPreview, setCoverPreview] = useState(userData.coverImage || null);
  let [backendCoverImage, setBackendCoverImage] = useState(null);

  let handleProfileImage = (e) => {
    let file = e.target.files[0];

    if (file) {
      setBackendProfileImage(file);
      setFrontendProfileImage(URL.createObjectURL(file));
    }
  }

  let handleCoverImage = (e) => {
    let file = e.target.files[0];

    if (file) {
      setBackendCoverImage(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  }


  let addSkill = (e) => {
    e.preventDefault();
    if (newSkill && !skills.includes(newSkill)) {
      setSkills([...skills, newSkill]);
    }
    setNewSkill("");

  }

  let addEducation = (e) => {
    e.preventDefault(); // prevent from being refreshed.

    if (
      newEducation.college &&
      newEducation.degree &&
      newEducation.fieldOfStudy
    ) {
      setEducation([...education, newEducation]);

      setNewEducation({
        college: "",
        degree: "",
        fieldOfStudy: "",
        GPA: ""
      });
    }
  };

  let addExperience = (e) => {
    e.preventDefault();

    if (
      newExperience.jobTitle &&
      newExperience.company &&
      newExperience.yearsOfExperience &&
      newExperience.description
    ) {
      setExperience([...experience, newExperience]);

      setNewExperience({
        jobTitle: "",
        company: "",
        yearsOfExperience: "",
        description: ""
      });
    }
  };

  let removeExperience = (index) => {
    setExperience(experience.filter((exp, i) => i !== index));
  };

  let removeEducation = (index) => {
    setEducation(education.filter((element, i) => i !== index));
  };

  const handleSaveProfile = async () => {
    try {
      let formData = new FormData();

      formData.append("firstname", firstName.trim());
      formData.append("lastname", lastName.trim());
      formData.append("username", username.trim());
      formData.append("headline", headline);
      formData.append("location", location);
      formData.append("gender", gender);
      formData.append("skills", JSON.stringify(skills));
      formData.append("education", JSON.stringify(education));
      formData.append("experience", JSON.stringify(experience));

      if (backendProfileImage) {
        formData.append("profileImage", backendProfileImage);
      }
      if (backendCoverImage) {
        formData.append("coverImage", backendCoverImage);
      }

      let result = await axios.put(serverUrl + "/api/user/update", formData, { withCredentials: true, headers: { "Content-Type": "multipart/form-data" } });

      // setUserData(result.data);

      setUserData(prev => ({
        ...prev,
        ...result.data
      }));


      // close popup
      setEdit(false);
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <div className="fixed inset-0 z-[999] flex justify-center items-start pt-[90px]">

      {/* if you click outside the popup box, it will close the popup */}
      <div className="absolute inset-0 bg-black/50" onClick={() => setEdit(false)}></div>

      <input type="file" ref={profileImage} className="hidden" onChange={handleProfileImage} />

      <input
        type="file"
        accept="image/*"
        ref={coverPictureRef}
        className="hidden"
        onChange={handleCoverImage}
      />
      {/* Popup box */}
      {/* Main Div */}
      <div className="relative z-10 w-[95%] max-w-[710px] bg-white rounded-xl shadow-2xl max-h-[85vh] overflow-y-auto lg:p-10">



        {/* Close Button */}
        <div className="absolute top-4 right-4 z-20"><RxCross1 className="w-6 h-6 text-gray-700 cursor-pointer hover:scale-110 transition" onClick={() => setEdit(false)} /></div>


        {/* Cover Section */}
        <div className="relative">
          <div
            className="absolute top-[100px] right-[20px] bg-gray-800 text-white p-2 rounded-full cursor-pointer hover:scale-105 transition"
            onClick={() => coverPictureRef.current.click()}
          >
            <FiCamera size={16} />
          </div>
          <div className="h-[160px] rounded-t-xl overflow-hidden bg-gray-300">
            {coverPreview && (
              <img
                src={coverPreview}
                alt="cover"
                className="w-full h-full object-cover"
              />
            )}
          </div>

          {/* Profile Image Wrapper */}
          <div className="absolute -bottom-12 left-6">


            {/* Circle Container (Gray Frame) */}
            <div className="relative w-[100px] h-[100px]">


              {/* Profile Image */}
              <div className="w-full h-full rounded-full border-4 border-white bg-gray-200 overflow-hidden shadow-md">
                <img
                  src={frontendProfileImage || profilepicture}
                  alt="profile"
                  className="w-full h-full object-cover"
                  onClick={() => profileImage.current.click()}
                  cursor="pointer"
                />
              </div>

              {/* Plus Button (Attached Properly) */}
              <div
                className="absolute bottom-0 right-0 w-[26px] h-[26px] bg-[#0A66C2] rounded-full flex items-center justify-center border-2 border-white cursor-pointer hover:scale-110 transition"
                onClick={() => profileImage.current.click()}
              >
                <FiPlus size={14} className="text-white" />
              </div>

            </div>

          </div>
        </div>

        <form className="w-full flex flex-col gap-6 mt-[100px] px-6 pb-10">

          {/* First Name */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700">First Name</label>
            <input type="text" placeholder="Enter first name" className="w-full h-[48px] px-4 rounded-3xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0A66C2] focus:border-[#0A66C2] transition" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          </div>

          {/* Last Name */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700">Last Name</label>
            <input type="text" placeholder="Enter last name" className="w-full h-[48px] px-4 rounded-3xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0A66C2] focus:border-[#0A66C2] transition" value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </div>

          {/* Username */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700"> Username</label>
            <input type="text" placeholder="Choose a username" className="w-full h-[48px] px-4 rounded-3xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0A66C2] focus:border-[#0A66C2] transition" value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>

          {/* Headline */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700">Headline</label>
            <input type="text" placeholder="Ex: Computer Science Major" className="w-full h-[48px] px-4 rounded-3xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0A66C2] focus:border-[#0A66C2] transition" value={headline} onChange={(e) => setHeadline(e.target.value)} />
          </div>

          {/* Location */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700">
              Location
            </label>
            <input
              type="text"
              placeholder="Ex: San Jose, California"
              className="w-full h-[48px] px-4 rounded-3xl border border-gray-300 
                 focus:outline-none focus:ring-2 focus:ring-[#0A66C2] 
                 focus:border-[#0A66C2] transition"
              value={location} onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          {/* Gender (ENUM) */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700">
              Gender
            </label>
            <select
              className="w-full h-[48px] px-4 rounded-3xl border border-gray-300 
                 bg-white focus:outline-none focus:ring-2 
                 focus:ring-[#0A66C2] focus:border-[#0A66C2] transition"
              value={gender} onChange={(e) => setGender(e.target.value)}
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Skills Section */}
          <div className="flex flex-col gap-3">

            <label className="text-sm font-semibold text-gray-700">
              Skills
            </label>

            {/* Skill Tags */}
            <div className="flex flex-wrap gap-2">
              {skills && skills.map((skill, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-4 py-1
                 bg-gray-100 border border-gray-300 
                 rounded-full text-base font-medium text-gray-800 
                 shadow-sm transition hover:bg-gray-200"
                >
                  <span>
                    {skill}
                  </span>

                  <RxCross1
                    className="cursor-pointer w-4 h-4 text-gray-500 hover:text-red-500 transition"
                    onClick={() => setSkills(skills.filter((element, i) => i !== index))}
                  />
                </div>
              ))}
            </div>

            {/* Add Skill Input + Button */}
            {/* Add Skill Input + Button */}
            <div className="flex flex-col gap-3 mt-2">

              <input
                type="text"
                placeholder="Add new skill"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                className="w-full h-[48px] px-4 rounded-3xl border border-gray-300 
    focus:outline-none focus:ring-2 
    focus:ring-[#0A66C2] focus:border-[#0A66C2] transition"
              />

              <button
                type="button"
                onClick={addSkill}
                className="self-start h-[42px] px-6 rounded-3xl bg-[#0A66C2] text-white hover:bg-[#004182]"
              >
                Add Skill
              </button>

            </div>

          </div>


          {/* Education */}
          {/* Education Section */}
          <div className="flex flex-col gap-4">

            <label className="text-sm font-semibold text-gray-700">
              Education
            </label>

            {/* Existing Education */}
            {education.length > 0 && (
              <div className="flex flex-col gap-3">
                {education.map((edu, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-start p-4 border rounded-xl bg-gray-50"
                  >

                    <div className="flex flex-col text-sm">
                      <span className="font-semibold text-gray-800">
                        {edu.college}
                      </span>

                      <span className="text-gray-600">
                        {edu.degree}, {edu.fieldOfStudy}
                      </span>

                      {edu.GPA && (
                        <span className="text-gray-500">
                          GPA: {edu.GPA}
                        </span>
                      )}
                    </div>

                    <RxCross1
                      className="cursor-pointer w-4 h-4 text-gray-500 hover:text-red-500"
                      onClick={() => removeEducation(index)}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Add Education Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

              <input
                type="text"
                placeholder="College / University"
                value={newEducation.college}
                onChange={(e) =>
                  setNewEducation({ ...newEducation, college: e.target.value })
                }
                className="h-[48px] px-4 rounded-3xl border border-gray-300 focus:ring-2 focus:ring-[#0A66C2]"
                required
              />

              <input
                type="text"
                placeholder="Degree (Ex: B.S.)"
                value={newEducation.degree}
                onChange={(e) =>
                  setNewEducation({ ...newEducation, degree: e.target.value })
                }
                className="h-[48px] px-4 rounded-3xl border border-gray-300 focus:ring-2 focus:ring-[#0A66C2]"
                required
              />

              <input
                type="text"
                placeholder="Field of Study"
                value={newEducation.fieldOfStudy}
                onChange={(e) =>
                  setNewEducation({ ...newEducation, fieldOfStudy: e.target.value })
                }
                className="h-[48px] px-4 rounded-3xl border border-gray-300 focus:ring-2 focus:ring-[#0A66C2]"
                required
              />

              <input
                type="text"
                placeholder="GPA"
                value={newEducation.GPA}
                onChange={(e) =>
                  setNewEducation({ ...newEducation, GPA: e.target.value })
                }
                className="h-[48px] px-4 rounded-3xl border border-gray-300 focus:ring-2 focus:ring-[#0A66C2]"
                required
              />

            </div>

            {/* Add Button */}
            <button
              type="button"
              onClick={addEducation}
              className="self-start h-[42px] px-6 rounded-3xl bg-[#0A66C2] text-white hover:bg-[#004182]"
            >
              Add Education
            </button>

          </div>

          {/* Experience Section */}
          <div className="flex flex-col gap-4">

            <label className="text-sm font-semibold text-gray-700">
              Experience
            </label>

            {/* Existing Experience */}
            {experience.length > 0 && (
              <div className="flex flex-col gap-3">
                {experience.map((exp, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-start p-4 border rounded-xl bg-gray-50"
                  >

                    <div className="flex flex-col text-sm">
                      <span className="font-semibold text-gray-800">
                        {exp.jobTitle}
                      </span>

                      <span className="text-gray-600">
                        {exp.company} • {exp.yearsOfExperience} years
                      </span>

                      <span className="text-gray-500">
                        {exp.description}
                      </span>
                    </div>

                    <RxCross1
                      className="cursor-pointer w-4 h-4 text-gray-500 hover:text-red-500"
                      onClick={() => removeExperience(index)}
                    />

                  </div>
                ))}
              </div>
            )}

            {/* Add Experience Inputs */}
            <div className="flex flex-col gap-3">

              <input
                type="text"
                placeholder="Job Title (Ex: Software Engineer Intern)"
                value={newExperience.jobTitle}
                onChange={(e) =>
                  setNewExperience({ ...newExperience, jobTitle: e.target.value })
                }
                className="h-[48px] px-4 rounded-3xl border border-gray-300 focus:ring-2 focus:ring-[#0A66C2]"
              />

              <input
                type="text"
                placeholder="Company (Ex: Google)"
                value={newExperience.company}
                onChange={(e) =>
                  setNewExperience({ ...newExperience, company: e.target.value })
                }
                className="h-[48px] px-4 rounded-3xl border border-gray-300 focus:ring-2 focus:ring-[#0A66C2]"
              />

              <input
                type="number"
                placeholder="Years of Experience (Ex: 2)"
                value={newExperience.yearsOfExperience}
                onChange={(e) =>
                  setNewExperience({
                    ...newExperience,
                    yearsOfExperience: e.target.value
                  })
                }
                className="h-[48px] px-4 rounded-3xl border border-gray-300 focus:ring-2 focus:ring-[#0A66C2]"
              />

              <textarea
                placeholder="Description of your work"
                value={newExperience.description}
                onChange={(e) =>
                  setNewExperience({ ...newExperience, description: e.target.value })
                }
                className="px-4 py-3 rounded-2xl border border-gray-300 focus:ring-2 focus:ring-[#0A66C2] resize-none"
                rows="3"
              />

            </div>

            {/* Add Button */}
            <button
              type="button"
              onClick={addExperience}
              className="self-start h-[42px] px-6 rounded-3xl bg-[#0A66C2] text-white hover:bg-[#004182]"
            >
              Add Experience
            </button>

          </div>

          {/* Save Profile Button */}
          <div className="flex justify-end mt-4">

            <button
              type="button"
              className="h-[48px] px-8 rounded-3xl bg-[#0A66C2] text-white 
    font-semibold hover:bg-[#004182] transition shadow-md"
              onClick={handleSaveProfile}
            >
              Save Profile
            </button>

          </div>

        </form>
      </div>
    </div>
  );
}

export default EditProfile;


