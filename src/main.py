from pypdf import PdfReader

def open_local_file(filename: str) -> PdfReader:
    return PdfReader(filename)

def print_pdf_text_raw(reader: PdfReader):
    text = ''
    for page in reader.pages:
        text += page.extract_text()
    print(text)

def example_print_text_raw():
    example = open_local_file('example/example.pdf')
    print_pdf_text_raw(example)
    example.close()

def get_pdf_chunks(reader: PdfReader) -> list[str]:
    chunks = []
    for page in reader.pages:
        page_chunks = []
        def visition_func(text, cm, tm, font_dict, font_size):
            page_chunks.append(text)
        page.extract_text(visitor_text=visition_func)
        chunks += page_chunks
    return chunks

def example_print_chunks():
    example = open_local_file('example/example.pdf')
    print(get_pdf_chunks(example))
    example.close()

# example_print_text_raw()
example_print_chunks()