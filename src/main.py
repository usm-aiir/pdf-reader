from pdfminer.pdfdocument import PDFDocument
from pdfminer.pdfparser import PDFParser
from pdfminer.pdftypes import PDFObjRef
from typing import Any, Iterator
from pdfminer.psparser import PSLiteral
from pdfminer.pdftypes import resolve1
from pdfminer.pdfpage import PDFPage
from pdfminer.pdfinterp import PDFResourceManager, PDFPageInterpreter
from pdfminer.converter import TextConverter

def resolve_dest(doc: PDFDocument, dest: object) -> Any:
    if isinstance(dest, (str, bytes)):
        dest = resolve1(doc.get_dest(dest))
    elif isinstance(dest, PSLiteral):
        dest = resolve1(doc.get_dest(dest.name))
    if isinstance(dest, dict):
        dest = dest["D"]
    if isinstance(dest, PDFObjRef):
        dest = dest.resolve()
    return dest

def parse_outlines(document: PDFDocument) -> list[tuple[int | None, str, Any, int]]:
    pages = {
        page.pageid: pageno
        for (pageno, page) in enumerate(PDFPage.create_pages(document), 1)
    }
    layout: Iterator[tuple[int, str, Any, Any, Any]] = document.get_outlines()
    r = []
    for item in layout:
        z, name, dest, action, _ = item
        pageno = None
        if dest is not None:
            dest = resolve_dest(document, dest)
            pageno = pages[dest[0].objid]
        elif action is not None:
             if isinstance(action, PDFObjRef):
                action = action.resolve()
             if isinstance(action, dict):
                    subtype = action.get("S")
                    if subtype and repr(subtype) == "/'GoTo'" and action.get("D"):
                        dest = resolve_dest(document, action["D"])
                        pageno = pages[dest[0].objid]
        r.append((pageno, name, dest, z))
    return r

from pdfminer.converter import PDFPageAggregator
from pdfminer.layout import LAParams

import math

def extract_accompanying_elements(document: PDFDocument, pageno1: int, dest1: Any, pageno2: int | None, dest2: Any | None) -> list | None:
    resource_manager = PDFResourceManager()
    params = LAParams(line_margin=0.3)
    device = PDFPageAggregator(resource_manager, laparams=params)
    interpreter = PDFPageInterpreter(resource_manager, device)
    pages = {
        num: page
        for (num, page) in enumerate(PDFPage.create_pages(document), 1)
    }
    max_pageno = max(pages.keys())
    if pageno2 is None or dest2 is None:
        pageno2 = max_pageno
    pagenos_to_process = set(range(pageno1, pageno2 + 1))
    pages_to_process = [pages[pageno] for pageno in pagenos_to_process if pageno in pages]
    print(f"Processing pages: {pageno1} to {pageno2}, total pages: {len(pages_to_process)}")
    if not pages_to_process:
        return None
    elements = []
    has_found_first = False
    x0_first = dest1[2]
    y1_first = dest1[3]
    print(x0_first, y1_first)
    x0_last = dest2[2] if dest2 else None
    y1_last = dest2[3] if dest2 else None
    for i, page in enumerate(pages_to_process):
        if i == 1 and not has_found_first:
            return None
        interpreter.process_page(page)
        page_layout = device.get_result()
        for element in page_layout:
            if not has_found_first and element.x0 <= x0_first <= element.x1 and element.y0 <= y1_first <= element.y1:
                has_found_first = True
            elif has_found_first and (x0_last is not None and y1_last is not None) and (element.x0 <= x0_last <= element.x1 and element.y0 <= y1_last <= element.y1):
                return elements
            elif has_found_first:
                elements.append(element)
            else:
                print(f"Skipping element at page {i + pageno1} with coordinates ({element.x0}, {element.y0}, {element.x1}, {element.y1}) as ({x0_first}, {y1_first}) not found yet. {element}")
    return elements if elements else None

if __name__ == "__main__":
    document = PDFDocument(PDFParser(open("example/example.pdf", "rb")))
    print("PDF document loaded successfully.")
    outline = parse_outlines(document)
    for i, (pageno, name, dest, z) in enumerate(outline):
        print(f"Page: {pageno}, Name: {name}, Destination: {dest}, Z-index: {z}")
        if pageno is not None and dest is not None:
            text = extract_accompanying_elements(document, pageno, dest, outline[i + 1][0] if i + 1 < len(outline) else None, outline[i + 1][2] if i + 1 < len(outline) else None)
            if text:
                print(f"Text for {name}: {text}")
    print("Outline parsed successfully.")