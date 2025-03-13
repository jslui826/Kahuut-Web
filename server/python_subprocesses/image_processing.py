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
            print(f"Error: Cant find image: {image_path}", file=sys.stderr)
            sys.exit(1)

        # Read the image as binary
        with open(image_path, "rb") as img_file:
            image_bytes = Binary(img_file.read())

        # Connect to database
        conn = psycopg2.connect(DATABASE_URL)
        cursor = conn.cursor()

        # Update profile picture in the database
        cursor.execute("UPDATE profile SET pfp = %s WHERE person_id = %s", (image_bytes, user_id))
        conn.commit()

        # Close connection
        cursor.close()
        conn.close()

        print(f"Profile picture successfully updated for user ID: {user_id}")

        if os.path.exists(image_path):
            os.remove(image_path)
            print(f"Deleted image file: {image_path}")
        else:
            print(f"WARNING!!!: Image file already deleted: {image_path}")

        print("Profile picture successfully updated in database.")


    except Exception as e:
        print(f"Database Error: {e}", file=sys.stderr)
        sys.exit(1)
