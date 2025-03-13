import React, { useEffect } from "react";
import "../css/quizzes.css";


const Carousel = ({ quizzes, setQuizzes, selectedIndex, setSelectedQuiz, setSelectedIndex, displayLimit }) => {
    const handleLeft = () => {
        if (selectedIndex > 0) {
            setSelectedIndex((prev) => prev - 1);
        }
    };


    useEffect(() => {
        async function fetchFavorites() {
            try {
                const response = await fetch("http://localhost:4000/favorites");
                if (!response.ok) {
                    throw new Error("Failed to fetch favorites");
                }
                const favoriteData = await response.json();

                // Convert array to a map for easier lookup
                const favoriteMap = favoriteData.reduce((acc, fav) => {
                    acc[fav.quiz_id] = fav.favorite_count;
                    return acc;
                }, {});

                // Merge favorite count with quizzes
                setQuizzes((prevQuizzes) =>
                    [...prevQuizzes.map((quiz) => ({
                        ...quiz,
                        favorites: favoriteMap[quiz.quiz_id] || 0
                    }))]
                        .sort((a, b) => b.favorites - a.favorites) // Sort in descending order
                );
            } catch (error) {
                console.error("Error:", error);
            }
        }


        if (quizzes.length > 0) {
            fetchFavorites();
        }
    }, [quizzes, setQuizzes]);


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
    const defaultImage = "https://media.discordapp.net/attachments/1145803324059295875/1349687001296801822/jefut.gif?ex=67d40179&is=67d2aff9&hm=f876ab69d2d8cb2b4e4226b6b26d1f8387252b4bcc57c30ac80d3446752c7534&width=324&height=297&"; // Replace with your actual default image URL



    if (quizzes.length === 0) {
        return (
            <h1 className="text-5xl font-semibold text-center drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]" style={{ marginTop: 175 }}>No Quizzes Found</h1>
        )
    } else {
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

                            <img
                                src={quiz.image_base64 ? `data:image/png;base64,${quiz.image_base64}` : defaultImage}
                                alt={quiz.title}
                                className="quiz-image"
                            />
                            <div className="favorite-section">
                                ⭐ {quiz.favorites || 0}
                            </div>
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
    }
};


export default Carousel;