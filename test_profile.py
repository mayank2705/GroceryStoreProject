import urllib.request
import json

url_sync = "http://localhost:8000/api/auth/sync"
req_sync = urllib.request.Request(url_sync, method="POST")
req_sync.add_header('Content-Type', 'application/json')
data_sync = json.dumps({
    "uid": "test_uid_123",
    "email": "test@example.com",
    "name": "Test User",
    "whatsapp_number": "1234567890"
}).encode('utf-8')

try:
    with urllib.request.urlopen(req_sync, data=data_sync) as res:
        sync_res = json.loads(res.read().decode('utf-8'))
        print("Sync OK:", sync_res)
        token = sync_res["access_token"]
except Exception as e:
    print("Sync error:", e.read().decode('utf-8') if hasattr(e, 'read') else e)
    token = None

if token:
    url_update = "http://localhost:8000/api/profile/"
    req_update = urllib.request.Request(url_update, method="PUT")
    req_update.add_header('Content-Type', 'application/json')
    req_update.add_header('Authorization', f'Bearer {token}')
    data_update = json.dumps({
        "full_name": "Test User",
        "whatsapp_number": "1234567890",
        "address": "123 Test Street"
    }).encode('utf-8')

    try:
        with urllib.request.urlopen(req_update, data=data_update) as res:
            update_res = json.loads(res.read().decode('utf-8'))
            print("Update OK:", update_res)
    except Exception as e:
        print("Update error:", e.read().decode('utf-8') if hasattr(e, 'read') else e)
