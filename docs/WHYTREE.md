# WHY Tree: GlocalX

> 출처: [Google Slides](https://docs.google.com/presentation/d/1zBm7PjXDZDwU_0oT4J0spxcBD0ifmWeKUGXMplyrKpo/edit?usp=drive_link)

## 우리 팀의 결론

**우리는 외국인 관광객의 Google Business Profile 도달을 자동화한다.**
이것이 매출 증대와 운영비 절감 두 목표에 동시에 기여하는 유일한 영역이다.

```mermaid
graph BT
    %% 궁극 목적 (둘)
    Goal1["지역경제 활성화"]

    %% 매출 극대화 — M:N #1: 두 부모로 동시 기여
    Sales["소상공인 매출 증대"]

    %% 매출 극대화의 두 갈래
    Path1["고객 유입 증대"]
    Path2["운영비 최적화"]

    %% 고객 유입 가지
    Cust1["기존 고객<br/>(국내)"]
    Cust2["해외 고객<br/>(외국인 관광객)"]
    Mkt["외국인 대상<br/>다국어 마케팅 활동"]

    %% 마케팅 채널 4종
    Ch1["SNS 마케팅"]
    Ch2["전단지"]
    Ch3["브랜딩"]
    Ch4["Google Business Profile<br/>최적화"]

    %% GBP 최적화의 3가지 수단 (우리 솔루션)
    Sol1["다국어 콘텐츠<br/>자동 게시"]
    Sol2["기본정보/메뉴/사진<br/>다국어화"]
    Sol3["다국어 리뷰 답변"]

    %% 운영비 최적화 가지
    Mkc["마케팅비 최적화"]

    %% --- 화살표 ---
    Sales --> Goal1
    Path1 --> Sales
    Path2 --> Sales
    Cust1 --> Path1
    Cust2 --> Path1
    Mkt --> Cust2
    Ch1 --> Mkt
    Ch2 --> Mkt
    Ch3 --> Mkt
    Ch4 --> Mkt
    Sol1 --> Ch4
    Sol2 --> Ch4
    Sol3 --> Ch4
    Mkc --> Path2

    %% M:N #2: GBP 자동화는 매출과 비용 둘 다에 기여
    Sol1 -.->|"자동화로<br/>인건비 절감"| Mkc

    %% --- 스타일 ---
    classDef ultimate fill:#ffe0e0,stroke:#c00,stroke-width:2px,color:#000
    classDef main fill:#fff3cd,stroke:#f76e11,stroke-width:3px,color:#000
    classDef out fill:#f0f0f0,stroke:#999,stroke-dasharray:5 5,color:#666
    classDef target fill:#cce5ff,stroke:#004085,stroke-width:2px,color:#000

    class Goal1 ultimate
    class Ch4,Sol1,Sol2,Sol3 main
    class Ch1,Ch2,Ch3 out
    class Cust2 target
```

### 다이어그램 읽는 법

| 시각 표시 | 의미 |
|---|---|
| **빨간 박스 (위)** | 궁극 목적 — 우리가 서비스를 통해 이루고자 하는 가치 |
| **파란 박스** | 우리 타겟 — 외국인 관광객 |
| **노란 굵은 박스** | 우리 영역 — Google Business Profile 최적화 + 3가지 수단 |
| **회색 점선 박스** | Out of Scope — SNS 마케팅, 전단지, 브랜딩 |
| **점선 화살표** (Sol1 → Mkc) | GBP 자동화는 외국인 유입(매출)뿐 아니라 인건비 절감(운영비)에도 기여 (M:N) |

### Scope 결정

| 분류 | 항목 | 이유 |
|---|---|---|
| **In Scope (Main)** | GBP 다국어 콘텐츠 자동 생성/게시 | 자동화 가능, 외국인 도달 직접 효과 |
| **In Scope (Main)** | 기본정보/메뉴/사진 다국어화 | 1회성 작업, 지속 효과 |
| **In Scope (Main)** | 다국어 리뷰 답변 | 검색 순위 영향 (2026.03 코어 알고리즘 업데이트) |
| Out of Scope | SNS 마케팅 | 별도 플랫폼/인력 필요, 채널 분산 위험 |
| Out of Scope | 전단지/오프라인 광고 | 외국인 도달률 낮음, 측정 어려움 |
| Out of Scope | 브랜딩 | 장기적, 자원 집중도 높음 |
| Out of Scope | 객단가 상승, 식음료 품질 | 매장 운영 영역, 우리 통제 밖 |

---

원칙은 [`MANIFEST.md`](./MANIFEST.md) 참조.
