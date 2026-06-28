import re

with open('backend/main.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix Suno POST
content = content.replace("""        response_data = response.json()
        print("Suno API POST Response:", response_data)""", """        try:
            response_data = response.json()
        except Exception as e:
            raise Exception(f"Suno API returned invalid JSON: {response.text}")
        print("Suno API POST Response:", response_data)""")

# Fix Suno Poll
content = content.replace("""        poll_data = poll_response.json()""", """        try:
            poll_data = poll_response.json()
        except Exception:
            poll_data = {}
            print("Suno API Poll returned invalid JSON:", poll_response.text)""")

# Fix Payment Init
content = content.replace("""    if response.status_code == 201 or response.status_code == 200:
        data = response.json()
        if data.get("success"):
            return {"checkout_url": data["data"].get("checkout_url") or data["data"].get("payment_url")}
    
    print("GeniusPay Init Error:", response.text)""", """    if response.status_code == 201 or response.status_code == 200:
        try:
            data = response.json()
            if data.get("success"):
                return {"checkout_url": data["data"].get("checkout_url") or data["data"].get("payment_url")}
        except Exception:
            pass # We fall through to the error handler below
    
    print("GeniusPay Init Error:", response.text)""")

# Fix Webhook
content = content.replace("""    payload = await request.json()""", """    try:
        payload = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")""")

with open('backend/main.py', 'w', encoding='utf-8') as f:
    f.write(content)

print("backend/main.py patched successfully to catch json parsing errors.")
