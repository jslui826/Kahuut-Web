import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Carousel from "./carousel";
import "../css/quizzes.css";
import pfp from "/assets/default_pfp.jpg"

const token = localStorage.getItem("token");
const defaultMusic = "/assets/ZeldaMain.mp3";
const musicFiles = [
   "01. Ashitaka Sekki.mp3",
   "01. Hell On Earth.mp3",
   "1-01. Key.mp3",
   "07. Mipha's Theme.mp3",
   "ZeldaMain.mp3",
];

const QuizPage = () => {
   const [quizzes, setQuizzes] = useState([]);
   const [selectedQuizIndex, setSelectedQuizIndex] = useState(0);
   const [selectedQuiz, setSelectedQuiz] = useState(null);
   const [searchQuery, setSearchQuery] = useState("");
   const [showMusicPopup, setShowMusicPopup] = useState(false);
   const [currentMusic, setCurrentMusic] = useState(defaultMusic);
   const [showImageUpload, setShowImageUpload] = useState(false);
   const [imageFile, setImageFile] = useState(null);
   const [isUploading, setIsUploading] = useState(false);
   const [loading, setLoading] = useState(true);

   const displayLimit = 5;
   const audioRef = useRef(null);
   const navigate = useNavigate();

   const [currentTab, setCurrentTab] = useState("top"); // Default to "Top"


   const fetchQuizzes = async (endpoint = "/quizzes") => {
       setLoading(true);
       try {
           const headers = {};
  
           if (endpoint !== "/quizzes") {
               const token = localStorage.getItem("token");
               if (!token) {
                   console.error("No token found, cannot fetch protected quizzes.");
                   setLoading(false);
                   return;
               }
               headers["Authorization"] = `Bearer ${token}`;
           }
  
           const response = await fetch(`http://localhost:4000${endpoint}`, { headers });
  
           if (!response.ok) {
               throw new Error(`Error: ${response.status} ${response.statusText}`);
           }
  
           const data = await response.json();
           setQuizzes([...data]);
           if (data.length > 0) setSelectedQuizIndex(0);
       } catch (error) {
           console.error("Error fetching quizzes:", error);
       } finally {
           setLoading(false);
       }
   };
  
   useEffect(() => {
       fetchQuizzes(); // Default fetch for "Top"
   }, []);
  
   const handleTabChange = (tab) => {
       setCurrentTab(tab);
  
       if (tab === "top") {
           fetchQuizzes("/quizzes"); // Fetch all quizzes
       } else if (tab === "favorites") {
           fetchQuizzes("/my_favorites"); // Fetch favorited quizzes
       } else if (tab === "mine") {
           fetchQuizzes("/my_quizzes"); // Fetch user's created quizzes
       }
   };




   const handleSearchInput = (e) => {
       setSearchQuery(e.target.value);
   };

   const handleSearchKeyDown = (e) => {
       if (e.key === "Enter") {
           if (searchQuery.trim() === "") {
               // If search bar is empty, fetch default quizzes
               fetchQuizzes();
           } else {
               fetchQuizzes(searchQuery.trim());
           }
       }
   };

   const handleFileUpload = async () => {
       if (!imageFile) {
           alert("Please upload an image first");
           return;
       }

       setIsUploading(true);
       const token = localStorage.getItem("token"); // Retrieve JWT token

       // 1️⃣ Build FormData
       const formData = new FormData();
       formData.append("pfp", imageFile); // "pfp" must match the backend key

       try {
           // 2️⃣ Send POST request with FormData
           const response = await fetch("http://localhost:4000/uploadPfp", {
               method: "POST",
               headers: {
                   Authorization: `Bearer ${token}`, // Ensure token is attached
               },
               body: formData, // FormData instead of JSON
           });


           const result = await response.json();
           console.log("Server Response:", result);


           if (response.ok) {
               alert("Image uploaded successfully!");
           } else {
               alert(`Failed to upload image: ${result.error}`);
           }
       } catch (error) {
           console.error("Error uploading image:", error);
           alert("Error uploading image");
       } finally {
           setIsUploading(false);
       }
   }


   return (
       <div className="quiz-page">
           <audio ref={audioRef} src={currentMusic} autoPlay loop>
               Your browser does not support the audio element.
           </audio>

           {showMusicPopup && (
               <div className="music-popup">
                   <div className="popup-content">
                       <h2>Select Background Music</h2>
                       <ul>
                           {musicFiles.map((file, index) => (
                               <li key={index} onClick={() => setCurrentMusic(`/assets/${file}`)}>
                                   🎵 {file.replace(".mp3", "")}
                               </li>
                           ))}
                       </ul>
                       <button onClick={() => setShowMusicPopup(false)}>Close</button>
                   </div>
               </div>
           )}

           <div className="sidebar">
               <div className="profile-section">
                   <div className="avatar">
                       <div className="ring-pink-300 ring-offset-base-100 w-24 rounded-full ring">
                           <img src={pfp} alt="User" />
                       </div>
                   </div>
               </div>
               <ul className="menu">
                   <li onClick={() => setShowImageUpload(true)}>Profile</li>
                   <li onClick={() => navigate("/leaderboard")}>Leaderboard</li>
                   <li onClick={() => setShowMusicPopup(true)}>Music</li>
                   <li onClick={() => navigate("/makequiz")}>Make Quiz</li>
                   <li onClick={() => { localStorage.clear(); navigate("/login"); window.location.reload(); }}>Log Out</li>
               </ul>
           </div>

           <div className="main-content">
               <h1>Select Your Quiz</h1>
               <div className="search-bar">
                   <input
                       type="text"
                       placeholder="Search..."
                       value={searchQuery}
                       onChange={handleSearchInput}
                       onKeyDown={handleSearchKeyDown}
                   />
               </div>
               {loading ? (
                   <div className="loading-container">
                       <div className="loading loading-spinner loading-lg flex items-center justify-center h-screen loader m-auto"></div>
                       <p>Loading quizzes...</p>
                   </div>
               ) : (
                   <>
                       <Carousel
                           quizzes={quizzes}
                           setQuizzes={setQuizzes}
                           selectedIndex={selectedQuizIndex}
                           setSelectedIndex={setSelectedQuizIndex}
                           setSelectedQuiz={setSelectedQuiz}
                           displayLimit={displayLimit}
                       />
                       <footer className="footer m:footer-horizontal bg-black text-base-content p-2 bg-opacity-75">
                           <button
                               className={`flex items-center btn btn-outline ${currentTab === "top" ? "btn-info" : ""}`}
                               onClick={() => handleTabChange("top")}
                           >
                               Top
                           </button>
                           <button
                               className={`flex items-center btn btn-outline ${currentTab === "favorites" ? "btn-success" : ""}`}
                               onClick={() => handleTabChange("favorites")}
                           >
                               Favorites
                           </button>
                           <button
                               className={`flex items-center btn btn-outline ${currentTab === "mine" ? "btn-info" : ""}`}
                               onClick={() => handleTabChange("mine")}
                           >
                               Mine
                           </button>
                       </footer>
                   </>
               )}
           </div>


           {showImageUpload && (
               <div className="pfp-popup">
                   <div className="popup-content-pfp">
                       <h2>Change Profile Picture</h2>
                       <input type="file" className="file-input file-input-bordered file-input-info w-full max-w-xs" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} />
                       <button onClick={handleFileUpload} disabled={isUploading}>
                           {isUploading ? "Uploading..." : "Submit Image"}
                       </button>
                       <button onClick={() => setShowImageUpload(false)}>Close</button>
                   </div>
               </div>
           )}


           {selectedQuiz && (
               <div className="quiz-popup">
                   <div className="popup-content">
                       <h2>{selectedQuiz.title}</h2>
                       <p>{selectedQuiz.description}</p>
                       <button onClick={() => navigate(`/play/${selectedQuiz.quiz_id}`)}>Start</button>
                       <button onClick={() => setSelectedQuiz(null)}>Close</button>
                   </div>
               </div>
           )}
       </div>
   );
};




export default QuizPage;