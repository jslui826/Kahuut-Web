const express = require('express')
const cors = require('cors')
const port = 4000
const app = express()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const env = ".env"
const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

module.exports = pool;

//middleware
app.use(cors())
app.use(express.json())

//ROUTES
// Signup endpoint
app.post('/signup', async (req, res) => {
  const { email, password } = req.body;

  if (!email.endsWith("@g.ucla.edu")) {
      return res.status(400).json({ error: "Email must be a g.ucla.edu address." });
  }

  try {
      const existingUser = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
      if (userCheck.rows.length > 0) {
          return res.status(409).json({ error: 'Email already exists' });
      }

      const bcrypt = require('bcrypt');
      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = await pool.query(
          'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING user_id, email',
          [email, hashedPassword]
      );

      const token = jwt.sign({ userId: newUser.rows[0].user_id }, process.env.JWT_SECRET, { expiresIn: '1h' });

      res.status(201).json({ token });
  } catch (err) {
      console.error(err);
      res.status(500).send("Server Error");
  }
});

// Login endpoint
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
      const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      if (userResult.rows.length === 0) {
          return res.status(401).json({ error: 'User not found' });
      }

      const user = userResult.rows[0];
      const bcrypt = require('bcrypt');
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
          return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = require('jsonwebtoken').sign({ userId: user.user_id }, 'your-secret-key', { expiresIn: '1h' });

      res.json({ token });
  } catch (err) {
      console.error(err);
      res.status(500).send("Server Error");
  }
});

// Posts a quiz
app.post("/quizzes", async (req, res) => {
  try {
    const { creator_id, title, description, image, music, questions } = req.body;

    // Insert quiz
    const quizResult = await pool.query(
      "INSERT INTO quizzes (creator_id, title, description, image, music) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [creator_id, title, description, image, music]
    );

    const quizId = quizResult.rows[0].quiz_id;

    // Insert questions and answers
    for (const q of questions) {
      const questionResult = await pool.query(
        "INSERT INTO questions (quiz_id, question_text) VALUES ($1, $2) RETURNING question_id",
        [quizId, q.question_text]
      );

      const questionId = questionResult.rows[0].question_id;

      // Insert answers
      for (const answer of q.answers) {
        await pool.query(
          "INSERT INTO answers (question_id, answer_text, is_correct) VALUES ($1, $2, $3)",
          [questionId, answer.text, answer.is_correct]
        );
      }
    }

    res.json({ message: "Quiz created successfully", quiz: quizResult.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Gets quizzes from db
app.get("/quizzes", async (req, res) => {
  try {
    const quizzes = await pool.query("SELECT * FROM quizzes");

    const quizzesWithDetails = await Promise.all(
      quizzes.rows.map(async (quiz) => {
        // Get questions and answers
        const questionsResult = await pool.query(
          "SELECT * FROM questions WHERE quiz_id = $1",
          [quiz.quiz_id]
        );

        const questionsWithAnswers = await Promise.all(
          questionsResult.rows.map(async (q) => {
            const answersResult = await pool.query(
              "SELECT * FROM answers WHERE question_id = $1",
              [q.question_id]
            );
            return { ...q, answers: answersResult.rows };
          })
        );

        return { ...quiz, questions: questionsWithAnswers };
      })
    );

    res.json(quizzesWithDetails);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Search bar feature
app.get("/quizzes/search", async (req, res) => {
  try {
    const searchQuery = req.query.query;
    if (!searchQuery) {
      return res.status(400).json({ error: "Search query is required" });
    }

    const quizzes = await pool.query(
      "SELECT * FROM quizzes WHERE title ILIKE $1 OR description ILIKE $1",
      [`%${searchQuery}%`]
    );

    res.json(quizzes.rows);
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