const express = require('express')
const cors = require('cors')
const port = 4000
const app = express()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const env = ".env"
const pool = require('./db');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if (!token) return res.sendStatus(401)
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403)
    req.user = user
    next()
  })
}

module.exports = pool

//middleware
app.use(cors())
app.use(express.json())

//ROUTES
// Signup endpoint
app.post('/signup', async (req, res) => {
  const { email, password, team } = req.body; // team is R, Y, or B

  if (!email || !password || !team) {
    return res.status(400).json({ error: "Email, password, and team are required." });
  }

  if (!['R', 'Y', 'G'].includes(team)) {
    return res.status(400).json({ error: "Invalid team selection." })
  }

  try {
    const existingUser = await pool.query(
      'SELECT email FROM persons WHERE email = $1', [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: "Email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await pool.query(
      'INSERT INTO persons (email, password) VALUES ($1, $2) RETURNING person_id',
      [email, hashedPassword]
    );

    const person_id = newUser.rows[0].person_id;

    // Insert default profile for user
    await pool.query(
      'INSERT INTO profile (person_id, team) VALUES ($1, $2)',
      [person_id, team]
    );

    const token = jwt.sign(
      { person_id, email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(201).json({ token });
    console.log("User and Profile created");
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error." });
  }
});

// Login endpoint (corrected)
app.post('/login', async (req, res) => {
  const { email, password } = req.body

  try {
    const userResult = await pool.query(
      'SELECT person_id, email, password FROM persons WHERE email = $1',
      [email]
    )

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'User not found' })
    }

    const user = userResult.rows[0]
    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const token = jwt.sign(
      { userId: user.person_id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    )

    res.json({ token })
  } catch (err) {
    console.error(err)
    res.status(500).send("Server Error")
  }
  console.log("Successful login")
})


// Endpoint: Upload PDF and generate quiz
app.post('/generate-quiz', authenticateToken, async (req, res) => {
  if (!req.files || !req.files.pdf) {
      return res.status(400).send('PDF file required.')
  }

  const pdfFile = req.files.pdf
  const userEmail = req.user.email
  const quizTitle = req.body.title || "Untitled Quiz"

  // Save PDF temporarily
  const uploadsDir = path.join(__dirname, 'uploads')
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir)
  const pdfPath = path.join(uploadsDir, pdfFile.name)

  await pdfFile.mv(pdfPath)

  // Step 1: Call PDF processing script
  const aiCmd = `python3 python_subprocesses/pdf_processing.py "${pdfPath}" .env`
  exec(aiCmd, (error, stdout, stderr) => {
      if (error) {
          console.error(`PDF processing error: ${stderr}`)
          return res.status(500).send('PDF processing failed.')
      }

      const aiOutputPath = path.join(uploadsDir, 'ai_output.txt')
      fs.writeFileSync(aiOutputPath, stdout)

      // Step 2: Parse AI Output and insert to PostgreSQL
      const parseCmd = `python3 python_subprocesses/parsing_output.py "${aiOutputPath}" "${userEmail}" "${quizTitle}" .env`
      exec(parseCommand, (parseErr, parseStdout, parseStderr) => {
          if (parseErr) {
              console.error(`Parsing error: ${parseStderr}`)
              return res.status(500).send('Parsing and storing failed.')
          }

          console.log(`Quiz stored successfully: ${parseStdout}`)
          res.status(201).send({ message: "Quiz successfully generated and stored!" })

          // Cleanup files
          fs.unlinkSync(pdfPath)
          fs.unlinkSync(aiOutputPath)
      })
  })
})


// Gets quizzes from db
app.get("/quizzes", async (req, res) => {
  try {
    const quizzes = await pool.query("SELECT * FROM quizzes")

    const quizzesWithDetails = await Promise.all(
      quizzes.rows.map(async (quiz) => {
        // Get questions and answers
        const questionsResult = await pool.query(
          "SELECT * FROM questions WHERE quiz_id = $1",
          [quiz.quiz_id]
        )

        const questionsWithAnswers = await Promise.all(
          questionsResult.rows.map(async (q) => {
            const answersResult = await pool.query(
              "SELECT * FROM answers WHERE question_id = $1",
              [q.question_id]
            )
            return { ...q, answers: answersResult.rows }
          })
        )

        return { ...quiz, questions: questionsWithAnswers }
      })
    )

    res.json(quizzesWithDetails)
  } catch (err) {
    console.error(err.message)
    res.status(500).send("Server Error")
  }
})

// Search bar feature
app.get("/quizzes/search", async (req, res) => {
  try {
    const searchQuery = req.query.query
    if (!searchQuery) {
      return res.status(400).json({ error: "Search query is required" })
    }

    const quizzes = await pool.query(
      "SELECT * FROM quizzes WHERE title ILIKE $1 OR description ILIKE $1",
      [`%${searchQuery}%`]
    )

    res.json(quizzes.rows)
  } catch (err) {
    console.error(err.message)
    res.status(500).send("Server Error")
  }
})

//upload images per question

//upload music

//user authentication

app.listen(port, () => {
    console.log("server has started on port", port)
})