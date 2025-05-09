import fitz

if __name__ == "__main__":
  file_path = "/home/ricanontherun/Downloads/Best Buy Order Details.pdf"

# Open pdf as binary
  with fitz.open(file_path) as doc:
    print("OK")
