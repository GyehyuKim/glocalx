// village.js — 마을 탭 (파트 칩 + 독서평 바텀시트 + 찌르기 인-컨텍스트)
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

// ── 독서평 카드: 공개 ─────────────────────────────────────────────────────────
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

// ── 독서평 카드: 잠금(블러) ───────────────────────────────────────────────────
const LockedReviewCard = ({ review }) => (
  <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden' }}>
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
    <div style={{
      position: 'absolute', inset: 0, display: 'flex',
      alignItems: 'center', justifyContent: 'center', gap: 6,
    }}>
      <span style={{ fontSize: 18 }}>🔒</span>
      <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--ink-2)' }}>{review.name}</span>
    </div>
  </div>
);

// ── 파트 칩 바 (헤더 바로 아래) ──────────────────────────────────────────────
const PartChipBar = ({ parts, members, selectedPart, onSelect }) => {
  const getStatus = part => {
    if (members.every(m => m.currentPage >= part.endPage)) return 'done';
    if (members.some(m => m.currentPage >= part.startPage && m.currentPage < part.endPage)) return 'active';
    return 'locked';
  };

  const BG    = { done: 'var(--brand-tint)', active: 'var(--gold-soft)',  locked: 'var(--line)' };
  const BGSEL = { done: 'var(--brand)',       active: 'var(--gold)',        locked: '#4A4A4A' };
  const FG    = { done: 'var(--brand-3)',     active: '#C8901C',            locked: 'var(--ink-3)' };
  const ICON  = { done: '✓',                  active: '●',                  locked: '—' };
  const SHD   = { done: 'var(--brand-shadow)', active: 'var(--gold-shadow)', locked: '#333' };

  return (
    <div style={{
      display: 'flex', gap: 8, overflowX: 'auto', padding: '10px 16px 10px',
      borderBottom: '1.5px solid var(--line)', background: '#fff',
      WebkitOverflowScrolling: 'touch',
    }}>
      {parts.map(part => {
        const status = getStatus(part);
        const sel = selectedPart?.order === part.order;
        return (
          <button key={part.order} onClick={() => onSelect(part)} style={{
            flexShrink: 0, display: 'flex', alignItems: 'center', gap: 5,
            padding: '7px 13px', borderRadius: 20, border: 'none',
            cursor: 'pointer', fontFamily: 'inherit', fontWeight: 800, fontSize: 12,
            background: sel ? BGSEL[status] : BG[status],
            color: sel ? '#fff' : FG[status],
            borderBottom: sel ? `3px solid ${SHD[status]}` : 'none',
            transition: 'background .15s, color .15s',
          }}>
            <span className="rg-pixel" style={{ fontSize: 11 }}>{part.order}</span>
            <span style={{ fontSize: 11 }}>{ICON[status]}</span>
          </button>
        );
      })}
    </div>
  );
};

// ── 파트 독서평 바텀시트 ──────────────────────────────────────────────────────
const PartReviewSheet = ({ village, part, pokes, onPoke, onWriteReview, onClose }) => {
  const partReviews = village.reviews.filter(r => r.partOrder === part.order);
  const revealedCnt = partReviews.filter(r => r.revealed).length;
  const allRevealed = partReviews.length > 0 && revealedCnt === partReviews.length;
  const blockers    = village.members.filter(m => m.currentPage < part.endPage);
  const myReview    = partReviews.find(r => r.handle === 'me');

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 50,
      background: 'rgba(0,0,0,.5)', display: 'flex', alignItems: 'flex-end',
    }} onClick={onClose}>
      <div style={{
        width: '100%', background: '#fff', borderRadius: '24px 24px 0 0',
        maxHeight: '84%', overflowY: 'auto',
        animation: 'slideUp .3s ease',
      }} onClick={e => e.stopPropagation()}>

        {/* 드래그 핸들 */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 0' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--line)' }} />
        </div>

        {/* 파트 헤더 */}
        <div style={{ padding: '12px 20px 14px', borderBottom: '1.5px solid var(--line)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontWeight: 900, fontSize: 16, color: 'var(--ink)', margin: 0 }}>
                파트 {part.order}: {part.title}
              </p>
              <p style={{ fontSize: 11, color: 'var(--ink-3)', margin: '2px 0 0' }}>
                <span className="rg-pixel">p.{part.startPage}–{part.endPage}</span>
                &nbsp;({part.endPage - part.startPage + 1}쪽)
              </p>
            </div>
            <div style={{
              borderRadius: 10, padding: '4px 10px',
              background: allRevealed ? 'var(--brand-soft)' : 'rgba(63,209,127,.12)',
            }}>
              <span className="rg-pixel" style={{
                fontSize: 13, fontWeight: 800,
                color: allRevealed ? 'var(--brand-3)' : 'var(--brand)',
              }}>
                {revealedCnt}/{partReviews.length}
              </span>
            </div>
          </div>
        </div>

        <div style={{ padding: '16px 20px 36px' }}>
          {/* 멤버 진행도 + 찌르기 */}
          <p style={{ fontSize: 12, fontWeight: 800, color: 'var(--ink-3)', margin: '0 0 10px' }}>
            멤버 진행도
          </p>
          {village.members.map(member => {
            const pct     = getMemberPartPct(member, part);
            const done    = member.currentPage >= part.endPage;
            const poked   = !!(pokes || {})[member.handle];
            const blocker = blockers.some(b => b.handle === member.handle);
            return (
              <div key={member.handle} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{
                    fontSize: 12, fontWeight: 800, flex: 1,
                    color: done ? 'var(--brand)' : 'var(--ink-2)',
                  }}>
                    {member.name}{done ? ' ✓' : ''}
                  </span>
                  <span className="rg-pixel" style={{ fontSize: 10, color: 'var(--ink-3)' }}>
                    {pct}%
                  </span>
                  {/* 찌르기 — 뒤처진 멤버 옆에만 표시 (본인 제외) */}
                  {blocker && !member.isMe && (
                    <button
                      onClick={() => !poked && onPoke(member.handle)}
                      disabled={poked}
                      style={{
                        padding: '4px 10px', borderRadius: 8, border: 'none',
                        cursor: poked ? 'not-allowed' : 'pointer',
                        fontWeight: 800, fontSize: 11, fontFamily: 'inherit',
                        background:   poked ? 'var(--line)' : 'var(--brand)',
                        color:        poked ? 'var(--ink-3)' : '#fff',
                        borderBottom: poked ? 'none' : '2px solid var(--brand-shadow)',
                      }}>
                      {poked ? '보냄 ✓' : '🪱 찌르기'}
                    </button>
                  )}
                </div>
                <div style={{ height: 5, background: 'var(--line)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', width: `${pct}%`, borderRadius: 4,
                    background: done ? 'var(--brand)' : blocker ? 'var(--gold)' : 'var(--brand)',
                    transition: 'width .4s ease',
                  }} />
                </div>
              </div>
            );
          })}

          {/* 상태 메시지 */}
          {!allRevealed && blockers.length > 0 && (
            <div style={{
              background: '#1F1F1F', borderRadius: 12,
              padding: '10px 14px', margin: '4px 0 16px',
            }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,.8)', margin: 0 }}>
                🔒&nbsp;
                <span style={{ color: 'var(--gold)', fontWeight: 900 }}>
                  {blockers.map(b => b.name).join(', ')}
                </span>
                님이 완독하면 독서평이 공개돼요
              </p>
            </div>
          )}
          {allRevealed && (
            <div style={{
              background: 'var(--brand-soft)', borderRadius: 12,
              padding: '10px 14px', margin: '4px 0 16px',
            }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--brand-3)', margin: 0 }}>
                🎉 모든 멤버 완독! 독서평이 공개됐어요
              </p>
            </div>
          )}

          {/* 독서평 카드들 */}
          {partReviews.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 16 }}>
              {partReviews.map(review => {
                const stage = (village.members.find(m => m.handle === review.handle) || {}).stage || 1;
                return review.revealed
                  ? <RevealedReviewCard key={review.handle} review={review} stage={stage} />
                  : <LockedReviewCard   key={review.handle} review={review} />;
              })}
            </div>
          ) : (
            <div style={{
              background: 'var(--paper)', borderRadius: 14, padding: '16px',
              textAlign: 'center', marginBottom: 16,
            }}>
              <p style={{ fontSize: 13, color: 'var(--ink-3)', fontWeight: 600, margin: 0 }}>
                아직 남긴 독서평이 없어요
              </p>
            </div>
          )}

          {/* 독서평 작성 CTA */}
          {!myReview ? (
            <button
              onClick={onWriteReview}
              style={{
                width: '100%', padding: '13px 0', borderRadius: 14, border: 'none',
                background: 'var(--brand)', color: '#fff',
                fontWeight: 800, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit',
                borderBottom: '5px solid var(--brand-shadow)',
              }}>
              ✏️ 독서평 남기기
            </button>
          ) : (
            <div style={{
              background: 'var(--brand-tint)', borderRadius: 12,
              padding: '10px 14px', textAlign: 'center',
            }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--brand-3)', margin: 0 }}>
                📝 독서평 저장됨 — 모두 완독하면 공개돼요
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── 내 진도 업데이트 시트 ─────────────────────────────────────────────────────
const MyProgressSheet = ({ village, onClose, onUpdate }) => {
  const me = village.members.find(m => m.isMe);
  const [pageStr, setPageStr] = React.useState(String(me?.currentPage || 1));
  const pageNum = parseInt(pageStr) || 0;
  const valid   = pageNum > 0 && pageNum <= village.totalPages;
  const curPart = valid ? getPartForPage(village.parts, pageNum) : null;

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 60,
      background: 'rgba(0,0,0,.55)', display: 'flex', alignItems: 'flex-end',
    }} onClick={onClose}>
      <div style={{
        width: '100%', background: '#fff', borderRadius: '24px 24px 0 0',
        padding: '12px 20px 40px', animation: 'slideUp .3s ease',
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '0 0 12px' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--line)' }} />
        </div>
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', marginBottom: 16,
        }}>
          <p style={{ fontWeight: 900, fontSize: 16, color: 'var(--ink)', margin: 0 }}>
            내 진도 업데이트
          </p>
          <button onClick={onClose} className="rg-btn-icon"><XIcon s={20} /></button>
        </div>
        <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-3)', margin: '0 0 8px' }}>
          몇 페이지까지 읽었어요?
        </p>
        <input
          type="number"
          value={pageStr}
          onChange={e => setPageStr(e.target.value)}
          min={1}
          max={village.totalPages}
          className="rg-input"
          style={{ display: 'block', marginBottom: 8 }}
          autoFocus
        />
        <p style={{ fontSize: 11, color: 'var(--ink-3)', margin: '0 0 12px' }}>
          총&nbsp;<span className="rg-pixel">{village.totalPages}</span>페이지
        </p>
        {curPart && (
          <div style={{
            background: 'var(--brand-tint)', borderRadius: 12,
            padding: '10px 13px', marginBottom: 14,
          }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--brand-3)', margin: 0 }}>
              📖 파트 {curPart.order}: {curPart.title}
            </p>
          </div>
        )}
        <button
          onClick={() => valid && onUpdate(pageNum)}
          style={{
            width: '100%', padding: '14px 0', borderRadius: 14, border: 'none',
            background: valid ? 'var(--brand)' : 'var(--line)',
            color: valid ? '#fff' : 'var(--ink-3)',
            fontWeight: 800, fontSize: 15,
            cursor: valid ? 'pointer' : 'not-allowed',
            fontFamily: 'inherit',
            borderBottom: valid ? '5px solid var(--brand-shadow)' : 'none',
          }}>
          업데이트하기
        </button>
      </div>
    </div>
  );
};

// ── 독서평 작성 시트 ──────────────────────────────────────────────────────────
const WriteReviewSheet = ({ partTitle, onClose, onSubmit }) => {
  const [text, setText] = React.useState('');
  const canSubmit = text.trim().length >= 10;

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 70,
      background: 'rgba(0,0,0,.55)', display: 'flex', alignItems: 'flex-end',
    }} onClick={onClose}>
      <div style={{
        width: '100%', background: '#fff', borderRadius: '24px 24px 0 0',
        padding: '12px 16px 40px', animation: 'slideUp .3s ease',
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '0 0 12px' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--line)' }} />
        </div>
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', marginBottom: 14,
        }}>
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
          style={{ minHeight: 100, resize: 'none', display: 'block', marginBottom: 6 }}
          maxLength={300}
          autoFocus
        />
        <p style={{ fontSize: 11, color: 'var(--ink-3)', textAlign: 'right', margin: '0 0 10px' }}>
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

// ── 멤버 그리드 ───────────────────────────────────────────────────────────────
const MemberGrid = ({ village, onMyCardTap }) => {
  const [detail, setDetail] = React.useState(null);

  return (
    <>
      <p style={{ fontWeight: 900, fontSize: 14, color: 'var(--ink)', margin: '0 0 10px' }}>
        🏘️ 마을 멤버
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
        {village.members.map(member => {
          const part       = getPartForPage(village.parts, member.currentPage);
          const overallPct = Math.round((member.currentPage / village.totalPages) * 100);
          return (
            <div key={member.handle}
              className="rg-card"
              onClick={() => member.isMe ? onMyCardTap() : setDetail(member)}
              style={{
                padding: 12, cursor: 'pointer',
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
              <p style={{
                fontSize: 10, color: 'var(--ink-3)', fontWeight: 600, margin: '0 0 2px',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {part ? part.title : '—'}
              </p>
              <p className="rg-pixel" style={{
                fontSize: 14, fontWeight: 800, color: 'var(--ink)', margin: '0 0 8px',
              }}>
                p.{member.currentPage}
                <span style={{ fontFamily: 'inherit', fontSize: 10, color: 'var(--ink-3)', fontWeight: 600 }}>
                  &nbsp;/{village.totalPages}
                </span>
              </p>
              {/* 전체 진행 바 */}
              <div style={{ height: 4, background: 'var(--line)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: `${overallPct}%`,
                  background: member.isMe ? 'var(--brand)' : 'var(--gold)',
                  borderRadius: 3,
                }} />
              </div>
              {/* 내 카드: 탭 힌트 */}
              {member.isMe && (
                <p style={{ fontSize: 10, color: 'var(--brand-3)', fontWeight: 700, margin: '6px 0 0' }}>
                  탭해서 진도 업데이트 →
                </p>
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
            padding: '12px 20px 44px', maxHeight: '60%', overflowY: 'auto',
            animation: 'slideUp .3s ease',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'center', padding: '0 0 12px' }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--line)' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <NestIcon stage={detail.stage} size={44} isLit={false} />
                <div>
                  <p style={{ fontWeight: 900, fontSize: 16, color: 'var(--ink)', margin: 0 }}>
                    {detail.name}
                  </p>
                  <p style={{ fontSize: 12, color: 'var(--ink-3)', margin: 0 }}>@{detail.handle}</p>
                </div>
              </div>
              <button onClick={() => setDetail(null)} className="rg-btn-icon">
                <XIcon s={20} />
              </button>
            </div>
            <div style={{ background: 'var(--paper)', borderRadius: 14, padding: '14px 16px' }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-3)', margin: '0 0 4px' }}>
                현재 진도
              </p>
              <p className="rg-pixel" style={{ fontSize: 22, fontWeight: 800, color: 'var(--ink)', margin: 0 }}>
                p.{detail.currentPage}
                <span style={{ fontFamily: 'inherit', fontSize: 13, color: 'var(--ink-3)', fontWeight: 600 }}>
                  /{village.totalPages}
                </span>
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

// ── 마을 내부 뷰 ──────────────────────────────────────────────────────────────
const VillageInternal = ({ village, pokes, onStateChange }) => {
  const [selectedPart,    setSelectedPart]    = React.useState(null);
  const [writeReviewPart, setWriteReviewPart] = React.useState(null);
  const [showMyProgress,  setShowMyProgress]  = React.useState(false);

  const onPoke = handle => {
    onStateChange(prev => ({
      ...prev,
      pokes: { ...(prev.pokes || {}), [handle]: true },
    }));
    window._showToast && window._showToast('🪱 모이를 보냈어요!');
  };

  const onUpdateMyPage = page => {
    onStateChange(prev => {
      const v = prev.village || SEED_VILLAGE;
      return {
        ...prev,
        village: {
          ...v,
          members: v.members.map(m => m.isMe ? { ...m, currentPage: page } : m),
        },
      };
    });
    setShowMyProgress(false);
    window._showToast && window._showToast('📖 진도가 업데이트됐어요!');
  };

  const onSubmitReview = (text, partOrder) => {
    onStateChange(prev => {
      const v = prev.village || SEED_VILLAGE;
      const filtered = v.reviews.filter(
        r => !(r.handle === 'me' && r.partOrder === partOrder)
      );
      return {
        ...prev,
        village: {
          ...v,
          reviews: [...filtered, {
            handle: 'me', name: '나', partOrder, text, revealed: false,
          }],
        },
      };
    });
    setWriteReviewPart(null);
    window._showToast && window._showToast('📝 독서평 저장! 모두 완독하면 공개돼요.');
  };

  return (
    <div className="rg-screen" style={{ position: 'relative' }}>
      {/* 헤더 */}
      <div className="rg-tab-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
            background: 'var(--brand-tint)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
          }}>
            📚
          </div>
          <div>
            <p style={{ fontWeight: 900, fontSize: 16, color: 'var(--ink)', margin: 0 }}>
              {village.bookTitle}
            </p>
            <p style={{ fontSize: 11, color: 'var(--ink-3)', margin: 0 }}>
              {village.members.length}명 함께 읽는 중
              &nbsp;·&nbsp;
              <span style={{ color: 'var(--brand-3)', fontWeight: 700 }}>
                파트를 눌러 독서평 확인
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* 파트 칩 바 — 헤더 바로 아래 고정 */}
      <PartChipBar
        parts={village.parts}
        members={village.members}
        selectedPart={selectedPart}
        onSelect={p => setSelectedPart(prev => prev?.order === p.order ? null : p)}
      />

      {/* 스크롤 영역 */}
      <div className="rg-scroll">
        <MemberGrid
          village={village}
          onMyCardTap={() => setShowMyProgress(true)}
        />
        <VillageBoardCard village={village} />
      </div>

      {/* 파트 독서평 바텀시트 */}
      {selectedPart && (
        <PartReviewSheet
          village={village}
          part={selectedPart}
          pokes={pokes}
          onPoke={onPoke}
          onWriteReview={() => {
            setWriteReviewPart(selectedPart);
            setSelectedPart(null);
          }}
          onClose={() => setSelectedPart(null)}
        />
      )}

      {/* 독서평 작성 시트 */}
      {writeReviewPart && (
        <WriteReviewSheet
          partTitle={`파트 ${writeReviewPart.order}: ${writeReviewPart.title}`}
          onClose={() => setWriteReviewPart(null)}
          onSubmit={text => onSubmitReview(text, writeReviewPart.order)}
        />
      )}

      {/* 내 진도 업데이트 시트 */}
      {showMyProgress && (
        <MyProgressSheet
          village={village}
          onClose={() => setShowMyProgress(false)}
          onUpdate={onUpdateMyPage}
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
    try {
      const chapters = await loadTOC(book.isbn);
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
    onDone({
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
    });
  };

  return (
    <div className="rg-screen">
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
        {step === 1 && (
          <div style={{ animation: 'fadeIn .3s ease' }}>
            <p style={{ fontWeight: 900, fontSize: 17, color: 'var(--ink)', margin: '0 0 6px' }}>
              어떤 책을 함께 읽을까요?
            </p>
            <p style={{ fontSize: 13, color: 'var(--ink-3)', margin: '0 0 20px' }}>
              목차를 자동으로 불러와 파트를 나눠드려요
            </p>
            {DEMO_BOOKS.map(book => (
              <button key={book.isbn} onClick={() => handleSelectBook(book)} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                padding: '14px 16px', borderRadius: 16,
                border: '2px solid var(--line)', background: '#fff',
                cursor: 'pointer', fontFamily: 'inherit', marginBottom: 10, textAlign: 'left',
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 10, background: 'var(--brand-tint)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22, flexShrink: 0,
                }}>📖</div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 800, fontSize: 14, color: 'var(--ink)', margin: 0 }}>
                    {book.title}
                  </p>
                  <p style={{ fontSize: 12, color: 'var(--ink-3)', margin: 0 }}>{book.author}</p>
                </div>
                <svg style={{ color: 'var(--ink-3)', flexShrink: 0 }} width="16" height="16"
                  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            ))}
          </div>
        )}

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
                <div style={{ fontSize: 44, marginBottom: 14, animation: 'bounce 1.4s ease-in-out infinite' }}>
                  📖
                </div>
                <p style={{ fontWeight: 800, fontSize: 14, color: 'var(--ink-2)', margin: 0 }}>
                  목차 불러오는 중...
                </p>
              </div>
            ) : tocParts && (
              <>
                <div style={{ background: 'var(--brand-tint)', borderRadius: 14, padding: '10px 14px', marginBottom: 14 }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--brand-3)', margin: 0 }}>
                    ✨ <span className="rg-pixel">{tocParts.length}</span>개 파트로 자동 분할됐어요!
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
                        <span className="rg-pixel" style={{ fontSize: 13, fontWeight: 800, color: 'var(--brand-3)' }}>
                          {part.order}
                        </span>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{
                          fontWeight: 700, fontSize: 13, color: 'var(--ink)', margin: 0,
                          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        }}>{part.title}</p>
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
                <button onClick={() => setStep(3)} style={{
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
                  <p style={{ fontWeight: 800, fontSize: 13, color: 'var(--ink)', margin: 0 }}>{m.name}</p>
                  <p style={{ fontSize: 11, color: 'var(--ink-3)', margin: 0 }}>@{m.handle}</p>
                </div>
                <span style={{
                  fontSize: 12, fontWeight: 700, color: 'var(--brand-3)',
                  background: 'var(--brand-tint)', borderRadius: 8, padding: '3px 9px',
                }}>초대됨</span>
              </div>
            ))}
            <button onClick={handleCreate} style={{
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
  const village = state.village;
  const pokes   = state.pokes || {};

  const handleCreateDone = newVillage => {
    onStateChange(prev => ({ ...prev, village: newVillage }));
    setScreen('home');
    window._showToast && window._showToast('🏘️ 마을이 만들어졌어요!');
  };

  if (screen === 'create') {
    return <VillageCreateFlow onBack={() => setScreen('home')} onDone={handleCreateDone} />;
  }
  if (!village) {
    return <VillageEmpty onCreateVillage={() => setScreen('create')} />;
  }
  return <VillageInternal village={village} pokes={pokes} onStateChange={onStateChange} />;
};

window.VillageView = VillageView;
