"""Analyze a Korean food photo with Gemini and produce multilingual GBP content.

Usage:
    python analyze_photo.py sample_photos/bibimbap.jpg
    python analyze_photo.py sample_photos/bibimbap.jpg --context "부산 서면 24시 해장국집"
    python analyze_photo.py sample_photos/bibimbap.jpg --save

The script loads the photo, sends it to Gemini 2.0 Flash with a structured
output schema, validates the response via Pydantic, and prints the result.
With --save, the parsed JSON is written to outputs/<photo_name>.json.
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

# Force UTF-8 stdout/stderr so that Japanese/Chinese/accented output
# doesn't crash on Windows cp949 consoles.
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

from google import genai
from google.genai import types
from PIL import Image
from pydantic import ValidationError

import config
from output_schema import AnalysisResult
from prompts import SYSTEM_PROMPT, build_user_prompt


def load_image(photo_path: Path) -> Image.Image:
    """Load an image file as a PIL Image."""
    if not photo_path.exists():
        raise FileNotFoundError(f"Photo not found: {photo_path}")
    if not photo_path.is_file():
        raise ValueError(f"Not a file: {photo_path}")

    img = Image.open(photo_path)
    # Force-load so we fail now if the image is corrupt.
    img.load()
    return img


def analyze(photo_path: Path, restaurant_context: str = "") -> AnalysisResult:
    """Run one photo through Gemini and return a validated AnalysisResult."""
    if not config.GEMINI_API_KEY:
        raise RuntimeError(
            "GOOGLE_API_KEY not set. Copy .env.example to .env and paste your key.\n"
            "Get one at: https://aistudio.google.com/apikey"
        )

    image = load_image(photo_path)

    client = genai.Client(api_key=config.GEMINI_API_KEY)

    response = client.models.generate_content(
        model=config.MODEL_NAME,
        contents=[build_user_prompt(restaurant_context), image],
        config=types.GenerateContentConfig(
            system_instruction=SYSTEM_PROMPT,
            response_mime_type="application/json",
            response_schema=AnalysisResult,
            temperature=0.7,
        ),
    )

    # `response.parsed` returns the Pydantic instance when response_schema is set.
    parsed = response.parsed
    if parsed is None:
        # Fall back to manual JSON parsing with a clearer error.
        raw_text = response.text or ""
        try:
            data = json.loads(raw_text)
            return AnalysisResult.model_validate(data)
        except (json.JSONDecodeError, ValidationError) as e:
            raise RuntimeError(
                f"Gemini returned invalid output.\nRaw: {raw_text[:500]}\nError: {e}"
            )

    return parsed


def check_character_limits(result: AnalysisResult) -> list[str]:
    """Post-hoc validation of GBP character limits. Returns list of violations."""
    violations = []
    for lang_key, lang_attr in [
        ("en", "content_en"),
        ("ja", "content_ja"),
        ("zh-TW", "content_zh_tw"),
    ]:
        content = getattr(result, lang_attr)
        if len(content.title) > config.GBP_TITLE_MAX:
            violations.append(
                f"[{lang_key}] title {len(content.title)} > {config.GBP_TITLE_MAX}"
            )
        if len(content.body) > config.GBP_BODY_MAX:
            violations.append(
                f"[{lang_key}] body {len(content.body)} > {config.GBP_BODY_MAX}"
            )
        if len(content.cta_text) > config.GBP_CTA_TEXT_MAX:
            violations.append(
                f"[{lang_key}] cta_text {len(content.cta_text)} > {config.GBP_CTA_TEXT_MAX}"
            )
    return violations


def print_result(result: AnalysisResult) -> None:
    """Pretty-print the analysis result to stdout."""
    print("=" * 70)
    print(f"Detected       : {result.detected_food} ({result.food_category})")
    print(f"Confidence     : {result.confidence:.2f}")
    print(f"Visual quality : {result.visual_quality}")
    print(f"Ingredients    : {', '.join(result.ingredients_visible) or '(none visible)'}")
    if result.warnings:
        print("Warnings       :")
        for w in result.warnings:
            print(f"  - {w}")

    for lang_label, content in [
        ("ENGLISH", result.content_en),
        ("JAPANESE", result.content_ja),
        ("TRADITIONAL CHINESE (TW)", result.content_zh_tw),
    ]:
        print("-" * 70)
        print(f"[{lang_label}]")
        print(f"Title  : {content.title}")
        print(f"Body   : {content.body}")
        print(f"CTA    : {content.cta_text}")
        print(f"Hook   : {content.cultural_hook}")
    print("=" * 70)


def save_result(result: AnalysisResult, photo_path: Path) -> Path:
    """Write the result to outputs/<photo_stem>.json."""
    out_path = config.OUTPUTS_DIR / f"{photo_path.stem}.json"
    out_path.write_text(
        result.model_dump_json(indent=2, by_alias=False), encoding="utf-8"
    )
    return out_path


def main() -> int:
    parser = argparse.ArgumentParser(description="Analyze a Korean food photo with Gemini.")
    parser.add_argument("photo", type=Path, help="Path to the photo file.")
    parser.add_argument(
        "--context",
        default="",
        help="Optional restaurant context (name, location, specialty).",
    )
    parser.add_argument(
        "--save", action="store_true", help="Save parsed JSON to outputs/<name>.json."
    )
    args = parser.parse_args()

    try:
        result = analyze(args.photo, args.context)
    except FileNotFoundError as e:
        print(f"ERROR: {e}", file=sys.stderr)
        return 2
    except RuntimeError as e:
        print(f"ERROR: {e}", file=sys.stderr)
        return 3

    print_result(result)

    violations = check_character_limits(result)
    if violations:
        print("\nCHARACTER LIMIT VIOLATIONS:", file=sys.stderr)
        for v in violations:
            print(f"  - {v}", file=sys.stderr)

    if result.confidence < config.MIN_CONFIDENCE:
        print(
            f"\nLOW CONFIDENCE ({result.confidence:.2f} < {config.MIN_CONFIDENCE}). "
            "Human review strongly recommended.",
            file=sys.stderr,
        )

    if args.save:
        out_path = save_result(result, args.photo)
        print(f"\nSaved: {out_path}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
