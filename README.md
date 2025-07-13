# pdf_reader

This is a web app with a backend that provides a helpful interface when reading PDFs that contain a lot of math content. This uses a latex OCR to convert regions that have been identified to have mathematical formulas into their latex form, so that copying is possible. Furthermore, they can be selected and easily searched with a sidebar in the PDF view.

## Downloading

Run `git clone https://github.com/AIIRLab-USM/pdf_reader.git` in a directory to download the project.

Within the project directory there are two subprojects, the backend and the frontend.

## Setting up backend

First you need to install the dependencies in `requirements.txt`

This includes the following:
* `pix2text`
* `pix2tex`
* `fastapi`
* `pdf2image`
* `uvicorn`

Note: `pdf2image` requires poppler (not installable via python evironment).

Mac: `brew install poppler`

Windows: Follow instructions at [oschwartz10612/poppler-windows](https://github.com/oschwartz10612/poppler-windows)

Ubuntu: `sudo apt install poppler-utils`

### Running

To run simply execute `python3 backend/backend.py`

## Setting up Frontend

The frontend uses node/vite as a package manager.

Run `npm install` to install all necessary dependencies.

Run `npm run dev` and navigate to `http://localhost:5173` to see the web app. Note that the backend must be running to have any meaningful usage of the application.
