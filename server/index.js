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
//upload images per question

//upload music

//user authentication

app.listen(port, () => {
    console.log("server has started on port", port)
})