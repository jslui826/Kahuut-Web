import React from "react";
import "../css/quizzes.css";

const Carousel = ({ quizzes, selectedIndex, setSelectedQuiz, setSelectedIndex, displayLimit }) => {
    const handleLeft = () => {
        if (selectedIndex > 0) {
            setSelectedIndex((prev) => prev - 1);
        }
        if ((selectedIndex - 1) % displayLimit === displayLimit - 1 && selectedIndex > 0) {
            setSelectedIndex((prev) => Math.max(0, prev - displayLimit));
        }
    };

    const handleRight = () => {
        if (selectedIndex < quizzes.length - 1) {
            setSelectedIndex((prev) => prev + 1);
        }
        if ((selectedIndex + 1) % displayLimit === 0 && selectedIndex < quizzes.length - 1) {
            setSelectedIndex((prev) => Math.min(quizzes.length - 1, prev));
        }
    };

    let start = Math.floor(selectedIndex / displayLimit) * displayLimit;
    let end = Math.min(quizzes.length, start + displayLimit);
    const visibleQuizzes = quizzes.slice(start, end);

    return (
        <div className="quiz-carousel" style={{ marginTop: 80 }}>
            <button className="nav-button left" onClick={handleLeft} disabled={selectedIndex === 0}>
                ⬅
            </button>

            <div className="quiz-list">
                {visibleQuizzes.map((quiz, index) => (
                    <div
                        key={quiz.quiz_id}
                        className={`quiz-card ${index + start === selectedIndex ? "selected" : ""}`}
                        onClick={() => setSelectedQuiz(quiz)}
                    >
                        <div className="font-bold text-2xl"><h3>{quiz.title}</h3></div>
                        
                        {/* Add quiz image */}
                        {quiz.image_base64 ? (
                            <img 
                                src={`data:image/png;base64,${quiz.image_base64}`} 
                                alt={quiz.title} 
                                className="quiz-image"
                            />
                        ) : (
                            <p>No image available</p>
                        )}
                    </div>
                ))}
            </div>

            <button
                className="nav-button right"
                onClick={handleRight}
                disabled={selectedIndex >= quizzes.length - 1}
            >
                ➡
            </button>

            <div className="quiz-count">
                {selectedIndex + 1} / {quizzes.length}
            </div>
        </div>
    );
};

export default Carousel;
