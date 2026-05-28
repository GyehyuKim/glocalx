// village.js — 마을 탭 리뉴얼 (독서평 인질극 + TOC 자동 파트 분할)
// 의존: data.js, components.js

// ── 유틸 ───────────────────────────────────────────────────────────────────────
const getPartForPage = (parts, page) => {
  if (!parts || !parts.length) return null;
  const found = parts.find(p => page >= p.startPage && page <= p.endPage);
  if (found) return found;
  return page > parts[parts.length - 1].endPage ? parts[parts.length - 1] : parts[0];
};

const getMemberPartPct = (member, part) => {
  if (!part) return 0;
  const range = part.endPage - part.startPage;
  if (range <= 0) return 100;
  return Math.max(0, Math.min(100,
    Math.round(((member.currentPage - part.startPage) / range) * 100)
  ));
};

// ── 공개된 독서평 카드 ────────────────────────────────────────────────────────
const RevealedReviewCard = ({ review, stage }) => (
  <div style={{
    background: 'var(--card-soft)', borderRadius: 16, padding: '14px 16px',
    borderLeft: '3px solid var(--brand)',
    animation: 'popIn .4s cubic-bezier(.34,1.56,.64,1)',
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
      <NestIcon stage={stage || 1} size={22} isLit={false} />
      <span style={{ fontWeight: 800, fontSize: 13, color: 'var(--ink)' }}>{review.name}</span>
      <span style={{
        marginLeft: 'auto', fontSize: 10, fontWeight: 700,
        color: 'var(--brand-3)', background: 'var(--brand-tint)',
        borderRadius: 6, padding: '2px 7px',
      }}>공개됨 ✓</span>
    </div>
    <p style={{ fontSize: 13, color: 'var(--ink)', lineHeight: 1.65, margin: 0, fontStyle: 'italic' }}>
      "{review.text}"
    </p>
  </div>
);

// ── 잠긴 독서평 카드 (블러) ───────────────────────────────────────────────────
const LockedReviewCard = ({ review }) => (
  <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden' }}>
    {/* 블러 레이어 */}
    <div style={{
      background: 'var(--paper-2)', borderRadius: 16, padding: '14px 16px',
      borderLeft: '3px solid var(--line)',
      filter: 'blur(7px)', userSelect: 'none', pointerEvents: 'none',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--line)' }} />
        <span style={{ fontWeight: 800, fontSize: 13 }}>{review.name}</span>
      </div>
      <p style={{ fontSize: 13, lineHeight: 1.65, margin: 0, fontStyle: 'italic' }}>
        "{review.text}"
      </p>
    </div>
    {/* 잠금 오버레이 */}
    <div style={{
      position: 'absolute', inset: 0, display: 'flex',
      alignItems: 'center', justifyContent: 'center', gap: 6,
    }}>
      <span style={{ fontSize: 18 }}>🔒</span>
      <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--ink-2)' }}>{review.name}</span>
    </div>
  </div>
);

// ── 독서평 인질극 카드 (THE FEATURE) ─────────────────────────────────────────
const HostageReviewCard = ({ village, partOrder, onWriteReview }) => {
  const [showPrev, setShowPrev] = React.useState(false);

  const part = village.parts.find(p => p.order === partOrder);
  if (!part) return null;

  const partReviews  = village.reviews.filter(r => r.partOrder === partOrder);
  const revealedCnt  = partReviews.filter(r => r.revealed).length;
  const allRevealed  = partReviews.length > 0 && revealedCnt === partReviews.length;
  const blockers     = village.members.filter(m => m.currentPage < part.endPage);
  const myReview     = partReviews.find(r => r.handle === 'me');

  const prevOrder    = partOrder - 1;
  const prevPart     = village.parts.find(p => p.order === prevOrder);
  const prevReviews  = prevOrder >= 1
    ? village.reviews.filter(r => r.partOrder === prevOrder && r.revealed)
    : [];

  const dark = !allRevealed;

  return (
    <div style={{ marginBottom: 16 }}>

      {/* ── 현재 파트 인질 카드 ─────────────────────────────────────── */}
      <div style={{
        background: dark
          ? 'linear-gradient(140deg,#1F1F1F,#2D3040)'
          : 'linear-gradient(140deg,var(--brand-tint),#fff)',
        borderRadius: 20, padding: '18px 16px',
        border: `2px solid ${dark ? '#3A3D50' : 'var(--brand-soft)'}`,
      }}>
        {/* 헤더 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 13, fontSize: 22, flexShrink: 0,
            background: dark ? 'rgba(255,255,255,.1)' : 'var(--brand-soft)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {allRevealed ? '🔓' : '🔒'}
          </div>
          <div style={{ flex: 1 }}>
            <p style={{
              fontWeight: 900, fontSize: 15, margin: 0,
              color: dark ? '#fff' : 'var(--ink)',
            }}>독서평 인질극</p>
            <p style={{
              fontSize: 11, fontWeight: 600, margin: '2px 0 0',
              color: dark ? 'rgba(255,255,255,.5)' : 'var(--ink-3)',
            }}>
              파트 {part.order}: {part.title}&nbsp;&nbsp;p.{part.startPage}–{part.endPage}
            </p>
          </div>
          <div style={{
            borderRadius: 10, padding: '4px 10px',
            background: dark ? 'rgba(63,209,127,.18)' : 'var(--brand-soft)',
          }}>
            <span className="rg-pixel" style={{
              fontSize: 13, fontWeight: 800,
              color: dark ? 'var(--brand)' : 'var(--brand-3)',
            }}>
              {revealedCnt}/{partReviews.length}
            </span>
          </div>
        </div>

        {/* 상태 메시지 */}
        {!allRevealed && blockers.length > 0 && (
          <div style={{
            background: 'rgba(255,255,255,.07)', borderRadius: 12,
            padding: '10px 13px', marginBottom: 14,
          }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,.8)', margin: 0 }}>
              💬&nbsp;
              <span style={{ color: 'var(--gold)', fontWeight: 900 }}>
                {blockers.map(b => b.name).join(', ')}
              </span>
              님이 파트를 완독하면 독서평이 공개돼요!
            </p>
          </div>
        )}
        {allRevealed && (
          <div style={{
            background: 'var(--brand-soft)', borderRadius: 12,
            padding: '10px 13px', marginBottom: 14,
          }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--brand-3)', margin: 0 }}>
              🎉 모든 멤버가 완독! 독서평이 공개됐어요
            </p>
          </div>
        )}

        {/* 멤버 진행 바 */}
        <div style={{ marginBottom: 14 }}>
          {village.members.map(member => {
            const pct  = getMemberPartPct(member, part);
            const done = member.currentPage >= part.endPage;
            const isBlocker = blockers.some(b => b.handle === member.handle);
            return (
              <div key={member.handle} style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                  <span style={{
                    fontSize: 11, fontWeight: 800,
                    color: done ? 'var(--brand)' : dark ? 'rgba(255,255,255,.72)' : 'var(--ink-2)',
                  }}>
                    {member.name}{done ? ' ✓' : ''}
                    {isBlocker && !allRevealed && (
                      <span style={{ marginLeft: 5, fontSize: 10, color: 'var(--gold)' }}>● 읽는 중</span>
                    )}
                  </span>
                  <span className="rg-pixel" style={{
                    fontSize: 10,
                    color: dark ? 'rgba(255,255,255,.38)' : 'var(--ink-3)',
                  }}>
                    {pct}%
                  </span>
                </div>
                <div style={{
                  height: 5, borderRadius: 4, overflow: 'hidden',
                  background: dark ? 'rgba(255,255,255,.1)' : 'var(--line)',
                }}>
                  <div style={{
                    height: '100%', width: `${pct}%`, borderRadius: 4,
                    background: done ? 'var(--brand)' : 'var(--gold)',
                    transition: 'width .4s ease',
                  }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* 독서평 카드들 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 14 }}>
          {partReviews.map(review => {
            const memberStage = (village.members.find(m => m.handle === review.handle) || {}).stage || 1;
            return review.revealed
              ? <RevealedReviewCard key={review.handle} review={review} stage={memberStage} />
              : <LockedReviewCard   key={review.handle} review={review} />;
          })}
        </div>

        {/* 독서평 작성 CTA (아직 안 썼을 때만) */}
        {!myReview && (
          <button
            onClick={onWriteReview}
            style={{
              width: '100%', padding: '13px 0', borderRadius: 14, border: 'none',
              background: 'var(--brand)', color: '#fff',
              fontWeight: 800, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit',
              borderBottom: '5px solid var(--brand-shadow)',
              transition: 'transform .08s',
            }}
            onPointerDown={e => { e.currentTarget.style.transform = 'translateY(5px)'; e.currentTarget.style.borderBottomWidth = '0'; }}
            onPointerUp={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderBottomWidth = ''; }}
          >
            ✏️ 독서평 남기기
          </button>
        )}
        {myReview && (
          <div style={{
            background: 'rgba(63,209,127,.12)', borderRadius: 12,
            padding: '10px 13px', textAlign: 'center',
          }}>
            <p style={{ fontSize: 12, fontWeight: 700,
              color: dark ? 'var(--brand)' : 'var(--brand-3)', margin: 0 }}>
              📝 독서평 저장됨 — 모두 완독하면 공개돼요
            </p>
          </div>
        )}
      </div>

      {/* ── 지난 파트 독서평 접이식 ─────────────────────────────────── */}
      {prevReviews.length > 0 && prevPart && (
        <div style={{ marginTop: 10 }}>
          <button
            onClick={() => setShowPrev(v => !v)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', padding: '10px 14px',
              borderRadius: 14, border: '1.5px solid var(--line)',
              background: '#fff', cursor: 'pointer', fontFamily: 'inherit',
            }}>
            <span style={{ fontWeight: 800, fontSize: 13, color: 'var(--ink)' }}>
              ✅ 파트 {prevPart.order} 독서평 ({prevReviews.length}개 공개됨)
            </span>
            <span style={{ color: 'var(--ink-3)', fontSize: 13 }}>{showPrev ? '▲' : '▼'}</span>
          </button>
          {showPrev && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8,
              animation: 'fadeIn .25s ease' }}>
              {prevReviews.map(r => {
                const s = (village.members.find(m => m.handle === r.handle) || {}).stage || 1;
                return <RevealedReviewCard key={r.handle} review={r} stage={s} />;
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ── 멤버 그리드 ───────────────────────────────────────────────────────────────
const MemberGrid = ({ village, pokes, onPoke }) => {
  const [detail, setDetail] = React.useState(null);

  return (
    <>
      <p style={{ fontWeight: 900, fontSize: 14, color: 'var(--ink)', margin: '0 0 10px' }}>
        🏘️ 마을 멤버
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
        {village.members.map(member => {
          const part      = getPartForPage(village.parts, member.currentPage);
          const poked     = !!(pokes || {})[member.handle];
          const overallPct = Math.round((member.currentPage / village.totalPages) * 100);
          return (
            <div key={member.handle}
              className="rg-card"
              onClick={() => !member.isMe && setDetail(member)}
              style={{
                padding: 12, cursor: member.isMe ? 'default' : 'pointer',
                borderColor: member.isMe ? 'var(--brand-soft)' : 'var(--line)',
                background:  member.isMe ? 'var(--brand-tint)' : '#fff',
              }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <NestIcon stage={member.stage} size={30} isLit={false} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontWeight: 800, fontSize: 12, color: 'var(--ink)', margin: 0,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {member.isMe ? '나 👤' : member.name}
                  </p>
                  <p style={{ fontSize: 10, color: 'var(--ink-3)', margin: 0 }}>
                    @{member.handle}
                  </p>
                </div>
              </div>

              {/* 현재 파트 + 페이지 */}
              <p style={{ fontSize: 10, color: 'var(--ink-3)', fontWeight: 600, margin: '0 0 2px',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {part ? part.title : '—'}
              </p>
              <p className="rg-pixel" style={{ fontSize: 14, fontWeight: 800, color: 'var(--ink)', margin: '0 0 8px' }}>
                p.{member.currentPage}
                <span style={{ fontFamily: 'inherit', fontSize: 10, color: 'var(--ink-3)', fontWeight: 600 }}>
                  &nbsp;/{village.totalPages}
                </span>
              </p>

              {/* 전체 진행 바 */}
              <div style={{ height: 4, background: 'var(--line)', borderRadius: 3,
                overflow: 'hidden', marginBottom: 8 }}>
                <div style={{
                  height: '100%', width: `${overallPct}%`,
                  background: member.isMe ? 'var(--brand)' : 'var(--gold)',
                  borderRadius: 3,
                }} />
              </div>

              {/* 포크 버튼 */}
              {!member.isMe ? (
                <button
                  onClick={e => { e.stopPropagation(); !poked && onPoke(member.handle); }}
                  disabled={poked}
                  style={{
                    width: '100%', padding: '7px 0', borderRadius: 10, border: 'none',
                    cursor: poked ? 'not-allowed' : 'pointer',
                    fontWeight: 800, fontSize: 11, fontFamily: 'inherit',
                    background:    poked ? 'var(--line)' : 'var(--brand)',
                    color:         poked ? 'var(--ink-3)' : '#fff',
                    borderBottom:  poked ? 'none' : '3px solid var(--brand-shadow)',
                  }}>
                  {poked ? '전송됨 ✓' : '🪱 모이 보내기'}
                </button>
              ) : (
                <div style={{ height: 28, display: 'flex', alignItems: 'center' }}>
                  <span style={{ fontSize: 10, color: 'var(--brand-3)', fontWeight: 700 }}>
                    내 현재 진도
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 멤버 상세 시트 */}
      {detail && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 50,
          background: 'rgba(0,0,0,.5)', display: 'flex', alignItems: 'flex-end',
        }} onClick={() => setDetail(null)}>
          <div style={{
            width: '100%', background: '#fff', borderRadius: '24px 24px 0 0',
            padding: '20px 20px 40px', maxHeight: '65%', overflowY: 'auto',
            animation: 'slideUp .3s ease',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <NestIcon stage={detail.stage} size={44} isLit={false} />
                <div>
                  <p style={{ fontWeight: 900, fontSize: 16, color: 'var(--ink)', margin: 0 }}>
                    {detail.name}
                  </p>
                  <p style={{ fontSize: 12, color: 'var(--ink-3)', margin: 0 }}>
                    @{detail.handle}
                  </p>
                </div>
              </div>
              <button onClick={() => setDetail(null)} className="rg-btn-icon">
                <XIcon s={20} />
              </button>
            </div>
            <div style={{
              background: 'var(--paper)', borderRadius: 14, padding: '14px 16px',
            }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-3)', margin: '0 0 4px' }}>
                현재 진도
              </p>
              <p className="rg-pixel" style={{
                fontSize: 22, fontWeight: 800, color: 'var(--ink)', margin: 0,
              }}>
                p.{detail.currentPage}
                <span style={{
                  fontFamily: 'inherit', fontSize: 13,
                  color: 'var(--ink-3)', fontWeight: 600,
                }}>/{village.totalPages}</span>
              </p>
              <p style={{ fontSize: 12, color: 'var(--ink-2)', margin: '4px 0 0', fontWeight: 600 }}>
                {(() => { const p = getPartForPage(village.parts, detail.currentPage); return p ? p.title : ''; })()}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// ── 파트 진행 현황 ────────────────────────────────────────────────────────────
const PartProgressCard = ({ village }) => {
  const { parts, members } = village;
  return (
    <div className="rg-card" style={{ padding: '16px 16px 8px', marginBottom: 16 }}>
      <p style={{ fontWeight: 900, fontSize: 14, color: 'var(--ink)', margin: '0 0 12px' }}>
        📖 파트 진행 현황
      </p>
      {parts.map(part => {
        const doneM  = members.filter(m => m.currentPage >= part.endPage);
        const inPartM = members.filter(m =>
          m.currentPage >= part.startPage && m.currentPage < part.endPage
        );
        const allDone  = doneM.length === members.length;
        const anyHere  = doneM.length > 0 || inPartM.length > 0;
        return (
          <div key={part.order} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            marginBottom: 12, opacity: anyHere ? 1 : 0.35,
          }}>
            <div style={{
              width: 30, height: 30, borderRadius: 9, flexShrink: 0,
              background: allDone
                ? 'var(--brand-soft)'
                : inPartM.length > 0 ? 'var(--gold-soft)' : 'var(--line)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span className="rg-pixel" style={{
                fontSize: 12, fontWeight: 800,
                color: allDone
                  ? 'var(--brand-3)'
                  : inPartM.length > 0 ? 'var(--gold-shadow)' : 'var(--ink-3)',
              }}>
                {part.order}
              </span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{
                fontWeight: 700, fontSize: 12, color: 'var(--ink)', margin: 0,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {part.title}
              </p>
              <p style={{ fontSize: 10, color: 'var(--ink-3)', margin: '1px 0 0', fontWeight: 600 }}>
                <span className="rg-pixel">p.{part.startPage}–{part.endPage}</span>
                {inPartM.length > 0 && (
                  <span style={{ marginLeft: 5, color: '#C8901C' }}>
                    · 읽는 중 {inPartM.map(m => m.name).join(', ')}
                  </span>
                )}
              </p>
            </div>
            {allDone ? (
              <span style={{
                fontSize: 10, fontWeight: 800, color: 'var(--brand-3)',
                background: 'var(--brand-tint)', borderRadius: 8, padding: '3px 8px', flexShrink: 0,
              }}>완료 ✓</span>
            ) : (
              <span className="rg-pixel" style={{
                fontSize: 12, fontWeight: 800, color: 'var(--ink-3)', flexShrink: 0,
              }}>
                {doneM.length}/{members.length}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};

// ── 마을 게시판 ───────────────────────────────────────────────────────────────
const VillageBoardCard = ({ village }) => {
  const posts = (village.board && village.board.length) ? village.board : SEED_BOARD_POSTS;
  return (
    <div className="rg-card" style={{ padding: '16px 16px 12px' }}>
      <p style={{ fontWeight: 900, fontSize: 14, color: 'var(--ink)', margin: '0 0 12px' }}>
        📋 마을 게시판
      </p>
      {posts.map((post, i) => (
        <div key={post.id} style={{
          marginBottom: i < posts.length - 1 ? 12 : 0,
          paddingBottom: i < posts.length - 1 ? 12 : 0,
          borderBottom: i < posts.length - 1 ? '1px solid var(--line)' : 'none',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <span style={{ fontWeight: 800, fontSize: 12, color: 'var(--ink)' }}>{post.name}</span>
            {post.handle === 'me' && (
              <span style={{ fontSize: 10, color: 'var(--brand-3)', fontWeight: 700 }}>나</span>
            )}
            <span style={{ fontSize: 11, color: 'var(--ink-3)', marginLeft: 'auto' }}>{post.time}</span>
          </div>
          <p style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.55, margin: 0 }}>{post.text}</p>
        </div>
      ))}
      <button style={{
        width: '100%', marginTop: 12, padding: '8px 0', borderRadius: 12,
        border: '1.5px dashed var(--line)', background: 'none',
        cursor: 'pointer', fontSize: 12, fontWeight: 700,
        color: 'var(--ink-3)', fontFamily: 'inherit',
      }}>
        ✍️ 글 남기기
      </button>
    </div>
  );
};

// ── 독서평 작성 시트 ──────────────────────────────────────────────────────────
const WriteReviewSheet = ({ partTitle, onClose, onSubmit }) => {
  const [text, setText] = React.useState('');
  const canSubmit = text.trim().length >= 10;

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 60,
      background: 'rgba(0,0,0,.55)', display: 'flex', alignItems: 'flex-end',
    }} onClick={onClose}>
      <div style={{
        width: '100%', background: '#fff', borderRadius: '24px 24px 0 0',
        padding: '20px 16px 36px', animation: 'slideUp .3s ease',
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', marginBottom: 16 }}>
          <div>
            <p style={{ fontWeight: 900, fontSize: 16, color: 'var(--ink)', margin: 0 }}>
              독서평 남기기
            </p>
            <p style={{ fontSize: 12, color: 'var(--ink-3)', margin: '2px 0 0' }}>{partTitle}</p>
          </div>
          <button onClick={onClose} className="rg-btn-icon"><XIcon s={20} /></button>
        </div>

        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="이 파트를 읽고 가장 인상 깊었던 것은? (10자 이상)"
          className="rg-input"
          style={{ minHeight: 108, resize: 'none', display: 'block', marginBottom: 6 }}
          maxLength={300}
          autoFocus
        />
        <p style={{ fontSize: 11, color: 'var(--ink-3)', textAlign: 'right', margin: '0 0 12px' }}>
          {text.length}/300
        </p>
        <div style={{
          background: 'var(--brand-tint)', borderRadius: 10,
          padding: '8px 12px', marginBottom: 14,
        }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--brand-3)', margin: 0 }}>
            🔒 모든 멤버가 이 파트를 완독해야 독서평이 공개돼요
          </p>
        </div>
        <button
          onClick={() => canSubmit && onSubmit(text.trim())}
          style={{
            width: '100%', padding: '14px 0', borderRadius: 14, border: 'none',
            background: canSubmit ? 'var(--brand)' : 'var(--line)',
            color: canSubmit ? '#fff' : 'var(--ink-3)',
            fontWeight: 800, fontSize: 15,
            cursor: canSubmit ? 'pointer' : 'not-allowed',
            fontFamily: 'inherit',
            borderBottom: canSubmit ? '5px solid var(--brand-shadow)' : 'none',
          }}>
          독서평 저장하기
        </button>
      </div>
    </div>
  );
};

// ── 마을 내부 뷰 ──────────────────────────────────────────────────────────────
const VillageInternal = ({ village, pokes, onStateChange }) => {
  const [showWriteReview, setShowWriteReview] = React.useState(false);

  // 현재 파트: 'me' 멤버 기준
  const me          = village.members.find(m => m.isMe) || village.members[0];
  const myPart      = getPartForPage(village.parts, me.currentPage);
  const curPartOrder = myPart ? myPart.order : 1;

  const onPoke = handle => {
    onStateChange(prev => ({
      ...prev,
      pokes: { ...(prev.pokes || {}), [handle]: true },
    }));
    window._showToast && window._showToast('🪱 모이를 보냈어요!');
  };

  const onSubmitReview = text => {
    onStateChange(prev => {
      const v = prev.village || SEED_VILLAGE;
      const filtered = v.reviews.filter(
        r => !(r.handle === 'me' && r.partOrder === curPartOrder)
      );
      return {
        ...prev,
        village: {
          ...v,
          reviews: [...filtered, {
            handle: 'me', name: '나',
            partOrder: curPartOrder, text, revealed: false,
          }],
        },
      };
    });
    setShowWriteReview(false);
    window._showToast && window._showToast('📝 독서평 저장! 모두 완독하면 공개돼요.');
  };

  const curPart = village.parts.find(p => p.order === curPartOrder);

  return (
    <div className="rg-screen" style={{ position: 'relative' }}>
      {/* 헤더 */}
      <div className="rg-tab-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'var(--brand-tint)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0,
          }}>
            📚
          </div>
          <div>
            <p style={{ fontWeight: 900, fontSize: 16, color: 'var(--ink)', margin: 0 }}>
              {village.bookTitle}
            </p>
            <p style={{ fontSize: 11, color: 'var(--ink-3)', margin: 0 }}>
              {village.members.length}명 함께 읽는 중
            </p>
          </div>
        </div>
      </div>

      <div className="rg-scroll">
        {/* 독서평 인질극 */}
        <HostageReviewCard
          village={village}
          partOrder={curPartOrder}
          onWriteReview={() => setShowWriteReview(true)}
        />

        {/* 멤버 그리드 */}
        <MemberGrid village={village} pokes={pokes} onPoke={onPoke} />

        {/* 파트 진행 현황 */}
        <PartProgressCard village={village} />

        {/* 게시판 */}
        <VillageBoardCard village={village} />
      </div>

      {/* 독서평 작성 시트 */}
      {showWriteReview && curPart && (
        <WriteReviewSheet
          partTitle={`파트 ${curPart.order}: ${curPart.title}`}
          onClose={() => setShowWriteReview(false)}
          onSubmit={onSubmitReview}
        />
      )}
    </div>
  );
};

// ── 마을 없는 상태 ────────────────────────────────────────────────────────────
const VillageEmpty = ({ onCreateVillage }) => (
  <div className="rg-screen">
    <div className="rg-tab-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 22 }}>🏘️</span>
        <span style={{ fontWeight: 900, fontSize: 17, color: 'var(--ink)' }}>리딩 빌리지</span>
      </div>
    </div>
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '0 32px', textAlign: 'center',
    }}>
      <span style={{ fontSize: 64, marginBottom: 18, display: 'block' }}>🪹</span>
      <p style={{ fontWeight: 900, fontSize: 20, color: 'var(--ink)', margin: '0 0 10px' }}>
        마을이 아직 없어요
      </p>
      <p style={{ fontSize: 14, color: 'var(--ink-3)', lineHeight: 1.7, margin: '0 0 32px' }}>
        같은 책을 읽는 친구들과 마을을 만들면<br />
        독서평 인질극이 시작돼요!<br />
        <span style={{ fontSize: 12, color: 'var(--brand-3)', fontWeight: 700 }}>
          🔒 모두 완독해야 독서평 공개
        </span>
      </p>
      <button
        onClick={onCreateVillage}
        style={{
          width: '100%', padding: '16px 0', borderRadius: 16, border: 'none',
          background: 'var(--brand)', color: '#fff',
          fontWeight: 800, fontSize: 16, cursor: 'pointer', fontFamily: 'inherit',
          borderBottom: '5px solid var(--brand-shadow)',
        }}>
        🏗️ 마을 만들기
      </button>
    </div>
  </div>
);

// ── 마을 만들기 플로우 (TOC 자동 파트 분할) ──────────────────────────────────
const VillageCreateFlow = ({ onBack, onDone }) => {
  const [step, setStep]         = React.useState(1);
  const [selectedBook, setBook] = React.useState(null);
  const [tocParts, setTocParts] = React.useState(null);
  const [tocLoading, setLoading]= React.useState(false);

  // 데모용 책 목록 (실제로는 loadBooks() 사용)
  const DEMO_BOOKS = [
    { isbn: '9788934972464', title: '사피엔스',   author: '유발 하라리', total_pages: 648 },
    { isbn: '9788937460449', title: '데미안',      author: '헤르만 헤세', total_pages: 248 },
    { isbn: '9788934976707', title: '호모 데우스', author: '유발 하라리', total_pages: 568 },
  ];

  const DEMO_MEMBERS = [
    { handle: 'book_bear',        name: '책읽는곰돌이', stage: 3, isNpc: true },
    { handle: 'activist_raccoon', name: '활자라쿤',    stage: 4, isNpc: true },
    { handle: 'reading_owl',      name: '독서올빼미',  stage: 2, isNpc: true },
  ];

  const handleSelectBook = async book => {
    setBook(book);
    setStep(2);
    setLoading(true);
    setTocParts(null);
    try {
      const chapters = await loadTOC(book.isbn);
      // 로딩 느낌 연출 (0.9초)
      await new Promise(r => setTimeout(r, 900));
      setTocParts(
        chapters.length > 0
          ? chapters
          : [{ order: 1, title: '전체 본문', startPage: 1, endPage: parseInt(book.total_pages) || 300 }]
      );
    } catch {
      setTocParts([{ order: 1, title: '전체 본문', startPage: 1, endPage: 300 }]);
    }
    setLoading(false);
  };

  const handleCreate = () => {
    const newVillage = {
      id: genId(),
      bookIsbn:   selectedBook.isbn,
      bookTitle:  selectedBook.title,
      bookAuthor: selectedBook.author || '',
      totalPages: parseInt(selectedBook.total_pages) || 300,
      parts: (tocParts || []).map(p => ({
        order: p.order, title: p.title,
        startPage: p.startPage, endPage: p.endPage,
      })),
      members: [
        { handle: 'me', name: '나', stage: 3, currentPage: 1, isMe: true },
        ...DEMO_MEMBERS.map(m => ({ ...m, currentPage: 1 })),
      ],
      reviews: [],
      board: [],
    };
    onDone(newVillage);
  };

  return (
    <div className="rg-screen">
      {/* 헤더 */}
      <div className="rg-tab-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={onBack} className="rg-btn-icon" style={{ marginRight: 2 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <span style={{ fontWeight: 900, fontSize: 17, color: 'var(--ink)' }}>마을 만들기</span>
        </div>
        {/* 단계 표시 */}
        <div style={{ display: 'flex', gap: 4, marginTop: 10 }}>
          {[1, 2, 3].map(s => (
            <div key={s} style={{
              flex: 1, height: 4, borderRadius: 4,
              background: s <= step ? 'var(--brand)' : 'var(--line)',
              transition: 'background .3s',
            }} />
          ))}
        </div>
      </div>

      <div className="rg-scroll">

        {/* ── Step 1: 책 선택 ── */}
        {step === 1 && (
          <div style={{ animation: 'fadeIn .3s ease' }}>
            <p style={{ fontWeight: 900, fontSize: 17, color: 'var(--ink)', margin: '0 0 6px' }}>
              어떤 책을 함께 읽을까요?
            </p>
            <p style={{ fontSize: 13, color: 'var(--ink-3)', margin: '0 0 20px', lineHeight: 1.6 }}>
              목차를 자동으로 불러와 파트를 나눠드려요
            </p>
            {DEMO_BOOKS.map(book => (
              <button key={book.isbn}
                onClick={() => handleSelectBook(book)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                  padding: '14px 16px', borderRadius: 16,
                  border: '2px solid var(--line)', background: '#fff',
                  cursor: 'pointer', fontFamily: 'inherit',
                  marginBottom: 10, textAlign: 'left',
                }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 10, background: 'var(--brand-tint)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22, flexShrink: 0,
                }}>
                  📖
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 800, fontSize: 14, color: 'var(--ink)', margin: 0 }}>
                    {book.title}
                  </p>
                  <p style={{ fontSize: 12, color: 'var(--ink-3)', margin: 0 }}>{book.author}</p>
                </div>
                <svg style={{ color: 'var(--ink-3)', flexShrink: 0 }}
                  width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            ))}
          </div>
        )}

        {/* ── Step 2: TOC 로드 + 파트 확인 ── */}
        {step === 2 && (
          <div style={{ animation: 'fadeIn .3s ease' }}>
            <p style={{ fontWeight: 900, fontSize: 17, color: 'var(--ink)', margin: '0 0 4px' }}>
              파트 자동 분할
            </p>
            <p style={{ fontSize: 13, color: 'var(--ink-3)', margin: '0 0 18px' }}>
              📚 {selectedBook?.title}의 목차를 불러왔어요
            </p>

            {tocLoading ? (
              <div style={{ textAlign: 'center', padding: '48px 0' }}>
                <div style={{
                  fontSize: 44, marginBottom: 14,
                  animation: 'bounce 1.4s ease-in-out infinite',
                }}>📖</div>
                <p style={{ fontWeight: 800, fontSize: 14, color: 'var(--ink-2)', margin: 0 }}>
                  목차 불러오는 중...
                </p>
                <p style={{ fontSize: 12, color: 'var(--ink-3)', margin: '6px 0 0' }}>
                  books_toc.csv에서 챕터를 읽고 있어요
                </p>
              </div>
            ) : tocParts && (
              <>
                <div style={{
                  background: 'var(--brand-tint)', borderRadius: 14,
                  padding: '10px 14px', marginBottom: 14,
                }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--brand-3)', margin: 0 }}>
                    ✨&nbsp;
                    <span className="rg-pixel">{tocParts.length}</span>
                    개 파트로 자동 분할됐어요!
                  </p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                  {tocParts.map(part => (
                    <div key={part.order} className="rg-card"
                      style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 30, height: 30, borderRadius: 9, flexShrink: 0,
                        background: 'var(--brand-tint)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <span className="rg-pixel" style={{
                          fontSize: 13, fontWeight: 800, color: 'var(--brand-3)',
                        }}>
                          {part.order}
                        </span>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{
                          fontWeight: 700, fontSize: 13, color: 'var(--ink)', margin: 0,
                          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        }}>
                          {part.title}
                        </p>
                        <p style={{ fontSize: 10, color: 'var(--ink-3)', margin: '1px 0 0' }}>
                          <span className="rg-pixel">p.{part.startPage}–{part.endPage}</span>
                          <span style={{ fontFamily: 'inherit', marginLeft: 5 }}>
                            ({part.endPage - part.startPage + 1}쪽)
                          </span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setStep(3)}
                  style={{
                    width: '100%', padding: '14px 0', borderRadius: 16, border: 'none',
                    background: 'var(--brand)', color: '#fff',
                    fontWeight: 800, fontSize: 15, cursor: 'pointer', fontFamily: 'inherit',
                    borderBottom: '5px solid var(--brand-shadow)',
                  }}>
                  이 파트로 진행할게요 →
                </button>
              </>
            )}
          </div>
        )}

        {/* ── Step 3: 멤버 초대 ── */}
        {step === 3 && (
          <div style={{ animation: 'fadeIn .3s ease' }}>
            <p style={{ fontWeight: 900, fontSize: 17, color: 'var(--ink)', margin: '0 0 4px' }}>
              함께 읽을 친구들
            </p>
            <p style={{ fontSize: 13, color: 'var(--ink-3)', margin: '0 0 18px' }}>
              마을에 자동으로 초대됐어요
            </p>
            {DEMO_MEMBERS.map(m => (
              <div key={m.handle} className="rg-card"
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', marginBottom: 10 }}>
                <NestIcon stage={m.stage} size={36} isLit={false} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 800, fontSize: 13, color: 'var(--ink)', margin: 0 }}>
                    {m.name}
                  </p>
                  <p style={{ fontSize: 11, color: 'var(--ink-3)', margin: 0 }}>@{m.handle}</p>
                </div>
                <span style={{
                  fontSize: 12, fontWeight: 700, color: 'var(--brand-3)',
                  background: 'var(--brand-tint)', borderRadius: 8, padding: '3px 9px',
                }}>
                  초대됨
                </span>
              </div>
            ))}
            <button
              onClick={handleCreate}
              style={{
                width: '100%', marginTop: 8, padding: '14px 0', borderRadius: 16, border: 'none',
                background: 'var(--brand)', color: '#fff',
                fontWeight: 800, fontSize: 15, cursor: 'pointer', fontFamily: 'inherit',
                borderBottom: '5px solid var(--brand-shadow)',
              }}>
              🏘️ 마을 만들기!
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ── VillageView 최상위 ────────────────────────────────────────────────────────
const VillageView = ({ state, onStateChange }) => {
  const [screen, setScreen] = React.useState('home');

  const village = state.village; // null → 미참여
  const pokes   = state.pokes || {};

  const handleCreateDone = newVillage => {
    onStateChange(prev => ({ ...prev, village: newVillage }));
    setScreen('home');
    window._showToast && window._showToast('🏘️ 마을이 만들어졌어요!');
  };

  if (screen === 'create') {
    return (
      <VillageCreateFlow
        onBack={() => setScreen('home')}
        onDone={handleCreateDone}
      />
    );
  }

  if (!village) {
    return <VillageEmpty onCreateVillage={() => setScreen('create')} />;
  }

  return (
    <VillageInternal
      village={village}
      pokes={pokes}
      onStateChange={onStateChange}
    />
  );
};

window.VillageView = VillageView;
