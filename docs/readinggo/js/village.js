/* =========================================================
   ReadingGo — village.js
   마을 탭: 친구 둥지 그리드 + 모이 보내기
   ========================================================= */

function VillageView({ state, onSendSeed }) {
  return (
    <section className="view active">
      <div style={{textAlign:'center', margin:'6px 0 16px'}}>
        <div style={{fontSize:22, fontWeight:900, letterSpacing:'-.3px'}}>🌳 우리 마을</div>
        <div style={{fontSize:13, color:'var(--ink-2)', fontWeight:700, marginTop:2}}>
          오늘 <span style={{color:'var(--ink-3)'}}>불 꺼진</span> 친구에게 🪱 모이를 보내 깨워봐요.
        </div>
      </div>

      <div className="village-grid">
        {state.village.map((f, idx) => (
          <div key={f.name} className={'friend-nest' + (f.on ? ' on' : '')}>
            {!f.on && (
              <span
                className={'seed' + (f.sent ? ' sent' : '')}
                title={f.sent ? '오늘 모이 보냄' : '🪱 모이 보내기'}
                onClick={e => { e.stopPropagation(); onSendSeed(idx); }}
              >🪱</span>
            )}
            <span className="light" />
            <div className="nestico">{f.nest}</div>
            <div className="nick">@{f.name}</div>
            <div className="streakmini">{f.streak ? '🔥 ' + f.streak : '쉼 중'}</div>
          </div>
        ))}
      </div>

      <div className="section-head">
        <h3>🪱 오늘 받은 모이</h3>
      </div>
      <div className="card" style={{padding:14}}>
        <div style={{display:'flex', gap:10, alignItems:'center'}}>
          <div style={{fontSize:28}}>🪱</div>
          <div style={{flex:1}}>
            <div style={{fontWeight:800, fontSize:14}}>@book_bear가 모이를 보냈어요</div>
            <div style={{fontSize:12, color:'var(--ink-2)', fontWeight:700, marginTop:2}}>"오늘도 짹 한번! 같이 읽자🐦"</div>
          </div>
          <span style={{fontSize:11, color:'var(--ink-3)', fontWeight:700}}>12분 전</span>
        </div>
      </div>
    </section>
  );
}

window.VillageView = VillageView;
