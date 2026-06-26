package com.readinggo.app;

import com.getcapacitor.BridgeActivity;

// 상태바 아이콘 색은 @capacitor/status-bar 런타임 setStyle(Style.Light)로 처리(#1016, setup-globals.js).
// onCreate 에서의 WindowInsetsController 설정(#1013)은 스플래시 처리에 덮여 효과가 없어 제거.
public class MainActivity extends BridgeActivity {}
