import os
import sys
import re
import psycopg2
from psycopg2 import Binary
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
    """Stores parsed questions into the PostgreSQL database, properly handling binary image/audio data."""
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
            sys.exit(1)

        creator_id = person[0]
        print(f"✅ Creator found: ID = {creator_id}")

        # ✅ Read and encode image/audio files as BYTEA
        image_bytes = None
        audio_bytes = None

        print(f"📂 Checking image path: {image_path}")
        if image_path and os.path.exists(image_path) and os.path.isfile(image_path):
            print(f"✅ Image file exists: {image_path}")
            with open(image_path, 'rb') as img_file:
                image_bytes = Binary(img_file.read())
        else:
            print(f"⚠️ Warning: Image file not found or unreadable: {image_path}")

        print(f"🎵 Checking audio path: {audio_path}")
        if audio_path and os.path.exists(audio_path) and os.path.isfile(audio_path):
            print(f"✅ Audio file exists: {audio_path}")
            with open(audio_path, 'rb') as audio_file:
                audio_bytes = Binary(audio_file.read())
        else:
            print(f"⚠️ Warning: Audio file not found or unreadable: {audio_path}")

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
        print("✅ Questions successfully stored in the database!")

        # ✅ Now safe to delete files after storage
        if image_path and os.path.exists(image_path):
            os.remove(image_path)
            print(f"🗑️ Deleted image file: {image_path}")

        if audio_path and os.path.exists(audio_path):
            os.remove(audio_path)
            print(f"🗑️ Deleted audio file: {audio_path}")

    except Exception as e:
        print(f"❌ Database Error: {e}")
        sys.exit(1)

    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    print("📥 Received command-line arguments:", sys.argv)
    if len(sys.argv) < 6:
        print("Usage: python parsing_output.py <input_file.txt> <creator_email> <quiz_title> <image_path> <audio_path>")
        sys.exit(1)

    input_file = sys.argv[1]
    creator_email = sys.argv[2]
    quiz_title = sys.argv[3]
    image_path = sys.argv[4] if sys.argv[4] not in ["None", ""] else None
    audio_path = sys.argv[5] if sys.argv[5] not in ["None", ""] else None

    print(f"📂 Final Image Path: {image_path}")
    print(f"🎵 Final Audio Path: {audio_path}")

    # Check if files exist before proceeding
    print(f"✅ Checking image file existence: {os.path.exists(image_path) if image_path else 'N/A'}")
    print(f"✅ Checking audio file existence: {os.path.exists(audio_path) if audio_path else 'N/A'}")

    print("📥 Loading AI-generated quiz content...")
    try:
        with open(input_file, 'r', encoding='utf-8') as file:
            content = file.read()
    except Exception as e:
        print(f"❌ Failed to read AI output file: {e}")
        sys.exit(1)

    parsed_questions = parse_questions(input_text=content)

    print(f"📊 {len(parsed_questions)} questions extracted.")
    store_questions(parsed_questions=parsed_questions, creator_email=creator_email, quiz_title=quiz_title, image_path=image_path, audio_path=audio_path)
    print("✅ Pipeline completed successfully!")
