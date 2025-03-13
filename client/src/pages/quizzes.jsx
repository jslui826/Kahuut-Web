import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Carousel from "./carousel";
import "../css/quizzes.css";
import defaultPfp from "/assets/default_pfp.jpg"


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
    const [loading2, setLoading2] = useState(false);
    const [profilePic, setProfilePic] = useState(defaultPfp); // Default profile picture

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

    const fetchProfilePic = async () => {
        setLoading2(true);
        const token = localStorage.getItem("token");
        if (!token) return;

        try {
            const response = await fetch("http://localhost:4000/getPfp", {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) throw new Error("Failed to fetch profile picture");

            const data = await response.json();
            if (data.pfp) {
                setProfilePic(`data:image/png;base64,${data.pfp}`); // Convert Base64 to an image URL
            }
            setLoading2(false);
        } catch (error) {
            console.error("Error fetching profile picture:", error);
        }
    };

    useEffect(() => {
        fetchQuizzes(); // Fetch quizzes on load
        fetchProfilePic(); // Fetch profile picture on load
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
            const query = searchQuery.trim();
            if (query) {
                fetchQuizzes(`/quizzes/search?query=${encodeURIComponent(query)}`);
            } else {
                fetchQuizzes("/quizzes");
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
            window.location.reload();
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

            <div className="sidebar flex justify-center">
                <div className="profile-section">
                    <div className="avatar">
                        <div className="ring-pink-300 ring-offset-base-100 w-24 rounded-full ring">
                            {loading2 ? (
                                <div className="loading loading-spinner loading-lg" style={{ marginTop: 28 }}></div>
                            ) : (
                                <img src={profilePic} alt="User Profile" />
                            )}
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
                <h1 className="drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]">Select Your Quiz</h1>
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
                        <div className="loading loading-spinner loading-lg flex items-center justify-center h-screen loader m-auto drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]" style={{ marginTop: 250 }}></div>
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
                            <div></div>
                            <button
                                className={`flex items-center btn btn-outline btn-info ${currentTab === "top" ? "btn-active" : ""}`}
                                onClick={() => handleTabChange("top")}
                            >
                                Top
                            </button>
                            <button
                                className={`flex items-center btn btn-outline btn-success ${currentTab === "favorites" ? "btn-active" : ""}`}
                                onClick={() => handleTabChange("favorites")}
                            >
                                Favorites
                            </button>
                            <button
                                className={`flex items-center btn btn-outline btn-info ${currentTab === "mine" ? "btn-active" : ""}`}
                                onClick={() => handleTabChange("mine")}
                            >
                                Mine
                            </button>
                        </footer>
                    </>
                )}
            </div>

            {showImageUpload && (
                <div className="
    pfp-popup 
    fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
    z-50 w-196 bg-white shadow-lg rounded p-6
  ">
                    <div className="popup-content-pfp space-y-4">
                        <h2 className="text-xl font-bold">Change Profile Picture</h2>

                        {/* Custom file input and filename display */}
                        <div className="flex flex-col items-center gap-2">
                            {/* “Choose File” button */}
                            <label className="btn btn-primary cursor-pointer">
                                Choose File
                                {/* Hidden native file input */}
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => setImageFile(e.target.files[0])}
                                />
                            </label>

                            {/* Display chosen file name or fallback text */}
                            <span className="text-black">
                                {imageFile ? imageFile.name : "No file chosen"}
                            </span>

                            {/* Show image preview if a file is selected */}
                            {imageFile && (
                                <img
                                    src={URL.createObjectURL(imageFile)}
                                    alt="preview"
                                    className="max-h-40 object-contain border border-gray-300 rounded"
                                />
                            )}
                        </div>

                        {/* Buttons for submit/close */}
                        <div className="flex justify-end gap-2">
                            <button
                                className="btn btn-info"
                                onClick={handleFileUpload}
                                disabled={isUploading}
                            >
                                {isUploading ? "Uploading..." : "Submit Image"}
                            </button>
                            <button
                                className="btn btn-outline"
                                onClick={() => setShowImageUpload(false)}
                            >
                                Close
                            </button>
                        </div>
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
