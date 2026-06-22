import { defineConfig } from 'vite';

// ReadingGo Vite 설정 (#871) — 런타임 Babel 대체.
// 핵심: 기존 코드는 .js 안에 JSX + window 전역 공유 패턴(import/export 없음).
//   - .js 를 JSX 로 컴파일(esbuild loader) — 파일명 .js 유지(spec-align CI 가 *.js glob).
//   - classic 런타임(React.createElement) — 현 코드와 동일. React 는 setup-globals.js 가 window 에 노출.
export default defineConfig({
  // 상대경로 — Capacitor(file:// webview) 및 서브경로 배포 안전.
  base: './',
  esbuild: {
    loader: 'jsx',
    // 프로젝트 소스(js/*, main, setup-globals)만 JSX 로더 적용. node_modules 제외.
    include: /(?:\/js\/[^/]+|\/main|\/setup-globals)\.js$/,
    exclude: [],
    jsxFactory: 'React.createElement',
    jsxFragment: 'React.Fragment',
  },
  optimizeDeps: {
    // 혹시 JSX 를 담은 .js 의존이 있어도 깨지지 않게(우리 deps 엔 없음).
    esbuildOptions: { loader: { '.js': 'jsx' } },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
