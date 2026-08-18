// 반려동물 종류 / 체중대 / 지역 / 진료 항목 데이터는 Supabase(DB)에서 불러옵니다.
// 값 자체(가격, 계수, 문구 등)를 바꾸고 싶으면 코드가 아니라 Supabase 테이블을 수정하세요.
// 스키마와 초기 시드 값은 supabase/schema.sql 을 참고하세요.

import { supabase } from "./lib/supabaseClient";

export async function fetchPetTypes() {
  const { data, error } = await supabase
    .from("pet_types")
    .select("id, label")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data;
}

export async function fetchWeightBands() {
  const { data, error } = await supabase
    .from("weight_bands")
    .select("id, pet_type_id, label, factor")
    .order("sort_order", { ascending: true });
  if (error) throw error;

  return data.reduce((acc, row) => {
    const list = acc[row.pet_type_id] ?? [];
    list.push({ id: row.id, label: row.label, factor: row.factor });
    acc[row.pet_type_id] = list;
    return acc;
  }, {});
}

export async function fetchRegions() {
  const { data, error } = await supabase
    .from("regions")
    .select("id, label, factor")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data;
}

export async function fetchProcedures() {
  const { data, error } = await supabase
    .from("procedures")
    .select("id, label, description, base, spread, weight_scaled")
    .order("sort_order", { ascending: true });
  if (error) throw error;

  return data.map((p) => ({
    id: p.id,
    label: p.label,
    desc: p.description,
    base: p.base,
    spread: p.spread,
    weightScaled: p.weight_scaled,
  }));
}

export function estimateCost(procedure, regionFactor, weightFactor) {
  const scaled = procedure.weightScaled ? weightFactor : 1;
  const mid = procedure.base * regionFactor * scaled;
  const min = Math.round((mid * (1 - procedure.spread)) / 1000) * 1000;
  const max = Math.round((mid * (1 + procedure.spread)) / 1000) * 1000;
  const avg = Math.round(mid / 1000) * 1000;
  return { min, max, avg };
}
