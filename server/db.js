require('dotenv').config()
const Pool = require('pg').Pool

// define an object with a constructor with the new keyword
// this requires that the database be running at the time of use
const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });  

module.exports = pool