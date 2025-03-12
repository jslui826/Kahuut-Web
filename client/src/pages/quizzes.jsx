import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../css/quizzes.css";

const token = localStorage.getItem('token')
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
    const [quizzes, setQuizzes] = useState([sampleQuiz]);
    const [selectedQuizIndex, setSelectedQuizIndex] = useState(0);
    const [selectedQuiz, setSelectedQuiz] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [showMusicPopup, setShowMusicPopup] = useState(false);
    const [showMakeQuizPage, setShowMakeQuizPage] = useState(false);
    const [currentMusic, setCurrentMusic] = useState(defaultMusic);
    const [pdfFile, setPdfFile] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [mp3File, setMp3File] = useState(null);

    const audioRef = useRef(null);
    const navigate = useNavigate();

    const fetchQuizzes = async (query = "") => {
        try {
            const url = query
                ? `http://localhost:4000/quizzes/search?query=${query}`
                : "http://localhost:4000/quizzes";
            const response = await fetch(url);
            const data = await response.json();
            setQuizzes([sampleQuiz, ...data]);
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
        setSelectedQuizIndex((prev) => (prev > 0 ? prev - 1 : quizzes.length - 1));
    };

    const handleRight = () => {
        setSelectedQuizIndex((prev) => (prev < quizzes.length - 1 ? prev + 1 : 0));
    };

    const [quizTitle, setQuizTitle] = useState(""); // State for title input

    const [isUploading, setIsUploading] = useState(false);

    const handleFileUpload = async () => {
        if (!pdfFile || !quizTitle.trim()) {
            alert("Please enter a title and upload a PDF file for the quiz.");
            return;
        }

        setIsUploading(true);
        const token = localStorage.getItem('token'); // assuming JWT stored in localStorage

        const formData = new FormData();
        formData.append("title", quizTitle);
        formData.append("pdf", pdfFile);
        if (imageFile) formData.append("image", imageFile);
        if (mp3File) formData.append("mp3", mp3File);

        try {
            const response = await fetch("http://localhost:4000/quizzes/upload", {
                method: "POST",
                body: formData,
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });

            if (response.ok) {
                alert("Quiz uploaded successfully!");
                setShowMakeQuizPage(false);
                setQuizTitle("");
                setPdfFile(null);
                setImageFile(null);
                setMp3File(null);
                fetchQuizzes();
            } else {
                alert("Failed to upload quiz.");
            }
        } catch (error) {
            alert("Error uploading quiz.");
        } finally {
            setIsUploading(false);
        }
    };
    
    if (showMakeQuizPage) {
        return (
            <div className="quiz-fullscreen">
                <div className="quiz-form">
                    <h2>Create a New Quiz</h2>
    
                    <h3>Step 1: Enter Quiz Title</h3>
                    <label>Quiz Title (Required):</label>
                    <input
                        type="text"
                        placeholder="Enter quiz title here..."
                        value={quizTitle}
                        onChange={(e) => setQuizTitle(e.target.value)}
                    />
    
                    <h3>Step 2: Upload PDF File</h3>
                    <label>PDF (Required):</label>
                    <input type="file" accept="application/pdf" onChange={(e) => setPdfFile(e.target.files[0])} />
                    {pdfFile && <p>{pdfFile.name}</p>}
    
                    <h3>Step 3: Upload an Image (Optional)</h3>
                    <label>Image (Optional):</label>
                    <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} />
                    {imageFile && <p>{imageFile.name}</p>}
    
                    <h3>Step 4: Upload an MP3 File (Optional)</h3>
                    <label>MP3 (Optional):</label>
                    <input type="file" accept="audio/mp3" onChange={(e) => setMp3File(e.target.files[0])} />
                    {mp3File && <p>{mp3File.name}</p>}
    
                    <button className="submit-btn" onClick={handleFileUpload}>Submit Quiz</button>
                    <button className="close-btn" onClick={() => setShowMakeQuizPage(false)}>Go Back</button>
                </div>
            </div>
        );
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
                    <img src="/assets/user1.png" alt="User" className="profile-icon" />
                </div>
                <ul className="menu">
                    <li>Dashboard</li>
                    <li>Quizzes</li>
                    <li>Progress</li>
                    <li>Settings</li>
                    <li onClick={() => setShowMusicPopup(true)}>Music</li>
                    <li onClick={() => setShowMakeQuizPage(true)}>Make Quiz</li>
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
                        {quizzes.length > 0 ? (
                            quizzes.map((quiz, index) => (
                                <div
                                    key={quiz.quiz_id}
                                    className={`quiz-card ${index === selectedQuizIndex ? "selected" : ""}`}
                                    onClick={() => setSelectedQuiz(quiz)}
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
