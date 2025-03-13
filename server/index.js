const express = require('express')
const cors = require('cors')
const path = require('path')
const fs = require('fs')
const { exec } = require('child_process')
const fileUpload = require('express-fileupload')
const pool = require('./db')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const redis = require("redis");


require('dotenv').config()




const app = express()
const client = redis.createClient();
client.connect().catch(console.error);
const port = process.env.PORT || 4000




// Middleware setup VERY IMPORTANT AND ERROR PRONE
app.use(cors({
origin: "http://localhost:3000", // adjust as needed
}))
app.use(fileUpload({
limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
useTempFiles: true,
tempFileDir: '/tmp/'
}));
app.use(express.json())




// Authenticate the session token created during registration or login




function authenticateToken(req, res, next) {
const authHeader = req.headers['authorization']
const token = authHeader && authHeader.split(' ')[1]
if (!token) return res.sendStatus(401)
jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
  if (err) return res.sendStatus(403)
  //console.log("Decoded User:", user);
  req.user = user
  next()
})
}




module.exports = pool




//ROUTES








// Endpoint: Upload PDF and generate quiz
app.post('/quizzes/upload', authenticateToken, async (req, res) => {
const { title } = req.body
const pdfFile = req.files?.pdf
const imageFile = req.files?.image
const audioFile = req.files?.mp3
console.log("📩 Incoming request...")
console.log("📢 Headers:", req.headers)
 req.on("data", chunk => {
    console.log("📦 Received chunk:", chunk.length, "bytes")
})




req.on("end", () => {
    console.log("✅ Request fully received!")
})




console.log("📂 Files:", req.files)
console.log("📜 Body:", req.body)




if (!req.files || !req.files.pdf) {
    return res.status(400).json({ error: "No files were uploaded." })
}




const uploadsDir = path.join(__dirname, 'uploads')
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir)




const pdfPath = path.join(uploadsDir, pdfFile.name)
await pdfFile.mv(pdfPath)




const imagePath = imageFile ? path.join(uploadsDir, imageFile.name) : null
const audioPath = audioFile ? path.join(uploadsDir, audioFile.name) : null




if (imageFile) {
  await imageFile.mv(imagePath);
  console.log("✅ Image successfully saved at:", imagePath);
} else {
  console.log("❌ No image file received.");
}
 if (audioFile) {
  await audioFile.mv(audioPath);
  console.log("✅ Audio successfully saved at:", audioPath);
} else {
  console.log("❌ No audio file received.");
}
 const creatorEmail = req.user.email




// Call pdf_processing.py
console.log("Executing pdf processing python subprocess")
exec(`python3 python_subprocesses/pdf_processing.py "${pdfPath}" .env`, (error, stdout, stderr) => {
  if (error) {
    console.error(stderr);
    return res.status(500).json({ error: 'PDF processing failed.' });
  }




  const aiOutputPath = path.join(uploadsDir, 'ai_output.txt')
  fs.writeFileSync(aiOutputPath, stdout)




  // Call parsing_output.py
  console.log("Executing parsing of llm output")
  console.log(`Final command: python3 parsing_output.py "${aiOutputPath}" "${creatorEmail}" "${title}" "${imagePath}" "${audioPath}"`);
  exec(
    `python3 python_subprocesses/parsing_output.py '${aiOutputPath}' '${creatorEmail}' '${title}' '${imagePath}' '${audioPath}'`,
    (parseErr, parseStdout, parseStderr) => {
        console.log("🔄 Parsing Output Started...");
        console.log("📂 Image Path Sent:", imagePath);
        console.log("🎵 Audio Path Sent:", audioPath);
         if (parseErr) {
            console.error("❌ Parsing Output Error:", parseStderr || "No error message received.");
            return res.status(500).json({ error: 'Parsing and storing failed.', details: parseStderr || "Unknown error" });
        }
         console.log("✅ Parsing Output Completed Successfully!");
         console.log("📄 Parser Output:", parseStdout);
         client.del("quizzes_all")
           .then(() => console.log("🗑️ Redis cache cleared for quizzes_all"))
           .catch(err => console.error("⚠️ Error clearing Redis cache:", err));


         res.status(201).json({ message: "Quiz successfully generated and stored!" });
         setTimeout(() => {
          try {
              if (fs.existsSync(pdfPath)) {
                  fs.unlinkSync(pdfPath);
                  console.log("🗑️ Deleted PDF file:", pdfPath);
              }
    
              if (fs.existsSync(aiOutputPath)) {
                  fs.unlinkSync(aiOutputPath);
                  console.log("🗑️ Deleted AI output file:", aiOutputPath);
              }
    
              if (imagePath && fs.existsSync(imagePath)) {
                  fs.unlinkSync(imagePath);
                  console.log("🗑️ Deleted image file:", imagePath);
              } else {
                  console.log("⚠️ Skipping deletion: Image file already deleted.");
              }
    
              if (audioPath && fs.existsSync(audioPath)) {
                  fs.unlinkSync(audioPath);
                  console.log("🗑️ Deleted audio file:", audioPath);
              } else {
                  console.log("⚠️ Skipping deletion: Audio file already deleted.");
              }
          } catch (err) {
              console.error("⚠️ Error during cleanup:", err);
          }
      }, 5000);  // Delay ensures Python has finished before deletion
    
    }
);
})
})




// Signup endpoint
app.post('/signup', async (req, res) => {
const { email, password, team } = req.body // team is R, Y, or B




if (!email || !password || !team) {
  return res.status(400).json({ error: "Email, password, and team are required." })
}




if (!['R', 'Y', 'B'].includes(team)) {
  return res.status(400).json({ error: "Invalid team selection." })
}




const client = await pool.connect() // Get a client from the pool




try {
  await client.query('BEGIN') // Start transaction




  const existingUser = await client.query(
    'SELECT email FROM persons WHERE email = $1', [email]
  )




  if (existingUser.rows.length > 0) {
    await client.query('ROLLBACK')
    return res.status(409).json({ error: "Email already exists." })
  }




  const hashedPassword = await bcrypt.hash(password, 10)




  const newUser = await client.query(
    'INSERT INTO persons (email, password) VALUES ($1, $2) RETURNING person_id',
    [email, hashedPassword]
  )




  const person_id = newUser.rows[0].person_id




  await client.query(
    'INSERT INTO profile (person_id, team) VALUES ($1, $2)',
    [person_id, team]
  )




  await client.query('COMMIT') // Commit transaction




  const token = jwt.sign(
    { person_id, email },
    process.env.JWT_SECRET,
    { expiresIn: '3h' }
  )




  res.status(201).json({ token })
  console.log("User and Profile created")




} catch (err) {
  await client.query('ROLLBACK') // Rollback transaction on error
  console.error(err)
  res.status(500).json({ error: "Internal server error." })
} finally {
  client.release() // Release client back to the pool
}
})








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






// Get all quizzes (with Redis caching)
app.get("/quizzes", async (req, res) => {
 try {
     // 1️⃣ Check Redis cache first
     const cachedData = await client.get("quizzes_all");
     if (cachedData) {
         console.log("✅ Serving from Redis Cache");
         return res.json(JSON.parse(cachedData));
     }


     // 2️⃣ Fetch from PostgreSQL if cache is empty
     console.log("🚀 Fetching from Database");
     const quizzes = await pool.query(`
         SELECT quiz_id, title, creator_id, encode(audio, 'base64') AS audio_base64, encode(image, 'base64') AS image_base64
         FROM quizzes
     `);


     // 3️⃣ Store data in Redis with expiration (10 minutes)
     await client.set("quizzes_all", JSON.stringify(quizzes.rows), { EX: 600 });


     res.json(quizzes.rows);
 } catch (err) {
     console.error(err.message);
     res.status(500).send("Server Error");
 }
});




// Search bar feature (searching by quiz title)
app.get("/quizzes/search", async (req, res) => {
try {
    const searchQuery = req.query.query
    if (!searchQuery) {
        return res.status(400).json({ error: "Search query is required" })
    }




    const quizzes = await pool.query(`
        SELECT quiz_id, title, creator_id, encode(audio, 'base64') AS audio_base64, encode(image, 'base64') AS image_base64
        FROM quizzes
        WHERE title ILIKE $1
    `, [`%${searchQuery}%`])




    res.json(quizzes.rows)
} catch (err) {
    console.error(err.message)
    res.status(500).send("Server Error")
}
})




//Individual Leaderboard
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
        LIMIT 10`
    )








    const players = result.rows.map(player => ({
        id: player.person_id,
        name: player.username,
        team: player.team,
        score: player.score,
        img: player.pfp ? `data:image/png;base64,${player.pfp}` : "/assets/default_pfp.jpg" // need default here lol
    }))








    res.json(players)
} catch (error) {
    console.error("Error fetching leaderboard:", error)
    res.status(500).json({ error: "Internal Server Error" })
}
})




// Leaderboard: Team rankings by total score
app.get("/api/leaderboard/teams", async (req, res) => {
try {
  const result = await pool.query(
    `SELECT
        team,
        SUM(score) AS total_score
     FROM profile
     GROUP BY team
     ORDER BY total_score DESC`
  );




  const teams = result.rows.map((team) => ({
    team: team.team,
    totalScore: team.total_score,
  }));




  res.json(teams);
} catch (error) {
  console.error("Error fetching team leaderboard:", error);
  res.status(500).json({ error: "Internal Server Error" });
}
});




// Quizzes questions
app.get("/quizzes/:quiz_id/questions", async (req, res) => {
const { quiz_id } = req.params;
try {
    const questions = await pool.query(
        `SELECT question, answer1, answer2, answer3, answer4
         FROM qa WHERE quiz_id = $1`,
        [quiz_id]
    );
    const formattedQuestions = questions.rows.map((q) => ({
        question: q.question,
        options: [q.answer1, q.answer2, q.answer3, q.answer4],
        correctAnswer: q.answer1, // Assume answer1 is the correct one
    }));
    res.json(formattedQuestions);
} catch (err) {
    console.error("Error fetching questions:", err);
    res.status(500).send("Server Error");
}
});








module.exports = app




//upload images per question




//upload music




//user authentication




app.listen(port, () => {
  console.log("server has started on port", port)
})




// Favorite/unfavorite a quiz
app.post("/favorite", authenticateToken, async (req, res) => {
try {
  const personId = req.user.userId;
  const { quizId } = req.body;

  console.log("Decoded User:", req);

  if (!quizId) {
    return res.status(400).json({ message: "Missing quizId" });
  }

  // Check if quiz is already favorited
  const checkQuery = "SELECT * FROM favorites WHERE person_id = $1 AND quiz_id = $2";
  const checkResult = await pool.query(checkQuery, [personId, quizId]);

  if (checkResult.rows.length > 0) {
    await pool.query("DELETE FROM favorites WHERE person_id = $1 AND quiz_id = $2", [personId, quizId]);
    await client.del(`my_favorites_${personId}`); // ✅ Invalidate cache
    return res.json({ message: "Quiz unfavorited", favorited: false });
} else {
    await pool.query("INSERT INTO favorites (person_id, quiz_id) VALUES ($1, $2)", [personId, quizId]);
    await client.del(`my_favorites_${personId}`); // ✅ Invalidate cache
    return res.json({ message: "Quiz favorited", favorited: true });
}
} catch (error) {
console.error("Error:", error);
res.status(500).json({ error: "Internal server error" });
}
});

// Fetch all quizzes created by the current user
app.get("/my_quizzes", authenticateToken, async (req, res) => {
try {
  const userId = req.user.userId // Extract user ID from authenticated request

  const userQuizzes = await pool.query(
    "SELECT * FROM quizzes WHERE creator_id = $1",
    [userId]
  )

  res.json(userQuizzes.rows)
} catch (err) {
  console.error(err.message)
  res.status(500).send("Server Error")
}
})


// Fetch favorites
app.get("/favorites", async (req, res) => {
 try {
     const result = await pool.query(`
         SELECT quiz_id, COUNT(*) AS favorite_count
         FROM favorites
         GROUP BY quiz_id
     `);
     res.json(result.rows);
 } catch (error) {
     console.error("Error fetching favorites:", error);
     res.status(500).json({ error: "Internal Server Error" });
 }
});


// Fetch all quizzes favorited by the current user
app.get("/my_favorites", authenticateToken, async (req, res) => {
try {
  const userId = req.user.userId // Extract user ID from authenticated request
  const cacheKey = `my_favorites_${userId}`;
        const cachedFavorites = await client.get(cacheKey);
        if (cachedFavorites) {
            console.log("✅ Serving user's favorites from Redis Cache");
            return res.json(JSON.parse(cachedFavorites));
        }

  const userQuizzes = await pool.query(
   `SELECT q.quiz_id, q.title, q.creator_id, q.audio, q.image
    FROM favorites f
    JOIN quizzes q ON f.quiz_id = q.quiz_id
    WHERE f.person_id = $1`,
   [userId]
);
  await client.set(cacheKey, JSON.stringify(userQuizzes.rows), { EX: 600 });
  res.json(userQuizzes.rows)
} catch (err) {
  console.error(err.message)
  res.status(500).send("Server Error")
}
})


app.get("/is_favorite/:quizId", authenticateToken, async (req, res) => {
try {
    const personId = req.user.userId;
    const { quizId } = req.params;




    const result = await pool.query(
        "SELECT 1 FROM favorites WHERE person_id = $1 AND quiz_id = $2",
        [personId, quizId]
    );




    res.json({ isFavorited: result.rows.length > 0 });
} catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
}
});








// Upload Profile Picture
app.post("/uploadPfp", authenticateToken, async (req, res) => {
try {
  const userId = req.user.userId;




  if (!req.files || !req.files.pfp) {
    return res.status(400).json({ error: "Profile picture is required." });
  }




  const imageFile = req.files.pfp;
  const uploadsDir = path.join(__dirname, "uploads");
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);




  const imagePath = path.join(uploadsDir, imageFile.name);
  await imageFile.mv(imagePath);




  // Processing and store the image
  exec(`python3 python_subprocesses/image_processing.py "${userId}" "${imagePath}"`, async (error, stdout, stderr) => {
    if (error) {
      console.error(stderr);
      return res.status(500).json({ error: "Image processing failed." });
    }




    res.status(200).json({ message: "Profile picture updated successfully!" });




   });
} catch (err) {
  console.error(err.message);
  res.status(500).send("Server Error");
}
});


// Update user score after quiz completion
app.post("/update-score", authenticateToken, async (req, res) => {
 try {
     const userId = req.user.userId; // Extract authenticated user ID
     const { correctCount } = req.body;


     if (correctCount === undefined || correctCount < 0) {
         return res.status(400).json({ error: "Invalid score update request." });
     }


     // Update the profile table by adding the correctCount to the user's existing score
     const updateScoreQuery = `
         UPDATE profile
         SET score = score + $1
         WHERE person_id = $2
         RETURNING score
     `;
     const result = await pool.query(updateScoreQuery, [correctCount, userId]);


     if (result.rowCount === 0) {
         return res.status(404).json({ error: "User profile not found." });
     }
     await client.del("leaderboard_top10");
     await client.del("leaderboard_teams");

     res.json({ message: "Score updated successfully!", newScore: result.rows[0].score });
 } catch (error) {
     console.error("Error updating score:", error);
     res.status(500).json({ error: "Internal Server Error" });
 }
});
