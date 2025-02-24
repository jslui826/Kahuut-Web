const express = require('express')
const cors = require('cors')
const port = 4000
const app = express()
const pool = require('./db')

//middleware
app.use(cors())
app.use(express.json())

//ROUTES

//TODO:

//upload a PDF => questions, answers
/*
 app.post("/quizzes", async(req, res) =>{
    try{
    
    } catch (err){
        console.error(err.message) 
    }
})
*/

// Posts quizzes to db
app.post("/quizzes", async (req, res) => {
    try {
      const { description, questions } = req.body; // Expects description and questions array
  
      // Put quiz into db
      const quizResult = await pool.query(
        "INSERT INTO quizzes (description) VALUES ($1) RETURNING *",
        [description]
      );
  
      const quizId = quizResult.rows[0].quiz_id;
  
      // Put questions into db
      const questionPromises = questions.map((q) =>
        pool.query(
          "INSERT INTO questions (quiz_id, question_text, answer) VALUES ($1, $2, $3)",
          [quizId, q.question_text, q.answer]
        )
      );
  
      await Promise.all(questionPromises);
  
      res.json({ message: "Quiz created successfully", quiz: quizResult.rows[0] });
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  });

  /*
  JSON example for POST:

  {
  "description": "General Knowledge Quiz",
  "questions": [
    { "question_text": "What is the largest land mammal?", "answer": "The African elephant" },
    { "question_text": "Which Queen of England was also celebrated for writing poetry?", "answer": "Queen Elizabeth I" }
  ]
}
  */
  
// Gets quizzes from db
app.get("/quizzes", async (req, res) => {
    try {
      const quizzes = await pool.query("SELECT * FROM quizzes");
  
      const quizzesWithQuestions = await Promise.all(
        quizzes.rows.map(async (quiz) => {
          const questions = await pool.query(
            "SELECT * FROM questions WHERE quiz_id = $1 ORDER BY created_at",
            [quiz.quiz_id]
          );
          return { ...quiz, questions: questions.rows };
        })
      );
  
      res.json(quizzesWithQuestions);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  });


//upload images per question

//upload music

//user authentication

app.listen(port, () => {
    console.log("server has started on port", port)
})