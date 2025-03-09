import React, { useState, useEffect } from "react";
import quizData from "../data/quizData"; 
import { useNavigate } from "react-router-dom"; 
import "../css/quizplay.css";

const Play = () => {
    const navigate = useNavigate(); 
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [stage, setStage] = useState("question");
    const [timeLeft, setTimeLeft] = useState(20);
    const [confirmTimeLeft, setConfirmTimeLeft] = useState(10);
    const [resultTimeLeft, setResultTimeLeft] = useState(5);
    const [nextTimeLeft, setNextTimeLeft] = useState(5);
    const [correctCount, setCorrectCount] = useState(0);
    const [wrongCount, setWrongCount] = useState(0);

    const question = quizData[currentQuestionIndex];

    useEffect(() => {
        if (stage === "question" && timeLeft > 0) {
            const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
            return () => clearInterval(timer);
        } else if (stage === "question" && timeLeft === 0) {
            setStage("confirm");
        }
    }, [timeLeft, stage]);

    useEffect(() => {
        if (stage === "confirm" && confirmTimeLeft > 0) {
            const timer = setInterval(() => setConfirmTimeLeft((prev) => prev - 1), 1000);
            return () => clearInterval(timer);
        } else if (stage === "confirm" && confirmTimeLeft === 0) {
            setStage("result");
            setResultTimeLeft(3);
        }
    }, [confirmTimeLeft, stage]);

    useEffect(() => {
        if (stage === "result" && resultTimeLeft > 0) {
            const timer = setInterval(() => setResultTimeLeft((prev) => prev - 1), 1000);
            return () => clearInterval(timer);
        } else if (stage === "result" && resultTimeLeft === 0) {
            if (currentQuestionIndex >= quizData.length - 1) {
                setStage("final");
            } else {
                setStage("next");
                setNextTimeLeft(5);
            }
        }
    }, [resultTimeLeft, stage]);

    useEffect(() => {
        if (stage === "next" && nextTimeLeft > 0) {
            const timer = setInterval(() => setNextTimeLeft((prev) => prev - 1), 1000);
            return () => clearInterval(timer);
        } else if (stage === "next" && nextTimeLeft === 0) {
            goToNextQuestion();
        }
    }, [nextTimeLeft, stage]);

    const handleOptionClick = (option) => {
        setSelectedOption(option);
        setStage("confirm");
        setConfirmTimeLeft(7);
    };

    const goToNextQuestion = () => {
        if (selectedOption === question.correctAnswer) {
            setCorrectCount((prev) => prev + 1);
        } else {
            setWrongCount((prev) => prev + 1);
        }

        if (currentQuestionIndex >= quizData.length - 1) {
            setStage("final");
        } else {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setSelectedOption(null);
            setTimeLeft(20);
            setStage("question");
        }
    };

    const percentageScore = ((correctCount / quizData.length) * 100).toFixed(2);

    return (
        <div className="quiz-container">
            {stage !== "final" && (
                <div className="timer-bar" style={{ width: `${(timeLeft / 20) * 100}%` }}>
                    {timeLeft} seconds left
                </div>
            )}

            {stage === "question" && (
                <>
                    <div className="question-section">
                        <h1 className="question">{question.question}</h1>
                    </div>

                    <div className="options-grid">
                        {question.options.map((option, index) => (
                            <button
                                key={index}
                                className="option-button"
                                onClick={() => handleOptionClick(option)}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                </>
            )}

            {stage === "confirm" && (
                <div className="overlay confirm-screen">
                    <video autoPlay loop muted className="background-video">
                        <source src="/assets/nyan-cat.mp4" type="video/mp4" />
                        Your browser does not support the video tag.
                </video>
                    <h2>Are you sure?</h2>
                    <p>{confirmTimeLeft} seconds</p>
                </div>
            )}

            

            {stage === "result" && (
                <div className={`overlay result-screen ${selectedOption === question.correctAnswer ? "correct" : "wrong"}`}>
                    <h2>{selectedOption === question.correctAnswer ? "Correct!" : "Wrong!"}</h2>
                    <p>{question.explanation}</p>
                </div>
            )}

            {stage === "next" && (
                <div className="overlay next-screen">
                    <h2>Next Question in {nextTimeLeft} seconds...</h2>
                </div>
            )}

            {stage === "final" && (
                <div className="overlay final-screen">
                    <h2>Quiz Complete</h2>
                    <p>Correct Answers: {correctCount}</p>
                    <p>Wrong Answers: {wrongCount}</p>
                    <p>Score: {percentageScore}%</p>

                    <button onClick={() => window.location.reload()} className="restart-button">Play Again</button>
                    <button onClick={() => navigate("/quiz")} className="quizzes-button">
                        Back to Quizzes
                    </button>
                </div>
            )}
        </div>
    );
};

export default Play;
