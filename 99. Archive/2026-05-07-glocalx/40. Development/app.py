"""GlocalX v2 — 포스팅 어댑테이션 도구 (대행 서비스 모델)

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
from wizard_schema import PostAdaptation
from wizard_prompts import (
    ADAPT_SYSTEM_PROMPT,
    build_adapt_user_prompt,
    POST_TYPES,
    sanitize_input,
    STORE_NAME_MAX_LEN,
    ORIGINAL_TEXT_MAX_LEN,
)

# ─── 페이지 설정 ─────────────────────────────────────────────────────────────
st.set_page_config(
    page_title="GlocalX — 포스팅 어댑테이션",
    page_icon="🌏",
    layout="wide",
)

# ─── 상수 ────────────────────────────────────────────────────────────────────
LANG_LABELS = {
    "refined_ko": "🇰🇷 한국어 (보정본)",
    "en": "🇺🇸 English",
    "ja": "🇯🇵 日本語",
    "zh_tw": "🇹🇼 繁體中文",
}

# ─── 데모용 샘플 데이터 ──────────────────────────────────────────────────────
DEMO_SAMPLES = {
    "-- 직접 입력 --": {"store_name": "", "post_type": "신메뉴", "original_text": "", "photo": None},
    "두플릿 광안점 — 신메뉴": {
        "store_name": "두플릿 광안점",
        "post_type": "신메뉴",
        "original_text": "새로운 메뉴 나왔어요~ 매콤달콤 양념치킨에 모짜렐라 치즈 듬뿍 올린 치즈폭포치킨!! 치즈가 쭈욱 늘어나서 사진 찍기도 좋아요ㅋㅋ 2인분부터 주문 가능하고 가격은 28,000원입니다. 맥주랑 같이 드시면 진짜 꿀조합이에요!",
        "photo": "korean_fried_chicken.jpg",
    },
    "캐버린하우스 — 이벤트": {
        "store_name": "캐버린하우스",
        "post_type": "이벤트",
        "original_text": "5월 가정의달 이벤트합니다! 가족 4인 이상 방문시 디저트 서비스로 드려요~ 기간은 5/1~5/31까지고요. 인스타 팔로우하시면 음료 한잔 추가 서비스! 많이 와주세요^^",
        "photo": None,
    },
    "듀플릿 해운대 — 시즌": {
        "store_name": "듀플릿 해운대",
        "post_type": "시즌",
        "original_text": "여름 시즌 메뉴 시작합니다~ 시원한 냉모밀이랑 비빔국수 준비했어요. 해운대 바다 보면서 시원하게 한 그릇 하세요! 날씨 더운날 에어컨 빵빵하게 틀어놨습니다ㅎㅎ",
        "photo": "bibimbap.jpg",
    },
}

# GBP 이름 필드 위반 감지 패턴
_SLASH_RE = re.compile(r"[/／]")
_HIRAGANA_RE = re.compile(r"[\u3040-\u309F]")
_KATAKANA_RE = re.compile(r"[\u30A0-\u30FF]")
_HANGUL_RE = re.compile(r"[\uAC00-\uD7AF]")
_LATIN_RE = re.compile(r"[A-Za-z]")
_CJK_RE = re.compile(r"[\u4E00-\u9FFF]")


def detect_name_violation(name: str) -> tuple[bool, str]:
    """GBP 이름 필드 위반 여부 감지."""
    if not name.strip():
        return False, ""
    if _SLASH_RE.search(name):
        return True, "슬래시(/) 구분 다국어 혼재"
    has_hangul = bool(_HANGUL_RE.search(name))
    has_japanese = bool(_HIRAGANA_RE.search(name) or _KATAKANA_RE.search(name))
    has_latin = bool(_LATIN_RE.search(name))
    has_cjk = bool(_CJK_RE.search(name))
    if has_hangul and has_japanese:
        return True, "한글 + 일본어 혼재"
    if has_hangul and has_latin and has_cjk:
        return True, "한글 + 영문 + 중문 혼재"
    return False, ""


def _classify_error(e: Exception) -> str:
    """예외를 사용자 친화적 한국어 메시지로 변환."""
    msg = str(e)
    if "GOOGLE_API_KEY" in msg or "api_key" in msg.lower():
        return (
            "API 키가 설정되지 않았습니다. "
            ".env 파일에 GOOGLE_API_KEY=your_key 를 입력하고 앱을 재시작해주세요."
        )
    if "quota" in msg.lower() or "rate" in msg.lower() or "429" in msg:
        return "Gemini API 요청 한도에 도달했습니다. 잠시 후(1~2분) 다시 시도해주세요."
    if "timeout" in msg.lower() or "deadline" in msg.lower():
        return "Gemini 응답 시간이 초과되었습니다. 다시 시도해주세요."
    if "invalid output" in msg.lower() or "validation" in msg.lower():
        return "Gemini가 예상치 못한 형식으로 응답했습니다. 다시 시도해주세요."
    return "콘텐츠 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요."


def run_adaptation(
    store_name: str,
    original_text: str,
    post_type: str,
    image: Image.Image | None = None,
) -> PostAdaptation:
    """Gemini 호출 → PostAdaptation 반환."""
    if not config.GEMINI_API_KEY:
        raise RuntimeError("GOOGLE_API_KEY_MISSING")

    client = genai.Client(api_key=config.GEMINI_API_KEY)
    user_prompt = build_adapt_user_prompt(
        store_name, original_text, post_type, has_photo=(image is not None),
    )

    contents = [user_prompt]
    if image is not None:
        contents.append(image)

    response = client.models.generate_content(
        model=config.MODEL_NAME,
        contents=contents,
        config=types.GenerateContentConfig(
            system_instruction=ADAPT_SYSTEM_PROMPT,
            response_mime_type="application/json",
            response_schema=PostAdaptation,
            temperature=0.7,
            thinking_config=types.ThinkingConfig(thinking_budget=0),
        ),
    )

    parsed = response.parsed
    if parsed is None:
        raw = response.text or ""
        try:
            data = json.loads(raw)
            return PostAdaptation.model_validate(data)
        except (json.JSONDecodeError, ValidationError) as e:
            raise RuntimeError(f"invalid output: {raw[:200]}") from e
    return parsed


def render_post(post, label: str) -> None:
    """하나의 AdaptedPost를 렌더링."""
    col_title, col_cta = st.columns([3, 1])
    with col_title:
        st.caption(f"제목 ({len(post.title)}/58자)")
        st.code(post.title, language=None)
    with col_cta:
        st.caption(f"CTA ({len(post.cta)}/58자)")
        st.code(post.cta, language=None)
    st.caption(
        f"본문 ({len(post.body)}/1500자) — 📋 복사해서 GBP에 붙여넣으세요."
    )
    st.code(post.body, language=None)


# ─── 메인 UI ─────────────────────────────────────────────────────────────────
st.title("🌏 GlocalX — 포스팅 어댑테이션")
st.caption(
    "점주 카톡 원문 → KO 보정본 + EN/JA/ZH-TW 문화 어댑테이션"
)
st.divider()

# ── 입력 패널 ─────────────────────────────────────────────────────────────────
with st.sidebar:
    st.header("입력 정보")

    # 데모 샘플 선택
    demo_choice = st.selectbox(
        "🧪 데모 샘플",
        options=list(DEMO_SAMPLES.keys()),
        help="샘플을 선택하면 입력이 자동으로 채워집니다.",
    )
    sample = DEMO_SAMPLES[demo_choice]
    use_sample = demo_choice != "-- 직접 입력 --"

    st.divider()

    store_name = st.text_input(
        "가게 이름 *",
        value=sample["store_name"] if use_sample else "",
        placeholder="예: 두플릿 광안점",
        help="Google 비즈니스 프로필에 등록된 가게 이름.",
        max_chars=STORE_NAME_MAX_LEN,
    )

    if store_name:
        violated, _ = detect_name_violation(store_name)
        if violated:
            st.caption("⚠️ 이름 필드 위반 감지됨")
        else:
            st.caption("✅ 이름 형식 정상")

    post_type_options = POST_TYPES
    post_type_index = (
        POST_TYPES.index(sample["post_type"])
        if use_sample and sample["post_type"] in POST_TYPES
        else 0
    )
    post_type = st.selectbox(
        "포스팅 유형 *",
        options=post_type_options,
        index=post_type_index,
        help="점주가 보낸 카톡의 내용 유형을 선택하세요.",
    )

    original_text = st.text_area(
        "점주 카톡 원문 *",
        value=sample["original_text"] if use_sample else "",
        placeholder="예: 봄 한정 딸기 라떼 출시했어요! 생딸기 듬뿍 들어가서 진짜 맛있어요. 4월까지만 판매합니다~",
        height=200,
        help="점주가 카톡으로 보낸 원문을 그대로 붙여넣으세요.",
        max_chars=ORIGINAL_TEXT_MAX_LEN,
    )

    # 샘플 사진 자동 로드 또는 직접 업로드
    uploaded_file = st.file_uploader(
        "사진 (선택)",
        type=["jpg", "jpeg", "png", "webp"],
        help="포스팅에 첨부할 사진. 없어도 됩니다.",
    )

    sample_photo_path = None
    if use_sample and sample["photo"] and not uploaded_file:
        sample_photo_path = config.SAMPLE_PHOTOS_DIR / sample["photo"]
        if sample_photo_path.exists():
            st.image(str(sample_photo_path), caption=f"샘플 사진: {sample['photo']}", use_container_width=True)

    if uploaded_file:
        st.image(uploaded_file, caption="첨부 사진", use_container_width=True)

    st.divider()
    generate_btn = st.button(
        "✨ 어댑테이션 생성",
        type="primary",
        disabled=not (store_name and original_text),
        use_container_width=True,
    )

# ── 출력 패널 ─────────────────────────────────────────────────────────────────
if generate_btn:
    if not store_name or not original_text:
        st.error("가게 이름과 점주 카톡 원문을 입력해주세요.")
        st.stop()

    # UI 레이어 belt-and-suspenders sanitize (백엔드 wizard_prompts.py의 중복이지만 명시적)
    store_name = sanitize_input(store_name, STORE_NAME_MAX_LEN)
    original_text = sanitize_input(original_text, ORIGINAL_TEXT_MAX_LEN)

    # sanitize 후 빈 문자열 체크 (제어문자만 입력된 경우 방어)
    if not store_name.strip() or not original_text.strip():
        st.error("입력 내용에 처리 가능한 텍스트가 없습니다. 일반 텍스트를 입력해주세요.")
        st.stop()

    # 이미지 처리 (업로드 우선, 없으면 샘플 사진)
    image = None
    if uploaded_file:
        uploaded_file.seek(0)
        image_bytes = uploaded_file.read()
        image = Image.open(io.BytesIO(image_bytes))
        image.load()
    elif sample_photo_path and sample_photo_path.exists():
        image = Image.open(sample_photo_path)
        image.load()

    with st.spinner("Gemini가 어댑테이션을 생성하고 있습니다... (10~30초)"):
        try:
            result: PostAdaptation = run_adaptation(
                store_name=store_name,
                original_text=original_text,
                post_type=post_type,
                image=image,
            )
        except Exception as e:
            korean_msg = _classify_error(e)
            st.error(f"❌ {korean_msg}")
            with st.expander("🔧 에러 상세 (디버깅용)", expanded=False):
                st.code(f"{type(e).__name__}: {e}", language=None)
            st.markdown("왼쪽 **✨ 어댑테이션 생성** 버튼을 눌러 다시 시도해주세요.")
            st.stop()

    st.success("✅ 생성 완료! 각 탭에서 언어별 포스팅을 확인하고, 📋 복사해서 GBP에 붙여넣으세요.")

    # ── 이름 위반 경고 ────────────────────────────────────────────────────
    violated, violation_reason = detect_name_violation(store_name)
    if violated:
        st.warning(
            f"⚠️ **GBP 이름 필드 위반 감지**\n\n"
            f"**현재 이름:** `{store_name}`\n\n"
            f"**문제:** {violation_reason} — Google 가이드라인 위반으로 프로필 정지 위험이 있습니다.\n\n"
            f"**해결:** 이름 필드는 단일 언어(예: `두플릿 광안점`)로만 유지하세요."
        )

    # ── 점주 원문 표시 ────────────────────────────────────────────────────
    st.subheader("📝 점주 원문")
    st.text_area("원문 (읽기 전용)", value=original_text, height=100, disabled=True)

    # ── 언어별 어댑테이션 탭 ──────────────────────────────────────────────
    result_map = {
        "refined_ko": result.refined_ko,
        "en": result.en,
        "ja": result.ja,
        "zh_tw": result.zh_tw,
    }

    tab_labels = list(LANG_LABELS.values())
    tab_keys = list(LANG_LABELS.keys())
    tabs = st.tabs(tab_labels)
    for tab, lang_key in zip(tabs, tab_keys):
        with tab:
            render_post(result_map[lang_key], LANG_LABELS[lang_key])

    # ── JSON (개발자용, 기본 접힘) ────────────────────────────────────────
    st.divider()
    with st.expander("🔧 원본 JSON (개발자용)", expanded=False):
        json_str = result.model_dump_json(indent=2, by_alias=False)
        st.download_button(
            label="📥 JSON 다운로드",
            data=json_str.encode("utf-8"),
            file_name=f"{store_name.replace(' ', '_')}_post.json",
            mime="application/json",
        )
        st.code(json_str, language="json")

else:
    # ── 초기 상태 ─────────────────────────────────────────────────────────
    st.info(
        "👈 왼쪽에 가게 이름과 점주 카톡 원문을 입력하면 "
        "4개 언어 GBP 포스팅이 생성됩니다."
    )
    with st.expander("ℹ️ GlocalX v2란?", expanded=False):
        st.markdown(
            """
            **GlocalX v2**는 GBP 다국어 포스팅 대행 서비스를 위한 팀 내부 도구입니다.

            **워크플로우:**
            1. 점주가 카톡으로 사진 + 텍스트를 보냄
            2. 팀이 이 도구에 원문을 입력
            3. AI가 한국어 보정본 + EN/JA/ZH-TW 어댑테이션 생성
            4. 팀이 결과를 점주에게 확인받고 GBP에 포스팅

            **변환 방식:**
            - 한국어 원문은 점주의 의도를 존중하며 GBP에 적합하게 보정
            - 외국어 버전은 직역이 아닌 문화 어댑테이션
            - 입력되지 않은 정보는 추측하지 않음
            """
        )
