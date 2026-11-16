# 일하는 베짱이 — AI 상세페이지 생성기 (무료 · Pollinations + Vercel)

상품명·사진을 넣으면 AI가 **기획 초안 → 쿠팡 스타일 상세페이지 → AI 이미지**까지 만들어주는 웹앱입니다.
카피·이미지 생성 모두 **무료 [Pollinations.ai](https://pollinations.ai)** 를 사용합니다. **API 키·결제수단 불필요.**

## 구성

```
index.html        프런트엔드 (전체 UI)
api/copy.js        카피/기획 생성 (Pollinations 무료 텍스트)
api/image.js       AI 이미지 생성 (Pollinations 무료 이미지)
vercel.json        함수 실행 시간 설정
package.json       Node 18+
.env.example       (선택) 환경변수 예시 — 없어도 동작
```

---

## 배포 순서 (약 5분, 전부 무료)

### 1. GitHub 저장소 (이미 완료)
이 프로젝트는 비공개 저장소에 올라가 있습니다.

### 2. Vercel에 배포
1. https://vercel.com 에 **GitHub로 로그인**
2. **Add New → Project → Import** 에서 이 저장소(`detail-maker-ai`) 선택
3. 환경변수는 **설정할 필요 없음** (키가 필요 없습니다) → 바로 **Deploy**
4. 1~2분 후 `https://<프로젝트>.vercel.app` 주소 완성

끝입니다. 그 주소에서 **카피 생성 + AI 이미지 생성**이 모두 무료로 동작합니다.

---

## 로컬 테스트 (선택)
```bash
npm i -g vercel
vercel dev     # http://localhost:3000
```
> `index.html`만 브라우저로 열면 `/api/*` 함수가 없어 "결과 예시 먼저 보기"만 동작합니다.

---

## 비용
- **GitHub / Vercel(Hobby) / Pollinations: 전부 무료.** API 키·결제 없음.
- Vercel Hobby 플랜은 개인용 기준입니다. 상업적으로 트래픽이 커지면 Pro 전환이 필요할 수 있습니다.

## 품질 / 한도 참고
- Pollinations는 무료 서비스라 **유료 OpenAI보다 품질이 낮고**, 가끔 **느리거나 결과가 들쭉날쭉**할 수 있습니다.
- 사용량이 많아 제한이 걸리면, `auth.pollinations.ai` 에서 무료 토큰을 받아 Vercel 환경변수 `POLLINATIONS_TOKEN` 에 넣으면 한도가 늘어납니다.
- 더 높은 품질이 필요해지면 `api/copy.js` · `api/image.js` 를 OpenAI/Google 유료 API로 교체할 수 있습니다(과금 발생).

## 보안 / 주의
- 이 앱엔 로그인·사용량 제한이 없습니다. 공개 URL로 두면 누구나 호출할 수 있으니,
  필요하면 Vercel의 **Password Protection** 을 켜세요.
- AI가 만든 **예시 후기**는 반드시 실제 후기로 교체하고, 생성된 문구·사양은 판매 전 사실 확인하세요.
