// onboarding.js — 가입 여정 A → C1 → C2 → D1 → D2 → D3 → E
// 의존: data.js, components.js

// ── Screen A: 진입 (비로그인) ─────────────────────────────────────────────────
const ScreenA = ({ onStart }) => (
  <div style={{ display: 'flex', flexDirection: 'column', height: '100%',
    background: 'linear-gradient(160deg,#F0FDF4 0%,#fff 60%)' }}>
    {/* 상단 로고 */}
    <div style={{ padding: '48px 0 0', textAlign: 'center' }}>
      <div className="sparrow-bounce" style={{ display: 'inline-block' }}>
        <Sparrow size={96}/>
      </div>
      <h1 style={{ fontWeight: 900, fontSize: 28, color: '#1F1F1F', margin: '16px 0 8px',
        letterSpacing: '-0.5px', lineHeight: 1.2 }}>
        reading<span style={{ color: '#58CC02' }}>Go</span>
      </h1>
    </div>

    {/* 슬로건 (§4-A, §1.2) */}
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '0 32px', textAlign: 'center', gap: 16 }}>
      <p style={{ fontWeight: 900, fontSize: 22, color: '#1F1F1F', lineHeight: 1.4, margin: 0 }}>
        "하루 한 페이지,<br/>한 문장에서 시작해요."
      </p>
      <p style={{ fontSize: 15, color: '#AFAFAF', fontWeight: 600, lineHeight: 1.6, margin: 0 }}>
        1페이지만 읽어도 오늘은 성공이에요 🐦
      </p>
    </div>

    {/* CTA */}
    <div style={{ padding: '0 24px 48px' }}>
      <button onClick={onStart} className="btn-duo btn-green" style={{ width: '100%', fontSize: 17 }}>
        시작하기
      </button>
    </div>
  </div>
);

// ── Screen C-1: 책 검색 ────────────────────────────────────────────────────────
const ScreenC1 = ({ onSelect, onManual }) => {
  const [query, setQuery]     = React.useState('');
  const [books, setBooks]     = React.useState([]);
  const [results, setResults] = React.useState([]);
  const [loaded, setLoaded]   = React.useState(false);
  const [tab, setTab]         = React.useState('recent');

  React.useEffect(() => {
    loadBooks().then(b => { setBooks(b); setLoaded(true); });
  }, []);

  React.useEffect(() => {
    if (query.trim()) {
      setResults(fuzzySearch(books, query).slice(0, 20));
    } else {
      setResults([]);
    }
  }, [query, books]);

  // rank 컬럼이 없으면 인덱스 기준 Top 10으로 fallback
  const hasRank = loaded && books.some(b => b.rank_recent || b.rank_steady);
  const top10 = loaded
    ? hasRank
      ? books.filter(b => tab === 'recent' ? (parseInt(b.rank_recent) || 999) < 11 : (parseInt(b.rank_steady) || 999) < 11)
          .sort((a, b) => (parseInt(a['rank_' + tab]) || 999) - (parseInt(b['rank_' + tab]) || 999))
          .slice(0, 10)
      : books.slice(0, 10)
    : [];

  const display = query.trim() ? results : top10;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fff' }}>
      {/* 헤더 */}
      <div style={{ padding: '16px 16px 12px', borderBottom: '2px solid #E5E5E5' }}>
        <p style={{ fontWeight: 900, fontSize: 18, color: '#1F1F1F', margin: '0 0 12px' }}>
          어떤 책을 읽고 있나요?
        </p>
        {/* 검색창 */}
        <div style={{ position: 'relative' }}>
          <SearchIcon s={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#AFAFAF' }}/>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="제목, 저자, ISBN 검색..."
            autoFocus
            style={{ width: '100%', border: '2px solid #E5E5E5', borderRadius: 14, padding: '11px 14px 11px 36px',
              fontSize: 15, fontWeight: 600, outline: 'none', fontFamily: 'Nunito',
              transition: 'border-color .2s' }}
            onFocus={e => e.target.style.borderColor = '#58CC02'}
            onBlur={e => e.target.style.borderColor  = '#E5E5E5'}
          />
        </div>
        {/* 추천 탭 (검색어 없을 때) */}
        {!query.trim() && (
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            {[['recent','요즘 Top 10'],['steady','스테디 Top 10']].map(([id, label]) => (
              <button key={id} onClick={() => setTab(id)} style={{
                padding: '6px 14px', borderRadius: 20, border: 'none', cursor: 'pointer',
                fontWeight: 700, fontSize: 12,
                background: tab === id ? '#58CC02' : '#F7F7F7',
                color:      tab === id ? '#fff'    : '#AFAFAF',
              }}>{label}</button>
            ))}
          </div>
        )}
      </div>

      {/* 결과 목록 */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 16px' }}>
        {display.length === 0 && query.trim() && loaded && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <p style={{ color: '#AFAFAF', fontWeight: 700, marginBottom: 12 }}>
              찾으시는 책이 없나요? 직접 등록할 수 있어요
            </p>
            <button onClick={onManual} className="btn-duo btn-white" style={{ fontSize: 14 }}>
              직접 등록
            </button>
          </div>
        )}
        {display.map(book => (
          <button key={book.book_id} onClick={() => onSelect(book)} style={{
            display: 'flex', alignItems: 'center', gap: 12, width: '100%',
            background: 'none', border: 'none', padding: '10px 0', cursor: 'pointer',
            borderBottom: '1px solid #F7F7F7', textAlign: 'left'
          }}>
            <BookCover book={book} size={52} radius={10}/>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontWeight: 800, fontSize: 14, color: '#1F1F1F', margin: '0 0 2px',
                overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                {book.title}
              </p>
              <p style={{ fontSize: 12, color: '#AFAFAF', margin: 0 }}>
                {book.author} · {book.total_pages}p
              </p>
            </div>
          </button>
        ))}
        {!loaded && (
          <p style={{ textAlign: 'center', color: '#AFAFAF', padding: '32px 0', fontWeight: 700 }}>
            도서 목록 로딩 중...
          </p>
        )}
      </div>
    </div>
  );
};

// ── Screen C-2: 확인 / 직접 등록 ──────────────────────────────────────────────
const ScreenC2 = ({ book, isManual, onBack, onConfirm }) => {
  const [page,       setPage]       = React.useState('0');
  const [title,      setTitle]      = React.useState(book ? book.title : '');
  const [author,     setAuthor]     = React.useState(book ? book.author : '');
  const [totalPages, setTotalPages] = React.useState(book ? String(book.total_pages) : '');

  const valid = isManual
    ? title.trim() && parseInt(totalPages) > 0
    : true;

  const handleConfirm = () => {
    const b = isManual
      ? { book_id: genId(), title: title.trim(), author: author.trim(), total_pages: parseInt(totalPages), cover_url: '' }
      : book;
    onConfirm(b, parseInt(page) || 0);
  };

  const inputStyle = { marginBottom: 12 };
  const focus = e => e.target.style.borderColor = '#58CC02';
  const blur  = e => e.target.style.borderColor = '#E5E5E5';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* 상단 바 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px',
        borderBottom: '2px solid #E5E5E5' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
          <BackIcon s={22} style={{ color: '#AFAFAF' }}/>
        </button>
        <span style={{ fontWeight: 900, fontSize: 17, color: '#1F1F1F' }}>
          {isManual ? '책 직접 등록' : '책 확인'}
        </span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px' }}>
        {/* 표지 */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <BookCover book={isManual ? null : book} size={100} radius={16}/>
        </div>

        {isManual ? (
          <>
            <p style={{ fontWeight: 800, fontSize: 13, color: '#1F1F1F', marginBottom: 6 }}>제목 *</p>
            <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="책 제목" className="rg-input" style={inputStyle} onFocus={focus} onBlur={blur}/>
            <p style={{ fontWeight: 800, fontSize: 13, color: '#1F1F1F', marginBottom: 6 }}>저자</p>
            <input value={author} onChange={e=>setAuthor(e.target.value)} placeholder="저자명" className="rg-input" style={inputStyle} onFocus={focus} onBlur={blur}/>
            <p style={{ fontWeight: 800, fontSize: 13, color: '#1F1F1F', marginBottom: 6 }}>총 페이지 *</p>
            <input type="number" value={totalPages} onChange={e=>setTotalPages(e.target.value)} placeholder="예: 300" className="rg-input" style={inputStyle} onFocus={focus} onBlur={blur}/>
          </>
        ) : (
          <div style={{ background: '#F0FDF4', border: '2px solid #D7F0BF', borderRadius: 16, padding: 16, marginBottom: 16 }}>
            <p style={{ fontWeight: 900, fontSize: 16, color: '#1F1F1F', margin: '0 0 4px' }}>{book.title}</p>
            <p style={{ fontSize: 13, color: '#AFAFAF', margin: 0 }}>{book.author} · 전 {book.total_pages}p</p>
          </div>
        )}

        <p style={{ fontWeight: 800, fontSize: 13, color: '#1F1F1F', marginBottom: 6 }}>
          현재 어디까지 읽었어요?
        </p>
        <input type="number" value={page} onChange={e=>setPage(e.target.value)} placeholder="0"
          min={0} max={isManual ? parseInt(totalPages) || 9999 : book.total_pages}
          className="rg-input" style={inputStyle} onFocus={focus} onBlur={blur}/>
      </div>

      <div className="rg-bottom-bar">
        <button onClick={handleConfirm} disabled={!valid}
          className={`btn-duo ${valid ? 'btn-green' : 'btn-off'}`}
          style={{ width: '100%' }}>
          이 책으로 시작
        </button>
      </div>
    </div>
  );
};

// ── Screen D-1: 페이지 입력 ───────────────────────────────────────────────────
const ScreenD1 = ({ book, initPage, onNext }) => {
  const [page, setPage] = React.useState(initPage || 0);
  const [showInput, setShowInput] = React.useState(false);
  const [inputVal, setInputVal]   = React.useState('');

  const bump = delta => setPage(p => Math.max(0, Math.min(p + delta, book.total_pages)));
  const confirm = () => {
    const v = parseInt(inputVal);
    if (!isNaN(v)) setPage(Math.max(0, Math.min(v, book.total_pages)));
    setShowInput(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fff' }}>
      {/* 진행 표시 */}
      <div style={{ padding: '16px 16px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ height: 6, flex: 1, borderRadius: 3, background: '#58CC02' }}/>
        <div style={{ height: 6, flex: 1, borderRadius: 3, background: '#E5E5E5' }}/>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', padding: '0 32px', gap: 0 }}>

        <BookCover book={book} size={80} radius={14}/>
        <p style={{ fontWeight: 800, fontSize: 14, color: '#1F1F1F', margin: '12px 0 4px', textAlign: 'center' }}>
          {book.title}
        </p>
        <p style={{ fontSize: 12, color: '#AFAFAF', marginBottom: 32 }}>오늘 읽은 마지막 페이지</p>

        {/* 큰 페이지 숫자 */}
        <button onClick={() => { setInputVal(String(page)); setShowInput(true); }}
          style={{ background: 'none', border: '3px solid #58CC02', borderRadius: 20,
            padding: '16px 40px', cursor: 'pointer', marginBottom: 28 }}>
          <span style={{ fontWeight: 900, fontSize: 56, color: '#1F1F1F', lineHeight: 1 }}>{page}</span>
          <span style={{ fontWeight: 700, fontSize: 16, color: '#AFAFAF' }}> / {book.total_pages}p</span>
        </button>

        {/* ±1 / +10 버튼 */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button onClick={() => bump(-1)} className="btn-duo btn-white"
            style={{ width: 64, height: 64, padding: 0, fontSize: 20, borderRadius: 18 }}>−1</button>
          <button onClick={() => bump(1)} className="btn-duo btn-green"
            style={{ width: 64, height: 64, padding: 0, fontSize: 20, borderRadius: 18 }}>+1</button>
          <button onClick={() => bump(10)} className="btn-duo btn-yellow"
            style={{ width: 72, height: 64, padding: 0, fontSize: 16, borderRadius: 18 }}>+10</button>
        </div>
      </div>

      <div className="rg-bottom-bar">
        <button onClick={() => onNext(page)} className="btn-duo btn-green" style={{ width: '100%' }}>
          다음
        </button>
      </div>

      {/* 직접 입력 모달 */}
      {showInput && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="pop-in" style={{ background: '#fff', borderRadius: 24, padding: 28, width: 280 }}>
            <p style={{ fontWeight: 800, fontSize: 16, marginBottom: 16 }}>페이지 직접 입력</p>
            <input type="number" value={inputVal} onChange={e => setInputVal(e.target.value)}
              autoFocus
              style={{ width: '100%', border: '2px solid #58CC02', borderRadius: 12,
                padding: '12px 16px', fontSize: 24, fontWeight: 900, textAlign: 'center',
                outline: 'none', fontFamily: 'Nunito', marginBottom: 16 }}/>
            <button onClick={confirm} className="btn-duo btn-green" style={{ width: '100%' }}>확인</button>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Screen D-2: 오늘의 문장 ───────────────────────────────────────────────────
const ScreenD2 = ({ initPage, onBack, onNext }) => {
  const [text, setText] = React.useState(() => {
    try { return localStorage.getItem('rg_pending_sentence') || ''; } catch { return ''; }
  });
  const [sentencePage, setSentencePage] = React.useState(initPage || 0);
  const valid = text.trim().length > 0;

  React.useEffect(() => {
    try { localStorage.setItem('rg_pending_sentence', text); } catch {}
  }, [text]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* 진행 표시 */}
      <div style={{ padding: '16px 16px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ height: 6, flex: 1, borderRadius: 3, background: '#58CC02' }}/>
        <div style={{ height: 6, flex: 1, borderRadius: 3, background: '#58CC02' }}/>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '28px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <button onClick={onBack} className="rg-btn-icon">
            <BackIcon s={20} style={{ color: '#AFAFAF' }}/>
          </button>
          <p style={{ fontWeight: 900, fontSize: 18, color: '#1F1F1F', margin: 0 }}>
            오늘의 문장
          </p>
        </div>
        <p style={{ fontSize: 13, color: '#AFAFAF', fontWeight: 600, marginBottom: 16 }}>
          오늘 읽은 내용 중 마음에 남는 한 문장을 적어주세요.
        </p>

        {/* 문장 페이지 입력 */}
        <p style={{ fontWeight: 800, fontSize: 13, color: '#1F1F1F', marginBottom: 6 }}>어느 페이지에서?</p>
        <input
          type="number"
          value={sentencePage}
          onChange={e => setSentencePage(e.target.value)}
          placeholder="페이지 번호"
          className="rg-input"
          style={{ marginBottom: 16 }}
          onFocus={e => e.target.style.borderColor = '#58CC02'}
          onBlur={e => e.target.style.borderColor  = '#E5E5E5'}
        />

        <p style={{ fontWeight: 800, fontSize: 13, color: '#1F1F1F', marginBottom: 6 }}>문장</p>
        <textarea
          value={text}
          onChange={e => { if (e.target.value.length <= 200) setText(e.target.value); }}
          placeholder="마음에 든 한 줄을 적어주세요 (최대 200자)"
          rows={4}
          autoFocus
          style={{ flex: 1, border: '2px solid #E5E5E5', borderRadius: 16, padding: '14px 16px',
            fontSize: 15, fontWeight: 600, outline: 'none', resize: 'none',
            fontFamily: 'Nunito', lineHeight: 1.6, transition: 'border-color .2s' }}
          onFocus={e => e.target.style.borderColor = '#58CC02'}
          onBlur={e => e.target.style.borderColor  = '#E5E5E5'}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 6 }}>
          <span style={{ fontSize: 12, color: text.length > 180 ? '#FF4B4B' : '#AFAFAF', fontWeight: 700 }}>
            {text.length}/200
          </span>
        </div>
      </div>

      <div className="rg-bottom-bar">
        <button onClick={() => valid && onNext(text.trim(), parseInt(sentencePage) || 0)}
          className={`btn-duo ${valid ? 'btn-green' : 'btn-off'}`}
          style={{ width: '100%' }} disabled={!valid}>
          기록 완료 🔥
        </button>
      </div>
    </div>
  );
};

// ── Screen D-3: 세리머니 ──────────────────────────────────────────────────────
const ScreenD3 = ({ sessionNum, xpGained, onContinue, isLoggedIn }) => {
  const colors = ['#3FD17F','#FFC233','#FF8A3D','#5AB5F0','#F08A9A','#B690F0','#2EB867','#FFD66B'];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', height: '100%', background: '#fff', padding: '0 24px',
      position: 'relative', overflow: 'hidden' }}>

      {/* Confetti 18조각 (§4-D3) */}
      {Array.from({ length: 18 }, (_, i) => (
        <div key={i} style={{
          position: 'absolute', left: `${4 + i * 5.5}%`, top: -16,
          width: 9, height: 9, borderRadius: 3,
          background: colors[i % 8],
          animation: `confetti 2.4s ${i * 0.014}s cubic-bezier(.25,.5,.5,1) forwards`,
        }}/>
      ))}

      {/* 참새 bounce */}
      <div className="sparrow-bounce" style={{ marginBottom: 12 }}>
        <Sparrow size={88}/>
      </div>

      <h2 className="pop-in" style={{ fontWeight: 900, fontSize: 26, color: '#1F1F1F', margin: '0 0 6px', textAlign: 'center' }}>
        훌륭해요!
      </h2>
      <p style={{ fontSize: 14, color: '#AFAFAF', margin: '0 0 28px', fontWeight: 700 }}>
        로드맵 {sessionNum}번째 노드 획득!
      </p>

      {/* 보상 카드 3그리드 (§4-D3) */}
      <div className="pop-in" style={{ display: 'flex', gap: 10, marginBottom: 32, width: '100%', maxWidth: 280 }}>
        {[
          ['🔥', '스트릭 +1', '#FFF3E0', '#FF9600'],
          ['⚡', `+${xpGained} XP`,  '#E0F4FF', '#1CB0F6'],
          ['⬆️', 'hop!',            '#F0FDF4', '#58CC02'],
        ].map(([emoji, label, bg, color]) => (
          <div key={label} style={{ flex: 1, background: bg, borderRadius: 16, padding: '14px 8px', textAlign: 'center' }}>
            <div style={{ fontSize: 24 }}>{emoji}</div>
            <div style={{ fontSize: 12, fontWeight: 800, color, marginTop: 6 }}>{label}</div>
          </div>
        ))}
      </div>

      <button onClick={onContinue} className="btn-duo btn-green" style={{ width: '100%', maxWidth: 280, fontSize: 16 }}>
        {isLoggedIn ? '내일도 짹 →' : '계속하려면 로그인'}
      </button>
    </div>
  );
};

// ── Screen E: 가입 (Google 로그인 시뮬레이션) ─────────────────────────────────
const ScreenE = ({ onLogin }) => (
  <div style={{ display: 'flex', flexDirection: 'column', height: '100%',
    background: 'linear-gradient(160deg,#F0FDF4 0%,#fff 50%)' }}>
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '0 32px', textAlign: 'center', gap: 20 }}>
      <div className="sparrow-bounce"><Sparrow size={80}/></div>
      <div>
        <p style={{ fontWeight: 900, fontSize: 20, color: '#1F1F1F', margin: '0 0 10px', lineHeight: 1.4 }}>
          "하루 한 페이지,<br/>한 문장에서 시작해요."
        </p>
        <p style={{ fontSize: 14, color: '#AFAFAF', fontWeight: 600, margin: 0, lineHeight: 1.6 }}>
          계속 이어가려면 로그인하세요.<br/>
          오늘의 기록은 저장되어 있어요 🐦
        </p>
      </div>
    </div>
    <div style={{ padding: '0 24px 48px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <button onClick={onLogin} className="btn-duo btn-green" style={{ width: '100%', fontSize: 15 }}>
        Google로 계속
      </button>
      <p style={{ textAlign: 'center', fontSize: 11, color: '#AFAFAF', margin: 0, fontWeight: 600 }}>
        Phase 0 데모 — 실제 OAuth 없이 시뮬레이션됩니다
      </p>
    </div>
  </div>
);

// ── Onboarding 컨테이너 ────────────────────────────────────────────────────────
const OnboardingFlow = ({ state, onStateChange, onDone }) => {
  const step = state.onboardingStep;

  const go = s => onStateChange(prev => ({ ...prev, onboardingStep: s }));

  const handleSelectBook = book => {
    onStateChange(prev => ({ ...prev, onboardingBook: book, onboardingStep: 'C2' }));
  };
  const handleConfirmBook = (book, page) => {
    onStateChange(prev => ({ ...prev, onboardingBook: book, onboardingPage: page, onboardingStep: 'D1' }));
  };
  const handlePage = page => {
    onStateChange(prev => ({ ...prev, onboardingPage: page, onboardingStep: 'D2' }));
  };
  const handleSentence = (text, page) => {
    onStateChange(prev => ({ ...prev, onboardingText: text, onboardingSentencePage: page, onboardingStep: 'D3' }));
  };
  const handleContinue = () => {
    // Phase 0: 가입 전이면 E, 이미 핸들 있으면 홈으로
    if (state.user.handle) {
      onDone();
    } else {
      go('E');
    }
  };
  const handleLogin = () => {
    // 구글 로그인 시뮬레이션 → 닉네임 자동 부여 후 홈
    onStateChange(prev => ({
      ...prev,
      user: { ...prev.user, handle: 'me', displayName: '나' },
    }));
    onDone();
  };

  if (step === 'A')  return <ScreenA onStart={() => go('C1')}/>;
  if (step === 'C1') return <ScreenC1 onSelect={handleSelectBook} onManual={() => go('C2_manual')}/>;
  if (step === 'C2' || step === 'C2_manual') return (
    <ScreenC2
      book={state.onboardingBook}
      isManual={step === 'C2_manual'}
      onBack={() => go('C1')}
      onConfirm={handleConfirmBook}
    />
  );
  if (step === 'D1') return (
    <ScreenD1
      book={state.onboardingBook}
      initPage={state.onboardingPage}
      onNext={handlePage}
    />
  );
  if (step === 'D2') return (
    <ScreenD2
      initPage={state.onboardingPage}
      onBack={() => go('D1')}
      onNext={handleSentence}
    />
  );
  if (step === 'D3') return (
    <ScreenD3
      sessionNum={1}
      xpGained={10}
      onContinue={handleContinue}
      isLoggedIn={!!state.user.handle}
    />
  );
  if (step === 'E') return <ScreenE onLogin={handleLogin}/>;
  return <ScreenA onStart={() => go('C1')}/>;
};

// ── window exports ─────────────────────────────────────────────────────────────
window.ScreenA       = ScreenA;
window.ScreenC1      = ScreenC1;
window.ScreenC2      = ScreenC2;
window.ScreenD1      = ScreenD1;
window.ScreenD2      = ScreenD2;
window.ScreenD3      = ScreenD3;
window.ScreenE       = ScreenE;
window.OnboardingFlow = OnboardingFlow;
