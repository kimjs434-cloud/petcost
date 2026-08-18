import { useState, useMemo, useEffect } from "react";
import {
  fetchPetTypes,
  fetchWeightBands,
  fetchRegions,
  fetchProcedures,
  estimateCost,
} from "./data";
import "./App.css";

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(
    2,
    "0"
  )}.${String(d.getDate()).padStart(2, "0")}`;
}

export default function App() {
  const [status, setStatus] = useState("loading"); // loading | error | ready
  const [petTypes, setPetTypes] = useState([]);
  const [weightBands, setWeightBands] = useState({});
  const [regions, setRegions] = useState([]);
  const [procedures, setProcedures] = useState([]);

  const [petType, setPetType] = useState(null);
  const [weightBand, setWeightBand] = useState(null);
  const [region, setRegion] = useState(null);
  const [selected, setSelected] = useState(new Set());

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      fetchPetTypes(),
      fetchWeightBands(),
      fetchRegions(),
      fetchProcedures(),
    ])
      .then(([petTypesData, weightBandsData, regionsData, proceduresData]) => {
        if (cancelled) return;
        setPetTypes(petTypesData);
        setWeightBands(weightBandsData);
        setRegions(regionsData);
        setProcedures(proceduresData);

        const firstPetType = petTypesData[0]?.id ?? null;
        setPetType(firstPetType);
        setWeightBand(weightBandsData[firstPetType]?.[0]?.id ?? null);
        setRegion(
          regionsData.find((r) => r.id === "seoul_etc")?.id ??
            regionsData[0]?.id ??
            null
        );
        setSelected(
          new Set(
            proceduresData.some((p) => p.id === "checkup")
              ? ["checkup"]
              : proceduresData[0]
              ? [proceduresData[0].id]
              : []
          )
        );

        setStatus("ready");
      })
      .catch((err) => {
        if (cancelled) return;
        console.error(err);
        setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const weightOptions = weightBands[petType] ?? [];

  function handlePetType(id) {
    setPetType(id);
    setWeightBand(weightBands[id]?.[0]?.id ?? null);
  }

  function toggleProcedure(id) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const regionFactor = regions.find((r) => r.id === region)?.factor ?? 1;
  const weightFactor =
    weightOptions.find((w) => w.id === weightBand)?.factor ?? 1;

  const lineItems = useMemo(() => {
    return procedures
      .filter((p) => selected.has(p.id))
      .map((p) => ({
        ...p,
        cost: estimateCost(p, regionFactor, weightFactor),
      }));
  }, [procedures, selected, regionFactor, weightFactor]);

  const totals = lineItems.reduce(
    (acc, item) => ({
      min: acc.min + item.cost.min,
      max: acc.max + item.cost.max,
      avg: acc.avg + item.cost.avg,
    }),
    { min: 0, max: 0, avg: 0 }
  );

  const won = (n) => n.toLocaleString("ko-KR");

  if (status === "loading") {
    return (
      <div className="page">
        <p className="empty">데이터를 불러오는 중이에요…</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="page">
        <p className="empty">
          데이터를 불러오지 못했어요. Supabase 연결 정보(.env)를 확인해
          주세요.
        </p>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="hero">
        <span className="eyebrow">동물병원비, 가기 전에 가늠해보기</span>
        <h1>펫코스트</h1>
        <p className="sub">
          진료 항목과 지역을 고르면, 병원 방문 전에 예상 비용 범위를
          영수증처럼 보여드려요.
        </p>
      </header>

      <main className="layout">
        <section className="panel">
          <div className="field">
            <label>반려동물</label>
            <div className="pill-row">
              {petTypes.map((p) => (
                <button
                  key={p.id}
                  className={`pill ${petType === p.id ? "active" : ""}`}
                  onClick={() => handlePetType(p.id)}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <label>체중대</label>
            <div className="pill-row">
              {weightOptions.map((w) => (
                <button
                  key={w.id}
                  className={`pill ${weightBand === w.id ? "active" : ""}`}
                  onClick={() => setWeightBand(w.id)}
                >
                  {w.label}
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <label>지역</label>
            <div className="pill-row">
              {regions.map((r) => (
                <button
                  key={r.id}
                  className={`pill ${region === r.id ? "active" : ""}`}
                  onClick={() => setRegion(r.id)}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <label>진료 · 시술 항목 (복수 선택)</label>
            <div className="proc-list">
              {procedures.map((p) => (
                <button
                  key={p.id}
                  className={`proc-row ${
                    selected.has(p.id) ? "active" : ""
                  }`}
                  onClick={() => toggleProcedure(p.id)}
                >
                  <span className="proc-check">
                    {selected.has(p.id) ? "✓" : ""}
                  </span>
                  <span className="proc-text">
                    <span className="proc-name">{p.label}</span>
                    <span className="proc-desc">{p.desc}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="receipt-wrap">
          <div className="receipt">
            <div className="receipt-head">
              <span className="receipt-title">예상 진료비 영수증</span>
              <span className="receipt-date">{todayStr()}</span>
            </div>
            <div className="receipt-meta">
              {petTypes.find((p) => p.id === petType)?.label} ·{" "}
              {weightOptions.find((w) => w.id === weightBand)?.label} ·{" "}
              {regions.find((r) => r.id === region)?.label}
            </div>
            <div className="receipt-dash" />

            {lineItems.length === 0 && (
              <p className="empty">항목을 하나 이상 선택해 주세요.</p>
            )}

            {lineItems.map((item) => (
              <div className="receipt-line" key={item.id}>
                <span className="line-name">{item.label}</span>
                <span className="line-cost">
                  {won(item.cost.min)}원~{won(item.cost.max)}원
                </span>
              </div>
            ))}

            <div className="receipt-dash" />

            <div className="receipt-total">
              <span>예상 합계 (평균)</span>
              <span className="total-avg">{won(totals.avg)}원</span>
            </div>
            <div className="receipt-total-range">
              최소 {won(totals.min)}원 ~ 최대 {won(totals.max)}원
            </div>

            <p className="disclaimer">
              * 공개된 진료비 통계를 바탕으로 한 추정 범위이며, 실제 진료비와
              다를 수 있습니다. 정확한 비용은 방문 병원에 문의해 주세요.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
