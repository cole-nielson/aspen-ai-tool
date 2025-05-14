import os
import uuid
from datetime import datetime, timedelta
from fastapi import FastAPI
from google.cloud import storage
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI()

@app.get("/")
def health():
    return {"status": "ok"}

@app.get("/generate-upload-url")
def generate_upload_url():
    # Grab bucket name from environment
    bucket_name = os.getenv("GCS_BUCKET_NAME")
    if not bucket_name:
        return {"error": "GCS_BUCKET_NAME not set in .env"}

    # Initialize GCS client
    try:
        storage_client = storage.Client()
        bucket = storage_client.bucket(bucket_name)
    except Exception as e:
        return {"error": f"Failed to initialize GCS client: {str(e)}"}

    # Create unique file path
    blob_name = f"uploads/{uuid.uuid4()}.pdf"
    blob = bucket.blob(blob_name)

    try:
        upload_url = blob.generate_signed_url(
            expiration=datetime.utcnow() + timedelta(minutes=10),
            method="PUT",
        )
        return {
            "upload_url": upload_url,
            "blob_name": blob_name
        }
    except Exception as e:
        return {"error": f"Failed to generate signed URL: {str(e)}"}