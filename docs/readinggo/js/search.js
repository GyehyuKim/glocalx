/* =========================================================
   ReadingGo — search.js
   도서 검색 모달 (하단 슬라이드업 시트)
   ========================================================= */

function SearchModal({ isOpen, onClose, books, onSelectBook, topRecommendations }) {
  const { useState, useMemo, useEffect, useRef } = React;
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  // 열릴 때 입력 포커스 + 검색어 초기화
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      const t = setTimeout(() => { if (inputRef.current) inputRef.current.focus(); }, 280);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  // Fuse 인스턴스 (books가 바뀔 때만 재생성)
  const fuse = useMemo(() => {
    if (typeof window.Fuse !== 'function' || !books) return null;
    return new window.Fuse(books, {
      keys: ['title', 'author', 'publisher'],
      threshold: 0.4,
      ignoreLocation: true,
    });
  }, [books]);

  const results = useMemo(() => {
    const q = query.trim();
    if (!q) return [];
    if (fuse) return fuse.search(q).map(r => r.item).slice(0, 20);
    // 폴백: 단순 includes
    const lq = q.toLowerCase();
    return (books || []).filter(b =>
      (b.title || '').toLowerCase().includes(lq) ||
      (b.author || '').toLowerCase().includes(lq) ||
      (b.publisher || '').toLowerCase().includes(lq)
    ).slice(0, 20);
  }, [query, fuse, books]);

  const showRecs = !query.trim();
  const list = showRecs ? (topRecommendations || []) : results;

  const renderRow = (book) => (
    <div
      key={book.book_id}
      className="shelf-row"
      onClick={() => onSelectBook(book)}
    >
      <div className="shelf-cover">
        {book.cover_url ? (
          <img
            src={book.cover_url}
            alt={book.title}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        ) : null}
      </div>
      <div className="shelf-meta">
        <div className="shelf-title">{book.title}</div>
        <div className="shelf-prog">{book.author}{book.publisher ? ' · ' + book.publisher : ''}</div>
      </div>
    </div>
  );

  return (
    <div
      className={'modal-backdrop' + (isOpen ? ' show' : '')}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="sheet" role="dialog" aria-modal="true" aria-label="도서 검색">
        <div className="sheet-grip" />
        <div className="sheet-head">
          <h2>🔍 책 찾기</h2>
          <div className="sub">제목 · 저자 · 출판사로 검색</div>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="어떤 책을 읽을까요?"
            style={{
              flex: 1,
              border: '1.5px solid var(--line)',
              borderRadius: 'var(--r-md)',
              padding: '12px 14px',
              fontSize: 15,
              fontWeight: 700,
              background: 'var(--card-soft)',
              color: 'var(--ink)',
            }}
            onFocus={(e) => { e.target.style.borderColor = 'var(--brand)'; e.target.style.background = '#fff'; }}
            onBlur={(e) => { e.target.style.borderColor = 'var(--line)'; e.target.style.background = 'var(--card-soft)'; }}
          />
          <button
            onClick={onClose}
            style={{
              border: 'none',
              background: 'var(--paper-2)',
              color: 'var(--ink-2)',
              fontWeight: 800,
              fontSize: 14,
              padding: '12px 14px',
              borderRadius: 'var(--r-md)',
            }}
          >
            닫기
          </button>
        </div>

        <div className="sheet-section">
          <div className="label">
            {showRecs ? '🐦 오늘의 추천' : `🔎 검색 결과 ${results.length}권`}
          </div>
          {list.length > 0 ? (
            list.map(renderRow)
          ) : (
            <div className="empty">
              <span className="ico">🪺</span>
              찾는 책이 없어요. 다른 검색어로 짹 해보세요.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

window.SearchModal = SearchModal;
