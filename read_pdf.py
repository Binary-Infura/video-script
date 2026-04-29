import fitz # PyMuPDF
doc = fitz.open('/Users/parthsinghrao/Documents/code-zone/video-script/mastery_guide.pdf')
text = ""
for page in doc:
    text += page.get_text()
print(text)
