import React, { useState, useEffect, useRef } from "react";
import "../css/quizzes.css";

const defaultMusic = "/assets/ZeldaMain.mp3";
const musicFiles = [
    "01. Ashitaka Sekki.mp3",
    "01. Hell On Earth.mp3",
    "1-01. Key.mp3",
    "07. Mipha's Theme.mp3",
    "ZeldaMain.mp3"
];

const QuizPage = () => {
    const [quizzes, setQuizzes] = useState([]); // Store quizzes from API
    const [selectedQuizIndex, setSelectedQuizIndex] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");
    const [showMusicPopup, setShowMusicPopup] = useState(false);
    const [currentMusic, setCurrentMusic] = useState(defaultMusic);
    const audioRef = useRef(null);

    // Fetch quizzes from backend
    const fetchQuizzes = async (query = "") => {
        try {
            const url = query
                ? `http://localhost:4000/quizzes/search?query=${query}`
                : "http://localhost:4000/quizzes";

            const response = await fetch(url);
            const data = await response.json();
            setQuizzes(data);

            // Reset selection if new data comes in
            if (data.length > 0) setSelectedQuizIndex(0);
        } catch (error) {
            console.error("Error fetching quizzes:", error);
        }
    };

    // Load quizzes on mount
    useEffect(() => {
        fetchQuizzes();
    }, []);

    // Search functionality
    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        if (query.length > 2) {
            fetchQuizzes(query);
        } else {
            fetchQuizzes();
        }
    };

    // Handle quiz navigation
    const handleLeft = () => {
        setSelectedQuizIndex((prev) => (prev > 0 ? prev - 1 : quizzes.length - 1));
    };

    const handleRight = () => {
        setSelectedQuizIndex((prev) => (prev < quizzes.length - 1 ? prev + 1 : 0));
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
                    <img src="/assets/user1.png" alt="User" className="profile-icon" />
                </div>
                <ul className="menu">
                    <li>Dashboard</li>
                    <li>Quizzes</li>
                    <li>Progress</li>
                    <li>Settings</li>
                    <li onClick={() => setShowMusicPopup(true)}>🎵 Music</li>
                    <li>Log Out</li>
                </ul>
            </div>

            <div className="main-content">
                <h1>Select Your Quiz</h1>

                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                    />
                </div>

                <div className="quiz-carousel">
                    <button className="nav-button left" onClick={handleLeft}>⬅</button>

                    <div className="quiz-list">
                        {quizzes.length > 0 ? (
                            quizzes.map((quiz, index) => (
                                <div
                                    key={quiz.quiz_id}
                                    className={`quiz-card ${index === selectedQuizIndex ? "selected" : ""}`}
                                >
                                    <h3>{quiz.description}</h3>
                                </div>
                            ))
                        ) : (
                            <p>No quizzes found.</p>
                        )}
                    </div>

                    <button className="nav-button right" onClick={handleRight}>➡</button>
                </div>
            </div>
        </div>
    );
};

export default QuizPage;