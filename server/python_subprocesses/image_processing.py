import os
import sys
import psycopg2
from psycopg2 import Binary
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

def process_image(user_id, image_path):
    try:
        print(f"Processing image for user ID: {user_id}")

        if not os.path.exists(image_path):
            print(f"Error: Can't find image: {image_path}", file=sys.stderr)
            sys.exit(1)

        # Check file size
        file_size = os.path.getsize(image_path)
        print(f"Image file size: {file_size} bytes")
        if file_size == 0:
            print("Error: Image file is empty", file=sys.stderr)
            sys.exit(1)

        # Read the image as binary
        with open(image_path, "rb") as img_file:
            image_bytes = Binary(img_file.read())

        print("Using DATABASE_URL:", DATABASE_URL)
        # Connect to database
        conn = psycopg2.connect(DATABASE_URL)
        cursor = conn.cursor()
        print("Connected to database successfully.")

        # Update profile picture in the database
        cursor.execute("UPDATE profile SET pfp = %s WHERE person_id = %s", (image_bytes, int(user_id)))
        conn.commit()

        cursor.close()
        conn.close()

        print(f"Profile picture successfully updated for user ID: {user_id}")

        # if os.path.exists(image_path):
        #     os.remove(image_path)
        #     print(f"Deleted image file: {image_path}")
        # else:
        #     print(f"WARNING: Image file already deleted: {image_path}")

        print("Profile picture successfully updated in database.")

    except Exception as e:
        print(f"Database Error: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python3 image_processing.py <user_id> <image_path>", file=sys.stderr)
        sys.exit(1)

    try:
        user_id = int(sys.argv[1])
    except ValueError:
        print("Error: user_id must be an integer", file=sys.stderr)
        sys.exit(1)

    image_path = sys.argv[2]

    process_image(user_id, image_path)