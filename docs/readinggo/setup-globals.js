// 전역 노출 (#871 Vite 전환) — 기존 CDN UMD 전역(React/ReactDOM/Fuse/htmlToImage/supabase)을
// npm 모듈로 대체하되 `window.X` 패턴을 유지(기존 js 파일 무수정).
// ⚠️ main.js 가 이 모듈을 *가장 먼저* import 한다 — ES import 는 호이스팅돼 다른 컴포넌트 파일
//    평가(예: `const {useState}=React`) 전에 window.React 등이 설정돼 있어야 한다.
import React from 'react';
import { createRoot } from 'react-dom/client';
import { createPortal } from 'react-dom';
import Fuse from 'fuse.js';
import * as htmlToImage from 'html-to-image';
import { createClient } from '@supabase/supabase-js';

window.React = React;
window.ReactDOM = { createRoot, createPortal };
window.Fuse = Fuse;
window.htmlToImage = htmlToImage;        // htmlToImage.toBlob 사용
window.supabase = { createClient };      // supabase.createClient 사용
