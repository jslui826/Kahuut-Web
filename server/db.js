require('dotenv').config()
const { Pool } = require('pg')
console.log("Loaded DATABASE_URL:", process.env.DATABASE_URL);
// define an object with a constructor with the new keyword
// this requires that the database be running at the time of use
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false } // Required for Railway-hosted DB
  });  

module.exports = pool