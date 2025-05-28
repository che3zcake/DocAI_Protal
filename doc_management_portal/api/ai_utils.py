import os
import google.generativeai as genai
from dotenv import load_dotenv
from PIL import Image
import io
import PyPDF2


load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-1.5-flash-latest')
    vision_model = genai.GenerativeModel('gemini-1.5-flash-latest')
else:
    print("WARNING: GEMINI_API_KEY not found. AI features will not work.")
    model = None
    vision_model = None


def extract_text_from_file(file_object):
    if not vision_model:
        return "AI Model not configured. Text extraction disabled."

    filename = file_object.name.lower()
    file_content = file_object.read()
    file_object.seek(0)

    try:
        if filename.endswith('.txt'):
            return file_content.decode('utf-8')
        elif filename.endswith(('.png', '.jpg', '.jpeg')):
            image = Image.open(io.BytesIO(file_content))
            response = vision_model.generate_content(["Extract all text from this image.", image])
            return response.text
        elif filename.endswith('.pdf'):
            pdf_part = {"mime_type": "application/pdf", "data": file_content}
            response = vision_model.generate_content(["Extract all text from this PDF document.", pdf_part])
            return response.text

        else:
            return "Unsupported file type for text extraction."
    except Exception as e:
        print(f"Error extracting text from {filename}: {e}")
        return f"Error during text extraction: {e}"


def get_ai_answer(document_text, question):
    if not model:
        return "AI Model not configured. Q&A disabled."
    try:
        prompt = (f"Based on the following document text, answer the question. If the answer is not in the text, "
                  f"say so.\n\nDocument Text:\n---\n{document_text}\n---\n\nQuestion: {question}\n\nAnswer:")
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        print(f"Error getting AI answer: {e}")
        return f"Error communicating with AI: {e}"
