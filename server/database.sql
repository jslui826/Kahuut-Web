CREATE TYPE asset_type_enum AS ENUM ('image', 'audio');

CREATE TABLE quizzes_assets (
    id SERIAL PRIMARY KEY,
    quiz_id INTEGER,
    asset_type asset_type_enum NOT NULL,
    mongo_asset_id TEXT NOT NULL
);

CREATE TABLE quizzes (
    quiz_id SERIAL PRIMARY KEY,
    description VARCHAR(255),
    asset_id INTEGER UNIQUE REFERENCES quizzes_assets(id)
);

ALTER TABLE quizzes_assets ADD CONSTRAINT fk_quiz FOREIGN KEY (quiz_id) REFERENCES quizzes(quiz_id) ON DELETE CASCADE;

CREATE TABLE questions (
    id SERIAL PRIMARY KEY,
    quiz_id INTEGER REFERENCES quizzes(quiz_id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    answer TEXT NOT NULL
);

/*
This is just a place to put the commands we will put into a sql session. It is not supposed to be run.
*/