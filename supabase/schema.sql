-- 펫코스트 데이터 스키마
-- Supabase 대시보드 → SQL Editor 에 이 파일 내용을 붙여넣고 실행하세요.
-- (Table Editor에서 직접 값을 추가/수정해도 되지만, 최초 세팅은 이 스크립트로 한 번에 하는 걸 권장합니다.)

create table if not exists pet_types (
  id text primary key,
  label text not null,
  sort_order int not null default 0
);

create table if not exists weight_bands (
  id text not null,
  pet_type_id text not null references pet_types(id) on delete cascade,
  label text not null,
  factor numeric not null,
  sort_order int not null default 0,
  primary key (pet_type_id, id)
);

create table if not exists regions (
  id text primary key,
  label text not null,
  factor numeric not null,
  sort_order int not null default 0
);

create table if not exists procedures (
  id text primary key,
  label text not null,
  description text not null,
  base numeric not null,
  spread numeric not null,
  weight_scaled boolean not null default false,
  sort_order int not null default 0
);

-- 이 앱은 로그인 없이 모두가 같은 견적 데이터를 읽기만 하므로,
-- RLS를 켜고 "누구나 읽기 가능" 정책만 추가합니다. 쓰기는 대시보드(관리자)에서만 합니다.
alter table pet_types enable row level security;
alter table weight_bands enable row level security;
alter table regions enable row level security;
alter table procedures enable row level security;

drop policy if exists "public read pet_types" on pet_types;
create policy "public read pet_types" on pet_types for select using (true);

drop policy if exists "public read weight_bands" on weight_bands;
create policy "public read weight_bands" on weight_bands for select using (true);

drop policy if exists "public read regions" on regions;
create policy "public read regions" on regions for select using (true);

drop policy if exists "public read procedures" on procedures;
create policy "public read procedures" on procedures for select using (true);

-- 시드 데이터 (기존 src/data.js에 있던 값과 동일)
insert into pet_types (id, label, sort_order) values
  ('dog', '강아지', 1),
  ('cat', '고양이', 2)
on conflict (id) do update set label = excluded.label, sort_order = excluded.sort_order;

insert into weight_bands (id, pet_type_id, label, factor, sort_order) values
  ('small', 'dog', '소형 (~5kg)', 1.0, 1),
  ('medium', 'dog', '중형 (5~15kg)', 1.25, 2),
  ('large', 'dog', '대형 (15kg~)', 1.6, 3),
  ('small', 'cat', '~4kg', 1.0, 1),
  ('large', 'cat', '4kg~', 1.15, 2)
on conflict (pet_type_id, id) do update set label = excluded.label, factor = excluded.factor, sort_order = excluded.sort_order;

insert into regions (id, label, factor, sort_order) values
  ('seoul_gangnam', '서울 강남·서초권', 1.3, 1),
  ('seoul_etc', '서울 기타·수도권', 1.0, 2),
  ('metro', '광역시', 0.9, 3),
  ('rural', '지방', 0.78, 4)
on conflict (id) do update set label = excluded.label, factor = excluded.factor, sort_order = excluded.sort_order;

insert into procedures (id, label, description, base, spread, weight_scaled, sort_order) values
  ('checkup', '기본 건강검진', '문진, 청진, 체온 측정 등 기본 검진', 15000, 0.4, false, 1),
  ('vaccine', '종합백신 접종 (1회)', '5종 종합백신 기준', 25000, 0.35, false, 2),
  ('bloodtest', '혈액검사 (기본 패널)', '일반 혈액검사 + 생화학검사', 90000, 0.4, false, 3),
  ('scaling', '스케일링 (치석 제거)', '마취 포함, 발치 없는 기본 스케일링', 280000, 0.45, true, 4),
  ('neuter', '중성화 수술', '암/수 평균, 입원 1일 포함', 260000, 0.5, true, 5),
  ('patella', '슬개골탈구 수술', '편측 기준, 입원·통증관리 포함', 950000, 0.5, true, 6),
  ('hospitalization', '입원 (1일)', '일반 입원실 기준', 85000, 0.4, false, 7)
on conflict (id) do update set
  label = excluded.label,
  description = excluded.description,
  base = excluded.base,
  spread = excluded.spread,
  weight_scaled = excluded.weight_scaled,
  sort_order = excluded.sort_order;
