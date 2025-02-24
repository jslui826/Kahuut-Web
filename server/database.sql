CREATE DATABASE kahuut;

CREATE TABLE quiz(
     quiz_id SERIAL PRIMARY KEY,
     description VARCHAR(255)
);

CREATE TABLE questions (
    id SERIAL PRIMARY KEY,
    question_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE asset_type_enum AS ENUM ('image', 'audio');

CREATE TABLE question_assets (
    id SERIAL PRIMARY KEY,
    question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
    asset_type asset_type_enum NOT NULL,
    mongo_asset_id TEXT NOT NULL
);

/*
This is just a place to put the commands we will put into a sql session. It is not supposed to be run.
*/