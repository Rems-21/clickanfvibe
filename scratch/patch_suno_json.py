with open('backend/main.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix Suno POST
content = content.replace("""        response_data = response.json()
        print("Suno API POST Response:", response_data)""", """        try:
            response_data = response.json()
            print("Suno API POST Response:", response_data)
        except Exception:
            raise Exception(f"Suno API returned invalid JSON: {response.text}")""")

with open('backend/main.py', 'w', encoding='utf-8') as f:
    f.write(content)
