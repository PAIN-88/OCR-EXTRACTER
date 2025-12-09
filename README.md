Bank Statement & PAN Card OCR Extractor (Flask App)

This project is a Flask-based OCR (Optical Character Recognition) API that extracts:

Bank statement transactions (Date, Description, Balance)

PAN Card details (PAN Number, Name, Date of Birth)

It uses Tesseract OCR, pdfplumber, and Pillow to process PDF and image files.

🚀 Features
✅ Bank Statement OCR

Upload a PDF bank statement and extract:

Date

Description

Balance

Uses regex to detect transaction patterns.

✅ PAN Card OCR

Automatically extracts from PAN Card:

PAN Number

Name

Date of Birth

✅ Tesseract Auto-Setup

The app automatically detects the Tesseract installation based on:

Windows

macOS

Linux

Also supports custom TESSERACT_PATH environment variable.

✅ CORS Enabled

API can be accessed from any frontend (React, HTML, JS, etc.)

🛠 Tech Stack

Python 3

Flask

pdfplumber – PDF text/image extraction

Pillow (PIL) – Image handling

pytesseract – OCR

Regex – Pattern matching

CORS – Cross-origin support

📦 Installation
1️⃣ Clone the Repository
git clone <your-repo-url>
cd <your-project-folder>

2️⃣ Install Dependencies
pip install -r requirements.txt

3️⃣ Install Tesseract OCR
Windows

Download from: https://github.com/UB-Mannheim/tesseract/wiki

(Default path is auto-detected.)

Linux
sudo apt install tesseract-ocr

macOS
brew install tesseract

4️⃣ (Optional) Set Custom Path
export TESSERACT_PATH="/path/to/tesseract"

▶️ Run the Server
python app.py


Server starts at:
➡️ http://localhost:5000/

📝 API Endpoints
1. Upload Bank Statement

POST /upload-bank

Form Field:
bankStatement → PDF file

Response Example:

{
  "transactions": [
    {
      "date": "12/03",
      "description": "UPI PAYMENT",
      "balance": "25,300.50"
    }
  ]
}

2. Upload PAN Card

POST /upload-pan

Form Field:
panCard → Image or PDF

Response Example:

{
  "PAN Number": "ABCDE1234F",
  "Name": "RAM KUMAR",
  "Date of Birth": "12/05/1998"
}

📁 Project Structure
.
├── app.py
├── templates
│   └── frontend.html
├── static
│   └── (optional files)
└── README.md

🔍 How It Works
Bank OCR

Converts each PDF page to an image

Applies Tesseract OCR

Cleans text

Uses regex to extract date, description, balance

PAN OCR

Reads the image/PDF

Extracts text using OCR

Uses regex patterns for

PAN Number

Name

DOB

❗ Important Notes

Accuracy depends on PDF/image quality

Use 300 DPI for best OCR results

Regex patterns can be customized for different banks
