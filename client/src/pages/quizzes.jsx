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

    const displayLimit = 5;
    const audioRef = useRef(null);
    const navigate = useNavigate();

    const fetchQuizzes = async (query = "") => {
        try {
            const url = query
                ? `http://localhost:4000/quizzes/search?query=${query}`
                : "http://localhost:4000/quizzes";
            const response = await fetch(url);
            const data = await response.json();
            setQuizzes([...data]);
            if (data.length > 0) setSelectedQuizIndex(0);
        } catch (error) {
            console.error("Error fetching quizzes:", error);
        }
    };

    // Fetch quizzes on component mount
    useEffect(() => {
        fetchQuizzes();
    }, []);

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
                    <img src={pfp} alt="User" className="profile-icon" />
                </div>
                <ul className="menu">
                    <li onClick={() => navigate("/profile")}>Profile</li>
                    <li>Quizzes</li>
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
                        onKeyDown={handleSearchKeyDown} // Search on Enter
                    />
                </div>

                <Carousel
                    quizzes={quizzes}
                    selectedIndex={selectedQuizIndex}
                    setSelectedIndex={setSelectedQuizIndex}
                    setSelectedQuiz={setSelectedQuiz}
                    displayLimit={displayLimit}
                />
            </div>

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