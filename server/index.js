const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const fileUpload = require('express-fileupload');
const pool = require('./db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

require('dotenv').config();

const app = express();
const port = process.env.PORT || 4000;

// Middleware setup
app.use(cors());
app.use(express.json());
app.use(fileUpload());
app.use(cors({
  origin: "http://localhost:3000", // adjust as needed
}));
app.use(fileUpload({
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  useTempFiles: true,
  tempFileDir: '/tmp/'
}));

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

//ROUTES
// Signup endpoint
app.post('/signup', async (req, res) => {
  const { email, password, team } = req.body; // team is R, Y, or B

  if (!email || !password || !team) {
    return res.status(400).json({ error: "Email, password, and team are required." });
  }

  if (!['R', 'Y', 'B'].includes(team)) {
    return res.status(400).json({ error: "Invalid team selection." });
  }

  const client = await pool.connect(); // Get a client from the pool

  try {
    await client.query('BEGIN'); // Start transaction

    const existingUser = await client.query(
      'SELECT email FROM persons WHERE email = $1', [email]
    );

    if (existingUser.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: "Email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await client.query(
      'INSERT INTO persons (email, password) VALUES ($1, $2) RETURNING person_id',
      [email, hashedPassword]
    );

    const person_id = newUser.rows[0].person_id;

    await client.query(
      'INSERT INTO profile (person_id, team) VALUES ($1, $2)',
      [person_id, team]
    );

    await client.query('COMMIT'); // Commit transaction

    const token = jwt.sign(
      { person_id, email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(201).json({ token });
    console.log("User and Profile created");

  } catch (err) {
    await client.query('ROLLBACK'); // Rollback transaction on error
    console.error(err);
    res.status(500).json({ error: "Internal server error." });
  } finally {
    client.release(); // Release client back to the pool
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
app.post('/quizzes/upload', authenticateToken, async (req, res) => {
  const { title } = req.body;
  const pdfFile = req.files?.pdf;
  const imageFile = req.files?.image;
  const audioFile = req.files?.mp3;

  if (!pdfFile || !title) {
    return res.status(400).json({ error: "Quiz title and PDF are required." });
  }

  const uploadsDir = path.join(__dirname, 'uploads');
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

  const pdfPath = path.join(uploadsDir, pdfFile.name);
  await pdfFile.mv(pdfPath);

  const imagePath = imageFile ? path.join(uploadsDir, imageFile.name) : null;
  const audioPath = audioFile ? path.join(uploadsDir, audioFile.name) : null;

  if (imageFile) await imageFile.mv(imagePath);
  if (audioFile) await audioFile.mv(audioPath);

  const creatorEmail = req.user.email;

  // Call pdf_processing.py
  exec(`python3 python_subprocesses/pdf_processing.py "${pdfPath}" .env`, (error, stdout, stderr) => {
    if (error) {
      console.error(stderr);
      return res.status(500).send('PDF processing failed.');
    }

    const aiOutputPath = path.join(uploadsDir, 'ai_output.txt');
    fs.writeFileSync(aiOutputPath, stdout);

    // Call parsing_output.py
    exec(`python3 python_subprocesses/parsing_output.py "${aiOutputPath}" "${creatorEmail}" "${title}" "${imagePath}" "${audioPath}"`, (parseErr, parseStdout, parseStderr) => {
      if (parseErr) {
        console.error(parseStderr);
        return res.status(500).send('Parsing and storing failed.');
      }

      res.status(201).json({ message: "Quiz successfully generated and stored!" });

      fs.unlinkSync(pdfPath);
      fs.unlinkSync(aiOutputPath);
      if (imagePath) fs.unlinkSync(imagePath);
      if (audioPath) fs.unlinkSync(audioPath);
    });
  });
});


// Get all quizzes with questions and answers
app.get("/quizzes", async (req, res) => {
  try {
      const quizzes = await pool.query(`
          SELECT q.quiz_id, q.title, q.creator_id, p.email AS creator_email,
                 encode(q.audio, 'base64') AS audio_base64, encode(q.image, 'base64') AS image_base64
          FROM quizzes q
          JOIN persons p ON q.creator_id = p.person_id
      `);

      const quizzesWithDetails = await Promise.all(
          quizzes.rows.map(async (quiz) => {
              const questionsResult = await pool.query(`
                  SELECT question, answer1, answer2, answer3, answer4
                  FROM qa
                  WHERE quiz_id = $1
              `, [quiz.quiz_id]);

              return { 
                  ...quiz, 
                  questions: questionsResult.rows
              };
          })
      );

      res.json(quizzesWithDetails);
  } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
  }
});

// Search bar feature (searching by quiz title)
app.get("/quizzes/search", async (req, res) => {
  try {
      const searchQuery = req.query.query;
      if (!searchQuery) {
          return res.status(400).json({ error: "Search query is required" });
      }

      const quizzes = await pool.query(`
          SELECT q.quiz_id, q.title, q.creator_id, p.email AS creator_email,
                 encode(q.audio, 'base64') AS audio_base64, encode(q.image, 'base64') AS image_base64
          FROM quizzes q
          JOIN persons p ON q.creator_id = p.person_id
          WHERE q.title ILIKE $1
      `, [`%${searchQuery}%`]);

      res.json(quizzes.rows);
  } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
  }
});

//Leaderboard
app.get("/api/leaderboard/top10", async (req, res) => {
  try {
      const result = await pool.query(
          `SELECT
              p.person_id,
              p.team,
              p.score,
              encode(p.pfp, 'base64') AS pfp,
              SPLIT_PART(pe.email, '@', 1) AS username
          FROM profile p
          JOIN persons pe ON p.person_id = pe.person_id
          ORDER BY p.score DESC
          LIMIT 10;`
      );


      const players = result.rows.map(player => ({
          id: player.person_id,
          name: player.username,
          team: player.team,
          score: player.score,
          img: player.pfp ? `data:image/png;base64,${player.pfp}` : "/assets/default_pfp.jpg" // need default here lol
      }));


      res.json(players);
  } catch (error) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({ error: "Internal Server Error" });
  }
});


module.exports = app;

//upload images per question

//upload music

//user authentication

app.listen(port, () => {
    console.log("server has started on port", port)
})

// Fetch all quizzes created by the current user
app.get("/my_quizzes", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.person_id; // Extract user ID from authenticated request

    const userQuizzes = await pool.query(
      "SELECT * FROM quizzes WHERE creator_id = $1",
      [userId]
    );

    res.json(userQuizzes.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Upload Profile Picture
app.post("/uploadPfp", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.person_id; // Getting user ID

    if (!req.files || !req.files.pfp) {
      return res.status(400).json({ error: "Profile picture is required." });
    }

    const imageFile = req.files.pfp;
    const uploadsDir = path.join(__dirname, "uploads");
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

    const imagePath = path.join(uploadsDir, imageFile.name);
    await imageFile.mv(imagePath);

    // Calling image_processing.py to process the image
    exec(`python3 python_subprocesses/image_processing.py "${imagePath}"`, async (error, stdout, stderr) => {
      if (error) {
        console.error(stderr);
        return res.status(500).json({ error: "Image processing failed." });
      }

      const processedImagePath = stdout.trim();
      const imageBuffer = fs.readFileSync(processedImagePath);

      await pool.query(
        "UPDATE profile SET pfp = $1 WHERE person_id = $2",
        [imageBuffer, userId]
      );

      res.status(200).json({ message: "Profile picture updated successfully!" });

      // Cleaning up my mess
      fs.unlinkSync(imagePath);
      fs.unlinkSync(processedImagePath);
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});