import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../css/quizzes.css";

const token = localStorage.getItem('token');
const defaultMusic = "/assets/ZeldaMain.mp3";
const musicFiles = [
    "01. Ashitaka Sekki.mp3",
    "01. Hell On Earth.mp3",
    "1-01. Key.mp3",
    "07. Mipha's Theme.mp3",
    "ZeldaMain.mp3"
];

const sampleQuiz = {
    quiz_id: "sample",
    title: "Sample Quiz",
    description: "Test your knowledge with this sample quiz!",
};

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

    useEffect(() => {
        fetchQuizzes();
    }, []);

    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        if (query.length > 2) {
            fetchQuizzes(query);
        } else {
            fetchQuizzes();
        }
    };
    
    const handleLeft = () => {
        setSelectedQuizIndex((prev) => Math.max(0, prev - 1));
    };

    const handleRight = () => {
        setSelectedQuizIndex((prev) =>
            Math.min(Math.max(0, quizzes.length - displayLimit), prev + 1)
        );
    };

    const visibleQuizzes = quizzes.slice(selectedQuizIndex, selectedQuizIndex + displayLimit);

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
                        onChange={handleSearchChange}
                    />
                </div>
                <div className="quiz-carousel">
                    <button className="nav-button left" onClick={handleLeft}>⬅</button>
                    <div className="quiz-list">
                    {visibleQuizzes.length > 0 ? (
                            visibleQuizzes.map((quiz, index) => (
                                <div
                                    key={quiz.quiz_id}
                                    className={`quiz-card ${index === 0 ? "selected" : ""}`}
                                    onClick={() => setSelectedQuiz(quiz)}
                                >
                                    <h3>{quiz.title}</h3>  {/* Ensure title is displayed */}
                                    <p>{quiz.description}</p>
                                </div>
                            ))
                        ) : (
                            <p>No quizzes found.</p>
                        )}
                    </div>
                    <button className="nav-button right" onClick={handleRight}>➡</button>
                </div>
            </div>

            {selectedQuiz && (
                <div className="quiz-popup">
                    <div className="popup-content">
                        <h2>{selectedQuiz.title}</h2>
                        <p>{selectedQuiz.description}</p>
                        <button onClick={() => navigate(`/play`)}>Start</button>
                        <button onClick={() => setSelectedQuiz(null)}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuizPage;
