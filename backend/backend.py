import logging

logging.basicConfig(level=logging.INFO)

logging.info("Starting the PDF Math Parser API...")

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(debug=True)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # Adjust this to your frontend's URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
@app.get("/")
def read_root():
    return {"message": "Welcome to the PDF Math Parser API!"}

from doclayout_yolo.engine.results import Results
import requests
from pdf2image import convert_from_bytes
from typing import NamedTuple

class PDFMathFormula(NamedTuple):
    page: int
    formula: str | None
    bbox: list[float]

from functools import lru_cache

@lru_cache(maxsize=32)
def download_pdf(pdf_url: str) -> bytes:
    """
    Download the PDF file from the given URL and return its content as bytes.
    """
    logging.info(f"Downloading PDF from URL: {pdf_url}")
    response = requests.get(pdf_url)
    if response.status_code != 200:
        raise ValueError("Failed to download PDF from the provided URL.")
    return response.content

from PIL import Image

def convert_pdf_to_images(pdf_bytes: bytes) -> list[Image.Image]:
    """
    Convert the PDF bytes to a list of images.
    """
    logging.info("Converting PDF bytes to images...")
    images = convert_from_bytes(pdf_bytes, dpi=300)
    print(f"Converted PDF to {len(images)} images.")
    print(f"Image sizes: {[image.size for image in images]}")
    if not images:
        raise ValueError("Failed to convert PDF to images.")
    return images

from pix2tex.cli import LatexOCR
from pix2text import MathFormulaDetector

latex_model = LatexOCR()
math_detector = MathFormulaDetector()
min_score = 0.75

def get_bounding_boxes(images: list) -> list[PDFMathFormula]:
    """
    Analyze the images and extract math formulas using the YOLOv10 model.
    """
    formulas = []
    for i, image in enumerate(images):
        results = math_detector.detect(image)
        if not results:
            continue
        for result in results:
            if isinstance(result, dict) and 'box' in result and 'score' in result:
                if result['score'] >= min_score:
                    # Box is a two dimensional list of coordinates
                    bbox = [
                        result['box'][0][0] / image.width,
                        result['box'][0][1] / image.height,
                        result['box'][2][0] / image.width,
                        result['box'][2][1] / image.height,
                    ]
                    formulas.append(PDFMathFormula(page=i + 1, formula=None, bbox=bbox))
        print(results)
    return formulas

from fastapi.responses import Response

@app.get("/get_pdf/{pdf_url:path}")
async def get_pdf(pdf_url: str):
    """
    Endpoint to get the PDF file from a given URL.
    """
    logging.info(f"Received request to get PDF from URL: {pdf_url}")
    try:
        pdf_bytes = download_pdf(pdf_url)
        return Response(content=pdf_bytes, media_type="application/pdf")
    except Exception as e:
        logging.error(f"Error downloading PDF: {e}")
        return {"error": str(e)}

import json

@lru_cache(maxsize=32)
def get_pdf_regions(pdf_url: str) -> list[dict]:
    """
    Get the bounding boxes of math formulas in a PDF file given its URL.
    This function caches the results to avoid repeated downloads and processing.
    """
    logging.info(f"Getting PDF regions for URL: {pdf_url}")
    pdf_bytes = download_pdf(pdf_url)
    images = convert_pdf_to_images(pdf_bytes)
    formulas = get_bounding_boxes(images)

    enumerated_bboxes = [
        {
            "bbox": f.bbox,
            "pagenum": f.page,
            "id": i
         } for i, f in enumerate(formulas)
    ]
    
    return enumerated_bboxes

@app.get("/predict_math_regions/{pdf_url:path}")
async def predict_math_regions(pdf_url: str):
    """
    Endpoint to predict math formulas in a PDF file given its URL.
    """
    logging.info(f"Received request to predict math regions for PDF URL: {pdf_url}")
    try:
        regions = get_pdf_regions(pdf_url)
        if not regions:
            return {"message": "No math formulas found in the PDF."}
        for region in regions:
            logging.info(f"Region ID: {region['id']}, Page: {region['pagenum']}, BBox: {region['bbox']}")
        return {"regions": regions}
    except Exception as e:
        logging.error(f"Error processing PDF: {e}")
        return {"error": str(e)}

@lru_cache(maxsize=32)
def get_pdf_latex(pdf_url: str, latex_id: int) -> dict:
    """
    Get the LaTeX representation of a specific math region in a PDF file.
    This function caches the results to avoid repeated downloads and processing.
    """
    logging.info(f"Getting LaTeX for region {latex_id} in PDF URL: {pdf_url}")
    regions = get_pdf_regions(pdf_url)
    
    if latex_id < 0 or latex_id >= len(regions):
        raise ValueError(f"Invalid region ID: {latex_id}. Must be between 0 and {len(regions) - 1}.")
    
    bbox = regions[latex_id]
    pdf_bytes = download_pdf(pdf_url)
    images = convert_pdf_to_images(pdf_bytes)
    
    page_image = images[bbox['pagenum'] - 1]
    # Convert bounding box coordinates to pixel values
    x1, y1, x2, y2 = bbox['bbox']
    width, height = page_image.size
    x1, y1, x2, y2 = int(x1 * width), int(y1 * height), int(x2 * width), int(y2 * height)
    image = page_image.crop((x1, y1, x2, y2))
    logging.info(f"Extracted image for region {latex_id} with size: {image.size}")
    
    latex = latex_model(image)
    return {"latex": latex}
    
@app.get("/get_latex_for_region/{region_id:int}/{pdf_url:path}")
async def get_latex_for_region(region_id: int, pdf_url: str):
    """
    Endpoint to get the LaTeX representation of a specific math region in a PDF.
    """
    logging.info(f"Received request to get LaTeX for region {region_id} in PDF URL: {pdf_url}")
    try:
        latex_data = get_pdf_latex(pdf_url, region_id)
        if "latex" not in latex_data:
            return {"message": "No LaTeX found for the specified region."}
        return latex_data
    except Exception as e:
        logging.error(f"Error processing region: {e}")
        return {"error": e.__class__.__name__, "message": str(e)}

@app.get("/simple_test")
def simple_test():
    logging.info("DEBUG: Simple test endpoint hit successfully.")
    return {"message": "Hello from simple test!"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, port=9090)