with open('backend/main.py', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    'results.append(f"FAILED (already exists or error): {q}")',
    'results.append(f"FAILED: {q} | Error: {str(e)}")'
)

with open('backend/main.py', 'w', encoding='utf-8') as f:
    f.write(content)
print("Patched.")
