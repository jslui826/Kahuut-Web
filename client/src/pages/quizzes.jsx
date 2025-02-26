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
    const [selectedQuiz, setSelectedQuiz] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [showMusicPopup, setShowMusicPopup] = useState(false);
    const [currentMusic, setCurrentMusic] = useState(defaultMusic);
    const audioRef = useRef(null);

    // Play default music on load
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.play().catch(error => {
                console.error("Failed to play audio:", error);
            });
        }
    }, [currentMusic]);

    // Play selected music
    const selectMusic = (music) => {
        setCurrentMusic(`/assets/${music}`);
        setShowMusicPopup(false);
    };

    // Search functionality for quizzes
    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleLeft = () => {
        setSelectedQuiz((prev) => (prev > 1 ? prev - 1 : 5));
    };

    const handleRight = () => {
        setSelectedQuiz((prev) => (prev < 5 ? prev + 1 : 1));
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
                                <li key={index} onClick={() => selectMusic(file)}>
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
                        {[1, 2, 3, 4, 5].map((id) => (
                            <div
                                key={id}
                                className={`quiz-card ${id === selectedQuiz ? "selected" : ""}`}
                            >
                                <h3>Quiz {id}</h3>
                            </div>
                        ))}
                    </div>

                    <button className="nav-button right" onClick={handleRight}>➡</button>
                </div>
            </div>
        </div>
    );
};

export default QuizPage;
