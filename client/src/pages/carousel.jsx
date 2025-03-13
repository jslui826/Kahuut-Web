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
                      
                       {quiz.image_base64 ? (
                           <img
                               src={`data:image/png;base64,${quiz.image_base64}`}
                               alt={quiz.title}
                               className="quiz-image"
                           />
                       ) : (
                           <p>No image available</p>
                       )}
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
};


export default Carousel;