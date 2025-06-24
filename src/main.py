from pypdf import PdfReader

class PDFSection:
    name: str
    content: str
    def __init__(self, name):
        self.name = name
        self.content = ''
    def append(self, content):
        self.content += content

class PDFFragment:
    content: str
    position: tuple[float, float]
    page: int
    font_size: float
    def __init__(self, content, position, page, font_size):
        self.content = content
        self.position = position
        self.page = page
        self.font_size = font_size
    
    def __repr__(self):
        return f"PDFFragment(content='{self.content}', position={self.position}, page={self.page}, font_size={self.font_size})"

def arrange_pdf_fragments(reader: PdfReader) -> list[PDFFragment]:
    fragments = []
    for page in reader.pages:
        def visitor_func(text: str, ctm: tuple[float, float, float, float, float, float], tm, font_dict, font_size: float):
            x, y = ctm[4], ctm[5]
            fragment = PDFFragment(
                content=text,
                position=(x, y),
                page=page.page_number,
                font_size=font_size
            )
            fragments.append(fragment)
        page.extract_text(visitor_text=visitor_func)
    return fragments

def test_pdf_fragments(example_pdf: PdfReader):
    fragments = arrange_pdf_fragments(example_pdf)
    print(f"Extracted {len(fragments)} fragments from the PDF.")
    for fragment in fragments[:5]:  # Print first 5 fragments for brevity
        print(fragment)
    # Simple merging of fragments based on proximity
    merged_fragments = simple_merge_fragments(fragments)
    print(f"Merged into {len(merged_fragments)} fragments.")
    for fragment in merged_fragments[:5]:
        print(fragment)

# Merges lines that are close together into a single fragment
def simple_merge_fragments(fragments: list[PDFFragment]) -> list[PDFFragment]:
    merged_fragments = []
    current_fragment = None
    for fragment in fragments:
        if fragment.content == '':
            continue
        if current_fragment is None:
            current_fragment = fragment
        else:
            if fragment.content == '\n':
                merged_fragments.append(current_fragment)
                current_fragment = None
                continue
            # Check if the current fragment is close to the last one
            if (abs(current_fragment.position[0] - fragment.position[0]) < 5 and
                abs(current_fragment.position[1] - fragment.position[1]) < 5 and
                current_fragment.page == fragment.page and current_fragment.font_size == fragment.font_size):
                # Merge the content
                if current_fragment.content.endswith('\n'):
                    current_fragment.content = current_fragment.content.rstrip('\n')
                if current_fragment.content.endswith('-'):
                    current_fragment.content = current_fragment.content.rstrip('-')
                else:
                    current_fragment.content += ' '
                current_fragment.content += fragment.content
            else:
                merged_fragments.append(current_fragment)
                current_fragment = fragment
    if current_fragment is not None:
        merged_fragments.append(current_fragment)
    return merged_fragments

def test_all():
    example_pdf = PdfReader('example/example.pdf')
    test_pdf_fragments(example_pdf)
    example_pdf.close()

if __name__ == '__main__':
    test_all()