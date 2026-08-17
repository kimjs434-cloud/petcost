# 펫코스트 (PetCost)

반려동물 병원비를 병원 방문 **전에** 미리 가늠해볼 수 있는 MVP 견적기입니다.
반려동물 종류·체중대·지역·진료 항목을 선택하면, 실제 영수증처럼 예상 비용 범위를 보여줍니다.

- AI 없이 규칙 기반(진료 항목별 기준 단가 × 지역/체중 계수)으로 계산합니다.
- 데이터는 공개된 반려동물 진료비 통계를 참고한 추정 값이며 `src/data.js`에서 관리합니다.

## 로컬 실행

```bash
npm install
npm run dev
```

## 기술 스택

- React + Vite
- 순수 CSS (외부 UI 프레임워크 없음)

## GitHub에 올리기

```bash
git init
git add .
git commit -m "Initial commit: 펫코스트 MVP"
git branch -M main
git remote add origin <내_깃허브_저장소_URL>
git push -u origin main
```

## Vercel 배포

1. https://vercel.com 에서 GitHub 계정으로 로그인
2. "Add New… → Project" 선택 후 방금 올린 저장소를 Import
3. Framework Preset은 **Vite**로 자동 인식됨 (Build Command: `npm run build`, Output Directory: `dist`)
4. Deploy 클릭 → 배포 완료 후 `*.vercel.app` 주소 발급

## 프로젝트 구조

```
src/
  data.js   # 진료 항목·지역·체중 계수 데이터
  App.jsx   # 메인 화면 로직
  App.css   # 디자인
```
