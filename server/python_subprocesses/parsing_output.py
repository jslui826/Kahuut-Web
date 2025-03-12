import os
import sys
import re
import psycopg2
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv('DATABASE_URL')

def parse_questions(input_text):
    questions = []
    blocks = input_text.strip().split("\n\n")

    for block in blocks:
        question_match = re.search(r"Question:\s*(.+)", block)
        correct_ans_match = re.search(r"Correct Answer:\s+[A-D]\)\s*(.+)", block)
        incorrect_match = re.search(r"Incorrect Answers:\s*(.+)", block)

        if question and correct_answer and incorrect_answers:
            question_text = question_match.group(1).strip()

            correct_answer = correct_answer_match.group(1).strip()

            incorrect_answers_list = [ans.strip() for ans in incorrect_match.group(1).split(",")]

            if len(incorrect_answers_list) != 3:
                continue  # Skip if incorrect answers aren't exactly three

            questions.append({
                'question': question_text,
                'correct_answer': correct_answer,
                'incorrect_answers': incorrect_answers_list
            })

    return questions
def store_questions(parsed_questions, creator_email, quiz_title, image_path=None, audio_path=None):
    conn = psycopg2.connect(DATABASE_URL)
    cursor = conn.cursor()

    cursor.execute("SELECT person_id FROM persons WHERE email = %s", (creator_email,))
    person = cursor.fetchone()
    if not person:
        print("Creator email not found.")
        return
    creator_id = person[0]

    # Read and encode image/audio files as bytes if they exist
    image_bytes = open(image_path, 'rb').read() if image_path else None
    audio_bytes = open(audio_path, 'rb').read() if audio_path else None

    cursor.execute("""
        INSERT INTO quizzes (title, creator_id, audio, image)
        VALUES (%s, %s, %s, %s)
        RETURNING quiz_id
    """, (quiz_title, creator_id, audio_bytes, image_bytes))

    quiz_id = cursor.fetchone()[0]

    for q in parsed_questions:
        cursor.execute("""
            INSERT INTO qa (quiz_id, question, answer1, answer2, answer3, answer4)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (
            quiz_id,
            q['question'],
            q['correct_answer'],
            q['incorrect_answers'][0],
            q['incorrect_answers'][1],
            q['incorrect_answers'][2]
        ))

    conn.commit()
    cursor.close()
    conn.close()

if __name__ == "__main__":
    if len(sys.argv) != 4:
        print("Usage: python parse_and_store.py <input_file.txt> <creator_email> <quiz_title>")
        sys.exit(1)

    input_file = sys.argv[1]
    creator_email = sys.argv[2]
    quiz_title = sys.argv[3]

    with open(input_file, 'r') as file:
        content = file.read()

    parsed_questions = parse_questions(input_text=content)
    store_questions(parsed_questions=parsed_questions, creator_email=creator_email, quiz_title=quiz_title)
    print("Questions stored successfully!")
