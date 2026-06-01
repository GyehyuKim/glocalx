/* =========================================================
   ReadingGo — components.js
   공용 UI 컴포넌트: Toast, SentenceCard, Confetti
   ========================================================= */
const { useState, useEffect, useRef, useCallback } = React;

/* ── Toast (전역 싱글턴) ──────────────────────────────── */
let _toastTimer = null;
let _setToastFn = null;

function showToast(msg) {
  if (_setToastFn) {
    _setToastFn(msg);
    clearTimeout(_toastTimer);
    _toastTimer = setTimeout(() => _setToastFn(''), 2200);
  }
}

function Toast() {
  const [msg, setMsg] = useState('');
  _setToastFn = setMsg;
  return (
    <div className={'toast' + (msg ? ' show' : '')}>{msg}</div>
  );
}

/* ── Confetti ─────────────────────────────────────────── */
function Confetti({ active, nestUp }) {
  const boxRef = useRef(null);
  useEffect(() => {
    if (!active || !boxRef.current) return;
    const box = boxRef.current;
    box.innerHTML = '';
    const colors = ['#3FD17F','#FFC233','#FF8A3D','#5AB5F0','#F08A9A','#B690F0','#2EB867','#FFD66B'];
    const n = nestUp ? 36 : 18;
    for (let i = 0; i < n; i++) {
      const el = document.createElement('i');
      el.style.left = (Math.random() * 100) + '%';
      el.style.background = colors[Math.floor(Math.random() * colors.length)];
      el.style.animationDuration = (1.6 + Math.random() * 1.4) + 's';
      el.style.animationDelay = (Math.random() * 0.25) + 's';
      el.style.transform = `rotate(${Math.random() * 360}deg)`;
      el.style.width = (6 + Math.random() * 8) + 'px';
      el.style.height = (10 + Math.random() * 10) + 'px';
      box.appendChild(el);
    }
    const t = setTimeout(() => { if (box) box.innerHTML = ''; }, 3200);
    return () => clearTimeout(t);
  }, [active]);
  return <div className="confetti" ref={boxRef} />;
}

/* ── SentenceCard ─────────────────────────────────────── */
function SentenceCard({ item, bookId }) {
  const sentenceId = `${bookId}:${item.page}:${item.nick}`;
  // 본인 카드(짹·책갈피 비활성) — 현재 사용자 jerome(🐦) 판정 (social.md §5.7)
  const isMine = item.nick === '@jerome' || item.nick === 'jerome';
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const bk = getBook(bookId);
  const likeCount = (item.claps || 0) + (liked ? 1 : 0);
  const toggleLike = () => {
    if (isMine) return;
    setLiked(DataStore.claps.toggle(sentenceId));
  };
  const toggleBookmark = () => {
    if (isMine) return;
    setBookmarked(DataStore.bookmarks.toggle(sentenceId));
  };
  const mineStyle = isMine ? { opacity: 0.4, pointerEvents: 'none' } : undefined;
  return (
    <div className="sentence-card">
      <div className="who">
        <div className="avatar">{item.avatar}</div>
        <div className="nick">{item.nick}</div>
        <div className="meta">{bk ? bk.title + ' · ' : ''}{item.page}p · {item.time}</div>
      </div>
      <div className="quote">"{item.q}"</div>
      <div className="react">
        <span className={'chip' + (liked ? ' active' : '')} style={mineStyle} onClick={toggleLike}>
          짹 {likeCount}
        </span>
        <span className={'chip' + (bookmarked ? ' active' : '')} style={mineStyle} onClick={toggleBookmark}>
          🔖
        </span>
      </div>
    </div>
  );
}

window.showToast = showToast;
window.Toast = Toast;
window.Confetti = Confetti;
window.SentenceCard = SentenceCard;
