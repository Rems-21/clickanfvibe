import urllib.request
import json

print("1. Calling Upgrade DB endpoint...")
try:
    req = urllib.request.Request("https://clickandvibe.com/api/admin/upgrade-db")
    with urllib.request.urlopen(req) as response:
        print("Status:", response.status)
        print("Body:", response.read().decode('utf-8'))
except Exception as e:
    print("Failed to call upgrade-db:", e)

print("\n2. Calling Signup endpoint to test 500...")
try:
    data = json.dumps({
        "name": "Test User",
        "email": "test_bot_500@clickandvibe.com",
        "password": "botpassword123"
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
