from flask import Flask, request, jsonify, render_template
import pdfplumber
from PIL import Image
import pytesseract
import re
from flask_cors import CORS
import os
import platform

app = Flask(__name__)
CORS(app)

def setup_tesseract():
    if os.getenv('TESSERACT_PATH'):
        pytesseract.pytesseract.tesseract_cmd = os.getenv('TESSERACT_PATH')
        return
    
    system = platform.system()
    common_paths = []
    
    if system == "Windows":
        common_paths = [
            r"C:\Program Files\Tesseract-OCR\tesseract.exe",
            r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
        ]
    elif system == "Darwin":  
        common_paths = [
            "/usr/local/bin/tesseract",
            "/opt/homebrew/bin/tesseract",
        ]
    else: 
        common_paths = [
            "/usr/bin/tesseract",
            "/usr/local/bin/tesseract",
        ]
    
    for path in common_paths:
        if os.path.exists(path):
            pytesseract.pytesseract.tesseract_cmd = path
            return

setup_tesseract()

pattern = r"(\b(?:\d{1,2}[-/.]\d{1,2}|\d{1,2}\s+(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?))\b)\s+(.+?)\s+(?:(\d{1,3}(?:,\d{3})*\.\d{2})\s+)?(?:(\d{1,3}(?:,\d{3})*\.\d{2})\s+)?(\d{1,3}(?:,\d{3})*\.\d{2})"

@app.route("/")
def home():
    return render_template('frontend.html')

@app.route("/upload-bank", methods=["POST"])
def upload_bank():
    if "bankStatement" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    file = request.files["bankStatement"]
    output = {"transactions": []}
    try:
        with pdfplumber.open(file) as pdf:
            for page in pdf.pages:
                page_img = page.to_image(resolution=300)
                pil_img = page_img.original
                text = pytesseract.image_to_string(pil_img)
                clean = re.sub(r"\s+", " ", text)
                matches = re.findall(pattern, clean)
                for date, desc, debit, credit, balance in matches:
                    amount = debit if debit else credit
                    output["transactions"].append({
                        "date": date,
                        "description": desc.strip(),
                        "balance": balance
                    })
    except Exception as e:
        return jsonify({"error": f"Error processing file: {str(e)}"}), 500
    return jsonify(output)

pan_pattern = r"\b([A-Z]{5}[0-9]{4}[A-Z])\b"
name_pattern = r"Name\s*[:\-]?\s*([A-Z][A-Z\s]*[A-Z]|[A-Z][a-z]+(?:[\s]+[A-Z][a-z]+)*)"
dob_pattern = r"\b(\d{2}[-/]\d{2}[-/]\d{4})\b"

@app.route("/upload-pan", methods=["POST"])
def upload_pan():
    if "panCard" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    file = request.files["panCard"]
    text = ""
    try:
        if file.filename.lower().endswith('.pdf'):
            with pdfplumber.open(file) as pdf:
                page = pdf.pages[0]
                page_image = page.to_image(resolution=300)
                pil_img = page_image.original
                text = pytesseract.image_to_string(pil_img)
        else:
            img = Image.open(file.stream)
            text = pytesseract.image_to_string(img)

        pan_match = re.search(pan_pattern, text)
        name_match = re.search(name_pattern, text, re.MULTILINE)
        dob_match = re.search(dob_pattern, text)

        data = {
            "PAN Number": pan_match.group(1) if pan_match else None,
            "Name": name_match.group(1).strip() if name_match else None,
            "Date of Birth": dob_match.group(1) if dob_match else None
        }
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": f"Error processing file: {str(e)}"}), 500

if __name__ == "__main__":
    app.run(port=5000, debug=True)
