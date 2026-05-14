// village.js — 마을 탭 (§5.5 리딩 빌리지)
// 의존: data.js, components.js

const VillageView = ({ state, onStateChange }) => {
  const friends = state.friends || [];
  const pokes   = state.pokes  || {};

  const sendPoke = id => {
    onStateChange(prev => ({ ...prev, pokes: { ...prev.pokes, [id]: true } }));
    // 알림 시뮬레이션 토스트는 app.js에서 처리
    window._showToast && window._showToast('🪱 모이를 보냈어요!');
  };

  return (
    <div className="rg-screen">
      {/* 헤더 */}
      <div className="rg-tab-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 22 }}>🏘️</span>
          <span style={{ fontWeight: 900, fontSize: 17, color: '#1F1F1F' }}>리딩 빌리지</span>
        </div>
        <p style={{ fontSize: 12, color: '#AFAFAF', fontWeight: 600, margin: '4px 0 0' }}>
          💡 불빛 ON = 오늘 읽음 · 🪱 모이 = 독려 알림
        </p>
      </div>

      <div className="rg-scroll">
        {/* 친구 둥지 3열 그리드 (§5.5) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 16 }}>
          {friends.map(f => (
            <div key={f.id} className="rg-card" style={{
              padding: 10,
              borderColor: f.isLit ? '#D7F0BF' : '#E5E5E5',
              boxShadow: f.isLit ? '0 0 8px rgba(255,194,51,0.5)' : '0 2px 8px rgba(0,0,0,.04)',
            }}>
              {/* 둥지 아이콘 + 불빛 */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                <NestIcon stage={f.stage} size={36} isLit={f.isLit}/>
                {f.isLit && (
                  <span className="rg-badge-green" style={{ fontSize: 10 }}>읽는 중</span>
                )}
              </div>

              {/* 닉네임 (§5.5: @handle) */}
              <p style={{ fontWeight: 800, fontSize: 11, color: '#1F1F1F', margin: '0 0 3px' }}>
                @{f.handle}
              </p>

              {/* 오늘의 문장 1줄 (§5.5) */}
              {f.sentence ? (
                <p className="line-clamp-2" style={{ fontSize: 10, color: '#AFAFAF',
                  lineHeight: 1.4, margin: '0 0 8px', fontStyle: 'italic' }}>
                  {f.sentence}
                </p>
              ) : (
                <div style={{ marginBottom: 8 }}/>
              )}

              {/* 액션: 불빛 ON → "읽는 중" / 불빛 OFF → 🪱 모이 보내기 */}
              {!f.isLit && !f.isNpc && (
                <button
                  onClick={() => !pokes[f.id] && sendPoke(f.id)}
                  disabled={!!pokes[f.id]}
                  style={{
                    width: '100%', padding: '6px 0', borderRadius: 10, border: 'none',
                    cursor: pokes[f.id] ? 'not-allowed' : 'pointer', fontWeight: 800, fontSize: 10,
                    background: pokes[f.id] ? '#E5E5E5' : '#58CC02',
                    color:      pokes[f.id] ? '#AFAFAF' : '#fff',
                    boxShadow:  pokes[f.id] ? 'none' : '0 3px 0 #46A302',
                    fontFamily: 'Nunito',
                  }}>
                  {pokes[f.id] ? '전송됨 ✓' : '🪱 모이 보내기'}
                </button>
              )}
              {f.isNpc && !f.isLit && (
                <span style={{ fontSize: 10, color: '#AFAFAF', fontWeight: 600 }}>오늘도 곧 읽을 거예요</span>
              )}
            </div>
          ))}
        </div>

        {/* 마을 게시판 빈 상태 (§12) */}
        <div className="rg-card" style={{ padding: 20 }}>
          <p style={{ fontWeight: 800, fontSize: 14, color: '#1F1F1F', margin: '0 0 8px' }}>
            📋 마을 게시판
          </p>
          <p style={{ fontSize: 13, color: '#AFAFAF', textAlign: 'center', padding: '20px 0', margin: 0 }}>
            첫 글을 남겨보세요 ✍️
          </p>
        </div>
      </div>
    </div>
  );
};

window.VillageView = VillageView;
