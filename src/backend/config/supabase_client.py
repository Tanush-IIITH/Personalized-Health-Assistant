"""Supabase client configuration and helpers."""
import os
from functools import lru_cache
from typing import Final

from dotenv import load_dotenv
from supabase import Client, create_client


class SupabaseConfigError(RuntimeError):
    """Raised when mandatory Supabase configuration is missing."""


SUPABASE_URL_ENV: Final[str] = "SUPABASE_URL"
SUPABASE_KEY_ENV: Final[str] = "SUPABASE_SERVICE_ROLE_KEY"
SUPABASE_BUCKET_ENV: Final[str] = "SUPABASE_REPORTS_BUCKET"

# Load .env once on module import so env vars are available for client creation.
load_dotenv()


@lru_cache(maxsize=1)
def get_supabase_client() -> Client:
    """Return a singleton Supabase client configured from environment variables."""
    url = os.getenv(SUPABASE_URL_ENV)
    key = os.getenv(SUPABASE_KEY_ENV)
    if not url or not key:
        raise SupabaseConfigError(
            "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set for storage uploads."
        )
    return create_client(url, key)


def get_reports_bucket() -> str:
    """Return the target storage bucket for medical reports."""
    return os.getenv(SUPABASE_BUCKET_ENV, "medical-reports")
