import fitz # PyMuPDF
doc = fitz.open('./docs/mastery_guide.pdf')
text = ""
for page in doc:
    text += page.get_text()
print(text)
