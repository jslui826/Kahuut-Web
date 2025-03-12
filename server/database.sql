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
    question TEXT NOT NULL,
    answer1 TEXT NOT NULL,
    answer2 TEXT NOT NULL,
    answer3 TEXT NOT NULL,
    answer4 TEXT NOT NULL,
    audio BYTEA,
    image1 BYTEA,
    image2 BYTEA,
    image3 BYTEA,
    image4 BYTEA
);

CREATE TABLE profiles (
    profile_id SERIAL PRIMARY KEY,
    person_id INT NOT NULL REFERENCES persons(person_id) ON DELETE CASCADE,
    quiz_id INT NOT NULL REFERENCES quizzes(quiz_id) ON DELETE CASCADE,
    UNIQUE(person_id, quiz_id)  -- Ensures each person can have a unique profile per quiz
);
/*
This is just a place to put the commands we will put into a sql session. It is not supposed to be run.
*/