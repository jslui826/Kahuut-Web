const express = require('express')
const cors = require('cors')
const port = 3000
const app = express()

//middleware
app.use(cors())
app.use(express.json())

app.listen(port, () => {
    console.log("server has started on port", port)
})