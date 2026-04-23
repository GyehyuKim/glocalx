"""Pydantic output schema for the GlocalX Streamlit wizard.

Distinct from output_schema.py (food photo PoC).
This schema covers GBP descriptions + 3 posts + Q&A in 4 languages.
"""
from __future__ import annotations

from typing import List

from pydantic import BaseModel, Field


class GBPDescription(BaseModel):
    """GBP business description for one language. Max 750 chars (Google official limit)."""

    text: str = Field(
        ...,
        description=(
            "Google Business Profile business description. "
            "Max 750 characters. Natural, engaging, no keyword stuffing. "
            "Describe the restaurant's character, signature dishes, and atmosphere."
        ),
        max_length=750,
    )


class GBPPost(BaseModel):
    """One Google Business Profile Local Post."""

    title: str = Field(
        ...,
        description="Post headline. Max 58 characters. Specific and enticing.",
        max_length=58,
    )
    body: str = Field(
        ...,
        description=(
            "Post body. Max 1500 characters. "
            "Announce an event, seasonal menu, or dish highlight. "
            "Culturally adapted — not a literal translation."
        ),
        max_length=1500,
    )
    cta: str = Field(
        ...,
        description="CTA button label. Max 58 characters. e.g., 'Visit Us Today'.",
        max_length=58,
    )
    theme: str = Field(
        ...,
        description=(
            "One-word post theme used internally. "
            "e.g., 'seasonal', 'signature_dish', 'event'."
        ),
    )


class LangBundle(BaseModel):
    """All GBP content for a single language."""

    description: GBPDescription = Field(..., description="GBP business description.")
    posts: List[GBPPost] = Field(
        ...,
        description=(
            "Exactly 3 GBP Local Posts. "
            "Vary the themes: e.g., seasonal, signature dish, visit invitation."
        ),
        min_length=3,
        max_length=3,
    )


class QAItem(BaseModel):
    """One Q&A pair for GBP Q&A section (in English)."""

    question: str = Field(
        ...,
        description="A question a foreign tourist might ask about the restaurant.",
    )
    answer: str = Field(
        ...,
        description="Helpful, concise answer in English. Max 200 characters.",
        max_length=200,
    )


class WizardOutput(BaseModel):
    """Complete GBP content package from the wizard."""

    ko: LangBundle = Field(..., description="Korean (한국어) GBP content.")
    en: LangBundle = Field(..., description="English GBP content.")
    ja: LangBundle = Field(..., description="Japanese (日本語) GBP content.")
    zh_tw: LangBundle = Field(..., description="Traditional Chinese (繁體中文, zh-TW) GBP content.")
    qa: List[QAItem] = Field(
        ...,
        description="3 Q&A pairs in English for the GBP Q&A section.",
        min_length=3,
        max_length=3,
    )
