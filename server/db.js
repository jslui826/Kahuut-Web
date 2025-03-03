const Pool = require('pg').Pool

// define an object with a constructor with the new keyword
// this requires that the database be running at the time of use
const pool = new Pool({
    user: "postgres", 
    password: "kahuut",
    host: "localhost",
    port: 5432,
    database: "kahuut"
})

module.exports = pool