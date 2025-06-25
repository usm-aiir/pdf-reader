from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import requests
import io
import json

app = Flask(__name__)
CORS(app)

def extract_regions_from_pdf(pdf_path: str) -> dict:
    # Placeholder function to simulate region extraction
    # In a real application, this would involve PDF parsing and region detection logic
    return {
        "regions": [
            {"id": 1, "name": "Region 1", "coordinates": [100, 150, 200, 250]},
            {"id": 2, "name": "Region 2", "coordinates": [300, 350, 400, 450]}
        ]
    }

@app.route('/api/get_pdf_with_regions/<path:pdf_path>', methods=['GET'])
def get_pdf_with_regions(pdf_path: str):
    try:
        # Construct the URL for the PDF file
        pdf_url = f'http://localhost:5000/static/{pdf_path}'
        
        # Make a request to the PDF file
        response = requests.get(pdf_url)
        
        if response.status_code == 200:
            # Return the PDF file as a response
            return send_from_directory('static', pdf_path, as_attachment=True)
        else:
            return jsonify({'error': 'PDF not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500