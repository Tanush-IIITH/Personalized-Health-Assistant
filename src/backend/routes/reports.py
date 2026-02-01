"""HTTP routes for report uploads."""
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status

from config.supabase_client import get_reports_bucket, get_supabase_client
from controllers.reports_controller import ReportUploadError, upload_medical_report

router = APIRouter(prefix="/reports", tags=["reports"])


@router.post("/upload", status_code=status.HTTP_201_CREATED)
async def upload_report(
    user_id: str = Form(..., description="Identifier for the report owner"),
    file: UploadFile = File(..., description="Medical report PDF or image"),
):
    """Upload a medical report to Supabase storage."""
    file_bytes = await file.read()

    client = get_supabase_client()
    bucket = get_reports_bucket()

    try:
        storage_path, public_url = upload_medical_report(
            client=client,
            bucket=bucket,
            user_id=user_id,
            original_filename=file.filename or "report.pdf",
            file_bytes=file_bytes,
            content_type=file.content_type or "application/pdf",
        )
    except ReportUploadError as err:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(err)) from err

    return {"path": storage_path, "public_url": public_url}
