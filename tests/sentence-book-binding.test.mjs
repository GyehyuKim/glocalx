// 한 문장 책 귀속 회귀 테스트 (#565)
//
// 실제 docs/readinggo/js/datastore.js 를 node vm 에서 실행(localStorage·INITIAL_STATE 스텁)하여
// sentences.add 가 명시 userBookId 에 정확히 저장하고, 무효 ID 를 active 책으로 폴백하지 않음을 검증.
//
// 실행: node tests/sentence-book-binding.test.mjs
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = fs.readFileSync(path.join(root, 'docs/readinggo/js/datastore.js'), 'utf8');

function makeDS() {
  const initState = {
    user_books: [
      { id: 'ubA', book_id: 'bookA', book: { id: 'bookA', title: '가치관의 탄생', isbn13: '111' }, current_page: 16, status: 'reading', sentences: [] },
      { id: 'ubB', book_id: 'bookB', book: { id: 'bookB', title: '브람스를 좋아하세요', isbn13: '222' }, current_page: 20, status: 'reading', sentences: [] },
    ],
    active_user_book_id: 'ubA', // 전역 활성 책 = A
    bookmarks: {}, wish_books: [], sessions: [], pending: {},
  };
  let store = JSON.stringify(initState);
  const sandbox = {
    window: { INITIAL_STATE: { book: null, streak: 0, xp: 0, myQuotes: [] } },
    console,
    localStorage: {
      getItem: (k) => (k === 'rg_v41' ? store : null),
      setItem: (k, v) => { if (k === 'rg_v41') store = v; },
      removeItem: () => {},
    },
  };
  vm.createContext(sandbox);
  vm.runInContext(src, sandbox);
  return sandbox.window.DataStore;
}

let pass = 0, fail = 0;
function check(name, cond) { if (cond) { pass++; console.log('OK   ' + name); } else { fail++; console.error('FAIL ' + name); } }

// 1. A↔B 전환 직후 B 의 ubId 로 저장 → book_id 가 B (활성 책 A 가 아님)
{
  const DS = makeDS();
  const row = DS.sentences.add({ userBookId: 'ubB', page: 20, text: '로제 이외의 누군가를…', kind: 'quote' });
  check('1. B ubId 저장 → book_id=bookB (활성 A 아님)', row && row.book_id === 'bookB');
  check('1. user_book_id=ubB', row && row.user_book_id === 'ubB');
}

// 2. 무효 명시 userBookId → active(A) 폴백하지 않고 실패(null)
{
  const DS = makeDS();
  const row = DS.sentences.add({ userBookId: 'nonexistent', page: 5, text: 'x', kind: 'quote' });
  check('2. 무효 ID → null (active A 로 저장 안 함)', row === null);
}

// 3. userBookId 미명시(레거시 호출) → active(A) 사용(기존 호환 보존)
{
  const DS = makeDS();
  const row = DS.sentences.add({ page: 16, text: '레거시', kind: 'quote' });
  check('3. userBookId 미명시 → active(ubA) book_id=bookA', row && row.book_id === 'bookA');
}

// 4. A 의 ubId 로 저장 → book_id=A (정상 케이스)
{
  const DS = makeDS();
  const row = DS.sentences.add({ userBookId: 'ubA', page: 16, text: '정상', kind: 'quote' });
  check('4. A ubId 저장 → book_id=bookA', row && row.book_id === 'bookA');
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
