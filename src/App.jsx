import React, { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { Download, LoaderCircle, RefreshCw, Search } from "lucide-react";
import { analyzeLease, variablesToPosterValues } from "./services/analyzeLease.service";

const DEFAULTS = {
  mainHeadline: "임대",
  englishHeadline: "FOR LEASE",
  locationLine: "부산대 지하철역 앞",
  trafficFeatureLine: "무권리 공실",
  accessLine: "부산대역 인근",
  recommendedBusinessLine: "사무실 · 소형 업무공간 추천",
  leaseConditionLine: "보증금 1,000만원 · 월차임 70만원",
  agencyName: "원상가 지니부동산",
  phoneNumber: "010-4117-6994",
  ctaLine: "임대 문의 / 현장 확인 가능",
  fontColor: "#0033D9",
};

const FIELD_LABELS = [
  ["mainHeadline", "메인 헤드라인"],
  ["englishHeadline", "영문 헤드라인"],
  ["locationLine", "위치 문구"],
  ["trafficFeatureLine", "특징 문구"],
  ["accessLine", "접근성 문구"],
  ["recommendedBusinessLine", "추천 업종"],
  ["leaseConditionLine", "임대 조건"],
  ["ctaLine", "CTA 문구"],
];

const ARTBOARD = { width: 1200, height: 900 };

const GRID = {
  x: 40,
  y: 36,
  width: 1120,
  height: 820,
  columns: 10,
  rows: 9,
};

const POSITIONS = {
  mainHeadline: { x: 54, y: 176, size: 166, weight: 900, tracking: -9 },
  englishHeadline: { x: 54, y: 290, size: 84, weight: 900, tracking: -3.5 },
  locationLine: { x: 54, y: 406, size: 36, weight: 800, tracking: -1.8 },
  trafficFeatureLine: { x: 54, y: 450, size: 36, weight: 800, tracking: -1.8 },
  accessLine: { x: 54, y: 494, size: 36, weight: 800, tracking: -1.8 },
  recommendedBusinessLine: { x: 54, y: 566, size: 34, weight: 800, tracking: -1.6 },
  leaseConditionLine: { x: 54, y: 632, size: 34, weight: 800, tracking: -1.6 },
  agencyName: { x: 54, y: 724, size: 46, weight: 900, tracking: -3.2 },
  phoneNumber: { x: 54, y: 790, size: 60, weight: 900, tracking: -2.2 },
  ctaLine: { x: 54, y: 852, size: 28, weight: 800, tracking: -1.3 },
};

const QR = {
  boxX: 1026,
  boxY: 724,
  boxSize: 132,
  imageX: 1030,
  imageY: 728,
  imageSize: 124,
};

function escapeXml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function isValidHexColor(value) {
  return /^#[0-9A-Fa-f]{6}$/.test(String(value || ""));
}

function getSafeColor(value) {
  return isValidHexColor(value) ? value : DEFAULTS.fontColor;
}

function phoneToTelUri(phone = "") {
  const digits = phone.replace(/[^0-9]/g, "");

  if (digits.startsWith("010")) {
    return `tel:+82${digits.slice(1)}`;
  }

  return `tel:${digits || phone}`;
}

function makeGridLines() {
  const lines = [];
  const x0 = GRID.x;
  const y0 = GRID.y;
  const w = GRID.width;
  const h = GRID.height;
  const columns = GRID.columns;
  const rows = GRID.rows;

  for (let i = 0; i <= columns; i += 1) {
    const x = x0 + (w / columns) * i;
    lines.push(<line key={`v-${i}`} x1={x} y1={y0} x2={x} y2={y0 + h} />);
  }

  for (let i = 0; i <= rows; i += 1) {
    const y = y0 + (h / rows) * i;
    lines.push(<line key={`h-${i}`} x1={x0} y1={y} x2={x0 + w} y2={y} />);
  }

  return lines;
}

function PosterText({ id, value }) {
  const p = POSITIONS[id];

  if (!p) return null;

  return (
    <text
      x={p.x}
      y={p.y}
      fontSize={p.size}
      fontWeight={p.weight}
      letterSpacing={p.tracking}
    >
      {value}
    </text>
  );
}

function PosterSvg({ values, qrDataUrl }) {
  const blue = getSafeColor(values.fontColor);
  const font = "Helvetica Neue, Helvetica, Arial, Noto Sans KR, Pretendard, sans-serif";

  return (
    <svg
      id="lease-poster-svg"
      xmlns="http://www.w3.org/2000/svg"
      width="100%"
      viewBox={`0 0 ${ARTBOARD.width} ${ARTBOARD.height}`}
      role="img"
      aria-label="임대 포스터 미리보기"
      style={{ display: "block", background: "#fbfaf6" }}
    >
      <rect width={ARTBOARD.width} height={ARTBOARD.height} fill="#fbfaf6" />

      <g stroke="#d9d9d4" strokeWidth="1" opacity="0.9">
        {makeGridLines()}
      </g>

      <g fill={blue} fontFamily={font} textAnchor="start">
        <PosterText id="mainHeadline" value={values.mainHeadline} />
        <PosterText id="englishHeadline" value={values.englishHeadline} />
        <PosterText id="locationLine" value={values.locationLine} />
        <PosterText id="trafficFeatureLine" value={values.trafficFeatureLine} />
        <PosterText id="accessLine" value={values.accessLine} />
        <PosterText id="recommendedBusinessLine" value={values.recommendedBusinessLine} />
        <PosterText id="leaseConditionLine" value={values.leaseConditionLine} />
        <PosterText id="agencyName" value={values.agencyName} />
        <PosterText id="phoneNumber" value={values.phoneNumber} />
        <PosterText id="ctaLine" value={values.ctaLine} />
      </g>

      {qrDataUrl ? (
        <g>
          <rect
            x={QR.boxX}
            y={QR.boxY}
            width={QR.boxSize}
            height={QR.boxSize}
            fill="#fbfaf6"
          />
          <image
            href={qrDataUrl}
            x={QR.imageX}
            y={QR.imageY}
            width={QR.imageSize}
            height={QR.imageSize}
            preserveAspectRatio="xMidYMid meet"
          />
        </g>
      ) : null}
    </svg>
  );
}

function buildGridSvgMarkup() {
  const grid = [];
  const x0 = GRID.x;
  const y0 = GRID.y;
  const w = GRID.width;
  const h = GRID.height;
  const columns = GRID.columns;
  const rows = GRID.rows;

  for (let i = 0; i <= columns; i += 1) {
    const x = x0 + (w / columns) * i;
    grid.push(`<line x1="${x}" y1="${y0}" x2="${x}" y2="${y0 + h}"/>`);
  }

  for (let i = 0; i <= rows; i += 1) {
    const y = y0 + (h / rows) * i;
    grid.push(`<line x1="${x0}" y1="${y}" x2="${x0 + w}" y2="${y}"/>`);
  }

  return grid.join("");
}

function buildTextSvgMarkup(id, text) {
  const p = POSITIONS[id];

  if (!p) return "";

  return `<text x="${p.x}" y="${p.y}" font-size="${p.size}" font-weight="${p.weight}" letter-spacing="${p.tracking}">${escapeXml(text)}</text>`;
}

function buildStandaloneSvg(values, qrDataUrl) {
  const blue = getSafeColor(values.fontColor);
  const font = "Helvetica Neue, Helvetica, Arial, Noto Sans KR, Pretendard, sans-serif";

  const textMarkup = [
    buildTextSvgMarkup("mainHeadline", values.mainHeadline),
    buildTextSvgMarkup("englishHeadline", values.englishHeadline),
    buildTextSvgMarkup("locationLine", values.locationLine),
    buildTextSvgMarkup("trafficFeatureLine", values.trafficFeatureLine),
    buildTextSvgMarkup("accessLine", values.accessLine),
    buildTextSvgMarkup("recommendedBusinessLine", values.recommendedBusinessLine),
    buildTextSvgMarkup("leaseConditionLine", values.leaseConditionLine),
    buildTextSvgMarkup("agencyName", values.agencyName),
    buildTextSvgMarkup("phoneNumber", values.phoneNumber),
    buildTextSvgMarkup("ctaLine", values.ctaLine),
  ].join("\n    ");

  const qrMarkup = qrDataUrl
    ? `<g>
        <rect x="${QR.boxX}" y="${QR.boxY}" width="${QR.boxSize}" height="${QR.boxSize}" fill="#fbfaf6"/>
        <image href="${qrDataUrl}" x="${QR.imageX}" y="${QR.imageY}" width="${QR.imageSize}" height="${QR.imageSize}" preserveAspectRatio="xMidYMid meet"/>
      </g>`
    : "";

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${ARTBOARD.width}" height="${ARTBOARD.height}" viewBox="0 0 ${ARTBOARD.width} ${ARTBOARD.height}">
  <rect width="${ARTBOARD.width}" height="${ARTBOARD.height}" fill="#fbfaf6"/>
  <g stroke="#d9d9d4" stroke-width="1" opacity="0.9">${buildGridSvgMarkup()}</g>
  <g fill="${escapeXml(blue)}" font-family="${escapeXml(font)}" text-anchor="start">
    ${textMarkup}
  </g>
  ${qrMarkup}
</svg>`;
}

function downloadBlob(filename, blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");

  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function App() {
  const [values, setValues] = useState(DEFAULTS);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [scale, setScale] = useState(2);
  const [leaseInput, setLeaseInput] = useState({
    address: "부산 금정구 부산대학로 33 1층",
    floor: "",
    areaPyeong: 18,
    deposit: "",
    monthlyRent: "",
    premium: "",
    agencyName: DEFAULTS.agencyName,
    phoneNumber: DEFAULTS.phoneNumber,
    memo: "",
  });
  const [analysis, setAnalysis] = useState(null);
  const [analysisError, setAnalysisError] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const safeFontColor = getSafeColor(values.fontColor);

  useEffect(() => {
    let mounted = true;

    QRCode.toDataURL(phoneToTelUri(values.phoneNumber), {
      errorCorrectionLevel: "M",
      margin: 1,
      width: 512,
      color: {
        dark: safeFontColor,
        light: "#fbfaf6",
      },
    })
      .then((url) => {
        if (mounted) setQrDataUrl(url);
      })
      .catch(() => {
        if (mounted) setQrDataUrl("");
      });

    return () => {
      mounted = false;
    };
  }, [values.phoneNumber, safeFontColor]);

  const svgString = useMemo(() => {
    return buildStandaloneSvg(values, qrDataUrl);
  }, [values, qrDataUrl]);

  const updateField = (key, value) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const updateLeaseInput = (key, value) => {
    setLeaseInput((prev) => ({ ...prev, [key]: value }));
  };

  const updateContactField = (key, value) => {
    setLeaseInput((prev) => ({ ...prev, [key]: value }));
    setValues((prev) => ({
      ...prev,
      [key === "agencyName" ? "agencyName" : "phoneNumber"]: value,
    }));
  };

  const reset = () => {
    setValues(DEFAULTS);
  };

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisError("");

    try {
      const result = await analyzeLease(leaseInput);

      if (!result.ok) {
        setAnalysis(null);
        setAnalysisError(result.message);
        return;
      }

      setAnalysis(result);
      setValues((prev) => ({
        ...prev,
        ...variablesToPosterValues(result.result.variables),
      }));
    } catch (error) {
      setAnalysis(null);
      setAnalysisError(
        error instanceof Error ? error.message : "상권분석 생성 중 오류가 발생했습니다.",
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const exportSvg = () => {
    const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    downloadBlob("lease-poster.svg", blob);
  };

  const exportPng = () => {
    const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();

    img.decoding = "async";

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = ARTBOARD.width * scale;
      canvas.height = ARTBOARD.height * scale;

      const ctx = canvas.getContext("2d");

      if (!ctx) {
        URL.revokeObjectURL(url);
        return;
      }

      ctx.fillStyle = "#fbfaf6";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      URL.revokeObjectURL(url);

      canvas.toBlob((blob) => {
        if (blob) {
          downloadBlob(
            `lease-poster-${ARTBOARD.width * scale}x${ARTBOARD.height * scale}.png`,
            blob
          );
        }
      }, "image/png");
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
    };

    img.src = url;
  };

  return (
    <main className="min-h-screen bg-neutral-100 text-neutral-950">
      <div className="mx-auto grid max-w-[1500px] gap-6 px-5 py-6 lg:grid-cols-[390px_1fr]">
        <section className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-start justify-between gap-3">
            <div>
              <h1 className="text-xl font-semibold tracking-tight">
                임대 포스터 자동 생성기
              </h1>
              <p className="mt-1 text-sm leading-6 text-neutral-500">
                변수만 입력하면 4:3 미니멀 그리드 포스터가 자동으로 갱신됩니다.
              </p>
            </div>

            <button
              onClick={reset}
              className="rounded-2xl border border-neutral-200 p-2 text-neutral-600 transition hover:bg-neutral-50"
              aria-label="기본값 복원"
              type="button"
            >
              <RefreshCw size={18} />
            </button>
          </div>

          <div className="space-y-4">
            <section className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
              <div className="mb-3">
                <h2 className="text-sm font-semibold text-neutral-900">
                  부산대 대학로 임대 분석
                </h2>
                <p className="mt-1 text-xs leading-5 text-neutral-500">
                  주소 끝에 층수를 함께 넣으면 도로명·건물번호 기준으로 문구를 채웁니다.
                </p>
              </div>

              <div className="space-y-3">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold text-neutral-500">
                    주소 + 층수
                  </span>
                  <input
                    value={leaseInput.address}
                    onChange={(e) => updateLeaseInput("address", e.target.value)}
                    className="w-full rounded-2xl border border-blue-100 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                    placeholder="부산 금정구 부산대학로 33 1층"
                  />
                </label>

                <div className="grid grid-cols-2 gap-2">
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-semibold text-neutral-500">
                      부동산명
                    </span>
                    <input
                      value={leaseInput.agencyName}
                      onChange={(e) => updateContactField("agencyName", e.target.value)}
                      className="w-full rounded-2xl border border-blue-100 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1.5 block text-xs font-semibold text-neutral-500">
                      전화번호
                    </span>
                    <input
                      value={leaseInput.phoneNumber}
                      onChange={(e) => updateContactField("phoneNumber", e.target.value)}
                      className="w-full rounded-2xl border border-blue-100 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-semibold text-neutral-500">
                      층수
                    </span>
                    <input
                      value={leaseInput.floor}
                      onChange={(e) => updateLeaseInput("floor", e.target.value)}
                      className="w-full rounded-2xl border border-blue-100 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                      placeholder="주소에 없을 때만"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1.5 block text-xs font-semibold text-neutral-500">
                      면적
                    </span>
                    <input
                      value={leaseInput.areaPyeong}
                      onChange={(e) => updateLeaseInput("areaPyeong", e.target.value)}
                      className="w-full rounded-2xl border border-blue-100 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                      inputMode="decimal"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-semibold text-neutral-500">
                      보증금
                    </span>
                    <input
                      value={leaseInput.deposit}
                      onChange={(e) => updateLeaseInput("deposit", e.target.value)}
                      className="w-full rounded-2xl border border-blue-100 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1.5 block text-xs font-semibold text-neutral-500">
                      월세
                    </span>
                    <input
                      value={leaseInput.monthlyRent}
                      onChange={(e) => updateLeaseInput("monthlyRent", e.target.value)}
                      className="w-full rounded-2xl border border-blue-100 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                    />
                  </label>
                </div>

                <button
                  onClick={runAnalysis}
                  disabled={isAnalyzing}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                  type="button"
                >
                  {isAnalyzing ? (
                    <LoaderCircle className="animate-spin" size={17} />
                  ) : (
                    <Search size={17} />
                  )}
                  분석해서 포스터 반영
                </button>

                {analysisError ? (
                  <p className="rounded-2xl bg-white px-3 py-2 text-xs leading-5 text-red-600">
                    {analysisError}
                  </p>
                ) : null}

                {analysis ? (
                  <div className="rounded-2xl bg-white px-3 py-2 text-xs leading-5 text-neutral-600">
                    <div className="font-semibold text-neutral-900">
                      {analysis.tradeArea.roadZone.shortLabel} · {analysis.tradeArea.floor.label}
                    </div>
                    <div>
                      {analysis.parsedAddress.roadName || "도로명 미확인"}{" "}
                      {analysis.parsedAddress.buildingNumber || ""} ·{" "}
                      {analysis.parsedAddress.floorInput || "층수 미확인"}
                    </div>
                    <div>
                      추천 업종:{" "}
                      {analysis.result.variables.RECOMMENDED_BUSINESS_LINE.replace(" 추천", "")}
                    </div>
                  </div>
                ) : null}
              </div>
            </section>

            {FIELD_LABELS.map(([key, label]) => (
              <label key={key} className="block">
                <span className="mb-1.5 block text-xs font-semibold text-neutral-500">
                  {label}
                </span>
                <input
                  value={values[key] || ""}
                  onChange={(e) => updateField(key, e.target.value)}
                  className="w-full rounded-2xl border border-neutral-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-neutral-400 focus:ring-4 focus:ring-neutral-100"
                />
              </label>
            ))}

            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-neutral-500">
                폰트 색상
              </span>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={safeFontColor}
                  onChange={(e) => updateField("fontColor", e.target.value)}
                  className="h-11 w-14 rounded-2xl border border-neutral-200 bg-white p-1"
                />
                <input
                  value={values.fontColor}
                  onChange={(e) => updateField("fontColor", e.target.value)}
                  className="min-w-0 flex-1 rounded-2xl border border-neutral-200 bg-white px-3 py-2.5 text-sm uppercase outline-none transition focus:border-neutral-400 focus:ring-4 focus:ring-neutral-100"
                  placeholder="#0033D9"
                />
              </div>

              {!isValidHexColor(values.fontColor) ? (
                <p className="mt-1.5 text-xs text-red-500">
                  색상은 #0033D9처럼 6자리 HEX 코드로 입력하세요.
                </p>
              ) : null}
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-neutral-500">
                PNG 저장 배율
              </span>
              <select
                value={scale}
                onChange={(e) => setScale(Number(e.target.value))}
                className="w-full rounded-2xl border border-neutral-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-neutral-400 focus:ring-4 focus:ring-neutral-100"
              >
                <option value={1}>1200 × 900</option>
                <option value={2}>2400 × 1800</option>
                <option value={3}>3600 × 2700</option>
                <option value={4}>4800 × 3600</option>
              </select>
            </label>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={exportPng}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-neutral-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
                type="button"
              >
                <Download size={17} />
                PNG 저장
              </button>

              <button
                onClick={exportSvg}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-50"
                type="button"
              >
                SVG 저장
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-neutral-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 px-1">
            <div>
              <h2 className="text-sm font-semibold">실시간 미리보기</h2>
              <p className="text-xs text-neutral-500">
                전화번호 변경 시 우측 하단 QR도 자동 갱신됩니다.
              </p>
            </div>
            <div className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-500">
              4:3 / 1200×900 기준
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50">
            <PosterSvg values={values} qrDataUrl={qrDataUrl} />
          </div>
        </section>
      </div>
    </main>
  );
}
