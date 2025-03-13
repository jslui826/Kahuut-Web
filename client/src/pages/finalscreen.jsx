import React from "react";
import { useNavigate } from "react-router-dom";
import "../css/quizplay.css";

const FinalScreen = ({ correctCount, wrongCount, percentageScore }) => {
    const navigate = useNavigate();

    return (
        <div className="overlay final-screen">
            <video autoPlay loop className="background-video">
                <source src="/assets/egg.mp4" type="video/mp4" />
                Your browser does not support the video tag.
            </video>
            <h2>Quiz Complete</h2>
            <p>Correct Answers: {correctCount}</p>
            <p>Wrong Answers: {wrongCount}</p>
            <p>Score: {percentageScore}%</p>

            <button onClick={() => window.location.reload()} className="restart-button">
                Play Again
            </button>
            <button onClick={() => navigate("/quiz")} className="quizzes-button">
                Back to Quizzes
            </button>
        </div>
    );
};

export default FinalScreen;
