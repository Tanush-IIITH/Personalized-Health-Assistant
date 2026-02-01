# Backend Overview

Brief notes on the current backend layout and what each file does.

## Structure
- `main.py`: FastAPI entrypoint; initializes the app, healthcheck, and mounts routers.
- `requirements.txt`: Python dependencies for the backend (FastAPI, uvicorn, supabase client, multipart support, dotenv).

### config/
- `config/__init__.py`: Package marker.
- `config/supabase_client.py`: Creates a singleton Supabase client from env vars and exposes the reports bucket helper.

### controllers/
- `controllers/__init__.py`: Package marker.
- `controllers/reports_controller.py`: Business logic for uploading medical reports (path generation, validation, upload to Supabase Storage).

### middleware/
- `middleware/__init__.py`: Package marker (no middlewares yet).

### routes/
- `routes/__init__.py`: Package marker.
- `routes/reports.py`: HTTP route `POST /reports/upload` that accepts a file + user_id and delegates to the controller.

## Quick start
1) Install deps: `pip install -r requirements.txt`
2) Set env vars: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, optional `SUPABASE_REPORTS_BUCKET` (defaults to `medical-reports`).
3) Run: `uvicorn main:app --reload --port 8000`
4) Test upload: use Swagger UI at `/docs` or `curl -F "user_id=123" -F "file=@/path/to/report.pdf" http://localhost:8000/reports/upload`

## PDF upload
1) Ensure env vars are set (or .env present) so Supabase client can connect.
2) Start the API from the `backend/` folder: `uvicorn main:app --reload --port 8000`.
3) Upload a report via either:
	 - Swagger UI: open `http://localhost:8000/docs`, expand `POST /reports/upload`, provide `user_id` and choose a file.
	 - Curl:
		 ```bash
		 curl -X POST \
			 -F "user_id=YOUR_USER_ID" \
			 -F "file=@/full/path/to/report.pdf" \
			 http://localhost:8000/reports/upload
		 ```
4) Uploaded files land in Supabase Storage under `reports/<user_id>/<timestamp>_<uuid>_<filename>` inside your bucket (defaults to `medical-reports`).
