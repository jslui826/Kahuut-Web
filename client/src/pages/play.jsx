import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../css/quizplay.css";


const Play = () => {
   const { quizId } = useParams(); // Get quiz ID from URL
   const navigate = useNavigate();
   const [questions, setQuestions] = useState([]);
   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
   const [selectedOption, setSelectedOption] = useState(null);
   const [stage, setStage] = useState("question");
   const [timeLeft, setTimeLeft] = useState(20);
   const [confirmTimeLeft, setConfirmTimeLeft] = useState(10);
   const [resultTimeLeft, setResultTimeLeft] = useState(5);
   const [nextTimeLeft, setNextTimeLeft] = useState(5);
   const [correctCount, setCorrectCount] = useState(0);
   const [wrongCount, setWrongCount] = useState(0);
   const [incorrectAnswers, setIncorrectAnswers] = useState([]);
   const [shuffledOptions, setShuffledOptions] = useState([]);
   const [isFavorited, setIsFavorited] = useState(false);




   useEffect(() => {
       async function fetchQuestions() {
           try {
               const response = await fetch(`http://localhost:4000/quizzes/${quizId}/questions`);
               if (!response.ok) {
                   throw new Error("Failed to fetch questions");
               }
               const data = await response.json();
               setQuestions(data);
               shuffleOptions(data[0]);
           } catch (error) {
               console.error("Error:", error);
           }
       }


       fetchQuestions();
   }, [quizId]);


   useEffect(() => {
       async function checkFavoriteStatus() {
           try {
               const token = localStorage.getItem("token");
               const response = await fetch(`http://localhost:4000/is_favorite/${quizId}`, {
                   headers: {
                       "Authorization": `Bearer ${token}`,
                   },
               });
               if (!response.ok) throw new Error("Failed to check favorite status");
  
               const data = await response.json();
               setIsFavorited(data.isFavorited);
           } catch (error) {
               console.error("Error:", error);
           }
       }
  
       checkFavoriteStatus();
   }, [quizId]);
  
   const question = questions[currentQuestionIndex];
   const optionLabels = ["A)", "B)", "C)", "D)"];


   // Fisher-Yates shuffle function
   const shuffleArray = (array) => {
       let shuffled = [...array];
       for (let i = shuffled.length - 1; i > 0; i--) {
           const j = Math.floor(Math.random() * (i + 1));
           [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
       }
       return shuffled;
   };


   const handleFavorite = async () => {
       try {
         const token = localStorage.getItem("token");
         const response = await fetch("http://localhost:4000/favorite", {
           method: "POST",
           headers: {
             "Content-Type": "application/json",
             "Authorization": `Bearer ${token}`, // Pass the token in the header
           },
           body: JSON.stringify({ quizId }),
         });
    
         const data = await response.json();
         setIsFavorited(data.favorited);
       } catch (error) {
         console.error("Error:", error);
       }
     };

     
    // Shuffle options when the question changes
    const shuffleOptions = (question) => {
        if (!question) return;

        let optionsWithCorrect = question.options.map((option) => ({
            text: option.replace(/^[A-D]\)\s*/, ""), // Remove any prefixes
            isCorrect: option === question.correctAnswer
        }));

        let shuffled = shuffleArray(optionsWithCorrect);
        setShuffledOptions(shuffled);
    };

    useEffect(() => {
        if (questions.length > 0) {
            shuffleOptions(questions[currentQuestionIndex]);
        }
    }, [currentQuestionIndex, questions]);
    
    useEffect(() => {
        if (stage === "question") {
            if (timeLeft > 0) {
                const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
                return () => clearInterval(timer);
            } else {
                // Mark unanswered question as incorrect
                setWrongCount((prev) => prev + 1);
                setIncorrectAnswers((prev) => [...prev, { 
                    question: questions[currentQuestionIndex]?.question, 
                    selectedAnswer: "Unanswered",
                    correctAnswer: shuffledOptions.find(opt => opt.isCorrect)?.text
                }]);
                setStage("confirm");
            }
        }
    }, [timeLeft, stage]);
    
    useEffect(() => {
        if (stage === "confirm") {
            if (confirmTimeLeft > 0) {
                const timer = setInterval(() => setConfirmTimeLeft((prev) => prev - 1), 1000);
                return () => clearInterval(timer);
            } else {
                setStage("result");
                setResultTimeLeft(3);
            }
        }
    }, [confirmTimeLeft, stage]);
    
    useEffect(() => {
        if (stage === "result") {
            if (resultTimeLeft > 0) {
                const timer = setInterval(() => setResultTimeLeft((prev) => prev - 1), 1000);
                return () => clearInterval(timer);
            } else {
                if (currentQuestionIndex >= questions.length - 1) {
                    setStage("final");
                } else {
                    setStage("next");
                    setNextTimeLeft(5);
                }
            }
        }
    }, [resultTimeLeft, stage]);
    
    useEffect(() => {
        if (stage === "next") {
            if (nextTimeLeft > 0) {
                const timer = setInterval(() => setNextTimeLeft((prev) => prev - 1), 1000);
                return () => clearInterval(timer);
            } else {
                goToNextQuestion();
            }
        }
    }, [nextTimeLeft, stage]);

    const handleOptionClick = (option) => {
        setSelectedOption(option.text);
        if (option.isCorrect) {
            setCorrectCount((prev) => prev + 1);
        } else {
            setWrongCount((prev) => prev + 1);
            setIncorrectAnswers((prev) => [...prev, { 
                question: question.question, 
                selectedAnswer: option.text,
                correctAnswer: shuffledOptions.find(opt => opt.isCorrect)?.text
            }]);
        }
        setStage("confirm");
        setConfirmTimeLeft(7);
    };

    const goToNextQuestion = () => {
        setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
        setSelectedOption(null);
        setTimeLeft(20);
        setStage("question");
    };

    const percentageScore = ((correctCount / questions.length) * 100).toFixed(2);


   return (
       <div className="quiz-container">
           {stage !== "final" && (
               <div className="timer-bar" style={{ width: `${(timeLeft / 20) * 100}%` }}>
                   {timeLeft} seconds left
               </div>
           )}


           {stage === "question" && question && (
               <>
                   <div className="question-section">
                       <h1 className="question">{question.question}</h1>
                   </div>
                   <div className="options-grid">
                       {shuffledOptions.map((option, index) => (
                           <button
                               key={index}
                               className="option-button"
                               onClick={() => handleOptionClick(option)}
                           >
                               {optionLabels[index]} {option.text}
                           </button>
                       ))}
                   </div>
               </>
           )}


           {stage === "confirm" && (
               <div className="overlay confirm-screen">
                   <video autoPlay loop className="background-video">
                       <source src="/assets/teto.mp4" type="video/mp4" />
                       Your browser does not support the video tag.
                   </video>
                   <h2>Are you sure?</h2>
                   <p>{confirmTimeLeft} seconds</p>
               </div>
           )}


           {stage === "result" && (
               <div className={`overlay result-screen ${selectedOption === shuffledOptions.find(opt => opt.isCorrect)?.text ? "correct" : "wrong"}`}>
                   <h2>{selectedOption === shuffledOptions.find(opt => opt.isCorrect)?.text ? "Correct!" : "Wrong!"}</h2>
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
                   <video autoPlay loop className="background-video">
                       <source src="/assets/egg.mp4" type="video/mp4" />
                       Your browser does not support the video tag.
                   </video>
                   <h2>Quiz Complete</h2>
                   <p>Correct Answers: {correctCount}</p>
                   <p>Wrong Answers: {wrongCount}</p>
                   <p>Score: {percentageScore}%</p>
                   <button onClick={() => window.location.reload()} className="restart-button">Play Again</button>
                   <button onClick={() => navigate("/quiz")} className="quizzes-button">
                       Back to Quizzes
                   </button>
                   <button
                       onClick={handleFavorite}
                       className={`favorite-button ${isFavorited ? "favorited" : ""}`}
                   >
                       {isFavorited ? "Unfavorite" : "Favorite"}
                   </button>
               </div>
           )}
       </div>
   );
};


export default Play;