"""GBP 이름 필드 위반 감지 테스트.

`app.py`의 `detect_name_violation()`이 4가지 규칙(슬래시·한일혼재·한영중혼재·통과)
및 파트너 스토어 실명에서 정확히 동작하는지 회귀 테스트한다.

실행:
    cd "40. Development"
    python3 -m venv .venv-test && source .venv-test/bin/activate
    pip install pytest
    pytest test_app.py -v

설계 메모:
    `app.py`는 모듈 로드 시 streamlit UI 코드를 실행하므로 직접 import할 수 없다
    (`streamlit run` 컨텍스트 밖에서 실패). 우회: AST로 `app.py` 소스를 파싱해
    `import re`, regex 상수, `detect_name_violation` 함수 정의만 추출하여 격리된
    네임스페이스에 exec한다. 함수 본체는 변경 없이 100% 동일.
"""
from __future__ import annotations

import ast
from pathlib import Path
from typing import Any, Callable

import pytest


_TARGET_FN = "detect_name_violation"


def _load_target_fn() -> Callable[[str], tuple[bool, str]]:
    """app.py에서 detect_name_violation 정의만 추출하여 반환."""
    source_path = Path(__file__).parent / "app.py"
    source = source_path.read_text(encoding="utf-8")
    tree = ast.parse(source)

    keep: list[ast.stmt] = []
    for node in tree.body:
        # `import re`
        if isinstance(node, ast.Import) and any(a.name == "re" for a in node.names):
            keep.append(node)
        # `_SLASH_RE = re.compile(...)` 같은 위반 감지 정규식 상수
        elif isinstance(node, ast.Assign) and any(
            isinstance(t, ast.Name) and t.id.startswith("_") and t.id.endswith("_RE")
            for t in node.targets
        ):
            keep.append(node)
        # 대상 함수
        elif isinstance(node, ast.FunctionDef) and node.name == _TARGET_FN:
            keep.append(node)

    if not any(isinstance(n, ast.FunctionDef) and n.name == _TARGET_FN for n in keep):
        raise RuntimeError(f"{_TARGET_FN} not found in app.py — 함수가 이름이 바뀌었거나 다른 모듈로 이동했는지 확인")

    minimal = ast.Module(body=keep, type_ignores=[])
    ast.fix_missing_locations(minimal)
    ns: dict[str, Any] = {}
    exec(compile(minimal, str(source_path), "exec"), ns)
    return ns[_TARGET_FN]


detect_name_violation = _load_target_fn()


# ─── 위반 감지 케이스 ─────────────────────────────────────────────────────────


class TestSlashViolation:
    """슬래시(/, ／)로 다국어를 구분한 이름은 GBP에서 가장 적극적으로 정지된다."""

    def test_v1_halfwidth_slash(self):
        violated, reason = detect_name_violation("가게 / Store")
        assert violated is True
        assert reason == "슬래시(/) 구분 다국어 혼재"

    def test_v2_fullwidth_slash(self):
        violated, reason = detect_name_violation("가게／Store")
        assert violated is True
        assert reason == "슬래시(/) 구분 다국어 혼재"


class TestKoreanJapaneseMix:
    """한글 + 히라가나/가타카나 혼재."""

    def test_v3_hiragana(self):
        violated, reason = detect_name_violation("한글 ひらがな")
        assert violated is True
        assert reason == "한글 + 일본어 혼재"

    def test_v4_katakana(self):
        violated, reason = detect_name_violation("한글 カタカナ")
        assert violated is True
        assert reason == "한글 + 일본어 혼재"


class TestKoreanEnglishChineseMix:
    """한글 + 영문 + CJK 한자 3-way 혼재."""

    def test_v5_three_way_mix(self):
        violated, reason = detect_name_violation("한글 English 中文")
        assert violated is True
        assert reason == "한글 + 영문 + 중문 혼재"


# ─── 정상 통과 케이스 ─────────────────────────────────────────────────────────


class TestPassThrough:
    """위반 규칙에 해당하지 않는 입력은 통과해야 한다."""

    def test_p1_korean_only(self):
        assert detect_name_violation("듀플릿 광안점") == (False, "")

    def test_p2_empty_string(self):
        assert detect_name_violation("") == (False, "")

    def test_p3_whitespace_only(self):
        assert detect_name_violation("   ") == (False, "")

    def test_p4_english_only(self):
        assert detect_name_violation("Coffee Bean") == (False, "")

    def test_p5_korean_english_allowed(self):
        # 한영 혼재는 GBP에서 흔하고 허용된 패턴.
        assert detect_name_violation("카페 Bean") == (False, "")


# ─── 파트너 스토어 실명 회귀 테스트 ───────────────────────────────────────────


class TestPartnerStoreNames:
    """4월 데모 파트너 스토어 실명에서 거짓 양성이 발생하면 데모가 무너진다."""

    @pytest.mark.parametrize(
        "store_name",
        [
            "듀플릿 광안점",
            "듀플릿 해운대 해리단길점",
            "캐버린하우스 Keveren House",
        ],
    )
    def test_partner_names_pass(self, store_name):
        violated, reason = detect_name_violation(store_name)
        assert violated is False, (
            f"파트너 스토어 '{store_name}'이 거짓 양성으로 차단됨: reason={reason!r}"
        )
        assert reason == ""
