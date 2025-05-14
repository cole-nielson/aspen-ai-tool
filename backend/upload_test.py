# upload_test.py

import os
import requests
from dotenv import load_dotenv
from app.main import generate_upload_url

# Load environment variables
load_dotenv()

print("🛠 Generating signed upload URL...")

# Get signed URL
response = generate_upload_url()

if "upload_url" not in response:
    print("❌ Failed to generate URL:", response)
    exit(1)

upload_url = response["upload_url"]
blob_name = response["blob_name"]

print(f"✅ Upload URL generated:")
print(f"📄 Blob path: {blob_name}")
print(f"🔗 URL: {upload_url}")

# Upload file
try:
    with open("dummy.pdf", "rb") as file:
        upload_response = requests.put(upload_url, data=file)

    print(f"📤 Upload status code: {upload_response.status_code}")
    if upload_response.status_code == 200:
        print("✅ Upload successful!")
        print("🌐 View in GCS: https://console.cloud.google.com/storage/browser/aspen-doc-uploads/uploads")
    else:
        print("❌ Upload failed.")
        print(upload_response.text)

except FileNotFoundError:
    print("❌ File dummy.pdf not found in backend/")