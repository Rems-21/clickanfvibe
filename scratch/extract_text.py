import sys
import re

if len(sys.argv) < 3:
    print("Usage: extract_text.py <input> <output>")
    sys.exit(1)

with open(sys.argv[1], 'r', encoding='utf-8') as f:
    content = f.read()

text = re.sub(r'<[^>]+>', ' ', content)
text = re.sub(r'\s+', ' ', text)

with open(sys.argv[2], 'w', encoding='utf-8') as f:
    f.write(text)

print(f"Text extracted to {sys.argv[2]}")
