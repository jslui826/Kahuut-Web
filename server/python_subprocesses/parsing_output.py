import os
import sys
import re
import psycopg2
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

DATABASE_URL = os.getenv('DATABASE_URL')

def parse_questions(input_text):
    """Parses quiz questions from the AI-generated text."""
    try:
        print("📖 Parsing questions from input text...")
        questions = []
        blocks = input_text.strip().split("\n\n")

        for block in blocks:
            question_match = re.search(r"Question:\s*(.+)", block)
            correct_ans_match = re.search(r"Correct Answer:\s+[A-D]\)\s*(.+)", block)
            incorrect_match = re.search(r"Incorrect Answers:\s*(.+)", block)

            # Only proceed if all three patterns were found
            if question_match and correct_ans_match and incorrect_match:
                question_text = question_match.group(1).strip()
                correct_answer = correct_ans_match.group(1).strip()

                # Split the incorrect answers by commas
                incorrect_answers_list = [ans.strip() for ans in incorrect_match.group(1).split(",")]
                if len(incorrect_answers_list) != 3:
                    print(f"⚠️ Skipping malformed question block: {block}")
                    continue  # Skip this block if incorrect answers aren't exactly three

                questions.append({
                    'question': question_text,
                    'correct_answer': correct_answer,
                    'incorrect_answers': incorrect_answers_list
                })

        print(f"✅ Parsed {len(questions)} questions.")
        return questions

    except Exception as e:
        print(f"❌ Error parsing questions: {e}")
        sys.exit(1)


def store_questions(parsed_questions, creator_email, quiz_title, image_path=None, audio_path=None):
    """Stores parsed questions into the database."""
    try:
        print("🔍 Connecting to database...")
        conn = psycopg2.connect(DATABASE_URL)
        cursor = conn.cursor()
        print("✅ Database connection established.")

        print(f"🔎 Checking if creator '{creator_email}' exists in the database...")
        cursor.execute("SELECT person_id FROM persons WHERE email = %s", (creator_email,))
        person = cursor.fetchone()

        if not person:
            print("❌ Creator email not found in database.")
            sys.exit(1)  # Exit with error

        creator_id = person[0]
        print(f"✅ Creator found: ID = {creator_id}")

        # Read and encode image/audio files as bytes if they exist
        image_bytes = None
        audio_bytes = None

        if image_path:
            try:
                with open(image_path, 'rb') as img_file:
                    image_bytes = img_file.read()
            except Exception as e:
                print(f"⚠️ Warning: Failed to read image file '{image_path}': {e}")

        if audio_path:
            try:
                with open(audio_path, 'rb') as audio_file:
                    audio_bytes = audio_file.read()
            except Exception as e:
                print(f"⚠️ Warning: Failed to read audio file '{audio_path}': {e}")

        print("📝 Inserting quiz into database...")
        cursor.execute("""
            INSERT INTO quizzes (title, creator_id, audio, image)
            VALUES (%s, %s, %s, %s)
            RETURNING quiz_id
        """, (quiz_title, creator_id, audio_bytes, image_bytes))

        quiz_id = cursor.fetchone()[0]
        print(f"✅ Quiz stored with ID: {quiz_id}")

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
        print("✅ Questions successfully stored!")

    except Exception as e:
        print(f"❌ Database Error: {e}")
        sys.exit(1)

    finally:
        cursor.close()
        conn.close()


if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Usage: python parsing_output.py <input_file.txt> <creator_email> <quiz_title>")
        sys.exit(1)

    input_file = sys.argv[1]
    creator_email = sys.argv[2]
    quiz_title = sys.argv[3]

    print("📥 Loading AI-generated quiz content...")
    try:
        with open(input_file, 'r', encoding='utf-8') as file:
            content = file.read()
    except Exception as e:
        print(f"❌ Failed to read AI output file: {e}")
        sys.exit(1)

    parsed_questions = parse_questions(input_text=content)

    print(f"📊 {len(parsed_questions)} questions extracted.")
    store_questions(parsed_questions=parsed_questions, creator_email=creator_email, quiz_title=quiz_title)
    print("✅ Pipeline completed successfully!")