import urllib.request
import json

print("Testing signup with 8-character password on LIVE server...")
try:
    data = json.dumps({
        "name": "Test User",
        "email": "test_bot_length@clickandvibe.com",
        "password": "botpassw" # exactly 8 chars
    }).encode('utf-8')
    
    req = urllib.request.Request("https://clickandvibe.com/api/auth/signup", data=data, headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(req) as response:
        print("Status:", response.status)
        print("Body:", response.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print("HTTPError on signup:", e.code)
    print("Body:", e.read().decode('utf-8'))
except Exception as e:
    print("Failed to call signup:", e)
