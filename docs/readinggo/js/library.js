/* =========================================================
   ReadingGo — library.js
   내서재 탭: 책 목록 + 활성 책 전환
   ========================================================= */

function LibraryView({ state, onSetActiveBook }) {
  // 정렬: 활성 → 읽는 중 → 미개봉
  const sorted = React.useMemo(() => {
    return RG_BOOKS.slice().sort((a, b) => {
      if (a.id === state.book.id) return -1;
      if (b.id === state.book.id) return 1;
      const ap = INITIAL_PROGRESS[a.id] ? 0 : 1;
      const bp = INITIAL_PROGRESS[b.id] ? 0 : 1;
      return ap - bp;
    });
  }, [state.book.id]);

  return (
    <section className="view active">
      <div style={{textAlign:'center', margin:'6px 0 16px'}}>
        <div style={{fontSize:22, fontWeight:900, letterSpacing:'-.3px'}}>📚 내 서재</div>
        <div style={{fontSize:13, color:'var(--ink-2)', fontWeight:700, marginTop:2}}>
          여러 책 동시에 읽어도 OK. 하루는 한 권에 짹.
        </div>
      </div>

      <div>
        {sorted.map(b => {
          const isActive = b.id === state.book.id;
          const prog = INITIAL_PROGRESS[b.id];
          const cur = isActive ? state.book.cur : (prog ? prog.cur : 0);
          const days = isActive ? state.book.days : (prog ? prog.days : 0);
          const progText = cur > 0 ? `${cur} / ${b.total}p · ${days}일째` : '아직 안 펼침';
          return (
            <div
              key={b.id}
              className={'shelf-row' + (isActive ? ' active' : '')}
              onClick={() => { if (!isActive) onSetActiveBook(b.id); }}
            >
              <div
                className="shelf-cover"
                style={{background: `linear-gradient(135deg,${b.fb[0]},${b.fb[1]})`}}
              >
                <img src={b.cover} alt={b.title} loading="lazy" referrerPolicy="no-referrer"
                     onError={e => e.target.style.display='none'} />
              </div>
              <div className="shelf-meta">
                <div className="shelf-title">{b.title}</div>
                <div className="shelf-prog">{progText}</div>
              </div>
              {isActive && <span className="shelf-active-pill">읽는 중</span>}
            </div>
          );
        })}
      </div>

      <button
        className="checkin-cta"
        style={{marginTop:18, background:'var(--card)', color:'var(--brand-3)', border:'2px dashed var(--brand)', borderBottom:'5px solid var(--brand-shadow)'}}
        onClick={() => showToast('📚 책 추가 기능은 곧 열려요!')}
      >
        ＋ 새 책 추가하기
      </button>
    </section>
  );
}

window.LibraryView = LibraryView;
