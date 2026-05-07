"""Pydantic schemas for Gemini structured output.

These define the exact shape of the JSON returned from the model.
Gemini's structured output mode will enforce this schema.
"""
from typing import List

from pydantic import BaseModel, Field


class LocalizedContent(BaseModel):
    """Marketing content for a single target language."""

    title: str = Field(
        ...,
        description="GBP post headline. Must be <= 58 characters. Catchy, specific.",
        max_length=58,
    )
    body: str = Field(
        ...,
        description=(
            "GBP post body. Must be <= 1500 characters. "
            "Describe the dish, flavor, ingredients, and why a tourist would love it. "
            "Culturally adapted — not a literal translation from Korean."
        ),
        max_length=1500,
    )
    cta_text: str = Field(
        ...,
        description="Call-to-action button label. <= 58 chars. e.g., 'Order Now', 'Visit Us'.",
        max_length=58,
    )
    cultural_hook: str = Field(
        ...,
        description=(
            "One sentence explaining the specific angle used for this audience. "
            "e.g., 'Emphasized the fermented flavor for adventurous Western foodies.'"
        ),
    )


class AnalysisResult(BaseModel):
    """Complete analysis output for one photo."""

    detected_food: str = Field(
        ..., description="Primary Korean dish name in English (e.g., 'bibimbap', 'galbi')."
    )
    food_category: str = Field(
        ...,
        description="General category (e.g., 'rice bowl', 'stew', 'grilled meat', 'street food').",
    )
    ingredients_visible: List[str] = Field(
        default_factory=list,
        description="Ingredients clearly visible in the photo. Do not guess hidden ones.",
    )
    visual_quality: str = Field(
        ...,
        description="Photo quality assessment: 'high', 'medium', or 'low'.",
    )
    confidence: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description=(
            "Confidence in food identification, 0.0-1.0. "
            "If photo is blurry/dark/ambiguous, lower this."
        ),
    )
    warnings: List[str] = Field(
        default_factory=list,
        description=(
            "Red flags the human reviewer should know. "
            "e.g., 'Photo is too dark', 'Multiple dishes visible', 'Cannot confirm ingredients'."
        ),
    )
    content_en: LocalizedContent = Field(..., description="English marketing content.")
    content_ja: LocalizedContent = Field(..., description="Japanese marketing content.")
    content_zh_tw: LocalizedContent = Field(
        ..., description="Traditional Chinese (Taiwan) marketing content."
    )
