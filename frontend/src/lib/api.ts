// src/lib/api.ts
// -----------------------------------------------------------------------------
// Thin wrapper around the FastAPI backend. Every call automatically:
//   • refreshes the Firebase ID‑token
//   • sends `Authorization: Bearer <token>`
//   • throws with the backend’s JSON error payload if present
// -----------------------------------------------------------------------------

import { auth } from "./firebase";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

async function idToken(): Promise<string> {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");
  // true ==> force refresh so the token is always valid (<1h old)
  return user.getIdToken(true);
}

async function api<T = unknown>(
  path: string,
  options: RequestInit & { authorize?: boolean } = {}
): Promise<T> {
  const headers = new Headers(options.headers);

  if (options.authorize !== false) {
    headers.set("Authorization", `Bearer ${await idToken()}`);
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    // Try to include JSON error payload from FastAPI
    let message = res.statusText;
    try {
      const err = await res.json();
      if (err?.error) message = err.error;
    } catch {
      /* ignore – not JSON */
    }
    throw new Error(`API ${res.status}: ${message}`);
  }

  return (await res.json()) as T;
}

/* -------------------------------------------------------------------------- */
/* Public functions                                                           */
/* -------------------------------------------------------------------------- */

/** 
 * Returns `{ url, blob_name }` where `url` is a PUT‑signed URL for GCS 
 * and `blob_name` is the path under your bucket.
 */
export async function generateUploadUrl(
  fileName: string,
  contentType: string
): Promise<{ url: string; blob_name: string }> {
  // call your FastAPI POST /generate-upload-url
  const { upload_url, blob_name } = await api<{
    upload_url: string;
    blob_name: string;
  }>("/generate-upload-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ file_name: fileName, content_type: contentType }),
  });

  return { url: upload_url, blob_name };
}

/**
 * PUTs the raw file bytes into the signed URL.
 */
export async function uploadFileWithSignedUrl(
  signedUrl: string,
  file: File
): Promise<void> {
  const res = await fetch(signedUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
  if (!res.ok) {
    throw new Error(`Failed to upload file: ${res.statusText}`);
  }
}

/**
 * Kick off your document‑analysis endpoint (once you’ve wired it up).
 */
export async function analyzeDocument(
  blobName: string
): Promise<Record<string, unknown>> {
  return api("/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ blob_name: blobName }),
  });
}

/**
 * List the current user’s uploaded documents.
 */
export type Document = {
  id: string;
  name: string;
  uploaded_by: string;
  uploaded_at: string;
  status: string;
  blob_name: string;
};
export async function fetchUserDocuments(): Promise<{ documents: Document[] }> {
  try {
    return await api<{ documents: Document[] }>("/documents");
  } catch (err) {
    console.error("documents API failed – falling back to mock data:", err);
    return {
      documents: [
        {
          id: "doc-001",
          name: "Q2 Financial Report.pdf",
          uploaded_by: "alice@aspencapitalmgmt.com",
          uploaded_at: "2023-07-15T10:30:00Z",
          status: "processed",
          blob_name: "user123/Q2_Financial_Report_1689417000.pdf",
        },
      ],
    };
  }
}