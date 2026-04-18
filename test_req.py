import urllib.request
import json
import urllib.error

url = 'http://localhost:5173/api/auth/sync'
data = json.dumps({'uid': 'testuid2', 'email': '', 'name': ''}).encode('utf-8')
req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})

try:
    res = urllib.request.urlopen(req)
    print(res.status, res.read())
except urllib.error.HTTPError as e:
    print(e.code, e.read())
except Exception as e:
    print(e)
