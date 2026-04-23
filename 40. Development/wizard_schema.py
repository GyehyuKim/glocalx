"""Pydantic output schema for the GlocalX post adaptation wizard (v2).

v1 (WizardOutput): AI가 4개 언어 콘텐츠를 처음부터 생성.
v2 (PostAdaptation): 점주 한국어 원문을 GBP용으로 보정 + 3개 언어 문화 어댑테이션.
"""
from __future__ import annotations

from pydantic import BaseModel, Field


class AdaptedPost(BaseModel):
    """GBP Local Post for one language."""

    title: str = Field(
        ...,
        description="Post headline. Max 58 characters. Specific and enticing.",
        max_length=58,
    )
    body: str = Field(
        ...,
        description=(
            "Post body. Max 1500 characters. "
            "Culturally adapted for the target audience. "
            "Not a literal translation."
        ),
        max_length=1500,
    )
    cta: str = Field(
        ...,
        description="CTA button label. Max 58 characters. e.g., 'Visit Us Today'.",
        max_length=58,
    )


class PostAdaptation(BaseModel):
    """Adaptation of a single Korean post into 4 languages."""

    refined_ko: AdaptedPost = Field(
        ...,
        description=(
            "Korean refined version. Polish the owner's original text "
            "into a GBP-ready post. Keep the original intent and facts."
        ),
    )
    en: AdaptedPost = Field(
        ...,
        description=(
            "English cultural adaptation. Storytelling tone for Western tourists. "
            "Not a translation of the Korean version."
        ),
    )
    ja: AdaptedPost = Field(
        ...,
        description=(
            "Japanese cultural adaptation. Polite register (ます/です体). "
            "Emphasize quality and care. Restrained, not pushy."
        ),
    )
    zh_tw: AdaptedPost = Field(
        ...,
        description=(
            "Traditional Chinese (zh-TW) cultural adaptation. "
            "Practical, positive tone for Taiwanese/HK tourists. "
            "Emphasize value and trending appeal."
        ),
    )
