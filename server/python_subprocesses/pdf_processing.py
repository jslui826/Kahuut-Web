import sys
import os
import fitz  # PyMuPDF
from langchain.chat_models import ChatOpenAI
from langchain.schema import HumanMessage
from dotenv import load_dotenv

def load_env_file(env_file_path):
    """Loads environment variables from a specified .env file."""
    if os.path.exists(env_file_path):
        load_dotenv(env_file_path)
    else:
        print(f"Warning: .env file not found at {env_file_path}")

def extract_text_from_pdf(pdf_path):
    """Extracts text from a PDF file."""
    with fitz.open(pdf_path) as doc:
        text = "\n".join(page.get_text("text") for page in doc)
    return text

def generate_questions(text):
    """Generates multiple-choice quiz questions from text using OpenAI's model."""
    prompt = f"""Extract 5 multiple-choice quiz questions from the following text:\n\n{text}"""
    
    llm = ChatOpenAI(model_name="gpt-4o-mini", openai_api_key=os.getenv("OPENAI_API_KEY"))
    response = llm([HumanMessage(content=prompt)])
    
    return response.content

def generate_answers(questions):
    """Generates one correct answer and three incorrect answers for each question."""
    prompt = f"""For each of the following quiz questions, generate one correct answer and three incorrect answers:\n\n{questions}\n\nFormat the response as:\nQuestion: <question>\nCorrect Answer: <correct_answer>\nIncorrect Answers: <incorrect_1>, <incorrect_2>, <incorrect_3>"""
    
    llm = ChatOpenAI(model_name="gpt-4o-mini", openai_api_key=os.getenv("OPENAI_API_KEY"))
    response = llm([HumanMessage(content=prompt)])
    
    return response.content

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python script.py <pdf_path> <env_file_path>")
        sys.exit(1)

    pdf_path = sys.argv[1]
    env_file_path = sys.argv[2]

    # Load environment variables from the specified .env file
    load_env_file(env_file_path)

    text = extract_text_from_pdf(pdf_path)
    questions = generate_questions(text)
    answers = generate_answers(questions)
    print(answers)

