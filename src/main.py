from pypdf import PdfReader

class PDFSection:
    name: str
    content: str
    def __init__(self, name):
        self.name = name
        self.content = ''
    def append(self, content):
        self.content += content

def arrange_pdf_fragments(reader: PdfReader) -> list[str]:
    fragments = []
    for page in reader.pages:
        def visitor_func(text: str, cm, tm, font_dict, font_size: float):
            fragments.append(text)
        page.extract_text(visitor_text=visitor_func)
    return fragments

def test_pdf_fragments(example_pdf: PdfReader):
    print(arrange_pdf_fragments(example_pdf))

def test_all():
    example_pdf = PdfReader('example/example.pdf')
    test_pdf_fragments(example_pdf)
    example_pdf.close()

if __name__ == '__main__':
    test_all()