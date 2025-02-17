const Pool = require('pg').Pool

// define an object with a constructor with the new keyword
// this requires that the database be running at the time of use
const pool = new Pool({
    user: "postgres", 
    password: "",
    host: "localhost",
    port: 5432,
    database: "kahuut"
})

pool.query("SELECT NOW()", (err, res) => {
    if (err) {
        console.error("Connection error:", err);
    } else {
        console.log("Connected to PostgreSQL:", res.rows);
    }
});