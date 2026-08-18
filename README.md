# 펫코스트 (PetCost)

반려동물 병원비를 병원 방문 **전에** 미리 가늠해볼 수 있는 MVP 견적기입니다.
반려동물 종류·체중대·지역·진료 항목을 선택하면, 실제 영수증처럼 예상 비용 범위를 보여줍니다.

- AI 없이 규칙 기반(진료 항목별 기준 단가 × 지역/체중 계수)으로 계산합니다.
- 반려동물 종류·체중대·지역·진료 항목 데이터는 Supabase(Postgres) DB에서 관리합니다. 값을 바꾸고 싶으면
  코드를 고치지 말고 Supabase 테이블을 수정하세요.

## Supabase 설정

1. [supabase.com](https://supabase.com)에서 프로젝트를 하나 만듭니다.
2. 프로젝트 대시보드 → **SQL Editor**에서 `supabase/schema.sql` 내용을 붙여넣고 실행합니다.
   (테이블 생성 + 읽기 전용 RLS 정책 + 초기 시드 데이터가 한 번에 들어갑니다.)
3. 프로젝트 대시보드 → **Project Settings → API**에서 `Project URL`과 `anon public` 키를 복사합니다.
4. 저장소 루트에 `.env` 파일을 만들고 `.env.example`을 참고해 값을 채웁니다.

```bash
cp .env.example .env
# .env 파일을 열어 VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY 값을 채우기
```

이후 데이터(가격, 문구, 새 항목 추가 등)를 바꾸고 싶으면 Supabase 대시보드의 **Table Editor**에서
`pet_types` / `weight_bands` / `regions` / `procedures` 테이블을 직접 수정하면 됩니다. 배포된 앱은
새로고침만 하면 바로 반영됩니다.

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
4. **Environment Variables**에 `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`를 추가
5. Deploy 클릭 → 배포 완료 후 `*.vercel.app` 주소 발급

## 프로젝트 구조

```
supabase/
  schema.sql        # 테이블 정의 + RLS 정책 + 초기 시드 데이터
src/
  lib/supabaseClient.js  # Supabase 클라이언트 초기화
  data.js           # Supabase에서 데이터를 읽어오는 함수 + 비용 계산 로직
  App.jsx           # 메인 화면 로직
  App.css           # 디자인
미리보기.html         # 빌드 없이 바로 여는 정적 버전 (파일 상단에 Supabase URL/키 직접 입력 필요)
```
