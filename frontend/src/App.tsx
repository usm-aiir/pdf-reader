import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import PdfViewer from './PDFViewer'

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<div>
            <h1>Welcome to PDF Reader</h1>
            <h2>Please enter a URL to visit in the following box</h2>
            {/* This is a simple form to enter a PDF path */}
            <form onSubmit={(e) => {
              e.preventDefault();
              const input = (e.target as HTMLFormElement).elements.namedItem("pdfPath") as HTMLInputElement;
              const pdfPath = input.value.trim();
              if (pdfPath) {
                window.location.href = `/pdf/${encodeURIComponent(pdfPath)}`;
              }
            }
            }>
              <input type="text" name="pdfPath" placeholder="Enter PDF path, e.g., 23-09-14972.pdf" />
              <button type="submit">Open PDF</button>
            </form>
          </div>} />
          <Route path={`/pdf/:encodedPath`} element={<PdfViewer />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
