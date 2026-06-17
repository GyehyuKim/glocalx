/* =========================================================
   ReadingGo — shelf-import.js  (#772 통합 서가 ① 스샷 서가 복원)
   ShelfImportModal: 구매내역/서재 캡쳐 업로드 → /api/shelf-import(비전 OCR) →
   카탈로그 매칭(loadBooks·fuzzySearch) → 검수 → DataStore.myBooks.addBatch(완독) 일괄 등록.
   components 이후 로드. window 전역(showToast·DataStore·loadBooks)은 bare/window로 호출.
   MVP: 등록 status='completed'(독서 인생 복원). 진척 status 토글·다중 업로드는 후속.
   ========================================================= */

const { useState } = React;

function ShelfImportModal({ onClose }) {
  const [phase, setPhase] = useState('upload');   // upload | loading | review
  const [rows, setRows] = useState([]);           // [{title, author, book|null, checked}]
  const [err, setErr] = useState('');

  // 추출 결과를 카탈로그와 매칭 — 매칭되면 표지·메타 확보, 실패면 제목·저자 텍스트 보존.
  const matchToCatalog = async (books) => {
    let catalog = [];
    try { catalog = (await (window.loadBooks ? window.loadBooks() : [])) || []; } catch (e) { catalog = []; }
    return (books || []).map((b) => {
      let book = null;
      try {
        const hits = (window.fuzzySearch && catalog.length) ? window.fuzzySearch(catalog, b.title) : [];
        const top = hits && hits[0];
        // 보수적 매칭: 상위 결과 제목이 추출 제목을 포함하거나 그 반대일 때만 채택(환각 표지 방지).
        if (top && top.title) {
          const a = top.title.replace(/\s+/g, ''), q = (b.title || '').replace(/\s+/g, '');
          if (a && q && (a.includes(q) || q.includes(a))) book = top;
        }
      } catch (e) { /* 매칭 실패 → 미확인 */ }
      return { title: b.title, author: b.author || (book && book.author) || '', book, checked: true };
    });
  };

  const onPick = (file) => {
    if (!file) return;
    setErr('');
    if (file.size > 8 * 1024 * 1024) { setErr('이미지가 너무 커요 (최대 8MB)'); return; }
    setPhase('loading');
    if (window.rgTrack) window.rgTrack('shelf_import_started', {});
    const fd = new FormData();
    fd.append('document', file, file.name || 'shelf.jpg');
    fetch('/api/shelf-import', { method: 'POST', body: fd })
      .then((r) => r.json())
      .then(async (d) => {
        if (d && d.demo) { setErr('데모 환경에선 서가 복원이 비활성이에요.'); setPhase('upload'); return; }
        const books = (d && Array.isArray(d.books)) ? d.books : [];
        if (!books.length) {
          setErr(d && d.empty ? '사진에서 글자를 못 찾았어요 — 더 또렷한 캡쳐로 다시 시도해요.' : '책을 찾지 못했어요 — 책 목록이 잘 보이는 캡쳐가 필요해요.');
          setPhase('upload');
          return;
        }
        const matched = await matchToCatalog(books);
        setRows(matched);
        setPhase('review');
        if (window.rgTrack) window.rgTrack('shelf_import_extracted', { count: matched.length });
      })
      .catch(() => { setErr('처리 중 문제가 생겼어요 — 잠시 후 다시 시도해요.'); setPhase('upload'); });
  };

  const toggle = (i) => setRows((rs) => rs.map((r, j) => (j === i ? { ...r, checked: !r.checked } : r)));
  const edit = (i, k, v) => setRows((rs) => rs.map((r, j) => (j === i ? { ...r, [k]: v } : r)));

  const register = () => {
    const picked = rows.filter((r) => r.checked && (r.title || '').trim());
    if (!picked.length) { setErr('등록할 책을 한 권 이상 선택해요.'); return; }
    const DS = window.DataStore || {};
    if (!(DS.myBooks && DS.myBooks.addBatch)) { setErr('등록 경로가 준비되지 않았어요.'); return; }
    // 매칭된 책은 카탈로그 메타, 미확인은 제목·저자만. status='completed'(읽은 책 복원).
    const items = picked.map((r) => ({
      book: r.book ? r.book : { title: r.title.trim(), author: (r.author || '').trim() },
      status: 'completed',
    }));
    Promise.resolve(DS.myBooks.addBatch(items))
      .then((res) => {
        const n = (res || []).length || items.length;
        if (window.rgTrack) window.rgTrack('shelf_import_registered', { count: n });
        try { window.dispatchEvent(new CustomEvent('rg:wish-changed')); } catch (e) {}
        if (window.showToast) window.showToast(`📚 ${n}권을 서가에 복원했어요! 한 문장도 남겨보세요`);
        onClose();
      })
      .catch(() => { setErr('등록 중 문제가 생겼어요 — 다시 시도해요.'); });
  };

  const checkedCount = rows.filter((r) => r.checked).length;
  const matchedCount = rows.filter((r) => r.book).length;

  return (
    <div className="modal-backdrop show" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="sheet" role="dialog" aria-label="스샷으로 서가 복원">
        <div className="sheet-grip" />
        <button onClick={onClose} aria-label="닫기" style={{ position: 'absolute', top: 10, right: 14, background: 'rgba(0,0,0,0.06)', border: 'none', borderRadius: '50%', width: 30, height: 30, fontSize: 16, cursor: 'pointer', color: 'var(--ink-2)', lineHeight: 1, zIndex: 2 }}>✕</button>
        <div style={{ padding: '8px 20px 20px' }}>
          <h2 style={{ fontSize: 18, fontWeight: 900, margin: '4px 0 6px', color: 'var(--ink)' }}>📸 스샷으로 서가 복원</h2>

          {phase === 'upload' && (
            <div>
              <p style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.6, marginBottom: 14 }}>
                알라딘·교보·밀리 등 <b>주문내역이나 내 서재 화면을 캡쳐</b>해서 올리면, 사진 속 책들을 읽어 서가에 한 번에 복원해요.
              </p>
              {err && <div style={{ fontSize: 12.5, color: 'var(--danger, #d23)', marginBottom: 10 }}>{err}</div>}
              <label className="submit-btn" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer', width: '100%', margin: 0 }}>
                사진 고르기
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => onPick(e.target.files && e.target.files[0])} />
              </label>
              <p style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 10, lineHeight: 1.5 }}>사진은 책 인식에만 쓰고 저장하지 않아요 · 최대 8MB</p>
            </div>
          )}

          {phase === 'loading' && (
            <div style={{ padding: '36px 0', textAlign: 'center', color: 'var(--ink-3)' }}>
              <div style={{ fontSize: 22, marginBottom: 8 }}>🔎</div>
              <div style={{ fontSize: 13, fontWeight: 700 }}>사진에서 책을 찾는 중…</div>
            </div>
          )}

          {phase === 'review' && (
            <div>
              <div style={{ fontSize: 12.5, color: 'var(--ink-2)', marginBottom: 10 }}>
                {rows.length}권 찾았어요 (서가 매칭 {matchedCount}권). 등록할 책을 확인하세요 — <b>다 읽은 책</b>으로 추가돼요.
              </div>
              {err && <div style={{ fontSize: 12.5, color: 'var(--danger, #d23)', marginBottom: 10 }}>{err}</div>}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: '46vh', overflowY: 'auto', marginBottom: 14 }}>
                {rows.map((r, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--card)', border: '1.5px solid var(--line)', borderRadius: 10, padding: '8px 10px', opacity: r.checked ? 1 : 0.5 }}>
                    <input type="checkbox" checked={r.checked} onChange={() => toggle(i)} aria-label="등록 선택" style={{ width: 18, height: 18, flexShrink: 0 }} />
                    <div style={{ width: 30, height: 42, flexShrink: 0, borderRadius: 4, overflow: 'hidden', background: 'var(--line)' }}>
                      {r.book && r.book.cover_url && <img src={r.book.cover_url} alt="" referrerPolicy="no-referrer" onError={(e) => (e.target.style.display = 'none')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <input value={r.title} onChange={(e) => edit(i, 'title', e.target.value)} placeholder="제목" style={{ width: '100%', border: 'none', background: 'transparent', fontSize: 13.5, fontWeight: 800, color: 'var(--ink)', padding: 0 }} />
                      <input value={r.author} onChange={(e) => edit(i, 'author', e.target.value)} placeholder="저자" style={{ width: '100%', border: 'none', background: 'transparent', fontSize: 11.5, color: 'var(--ink-3)', padding: 0, marginTop: 2 }} />
                    </div>
                    {!r.book && <span title="서가에서 못 찾음 — 제목으로 등록" style={{ fontSize: 9.5, fontWeight: 800, color: 'var(--ink-3)', background: 'var(--line)', borderRadius: 5, padding: '1px 6px', flexShrink: 0 }}>미확인</span>}
                  </div>
                ))}
              </div>
              <button className="submit-btn" style={{ width: '100%', margin: 0 }} disabled={!checkedCount} onClick={register}>
                {checkedCount}권 서가에 복원
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
window.ShelfImportModal = ShelfImportModal;
