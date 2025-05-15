# backend/app/routes/documents.py

import os
from fastapi import APIRouter, Depends, HTTPException
from google.cloud import storage
from app.utils import verify_token

router = APIRouter()

@router.get("/documents")
async def list_documents(user=Depends(verify_token)):
    """
    List all blobs in the GCS bucket under the authenticated user's folder.
    Returns a JSON payload:
    {
      "documents": [
        {
          "id": "<blob_name>",
          "name": "<filename>",
          "blob_name": "<full_blob_path>",
          "size": <bytes>,
          "updated_at": "<ISO timestamp>"
        },
        ...
      ]
    }
    """
    bucket_name = os.getenv("GCS_BUCKET_NAME")
    if not bucket_name:
        raise HTTPException(status_code=500, detail="GCS_BUCKET_NAME not set in environment")

    try:
        client = storage.Client()
        bucket = client.bucket(bucket_name)
        # list blobs under uploads/<user.uid>/
        prefix = f"uploads/{user.uid}/"
        blobs = bucket.list_blobs(prefix=prefix)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list blobs: {e}")

    documents = []
    for blob in blobs:
        documents.append({
            "id": blob.name,
            "name": blob.name.split("/")[-1],
            "blob_name": blob.name,
            "size": blob.size,
            "updated_at": blob.updated.isoformat(),
        })

    return {"documents": documents}