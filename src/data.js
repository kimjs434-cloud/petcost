// 참고: 농림축산검역본부 반려동물 진료비 실태조사 및 동물병원 비급여 진료비 공시자료를 바탕으로 한 추정 범위입니다.
// 실제 진료비는 병원, 반려동물 상태에 따라 달라질 수 있습니다.

export const PET_TYPES = [
  { id: "dog", label: "강아지" },
  { id: "cat", label: "고양이" },
];

export const WEIGHT_BANDS = {
  dog: [
    { id: "small", label: "소형 (~5kg)", factor: 1.0 },
    { id: "medium", label: "중형 (5~15kg)", factor: 1.25 },
    { id: "large", label: "대형 (15kg~)", factor: 1.6 },
  ],
  cat: [
    { id: "small", label: "~4kg", factor: 1.0 },
    { id: "large", label: "4kg~", factor: 1.15 },
  ],
};

export const REGIONS = [
  { id: "seoul_gangnam", label: "서울 강남·서초권", factor: 1.3 },
  { id: "seoul_etc", label: "서울 기타·수도권", factor: 1.0 },
  { id: "metro", label: "광역시", factor: 0.9 },
  { id: "rural", label: "지방", factor: 0.78 },
];

export const PROCEDURES = [
  {
    id: "checkup",
    label: "기본 건강검진",
    desc: "문진, 청진, 체온 측정 등 기본 검진",
    base: 15000,
    spread: 0.4,
    weightScaled: false,
  },
  {
    id: "vaccine",
    label: "종합백신 접종 (1회)",
    desc: "5종 종합백신 기준",
    base: 25000,
    spread: 0.35,
    weightScaled: false,
  },
  {
    id: "bloodtest",
    label: "혈액검사 (기본 패널)",
    desc: "일반 혈액검사 + 생화학검사",
    base: 90000,
    spread: 0.4,
    weightScaled: false,
  },
  {
    id: "scaling",
    label: "스케일링 (치석 제거)",
    desc: "마취 포함, 발치 없는 기본 스케일링",
    base: 280000,
    spread: 0.45,
    weightScaled: true,
  },
  {
    id: "neuter",
    label: "중성화 수술",
    desc: "암/수 평균, 입원 1일 포함",
    base: 260000,
    spread: 0.5,
    weightScaled: true,
  },
  {
    id: "patella",
    label: "슬개골탈구 수술",
    desc: "편측 기준, 입원·통증관리 포함",
    base: 950000,
    spread: 0.5,
    weightScaled: true,
  },
  {
    id: "hospitalization",
    label: "입원 (1일)",
    desc: "일반 입원실 기준",
    base: 85000,
    spread: 0.4,
    weightScaled: false,
  },
];

export function estimateCost(procedure, regionFactor, weightFactor) {
  const scaled = procedure.weightScaled ? weightFactor : 1;
  const mid = procedure.base * regionFactor * scaled;
  const min = Math.round((mid * (1 - procedure.spread)) / 1000) * 1000;
  const max = Math.round((mid * (1 + procedure.spread)) / 1000) * 1000;
  const avg = Math.round(mid / 1000) * 1000;
  return { min, max, avg };
}
