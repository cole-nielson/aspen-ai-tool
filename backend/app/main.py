import os
import uuid
from datetime import datetime, timedelta

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from google.cloud import storage
from dotenv import load_dotenv

from app.utils import verify_token
from app.routes.documents import router as documents_router

# -----------------------------------------------------------------------------
# Load environment & initialize app
# -----------------------------------------------------------------------------
load_dotenv()  # Reads variables from backend/.env

app = FastAPI(
    title="Aspen AI Tool API",
    description="Backend for Aspen Document Analysis Portal",
    version="0.1.0",
)

# -----------------------------------------------------------------------------
# CORS configuration (allow your frontend to access this API)
# -----------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080"],  # Update for production domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------------------------------------------------------
# Include documents router
# -----------------------------------------------------------------------------
# Mounts:
#   GET  /documents    -> list all user documents
#   GET  /documents/{doc_id}
#   POST /documents
app.include_router(
    documents_router,
    prefix="/documents",
    dependencies=[Depends(verify_token)],
    tags=["documents"],
)

# -----------------------------------------------------------------------------
# Health check
# -----------------------------------------------------------------------------
@app.get("/", summary="Health check")
def health_check():
    return {"status": "ok"}

# -----------------------------------------------------------------------------
# Generate signed upload URL (protected)
# -----------------------------------------------------------------------------
@app.post(
    "/generate-upload-url",
    summary="Get signed URL for PDF upload",
    response_model=dict,
)
async def generate_upload_url(user=Depends(verify_token)):
    """
    Returns a temporary PUT URL + blob_name for the authenticated user to upload
    exactly one PDF file into your GCS bucket under `uploads/<uuid>.pdf`.
    """
    bucket_name = os.getenv("GCS_BUCKET_NAME")
    if not bucket_name:
        raise HTTPException(status_code=500, detail="GCS_BUCKET_NAME not configured")

    # Initialize GCS client
    try:
        client = storage.Client()
        bucket = client.bucket(bucket_name)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"GCS init error: {e}")

    # Generate a unique blob path
    blob_name = f"uploads/{uuid.uuid4()}.pdf"
    blob = bucket.blob(blob_name)

    # Create signed URL
    try:
        signed_url = blob.generate_signed_url(
            expiration=datetime.utcnow() + timedelta(minutes=10),
            method="PUT",
            content_type="application/pdf",
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Signed URL error: {e}")

    return {
        "upload_url": signed_url,
        "blob_name": blob_name,
    }