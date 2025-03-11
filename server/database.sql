CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);


CREATE TABLE quizzes (
    quiz_id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    creator_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    image BYTEA,
    music BYTEA
);

CREATE TABLE questions (
    question_id SERIAL PRIMARY KEY,
    quiz_id INT NOT NULL REFERENCES quizzes(quiz_id) ON DELETE CASCADE,
    question_text TEXT NOT NULL
);

CREATE TABLE answers (
    answer_id SERIAL PRIMARY KEY,
    question_id INT NOT NULL REFERENCES questions(question_id) ON DELETE CASCADE,
    answer_text TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL
);

CREATE TABLE favorites (
    user_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    quiz_id INT NOT NULL REFERENCES quizzes(quiz_id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, quiz_id)
);

/*
This is just a place to put the commands we will put into a sql session. It is not supposed to be run.
*/