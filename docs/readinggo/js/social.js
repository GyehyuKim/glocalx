// social.js — 소셜 탭 (§5.6: 주간 리그 + 피드 + 박수)
// 의존: data.js, components.js

const SocialView = ({ state, onStateChange }) => {
  const feed      = state.feed       || [];
  const league    = state.leagueData || SEED_LEAGUE;
  const clapped   = state.clappedFeed || {};

  const doClap = id => {
    if (clapped[id]) return;
    onStateChange(prev => ({
      ...prev,
      clappedFeed: { ...prev.clappedFeed, [id]: true },
      feed: prev.feed.map(item => item.id === id ? { ...item, claps: item.claps + 1 } : item),
    }));
  };

  // 리그 배지 (§6.5)
  const badge = rank => rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : String(rank);

  return (
    <div className="rg-screen">
      {/* 헤더 */}
      <div className="rg-tab-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 22 }}>👥</span>
          <span style={{ fontWeight: 900, fontSize: 17, color: '#1F1F1F' }}>소셜</span>
        </div>
      </div>

      <div className="rg-scroll" style={{ padding: '16px 16px 0' }}>
        {/* ── 주간 리그 (§6.5 / §5.6) ─────────────────────────────────────── */}
        <div className="rg-card" style={{ marginBottom: 16 }}>
          <p style={{ fontWeight: 800, fontSize: 14, color: '#1F1F1F', margin: '0 0 12px' }}>
            🏆 이번 주 리그
          </p>
          {league.map((item, idx) => {
            const rank = idx + 1;
            return (
              <div key={item.handle} style={{
                display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8,
                padding: '8px 10px', borderRadius: 12,
                background: item.isMe ? '#F0FDF4' : 'transparent',
                border: item.isMe ? '1.5px solid #D7F0BF' : '1.5px solid transparent',
              }}>
                <span style={{ fontSize: 18, width: 28, textAlign: 'center' }}>{badge(rank)}</span>
                <span style={{ flex: 1, fontWeight: 700, fontSize: 13, color: '#1F1F1F' }}>
                  {item.name}{item.isMe && <span style={{ fontSize: 11, color: '#58CC02', marginLeft: 4 }}>← 나</span>}
                </span>
                <span style={{ fontWeight: 800, fontSize: 13, color: '#1CB0F6' }}>{item.xp} XP</span>
              </div>
            );
          })}
          <p style={{ fontSize: 11, color: '#AFAFAF', textAlign: 'center', marginTop: 8, marginBottom: 0 }}>
            매주 월요일 00:00 KST 초기화
          </p>
        </div>

        {/* ── 피드 (§5.6) ────────────────────────────────────────────────── */}
        {feed.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#AFAFAF' }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>🐦</div>
            <p style={{ fontWeight: 700, fontSize: 14, margin: 0 }}>
              아직 친구가 없어요. NPC와 함께 시작해보세요 🐦
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingBottom: 16 }}>
            {feed.map(item => (
              <div key={item.id} className="rg-card">
                {/* 유저 정보 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#F0FDF4',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Sparrow size={28}/>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 800, fontSize: 13, color: '#1F1F1F', margin: 0 }}>
                      {item.name}
                    </p>
                    <p style={{ fontSize: 11, color: '#AFAFAF', margin: 0 }}>
                      {item.book} · {item.time}
                    </p>
                  </div>
                </div>
                {/* 문장 */}
                <p style={{ fontSize: 13, color: '#4a4a4a', fontStyle: 'italic',
                  lineHeight: 1.6, margin: '0 0 10px' }}>
                  {item.sentence}
                </p>
                {/* 박수 버튼 (§5.6: 1버튼, 본인 카드 비활성) */}
                <button
                  onClick={() => item.handle !== 'me' && doClap(item.id)}
                  disabled={item.handle === 'me'}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    padding: '6px 14px', borderRadius: 20, border: 'none', cursor: item.handle === 'me' ? 'default' : 'pointer',
                    fontWeight: 800, fontSize: 12, fontFamily: 'Nunito',
                    background: clapped[item.id] ? '#FFF3E0' : '#F7F7F7',
                    color:      clapped[item.id] ? '#FF9600' : '#AFAFAF',
                    border: `2px solid ${clapped[item.id] ? '#FFC800' : '#E5E5E5'}`,
                    opacity:    item.handle === 'me' ? 0.4 : 1,
                  }}>
                  👏 {item.claps}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

window.SocialView = SocialView;
