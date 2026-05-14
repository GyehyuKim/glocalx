// social.js — 소셜 탭 (§5.6: 주간 리그 + 피드 + 박수)
// 의존: data.js, components.js

const SocialView = ({ state, onStateChange }) => {
  const feed      = state.feed        || [];
  const league    = state.leagueData  || SEED_LEAGUE;
  const clapped   = state.clappedFeed  || {};
  const sympathied = state.sympathyFeed || {};
  const saved      = state.savedFeed    || {};
  const friends   = state.friends      || [];
  const [searchQ, setSearchQ] = React.useState('');
  const [searchOpen, setSearchOpen] = React.useState(false);

  const followedIds = new Set(friends.map(f => f.id));
  const searchResults = searchQ.trim()
    ? NPC_SEARCH_USERS.filter(u =>
        u.handle.includes(searchQ.toLowerCase()) ||
        u.name.includes(searchQ)
      )
    : NPC_SEARCH_USERS;

  const doFollow = user => {
    if (followedIds.has(user.id)) return;
    onStateChange(prev => ({
      ...prev,
      friends: [...prev.friends, { ...user, sentence: user.sentence || '' }],
    }));
    window._showToast && window._showToast(`🐦 @${user.handle} 팔로우!`);
  };

  const doReact = (id, type) => {
    const fieldMap = { clap: 'clappedFeed', sympathy: 'sympathyFeed', save: 'savedFeed' };
    const countMap = { clap: 'claps', sympathy: 'sympathy', save: 'saves' };
    const stateMap = { clap: clapped, sympathy: sympathied, save: saved };
    const field = fieldMap[type], count = countMap[type], already = stateMap[type][id];
    onStateChange(prev => ({
      ...prev,
      [field]: { ...prev[field], [id]: !already },
      feed: prev.feed.map(item => item.id === id
        ? { ...item, [count]: item[count] + (already ? -1 : 1) }
        : item),
    }));
  };

  // 리그 순위 색상 (§5.6)
  const rankColor = rank => rank === 1 ? '#C8901C' : rank === 2 ? '#8E939B' : rank === 3 ? '#B17142' : '#1F1F1F';
  const badge = rank => rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : String(rank);

  return (
    <div className="rg-screen">
      {/* 헤더 */}
      <div className="rg-tab-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 22 }}>👥</span>
            <span style={{ fontWeight: 900, fontSize: 17, color: '#1F1F1F' }}>소셜</span>
          </div>
          <button onClick={() => setSearchOpen(v => !v)} style={{
            display: 'flex', alignItems: 'center', gap: 4, background: searchOpen ? '#F1FBF5' : '#F7F7F7',
            border: `1.5px solid ${searchOpen ? '#3FD17F' : '#E5E5E5'}`,
            borderRadius: 20, padding: '6px 12px', cursor: 'pointer', fontFamily: 'inherit',
            fontWeight: 800, fontSize: 12, color: searchOpen ? '#1F8E4D' : '#5A5F69',
          }}>
            <SearchIcon s={14}/> 친구 찾기
          </button>
        </div>
      </div>

      <div className="rg-scroll" style={{ padding: '16px 16px 0' }}>
        {/* ── 친구 찾기 패널 ─────────────────────────────────────────────────── */}
        {searchOpen && (
          <div className="rg-card" style={{ marginBottom: 16 }}>
            <p style={{ fontWeight: 800, fontSize: 14, color: '#1F1F1F', margin: '0 0 10px' }}>
              🔍 친구 찾기
            </p>
            <input
              type="text" value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
              placeholder="@닉네임으로 검색"
              className="rg-input"
              style={{ marginBottom: 10, fontSize: 13, padding: '10px 14px' }}
              onFocus={e => e.target.style.borderColor = '#3FD17F'}
              onBlur={e => e.target.style.borderColor  = '#E5E5E5'}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {searchResults.map(user => (
                <div key={user.id} style={{ display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 0', borderBottom: '1px solid #F7F7F7' }}>
                  <NestIcon stage={user.stage} size={36} isLit={user.isLit}/>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 800, fontSize: 13, color: '#1F1F1F', margin: 0 }}>
                      {user.name} <span style={{ fontSize: 10, color: '#AFAFAF', fontWeight: 600 }}>· NPC</span>
                    </p>
                    <p style={{ fontSize: 11, color: '#AFAFAF', margin: 0 }}>@{user.handle}</p>
                  </div>
                  <button onClick={() => doFollow(user)}
                    disabled={followedIds.has(user.id)}
                    style={{
                      padding: '6px 14px', borderRadius: 14, border: 'none', cursor: followedIds.has(user.id) ? 'default' : 'pointer',
                      fontWeight: 800, fontSize: 12, fontFamily: 'inherit',
                      background: followedIds.has(user.id) ? '#E5E5E5' : '#3FD17F',
                      color:      followedIds.has(user.id) ? '#AFAFAF' : '#fff',
                    }}>
                    {followedIds.has(user.id) ? '팔로잉 ✓' : '팔로우'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── 주간 리그 (§6.5 / §5.6) ─────────────────────────────────────── */}
        <div className="rg-card" style={{ marginBottom: 16 }}>
          <p style={{ fontWeight: 800, fontSize: 14, color: '#1F1F1F', margin: '0 0 12px' }}>
            🏆 민트 리그 · 이번 주
          </p>
          {league.map((item, idx) => {
            const rank = idx + 1;
            return (
              <div key={item.handle} style={{
                display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8,
                padding: '8px 10px', borderRadius: 12,
                background: item.isMe ? '#F1FBF5' : 'transparent',
                border: item.isMe ? '1.5px solid #DFF6EA' : '1.5px solid transparent',
              }}>
                <span style={{ fontSize: 18, width: 28, textAlign: 'center' }}>{badge(rank)}</span>
                <span style={{ flex: 1, fontWeight: 700, fontSize: 13, color: rankColor(rank) }}>
                  {item.name}{item.isNpc && <span style={{ fontSize: 10, color: '#AFAFAF', fontWeight: 600 }}> · NPC</span>}
                  {item.isMe && <span style={{ fontSize: 11, color: '#3FD17F', marginLeft: 4 }}>← 나</span>}
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
                {/* 리액션 칩 3종 (§5.6: 👏🥹🔖) */}
                <div style={{ display: 'flex', gap: 6 }}>
                  {[
                    { type: 'clap',    emoji: '👏', count: item.claps,    active: clapped[item.id],   activeColor: '#FF9600', activeBg: '#FFF3E0', activeBorder: '#FFC800' },
                    { type: 'sympathy',emoji: '🥹', count: item.sympathy, active: sympathied[item.id], activeColor: '#1CB0F6', activeBg: '#E0F4FF', activeBorder: '#85D8F8' },
                    { type: 'save',    emoji: '🔖', count: item.saves,    active: saved[item.id],     activeColor: '#CE82FF', activeBg: '#FAF0FF', activeBorder: '#D9B5FF' },
                  ].map(chip => (
                    <button key={chip.type}
                      onClick={() => item.handle !== 'me' && doReact(item.id, chip.type)}
                      disabled={item.handle === 'me'}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 3,
                        padding: '5px 10px', borderRadius: 16, cursor: item.handle === 'me' ? 'default' : 'pointer',
                        fontWeight: 800, fontSize: 11, fontFamily: 'inherit',
                        background: chip.active ? chip.activeBg : '#F7F7F7',
                        color:      chip.active ? chip.activeColor : '#AFAFAF',
                        border:    `1.5px solid ${chip.active ? chip.activeBorder : '#E5E5E5'}`,
                        opacity:    item.handle === 'me' ? 0.4 : 1,
                      }}>
                      {chip.emoji} {chip.count}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

window.SocialView = SocialView;
