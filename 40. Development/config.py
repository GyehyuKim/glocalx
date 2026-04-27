"""Configuration constants for GlocalX AI pipeline."""
import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

# API — .env (로컬) 또는 st.secrets (Streamlit Cloud) 모두 지원
GEMINI_API_KEY = os.getenv("GOOGLE_API_KEY", "")
if not GEMINI_API_KEY:
    try:
        import streamlit as st
        GEMINI_API_KEY = st.secrets.get("GOOGLE_API_KEY", "")
    except Exception:
        pass
# gemini-2.5-flash: current stable, multimodal, has free tier quota
# gemini-2.0-flash had 0 free-tier quota as of our test (2026-04)
MODEL_NAME = "gemini-2.5-flash"

# Paths
BASE_DIR = Path(__file__).parent
SAMPLE_PHOTOS_DIR = BASE_DIR / "sample_photos"
OUTPUTS_DIR = BASE_DIR / "outputs"
OUTPUTS_DIR.mkdir(exist_ok=True)

# Target languages (GBP-supported ISO codes)
# en: 미국/영미권 관광객
# ja: 일본 관광객
# zh-TW: 대만/홍콩 관광객 (번체 중국어)
TARGET_LANGUAGES = {
    "en": "English",
    "ja": "Japanese",
    "zh-TW": "Traditional Chinese (Taiwan)",
}

# Target audience cultural notes (per-language marketing angle)
AUDIENCE_NOTES = {
    "en": "Western tourists — focus on authentic local experience, storytelling, ingredients",
    "ja": "Japanese tourists — emphasize cleanliness, quality, polite service, small portions OK",
    "zh-TW": "Taiwanese/HK tourists — highlight value, shareable portions, trending dishes",
}

# GBP Local Posts character limits (Google official)
GBP_TITLE_MAX = 58
GBP_BODY_MAX = 1500
GBP_CTA_TEXT_MAX = 58

# Quality threshold — below this, flag for human review
MIN_CONFIDENCE = 0.6
