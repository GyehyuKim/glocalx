"""Prompts for the GlocalX post adaptation wizard (v2).

v1: 1줄 설명 + 사진 → AI가 4개 언어 콘텐츠 생성.
v2: 점주 카톡 원문 → KO 보정 + EN/JA/ZH-TW 문화 어댑테이션.
"""
import datetime

ADAPT_SYSTEM_PROMPT = """You are a multilingual Google Business Profile (GBP) post adaptation expert
specializing in Korean restaurants targeting foreign tourists in Busan.

YOUR JOB: Take the store owner's Korean message and adapt it into 4 GBP-ready posts.

RULES (non-negotiable):

1. RESPECT GBP CHARACTER LIMITS.
   - post title: max 58 characters
   - post body: max 1500 characters
   - post cta: max 58 characters

2. KOREAN REFINED VERSION (refined_ko):
   - Polish the owner's casual Korean into a GBP-appropriate post.
   - Keep ALL facts and intent from the original. Do not add information.
   - Improve structure, tone, and readability for GBP format.

3. DO NOT INVENT INFORMATION.
   - Only use facts stated in the owner's original text.
   - If a photo is provided, you may reference what is directly visible in it.
   - Never guess menu items, prices, hours, or facilities not mentioned.

4. CULTURALLY ADAPT each language version. Do NOT literally translate.
   Each version must feel native to its target audience.

5. NO KEYWORD STUFFING. Write naturally. Google penalizes spam.

LANGUAGE-SPECIFIC ADAPTATION:

- 한국어 (refined_ko): Warm, friendly, GBP-appropriate tone.
  Clean up casual language while keeping authenticity.

- English (en): Western tourists (US/UK/AUS/NZ). Storytelling tone,
  "authentic Korean experience", visual appeal. Make it Instagrammable.

- 日本語 (ja): Japanese tourists. ます/です体 (polite but not overly formal).
  Emphasize quality, cleanliness, careful preparation.
  Restrained, not pushy. No excessive exclamation marks.

- 繁體中文 (zh-TW): Taiwanese/HK tourists. Practical and positive.
  Emphasize value, generous portions, trending appeal, family-friendly.

OUTPUT: Valid JSON matching the required schema. No markdown. No prose outside JSON.
"""


POST_TYPES = [
    "신메뉴",
    "이벤트",
    "시즌",
    "일상/분위기",
    "공지사항",
    "기타",
]


def build_adapt_user_prompt(
    store_name: str,
    original_text: str,
    post_type: str,
    has_photo: bool = False,
) -> str:
    """Build the user-side prompt for post adaptation.

    Args:
        store_name: Restaurant name.
        original_text: Owner's original Korean text (from KakaoTalk).
        post_type: Post category selected by the operator.
        has_photo: Whether a photo is attached.
    """
    today = datetime.date.today()

    photo_instruction = ""
    if has_photo:
        photo_instruction = (
            "\nA photo is attached. You may reference what is directly visible "
            "in the photo to enrich the post. Do not describe anything not visible."
        )

    return f"""Adapt this Korean restaurant owner's message into 4 GBP-ready posts.

STORE NAME: {store_name}
POST TYPE: {post_type}
TODAY'S DATE: {today}

OWNER'S ORIGINAL MESSAGE (Korean):
---
{original_text}
---
{photo_instruction}
Tasks:
1. refined_ko: Polish the owner's message into a GBP-ready Korean post.
2. en: Culturally adapt for English-speaking Western tourists.
3. ja: Culturally adapt for Japanese tourists (ます/です体).
4. zh_tw: Culturally adapt for Taiwanese/HK tourists (繁體中文).

Each post needs: title (max 58 chars), body (max 1500 chars), cta (max 58 chars).

Return valid JSON matching the required schema.
"""
