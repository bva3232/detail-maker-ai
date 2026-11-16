# 일하는 베짱이 — AI 상세페이지 생성기 (OpenAI + Vercel)

상품명·사진을 넣으면 AI가 **기획 초안 → 쿠팡 스타일 상세페이지 → AI 이미지**까지 만들어주는 웹앱입니다.
카피 생성과 이미지 생성은 **서버리스 함수**에서 처리하며, OpenAI API 키는 서버 환경변수에만 보관됩니다(브라우저에 노출 안 됨).

## 구성

```
index.html        프런트엔드 (전체 UI)
api/copy.js        카피/기획 생성 (OpenAI Chat Completions)
api/image.js       AI 이미지 생성 (OpenAI Images, gpt-image-1)
vercel.json        함수 실행 시간 설정
package.json       Node 18+
.env.example       환경변수 예시
```

---

## 배포 순서 (약 10분)

### 1. OpenAI API 키 발급
1. https://platform.openai.com 가입/로그인
2. **API keys** → **Create new secret key** → 키 복사 (`sk-...`)
3. **Billing**에서 결제수단 등록 (생성마다 소량 과금됨)
4. (이미지 `gpt-image-1` 사용하려면) **Settings → Organization → Verify** 조직 인증이 필요할 수 있음.
   인증이 안 되면 배포 시 환경변수에 `IMAGE_MODEL=dall-e-3` 추가하면 됩니다.

### 2. GitHub 저장소에 올리기
이 폴더(`detail-maker-app`)를 저장소로 push 합니다.

```bash
cd detail-maker-app
git init
git add .
git commit -m "init: AI 상세페이지 생성기"
git branch -M main
git remote add origin https://github.com/<본인아이디>/<저장소이름>.git
git push -u origin main
```

> `.env`는 `.gitignore`로 제외됩니다. 키는 GitHub에 올리지 마세요.

### 3. Vercel에 배포
1. https://vercel.com 에 GitHub로 로그인
2. **Add New → Project → Import** 에서 방금 만든 저장소 선택
3. **Environment Variables**에 아래 추가:
   - `OPENAI_API_KEY` = 발급받은 키 (`sk-...`)
   - (선택) `IMAGE_MODEL` = `dall-e-3`  ← gpt-image-1 인증 전이면
4. **Deploy** 클릭 → 1~2분 후 `https://<프로젝트>.vercel.app` 주소가 나옵니다.

끝입니다. 그 주소에서 **카피 생성 + AI 이미지 생성**이 모두 동작합니다.

---

## 로컬에서 먼저 테스트 (선택)
Vercel CLI로 로컬 실행:

```bash
npm i -g vercel
vercel dev
```

`.env` 파일을 만들고 `OPENAI_API_KEY=sk-...` 를 넣으면 `http://localhost:3000` 에서 테스트됩니다.
(단순히 `index.html`만 브라우저로 열면 `/api/*` 함수가 없어 AI 기능은 안 되고, "결과 예시 먼저 보기"만 동작합니다.)

---

## 환경변수

| 변수 | 필수 | 설명 |
|---|---|---|
| `OPENAI_API_KEY` | ✅ | OpenAI 키 |
| `COPY_MODEL` | | 카피 모델 (기본 `gpt-4o-mini`) |
| `IMAGE_MODEL` | | 이미지 모델 (기본 `gpt-image-1`, 대체 `dall-e-3`) |
| `IMAGE_SIZE` | | 이미지 크기 (기본 `1024x1024`) |
| `IMAGE_QUALITY` | | gpt-image-1 품질 (기본 `high`) |

## 비용 주의
카피 1회 생성은 수원 단위, AI 이미지는 장당 수십~수백 원 수준입니다(모델·크기에 따라 다름).
OpenAI 대시보드 **Usage/Limits**에서 사용량과 한도를 꼭 설정하세요.

## 보안
- API 키는 서버 환경변수에만 두세요. `index.html`이나 깃 저장소에 키를 넣지 마세요.
- 이 앱엔 로그인/사용량 제한이 없습니다. 공개 URL로 두면 누구나 호출해 과금될 수 있으니,
  필요하면 Vercel의 접근 보호(Password Protection) 또는 자체 인증을 추가하세요.
