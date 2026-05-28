/* =========================================================
   ReadingGo — social.js
   소셜 탭: 주간 리그 + 친구 한 문장 피드
   ========================================================= */

function SocialView({ state }) {
  // 모든 NPC 인용 모아서 활성 책 우선 정렬
  const allQuotes = React.useMemo(() => {
    const all = [];
    for (const bid of Object.keys(NPC_QUOTES)) {
      for (const it of NPC_QUOTES[bid]) all.push({ bookId: bid, ...it });
    }
    all.sort((a, b) =>
      a.bookId === state.book.id ? -1 : b.bookId === state.book.id ? 1 : b.claps - a.claps
    );
    return all;
  }, [state.book.id]);

  return (
    <section className="view active">
      <div className="league-card">
        <div className="league-head">
          <div className="league-badge">🏆</div>
          <div>
            <div className="league-title">민트 리그 · 이번 주</div>
            <div className="league-sub">월요일 리셋까지 <strong>4일</strong></div>
          </div>
        </div>
        <div className="league-list">
          {state.league.map(p => {
            const rankClass = p.rank === 1 ? 'gold' : p.rank === 2 ? 'silver' : p.rank === 3 ? 'bronze' : '';
            return (
              <div key={p.rank} className={'league-row' + (p.me ? ' me' : '')}>
                <span className={'league-rank' + (rankClass ? ' ' + rankClass : '')}>{p.rank}</span>
                <span className="league-avatar">{p.avatar}</span>
                <span className="league-name">{p.name}</span>
                <span className="league-xp">{p.xp}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="section-head">
        <h3>📚 친구들의 한 문장</h3>
      </div>
      <div>
        {allQuotes.map((it, i) => (
          <SentenceCard key={i} item={it} bookId={it.bookId} />
        ))}
      </div>
    </section>
  );
}

window.SocialView = SocialView;
