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

// Posts a quiz
app.post("/quizzes", async (req, res) => {
  try {
    const { description, asset, questions } = req.body; // Asset includes {type, mongo_asset_id}

    // Insert quiz
    const quizResult = await pool.query(
      "INSERT INTO quizzes (description) VALUES ($1) RETURNING *",
      [description]
    );

    const quizId = quizResult.rows[0].quiz_id;

    // Insert asset if provided
    let assetId = null;
    if (asset) {
      const assetResult = await pool.query(
        "INSERT INTO quizzes_assets (quiz_id, asset_type, mongo_asset_id) VALUES ($1, $2, $3) RETURNING id",
        [quizId, asset.asset_type, asset.mongo_asset_id]
      );
      assetId = assetResult.rows[0].id;

      // Update quiz with asset_id
      await pool.query("UPDATE quizzes SET asset_id = $1 WHERE quiz_id = $2", [
        assetId,
        quizId,
      ]);
    }

    // Insert questions
    const questionPromises = questions.map((q) =>
      pool.query(
        "INSERT INTO questions (quiz_id, question_text, answer) VALUES ($1, $2, $3)",
        [quizId, q.question_text, q.answer]
      )
    );

    await Promise.all(questionPromises);

    res.json({
      message: "Quiz created successfully",
      quiz: { quiz_id: quizId, description, asset_id: assetId },
    });
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
        // Get asset
        const assetResult = await pool.query(
          "SELECT * FROM quizzes_assets WHERE quiz_id = $1",
          [quiz.quiz_id]
        );
        const asset = assetResult.rows.length ? assetResult.rows[0] : null;

        // Get questions
        const questionsResult = await pool.query(
          "SELECT * FROM questions WHERE quiz_id = $1 ORDER BY created_at",
          [quiz.quiz_id]
        );

        return {
          ...quiz,
          asset,
          questions: questionsResult.rows,
        };
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
      "SELECT * FROM quizzes WHERE description ILIKE $1",
      [`%${searchQuery}%`]
    );

    const quizzesWithDetails = await Promise.all(
      quizzes.rows.map(async (quiz) => {
        const assetResult = await pool.query(
          "SELECT * FROM quizzes_assets WHERE quiz_id = $1",
          [quiz.quiz_id]
        );
        const asset = assetResult.rows.length ? assetResult.rows[0] : null;

        return {
          ...quiz,
          asset,
        };
      })
    );

    res.json(quizzesWithDetails);
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