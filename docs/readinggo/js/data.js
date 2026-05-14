// data.js — localStorage helpers, seed data, TSV loader, state schema
// window exports at bottom

// ── localStorage helper ────────────────────────────────────────────────────────
const LS = {
  get: (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};

// ── Nest evolution stages (§5.2) ───────────────────────────────────────────────
const NEST_STAGES = [
  { max: 20,  name: '나뭇가지 자리', emoji: '🪵', color: '#AFAFAF', bg: '#f3f4f6' },
  { max: 50,  name: '빈 둥지',       emoji: '🪹', color: '#F59E0B', bg: '#FEF3C7' },
  { max: 80,  name: '따뜻한 둥지',   emoji: '🏠', color: '#58CC02', bg: '#F0FDF4' },
  { max: 99,  name: '다정한 집',     emoji: '🏡', color: '#1CB0F6', bg: '#EFF6FF' },
  { max: 100, name: '참새의 성',     emoji: '🏰', color: '#CE82FF', bg: '#FAF5FF' },
];
const getNestStage = pct => NEST_STAGES.find(s => pct <= s.max) || NEST_STAGES[4];

// ── Seed data (Phase 0 시뮬레이션) ────────────────────────────────────────────
const SEED_FRIENDS = [
  { id: 'npc1', handle: 'book_bear',        name: '책읽는곰돌이', stage: 3, isLit: true,
    sentence: '"역사는 언제나 승자의 기록이다. 그러나 우리는 그 너머를 봐야 한다."', isNpc: true },
  { id: 'npc2', handle: 'activist_raccoon', name: '활자라쿤',     stage: 4, isLit: true,
    sentence: '"빅브라더는 당신을 지켜보고 있다. 그것도 당신 안에서."',             isNpc: true },
  { id: 'f1',   handle: 'gyehyu',           name: '계휴',         stage: 4, isLit: true,
    sentence: '"별은 아름답다, 모래들이 아름답듯이."' },
  { id: 'f2',   handle: 'seungwon',         name: '승원',         stage: 2, isLit: false, sentence: '' },
];

const SEED_LEAGUE = [
  { handle: 'gyehyu',           name: '계휴',         xp: 420 },
  { handle: 'activist_raccoon', name: '활자라쿤',     xp: 380, isNpc: true },
  { handle: 'me',               name: '나',           xp: 240, isMe: true },
  { handle: 'seungwon',         name: '승원',         xp: 180 },
  { handle: 'book_bear',        name: '책읽는곰돌이',  xp: 120, isNpc: true },
];

const SEED_FEED = [
  { id: 'fd1', handle: 'gyehyu',           name: '계휴',         book: '어린 왕자',
    sentence: '"별은 아름답다, 모래들이 아름답듯이."',        time: '2시간 전', claps: 3, sympathy: 2, saves: 1 },
  { id: 'fd2', handle: 'activist_raccoon', name: '활자라쿤',     book: '1984',
    sentence: '"빅브라더는 당신을 지켜보고 있다."',             time: '4시간 전', claps: 7, sympathy: 4, saves: 3 },
  { id: 'fd3', handle: 'book_bear',        name: '책읽는곰돌이',  book: '사피엔스',
    sentence: '"역사는 언제나 승자의 기록이다."',               time: '어제',     claps: 5, sympathy: 1, saves: 2 },
];

// ── TSV loader ─────────────────────────────────────────────────────────────────
let _booksCache = null;
async function loadBooks() {
  if (_booksCache) return _booksCache;
  try {
    const res = await fetch('data/books.tsv');
    const text = await res.text();
    const lines = text.trim().split('\n');
    const headers = lines[0].split('\t').map(h => h.trim());
    _booksCache = lines.slice(1).filter(l => l.trim()).map(line => {
      const vals = line.split('\t');
      const obj = {};
      headers.forEach((h, i) => { obj[h] = (vals[i] || '').trim(); });
      obj.total_pages = parseInt(obj.total_pages) || 0;
      return obj;
    });
    return _booksCache;
  } catch { return []; }
}

// 클라이언트 fuzzy 검색 (Phase 0 — Fuse.js 없이 includes 기반)
function fuzzySearch(books, q) {
  if (!q.trim()) return books;
  const low = q.toLowerCase().trim();
  return books.filter(b =>
    b.title.toLowerCase().includes(low) ||
    b.author.toLowerCase().includes(low) ||
    (b.isbn || '').includes(low)
  );
}

// ── Utils ──────────────────────────────────────────────────────────────────────
function genId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
function todayISO() {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}
function todayLabel() {
  const d = new Date();
  return `${d.getMonth() + 1}/${d.getDate()}`;
}
function calcLevel(xp) {
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

// ── App state schema (Phase 0 localStorage) ────────────────────────────────────
//
// userBooks[] = [{
//   id, book:{book_id,isbn,title,author,total_pages,cover_url,...},
//   currentPage, status:'reading'|'completed',
//   sessions:[{id,sessionDate,currentPage,xpEarned,createdAt}],
//   sentences:[{id,text,page,sessionId,createdAt}]
// }]

const INITIAL_STATE = {
  appPhase: 'onboarding',   // 'onboarding' | 'home'
  onboardingStep: 'A',      // A | C1 | C2 | D1 | D2 | D3 | E
  onboardingBook: null,          // book object from C1
  onboardingPage: 0,             // session last page from D1
  onboardingText: '',            // sentence text from D2
  onboardingSentencePage: null,  // sentence-specific page from D2 (null = use onboardingPage)
  user: { handle: '', displayName: '나', xp: 0, level: 1, streak: 0, shields: 0 },
  userBooks: [],
  activeUserBookId: null,
  feed: SEED_FEED,
  friends: SEED_FRIENDS,
  leagueData: SEED_LEAGUE,
  clappedFeed: {},          // feedId -> bool
  sympathyFeed: {},         // feedId -> bool
  savedFeed: {},            // feedId -> bool
  pokes: {},                // friendId -> bool (오늘 보냈는지)
};

function loadAppState() {
  const s = LS.get('rg_v41', null);
  if (!s) return { ...INITIAL_STATE };
  // 새 필드 merge
  return {
    ...INITIAL_STATE,
    ...s,
    user: { ...INITIAL_STATE.user, ...(s.user || {}) },
    feed: s.feed || SEED_FEED,
    friends: s.friends || SEED_FRIENDS,
    leagueData: s.leagueData || SEED_LEAGUE,
  };
}

function getActiveBook(state) {
  if (!state.activeUserBookId) return null;
  return state.userBooks.find(ub => ub.id === state.activeUserBookId) || null;
}

function hasDoneToday(userBook) {
  if (!userBook) return false;
  const today = todayISO();
  return (userBook.sessions || []).some(s => s.sessionDate === today);
}

// ── window exports ─────────────────────────────────────────────────────────────
window.LS            = LS;
window.NEST_STAGES   = NEST_STAGES;
window.getNestStage  = getNestStage;
window.SEED_FRIENDS  = SEED_FRIENDS;
window.SEED_LEAGUE   = SEED_LEAGUE;
window.SEED_FEED     = SEED_FEED;
window.loadBooks     = loadBooks;
window.fuzzySearch   = fuzzySearch;
window.genId         = genId;
window.todayISO      = todayISO;
window.todayLabel    = todayLabel;
window.calcLevel     = calcLevel;
window.INITIAL_STATE = INITIAL_STATE;
window.loadAppState  = loadAppState;
window.getActiveBook = getActiveBook;
window.hasDoneToday  = hasDoneToday;
