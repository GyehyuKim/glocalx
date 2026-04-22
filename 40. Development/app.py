"""GlocalX — 사장님 데모 위자드 (Approach B)

사용법:
    cd 40.\\ Development
    streamlit run app.py

요구사항: .env 파일에 GOOGLE_API_KEY 설정 필요.
"""
from __future__ import annotations

import io
import json
import re
import sys

# Windows cp949 콘솔에서 한글/일본어 출력이 깨지지 않도록 UTF-8 강제 설정
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

import streamlit as st
from PIL import Image
from google import genai
from google.genai import types
from pydantic import ValidationError

import config
from wizard_schema import WizardOutput
from wizard_prompts import WIZARD_SYSTEM_PROMPT, build_wizard_user_prompt

# ─── 페이지 설정 ─────────────────────────────────────────────────────────────
st.set_page_config(
    page_title="GlocalX — 사장님 GBP 위자드",
    page_icon="🌏",
    layout="wide",
)

# ─── 상수 ────────────────────────────────────────────────────────────────────
LANG_LABELS = {
    "ko": "🇰🇷 한국어",
    "en": "🇺🇸 English",
    "ja": "🇯🇵 日本語",
    "zh_tw": "🇹🇼 繁體中文",
}
LANG_KEYS = list(LANG_LABELS.keys())

# GBP 이름 필드 위반 감지 패턴
_SLASH_RE = re.compile(r"[/／]")
_HIRAGANA_RE = re.compile(r"[\u3040-\u309F]")
_KATAKANA_RE = re.compile(r"[\u30A0-\u30FF]")
_HANGUL_RE = re.compile(r"[\uAC00-\uD7AF]")
_LATIN_RE = re.compile(r"[A-Za-z]")
# CJK Unified Ideographs (Chinese characters / Kanji)
_CJK_RE = re.compile(r"[\u4E00-\u9FFF]")


def detect_name_violation(name: str) -> tuple[bool, str]:
    """GBP 이름 필드 위반 여부 감지.

    Returns:
        (violated: bool, reason: str)
    """
    if not name.strip():
        return False, ""

    if _SLASH_RE.search(name):
        return True, "이름에 슬래시(/)가 포함되어 있습니다. GBP는 이름 필드에 여러 언어를 슬래시로 구분하는 것을 금지합니다."

    has_hangul = bool(_HANGUL_RE.search(name))
    has_japanese = bool(_HIRAGANA_RE.search(name) or _KATAKANA_RE.search(name))
    has_latin = bool(_LATIN_RE.search(name))
    has_cjk = bool(_CJK_RE.search(name))

    # 한글 + 일본어 가나 → 다국어 혼재
    if has_hangul and has_japanese:
        return True, "이름에 한글과 일본어가 함께 포함되어 있습니다. GBP 이름 필드는 하나의 언어로만 작성해야 합니다."

    # 한글 + 라틴 + CJK (세 가지 문자 체계) → 다국어 혼재
    if has_hangul and has_latin and has_cjk:
        return True, "이름에 한글·영문·중문이 모두 포함되어 있습니다. GBP 이름 필드는 하나의 언어로만 작성해야 합니다."

    return False, ""


def run_wizard(
    store_name: str,
    korean_desc: str,
    image: Image.Image,
    selected_langs: list[str],
) -> WizardOutput:
    """Gemini 호출 → WizardOutput 반환."""
    if not config.GEMINI_API_KEY:
        raise RuntimeError(
            "GOOGLE_API_KEY가 설정되지 않았습니다.\n"
            ".env 파일을 생성하고 GOOGLE_API_KEY=your_key 를 입력하세요.\n"
            "API 키 발급: https://aistudio.google.com/apikey"
        )

    client = genai.Client(api_key=config.GEMINI_API_KEY)
    user_prompt = build_wizard_user_prompt(store_name, korean_desc, selected_langs)

    response = client.models.generate_content(
        model=config.MODEL_NAME,
        contents=[user_prompt, image],
        config=types.GenerateContentConfig(
            system_instruction=WIZARD_SYSTEM_PROMPT,
            response_mime_type="application/json",
            response_schema=WizardOutput,
            temperature=0.7,
        ),
    )

    parsed = response.parsed
    if parsed is None:
        raw = response.text or ""
        try:
            data = json.loads(raw)
            return WizardOutput.model_validate(data)
        except (json.JSONDecodeError, ValidationError) as e:
            raise RuntimeError(
                f"Gemini가 유효하지 않은 출력을 반환했습니다.\n원문: {raw[:500]}\n오류: {e}"
            )
    return parsed


def copy_button(label: str, text: str, key: str) -> None:
    """클립보드 복사 버튼 (st.code + 접기/펼치기)."""
    st.code(text, language=None)


def render_lang_tab(bundle, lang_key: str) -> None:
    """언어별 탭 콘텐츠 렌더링."""
    # ── 비즈니스 설명 ─────────────────────────────────────────────────────
    st.subheader("📝 비즈니스 설명")
    desc_text = bundle.description.text
    char_count = len(desc_text)
    status = "✅" if char_count <= 750 else "⚠️ 750자 초과"
    st.caption(f"{char_count}/750자 {status}")
    st.text_area(
        label="description",
        value=desc_text,
        height=120,
        key=f"desc_{lang_key}",
        label_visibility="collapsed",
    )

    # ── Google Posts ──────────────────────────────────────────────────────
    st.subheader("📣 Google 포스팅 (3개)")
    for i, post in enumerate(bundle.posts, start=1):
        with st.expander(f"Post {i} — {post.theme}", expanded=(i == 1)):
            col_title, col_cta = st.columns([3, 1])
            with col_title:
                st.caption(f"제목 ({len(post.title)}/58자)")
                st.text_input(
                    label="title",
                    value=post.title,
                    key=f"title_{lang_key}_{i}",
                    label_visibility="collapsed",
                )
            with col_cta:
                st.caption(f"CTA ({len(post.cta)}/58자)")
                st.text_input(
                    label="cta",
                    value=post.cta,
                    key=f"cta_{lang_key}_{i}",
                    label_visibility="collapsed",
                )
            st.caption(f"본문 ({len(post.body)}/1500자)")
            st.text_area(
                label="body",
                value=post.body,
                height=160,
                key=f"body_{lang_key}_{i}",
                label_visibility="collapsed",
            )


def render_qa(qa_items) -> None:
    """Q&A 섹션 렌더링 (영문)."""
    st.subheader("❓ Q&A (Google 비즈니스 Q&A — 영문)")
    for i, item in enumerate(qa_items, start=1):
        with st.expander(f"Q{i}: {item.question}", expanded=True):
            st.markdown(f"**A:** {item.answer}")


# ─── 메인 UI ─────────────────────────────────────────────────────────────────
st.title("🌏 GlocalX — 사장님 GBP 위자드")
st.caption(
    "한국어 설명 1줄 + 사진 1장 → KO/EN/JA/ZH-TW Google 비즈니스 프로필 콘텐츠 자동 생성"
)
st.divider()

# ── 입력 패널 ─────────────────────────────────────────────────────────────────
with st.sidebar:
    st.header("입력 정보")

    store_name = st.text_input(
        "가게 이름 *",
        placeholder="예: 두플릿 광안점",
        help="Google 비즈니스 프로필에 등록된 가게 이름을 그대로 입력하세요.",
    )

    # 이름 필드 위반 감지 — 입력 즉시 경고
    if store_name:
        violated, violation_reason = detect_name_violation(store_name)
        if violated:
            st.warning(f"⚠️ **GBP 이름 위반 감지**\n\n{violation_reason}\n\n"
                       "이름 필드는 단일 언어로만 등록해야 합니다. "
                       "GlocalX가 올바른 다국어 콘텐츠를 별도 필드에 생성해드립니다.")
        else:
            st.success("✅ 이름 형식 정상")

    korean_desc = st.text_area(
        "한국어 설명 (1~2문장) *",
        placeholder="예: 부산 광안리 앞바다가 보이는 스페셜티 커피 전문점으로, 시즌마다 바뀌는 시그니처 음료가 인기입니다.",
        height=100,
        help="Gemini가 이 설명과 사진을 바탕으로 다국어 콘텐츠를 생성합니다.",
    )

    uploaded_file = st.file_uploader(
        "대표 사진 업로드 *",
        type=["jpg", "jpeg", "png", "webp"],
        help="음식 사진 또는 가게 분위기 사진 1장. 선명한 사진일수록 결과물이 좋습니다.",
    )
    if uploaded_file:
        st.image(uploaded_file, caption="업로드된 사진", use_container_width=True)

    st.divider()
    st.caption("생성할 언어")
    lang_ko = st.checkbox("🇰🇷 한국어", value=True)
    lang_en = st.checkbox("🇺🇸 English", value=True)
    lang_ja = st.checkbox("🇯🇵 日本語", value=True)
    lang_zh = st.checkbox("🇹🇼 繁體中文", value=True)

    selected_langs = []
    if lang_ko:
        selected_langs.append("ko")
    if lang_en:
        selected_langs.append("en")
    if lang_ja:
        selected_langs.append("ja")
    if lang_zh:
        selected_langs.append("zh-TW")

    st.divider()
    generate_btn = st.button(
        "✨ 콘텐츠 생성",
        type="primary",
        disabled=not (store_name and korean_desc and uploaded_file),
        use_container_width=True,
    )

# ── 출력 패널 ─────────────────────────────────────────────────────────────────
if generate_btn:
    if not store_name or not korean_desc or not uploaded_file:
        st.error("가게 이름, 한국어 설명, 사진을 모두 입력해주세요.")
        st.stop()

    # PIL Image 로드
    image_bytes = uploaded_file.read()
    image = Image.open(io.BytesIO(image_bytes))
    image.load()

    with st.spinner("Gemini가 콘텐츠를 생성하고 있습니다... (10-30초)"):
        try:
            result: WizardOutput = run_wizard(
                store_name=store_name,
                korean_desc=korean_desc,
                image=image,
                selected_langs=selected_langs,
            )
        except RuntimeError as e:
            st.error(f"오류: {e}")
            st.stop()

    st.success("생성 완료! 아래 탭에서 언어별 콘텐츠를 확인하세요.")

    # 이름 위반 배너 (생성 결과 위에 한 번 더 표시)
    if store_name:
        violated, violation_reason = detect_name_violation(store_name)
        if violated:
            st.warning(
                f"⚠️ **GBP 이름 필드 위반 감지:** {violation_reason}\n\n"
                "아래 생성된 콘텐츠를 활용하면 이름 필드를 단순화하고 "
                "각 언어 설명을 올바른 GBP 필드(설명, 포스팅)에 배치할 수 있습니다."
            )

    # 언어 탭
    active_tabs = [(k, LANG_LABELS[k]) for k in LANG_KEYS if k in [l.replace("-", "_") for l in selected_langs] or k in selected_langs]

    # lang key 정규화 (zh-TW → zh_tw)
    result_map = {
        "ko": result.ko,
        "en": result.en,
        "ja": result.ja,
        "zh_tw": result.zh_tw,
    }
    selected_normalized = [l.replace("-", "_") for l in selected_langs]

    if selected_normalized:
        tab_labels = [LANG_LABELS[k] for k in LANG_KEYS if k in selected_normalized]
        tab_keys = [k for k in LANG_KEYS if k in selected_normalized]
        tabs = st.tabs(tab_labels)
        for tab, lang_key in zip(tabs, tab_keys):
            with tab:
                render_lang_tab(result_map[lang_key], lang_key)

    # Q&A 섹션 (언어 탭 밖, 영문 공통)
    st.divider()
    render_qa(result.qa)

    # JSON 다운로드 버튼
    st.divider()
    with st.expander("🔧 원본 JSON 보기 / 다운로드"):
        json_str = result.model_dump_json(indent=2, by_alias=False)
        st.download_button(
            label="📥 JSON 다운로드",
            data=json_str.encode("utf-8"),
            file_name=f"{store_name.replace(' ', '_')}_gbp.json",
            mime="application/json",
        )
        st.code(json_str, language="json")

else:
    # 초기 상태 — 안내 메시지
    st.info(
        "👈 왼쪽 사이드바에 가게 정보를 입력하고 **✨ 콘텐츠 생성** 버튼을 클릭하세요.\n\n"
        "**생성되는 콘텐츠:**\n"
        "- Google 비즈니스 프로필 **비즈니스 설명** (각 언어, 750자 이내)\n"
        "- **Google 포스팅 3개** (계절/시그니처/초대 테마)\n"
        "- **Q&A 3세트** (외국인 관광객 예상 질문)\n"
        "- ⚠️ **GBP 이름 필드 위반 자동 감지**"
    )
    with st.expander("ℹ️ GlocalX란?"):
        st.markdown(
            """
            **GlocalX**는 부산 관광 상권 식당·카페 사장님을 위한
            AI 기반 Google 비즈니스 프로필(GBP) 다국어 관리 도구입니다.

            **문제:** 많은 사장님들이 GBP 이름 필드 하나에 4개 언어를 슬래시로 구겨 넣고 있습니다.
            이는 Google 가이드라인 위반으로 프로필 정지 위험이 있습니다.

            **해결:** 한국어 설명 1줄 + 사진 1장만 입력하면
            KO/EN/JA/ZH-TW 4개 언어 GBP 콘텐츠 패키지를 즉시 생성합니다.
            """
        )
