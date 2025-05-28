
📄 Document AI Management Portal
Upload documents (PDF, TXT, images), manage them, and ask AI-powered questions about their content.

Tech Stack: React (Frontend) · Django (Backend) · Google Gemini API

⚡ Quick Local Start

✅ Prerequisites

Node.js & npm

Python & pip

Git

Google Gemini API Key

🚀 1. Clone the Repository

- git clone https://github.com/che3zcake/DocAI_Protal

- cd DocAI_Protal

🛠️ 2. Backend Setup (Django)

- cd doc_management_portal
- python -m venv venv
- source venv/bin/activate  # On Windows: venv\Scripts\activate
- pip install -r requirements.txt 

If requirements.txt is missing, install manually:


pip install Django djangorestframework djangorestframework-simplejwt Pillow PyPDF2 google-generativeai django-cors-headers python-dotenv

🔐 Add Environment Variables

- echo "DJANGO_SECRET_KEY=your_secret_key" > .env
- echo "DJANGO_DEBUG=True" >> .env
- echo "GEMINI_API_KEY=your_gemini_api_key" >> .env

📦 Run Migrations & Start Server

- python manage.py migrate
- python manage.py runserver

Backend running at: http://127.0.0.1:8000

🎨 3. Frontend Setup (React)

- cd ../dmp_fe
- npm install
- echo "REACT_APP_API_URL=http://127.0.0.1:8000/api" > .env
- npm run dev

Frontend running at: http://localhost:5173 or the port shown

🌐 4. Access the App
- Open http://localhost:5173 in your browser.

📝 Notes

Replace:

- your_secret_key with your Django secret key.

- your_gemini_api_key with your Gemini API key.

- The echo commands create minimal .env files — adjust as needed.

- CORS_ALLOW_ALL_ORIGINS = True is enabled in Django for local development.

