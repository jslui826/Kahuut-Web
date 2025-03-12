CREATE TABLE persons (
    person_id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE quizzes (
    quiz_id INT NOT NULL,
    title TEXT NOT NULL,
    creator_id INT NOT NULL REFERENCES persons(person_id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer1 TEXT NOT NULL,
    answer2 TEXT NOT NULL,
    answer3 TEXT NOT NULL,
    answer4 TEXT NOT NULL,
    audio BYTEA,
    image BYTEA,
    PRIMARY KEY (quiz_id, question)
);

CREATE TABLE profiles (
    profile_id SERIAL PRIMARY KEY,
    person_id INT NOT NULL REFERENCES persons(person_id) ON DELETE CASCADE,
    quiz_id INT NOT NULL,
    question TEXT NOT NULL,
    FOREIGN KEY (quiz_id, question) REFERENCES quizzes(quiz_id, question) ON DELETE CASCADE,
    UNIQUE(person_id, quiz_id, question) -- Ensures each person has a unique profile entry per quiz question
);
/*
This is just a place to put the commands we will put into a sql session. It is not supposed to be run.
We assume answer 1 is the TRUE answer.
To reset the table, we use the following: 
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
*/