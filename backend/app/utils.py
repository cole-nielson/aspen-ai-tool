# backend/app/utils.py

import os
from fastapi import Request, HTTPException, status, Depends
import firebase_admin
from firebase_admin import credentials, auth as admin_auth

# Initialize the Admin SDK exactly once
cred_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
if not cred_path:
    raise RuntimeError("❌ Missing GOOGLE_APPLICATION_CREDENTIALS env var")

cred = credentials.Certificate(cred_path)
firebase_admin.initialize_app(cred)


async def verify_token(request: Request) -> dict:
    """
    FastAPI dependency: reads Authorization: Bearer <token>,
    verifies it via Firebase Admin, and returns the decoded token.
    """
    header = request.headers.get("authorization")
    if not header or not header.startswith("Bearer "):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Missing or invalid Authorization header")

    id_token = header.split(" ", 1)[1]
    try:
        decoded = admin_auth.verify_id_token(id_token)
        return decoded
    except Exception:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid or expired token")