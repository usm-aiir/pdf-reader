from doclayout_yolo import YOLOv10

from huggingface_hub import hf_hub_download

import logging

logging.basicConfig(level=logging.INFO)

logging.info("Starting the PDF Math Parser API...")

filepath = hf_hub_download(repo_id="juliozhao/DocLayout-YOLO-DocStructBench", filename="doclayout_yolo_docstructbench_imgsz1024.pt")
model = YOLOv10(filepath)



from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
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

def convert_pdf_to_images(pdf_bytes: bytes) -> list:
    """
    Convert the PDF bytes to a list of images.
    """
    logging.info("Converting PDF bytes to images...")
    images = convert_from_bytes(pdf_bytes, dpi=300)
    if not images:
        raise ValueError("Failed to convert PDF to images.")
    return images

import torch
import math
from pix2tex.cli import LatexOCR
from PIL import Image

latex_model = LatexOCR()

def get_bounding_boxes(images: list) -> list[PDFMathFormula]:
    """
    Analyze the images and extract math formulas using the YOLOv10 model.
    """
    formulas = []
    for i, image in enumerate(images):
        results: list[Results] = model(image)
        if not results:
            continue
        for result in results:
            if result.boxes is not None and isinstance(result.boxes.data, torch.Tensor):
                for box in result.boxes.data:
                    if math.isclose(box[5].item(), 8.0, abs_tol=1e-5):
                        bbox = [
                            box[0].item(),
                            box[1].item(),
                            box[2].item(),
                            box[3].item()
                        ]
                        formulas.append(PDFMathFormula(page=i + 1, formula=None, bbox=bbox))
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
def get_pdf_regions(pdf_url: str) -> list:
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
    
    if latex_id not in regions:
        raise ValueError("Region ID not found.")
    
    bbox = regions[latex_id]
    pdf_bytes = download_pdf(pdf_url)
    images = convert_pdf_to_images(pdf_bytes)
    
    # Assuming the region corresponds to the first page for simplicity
    image = images[0].crop((bbox['x_min'], bbox['y_min'], bbox['x_max'], bbox['y_max']))
    
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
        return {"error": str(e)}

@app.get("/simple_test")
def simple_test():
    logging.info("DEBUG: Simple test endpoint hit successfully.")
    return {"message": "Hello from simple test!"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, port=9090)