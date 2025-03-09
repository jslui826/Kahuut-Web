// DUMMY BACKEND
// just to test POST on frontend
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());

app.use('/login', (req, res) => {
    res.send({
        token: 'login_token'
    });
});

app.use('/signup', (req, res) => {
    res.send({
        token: 'signup_token'
    });
});

app.listen(8080, () => console.log('API is running on http://localhost:8080/login'));
app.listen(5050, () => console.log('API is running on http://localhost:5050/login'));