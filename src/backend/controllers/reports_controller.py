"""Business logic for uploading medical reports to Supabase storage."""
import re
import uuid
from datetime import datetime, timezone
from typing import Tuple

from supabase import Client


class ReportUploadError(RuntimeError):
    """Raised when a medical report cannot be uploaded."""


def _sanitize_filename(filename: str) -> str:
    if not filename:
        return "report.pdf"
    base = re.sub(r"[^A-Za-z0-9._-]", "_", filename)
    return base or "report.pdf"


def build_report_path(user_id: str, original_filename: str) -> str:
    """Create a unique, user-scoped path for the uploaded report."""
    safe_filename = _sanitize_filename(original_filename)
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    unique_id = uuid.uuid4().hex
    return f"{user_id}/{timestamp}_{unique_id}_{safe_filename}"


def upload_medical_report(
    client: Client,
    bucket: str,
    user_id: str,
    original_filename: str,
    file_bytes: bytes,
    content_type: str,
) -> Tuple[str, str]:
    if not user_id:
        raise ReportUploadError("user_id is required for report uploads.")
    if not file_bytes:
        raise ReportUploadError("Uploaded file is empty.")

    storage_path = build_report_path(user_id, original_filename)
    mime_type = content_type or "application/pdf"

    try:
        client.storage.from_(bucket).upload(
            storage_path,
            file_bytes,
            {
                "content-type": mime_type,
                "upsert": False,
            },
        )
        public_url = client.storage.from_(bucket).get_public_url(storage_path)
    except Exception as exc:  # supabase-py raises generic exceptions from storage operations
        raise ReportUploadError(f"Failed to upload report: {exc}") from exc

    return storage_path, public_url
