# Release AAB 빌드 — Play 업로드 (#1024)

ReadingGo 안드로이드 앱을 **Google Play 스토어**에 올리려면 디버그 APK(`app-debug.apk`)가 아니라 **서명된 release AAB(Android App Bundle, `.aab`)** 가 필요하다. 이 문서는 ① 업로드 키스토어 1회 생성 ② GitHub Secret 등록 ③ release 빌드 실행 ④ Play Console 업로드까지를 다룬다.

> 디버그 APK 빌드는 그대로 `.github/workflows/android-apk.yml`(`assembleDebug`). 이 문서는 출시용 release 경로만 다룬다.

---

## 0. Play App Signing — 왜 "업로드 키"만 만드나

Google Play 는 **Play App Signing**을 쓴다. 핵심은 키가 **두 개**라는 것:

- **앱 서명키 (app signing key)** — 사용자에게 배포되는 최종 APK를 서명하는 키. **구글이 보관·관리**한다. 우리는 손댈 일이 없다.
- **업로드 키 (upload key)** — 우리가 Play Console에 AAB를 올릴 때 쓰는 키. 구글은 이걸로 "이 업로드가 우리 것인지"만 검증하고, 자기 앱 서명키로 다시 서명해 배포한다.

**우리가 만들고 지키는 건 업로드 키 하나뿐.** 장점:

- 업로드 키를 **분실/유출해도 앱은 안 죽는다** — 구글에 요청해 업로드 키만 재설정하면 됨(앱 서명키는 그대로라 기존 설치 업데이트 정상).
- 앱 서명키 자체를 우리가 잃어버려서 "그 앱을 영영 업데이트 못 하는" 사고가 원천 차단된다.

즉 아래에서 만드는 `upload-keystore.jks` 는 **업로드 키**다. 한 번 만들어 GitHub Secret에 넣어두면 끝.

---

## 1. 업로드 키스토어 생성 (사용자 1회, 로컬)

JDK의 `keytool`로 키스토어를 만든다. (JDK는 Android Studio에 포함, 또는 `brew install temurin`.)

```bash
keytool -genkeypair -v \
  -keystore upload-keystore.jks \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias upload
```

- 실행하면 **키스토어 비밀번호**(store password)와 이름·조직 등을 묻는다. 비번은 **안전한 곳에 따로 기록**(이게 Secret로 들어감).
- `-alias upload` 가 **키 별칭**(key alias). 이 예시 그대로 쓰면 `RG_KEY_ALIAS=upload`.
- 키 비밀번호(key password)를 따로 물으면 그것도 기록. (그냥 엔터로 store password와 동일하게 둬도 됨 → 그 경우 둘이 같은 값.)
- `-validity 10000` ≈ 27년. 업로드 키는 길게 잡는 게 일반적.

> ⚠️ **`upload-keystore.jks` 와 비밀번호는 절대 깃에 커밋하지 말 것.** 레포 `.gitignore`가 `*.jks`·`*.keystore`·`keystore.properties` 를 무시하지만, 애초에 레포 밖(예: 비밀번호 매니저)에 보관하는 게 안전하다.

---

## 2. base64 인코딩 + GitHub Secret 4개 등록 (사용자 1회)

GitHub Actions 러너는 바이너리 `.jks` 를 직접 못 받으니 **base64 문자열**로 넣는다.

### 2-1. 키스토어를 base64로 (클립보드 복사)

macOS:

```bash
base64 -i upload-keystore.jks | pbcopy
```

(Linux: `base64 -w0 upload-keystore.jks` 출력 복사. `-w0` = 줄바꿈 없이.)

### 2-2. 레포 Settings → Secrets and variables → Actions → New repository secret

아래 **4개**를 등록한다:

| Secret 이름 | 값 |
|---|---|
| `RG_UPLOAD_KEYSTORE_BASE64` | 2-1에서 복사한 base64 문자열 |
| `RG_KEYSTORE_PASSWORD` | 1에서 정한 키스토어(store) 비밀번호 |
| `RG_KEY_ALIAS` | 키 별칭 (예시대로면 `upload`) |
| `RG_KEY_PASSWORD` | 키(key) 비밀번호 (store와 같게 뒀으면 동일 값) |

> 이름이 워크플로우(`android-release.yml`)와 정확히 일치해야 한다. 오타 나면 빌드 시 "Secret 미설정" 에러로 드러난다.

---

## 3. release 빌드 실행 (AAB 생성)

GitHub → **Actions** 탭 → 왼쪽 **`android-release`** 워크플로우 → **Run workflow**(브랜치 `main`) → 실행.

워크플로우가 하는 일(`android-release.yml`):

1. Secret의 base64 키스토어를 디코드해 `android/upload-keystore.jks` + `android/keystore.properties` 복원.
2. `npm ci && npm run build` → 웹 번들 `dist/`.
3. `npx cap sync android` → `dist/` 를 안드로이드 프로젝트에 반영.
4. `./gradlew bundleRelease` → **서명된 release AAB** 생성.
5. 빌드 후 키스토어·`keystore.properties` 삭제(유출 방지).
6. AAB를 **아티팩트**(`readinggo-release-aab`)로 업로드.

완료되면 워크플로우 실행 페이지 하단 **Artifacts** 에서 `readinggo-release-aab` 를 내려받는다 → 압축 안에 `app-release.aab`.

### 서명은 어떻게 연결되나 (gradle)

`docs/readinggo/android/app/build.gradle` 은 **`keystore.properties` 파일이 있을 때만** `signingConfigs.release` 를 구성하고 `buildTypes.release.signingConfig` 에 연결한다. 파일이 없으면(평소 로컬·`android-apk.yml` 의 `assembleDebug`) 분기 전체를 건너뛰므로 **디버그 빌드는 전혀 영향 없다.** 즉 release 서명키는 CI에서 Secret로 복원될 때만 존재한다.

> **로컬에서 직접 release 빌드하려면**: `android/` 에 `keystore.properties` 를 손으로 만들고(`storeFile=`, `storePassword=`, `keyAlias=`, `keyPassword=`), 키스토어 파일을 같은 폴더에 두고 `./gradlew bundleRelease`. 이 파일들은 gitignore 되니 커밋 걱정 없음.

---

## 4. Play Console 업로드

> 전제: Google Play 개발자 계정($25, 1회) + 앱 등록. 최초 업로드 시 Play App Signing 사용에 동의하면 구글이 앱 서명키를 발급·보관한다.

1. Play Console → 해당 앱 → **Production**(또는 **Internal testing** 으로 먼저 검증 권장) → **Create new release**.
2. 3에서 받은 `app-release.aab` 업로드.
3. 최초라면 Play App Signing 활성화 동의(우리 업로드 키로 올린 걸 구글이 자기 키로 재서명).
4. 릴리스 노트 작성 → 검토 → 출시.

스토어 등록 정보(스크린샷·설명 등)는 별도 작업(#874).

---

## 참고

- 디버그 APK: `.github/workflows/android-apk.yml` (`assembleDebug` → `app-debug.apk`).
- Capacitor 셸·빌드 환경: [`CAPACITOR.md`](./CAPACITOR.md).
- 키/비번을 평문으로 커밋하는 일은 거버넌스상 금지(`CONTRIBUTING.md` — secrets). 이 파이프라인은 전부 Secret 경유로 그 규칙을 지킨다.
