from flask import Flask, request, jsonify, render_template
import fitz

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_files():
    print("request.files")
    if 'pdf1' not in request.files or 'pdf2' not in request.files:
        return jsonify({'error': 'No file part'})

    file1 = request.files['pdf1']
    file2 = request.files['pdf2']
    print("file1",file1)
# Extract text from PDF files
    text1 = extract_text_from_pdf(file1)
    text2 = extract_text_from_pdf(file2)

    return jsonify({'text1': text1, 'text2': text2})

def extract_text_from_pdf(pdf_path):
    text = ""
    with fitz.open(stream=pdf_path.read(), filetype="pdf") as doc:
        for page in doc:
            text += page.get_text()
    return text

if __name__ == '__main__':
    app.run(debug=True)
