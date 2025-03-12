CREATE TABLE persons (
    person_id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE quizzes (
    quiz_id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    creator_id INT NOT NULL REFERENCES persons(person_id) ON DELETE CASCADE,
    audio BYTEA,
    image BYTEA
);

CREATE TABLE qa (
    quiz_id INT NOT NULL REFERENCES quizzes(quiz_id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer1 TEXT NOT NULL, -- Assume answer1 is always correct
    answer2 TEXT NOT NULL,
    answer3 TEXT NOT NULL,
    answer4 TEXT NOT NULL,
    PRIMARY KEY (quiz_id, question)
);

CREATE TABLE favorites (
    person_id INT NOT NULL REFERENCES persons(person_id) ON DELETE CASCADE,
    quiz_id INT NOT NULL REFERENCES quizzes(quiz_id) ON DELETE CASCADE,
    PRIMARY KEY (person_id, quiz_id)
);

CREATE TYPE team_enum AS ENUM ('R', 'Y', 'B');

CREATE TABLE profile (
    person_id INT PRIMARY KEY REFERENCES persons(person_id) ON DELETE CASCADE,
    team team_enum NOT NULL,
    score INT DEFAULT 0,
    pfp BYTEA
)
/*
This is just a place to put the commands we will put into a sql session. It is not supposed to be run.
We assume answer 1 is the TRUE answer.
To reset the table, we use the following: 
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
*/