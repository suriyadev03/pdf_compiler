from flask import Flask, request, jsonify, render_template
import fitz
import os

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'  # Directory to save uploaded files

# Create uploads directory if it doesn't exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_files():
    if 'pdf1' not in request.files or 'pdf2' not in request.files:
        return jsonify({'error': 'No file part'})

    file1 = request.files['pdf1']
    file2 = request.files['pdf2']

    if file1.filename == '' or file2.filename == '':
        return jsonify({'error': 'No selected file'})

    if file1 and file1.filename.endswith('.pdf') and file2 and file2.filename.endswith('.pdf'):
        pdf1_path = os.path.join(app.config['UPLOAD_FOLDER'], file1.filename)
        pdf2_path = os.path.join(app.config['UPLOAD_FOLDER'], file2.filename)
        file1.save(pdf1_path)
        file2.save(pdf2_path)

        # Extract text from PDF files
        text1 = extract_text_from_pdf(pdf1_path)
        text2 = extract_text_from_pdf(pdf2_path)

        comparison_result = compare_texts(text1, text2)

        return jsonify({'text1': text1, 'text2': text2, 'comparison': comparison_result})

    return jsonify({'error': 'File type not supported'})

def extract_text_from_pdf(pdf_path):
    text = ""
    with fitz.open(pdf_path) as doc:
        for page in doc:
            text += page.get_text()
    return text

def compare_texts(text1, text2):
    # Simple comparison logic
    if text1 == text2:
        return "The contents are identical."
    else:
        return "The contents are different."

if __name__ == '__main__':
    app.run(debug=True)
