import { PNU_TRADE_AREA } from "../config/pnuTradeArea";
import { getDistanceMeters } from "../utils/geo";

export function validatePnuTradeArea(lat, lng) {
  const distance = getDistanceMeters(PNU_TRADE_AREA.center, { lat, lng });

  return {
    isInside: distance <= PNU_TRADE_AREA.radiusMeters.maxAllowed,
    distanceFromCenter: Math.round(distance),
    areaLabel:
      distance <= PNU_TRADE_AREA.radiusMeters.core
        ? "부산대 대학로 핵심 입지"
        : distance <= PNU_TRADE_AREA.radiusMeters.main
          ? "부산대 앞 주요 보행상권"
          : distance <= PNU_TRADE_AREA.radiusMeters.extended
            ? "부산대 인접 생활상권"
            : "부산대 상권 외곽",
  };
}

export function extractPnuFeatures(params) {
  const main = params.snapshots.find((snapshot) => snapshot.radiusMeters === 250);
  const topCategories = main?.topCategories.map((item) => item.category) ?? [];

  const hasFood = topCategories.some((category) =>
    ["음식", "한식", "분식", "카페", "주점", "간이음식", "디저트"].some((keyword) =>
      category.includes(keyword),
    ),
  );

  const hasService = topCategories.some((category) =>
    ["서비스", "미용", "학원", "생활"].some((keyword) => category.includes(keyword)),
  );

  const recommendedBusinesses = [];

  if (hasFood) {
    recommendedBusinesses.push("카페", "디저트", "분식");
  }

  if (hasService) {
    recommendedBusinesses.push("생활서비스");
  }

  if (recommendedBusinesses.length < 3) {
    recommendedBusinesses.push("테이크아웃", "소형 편집숍", "간편식");
  }

  return {
    areaLabel: params.areaLabel,
    tradeAreaType: "대학가 근린상권",
    mainCustomer: ["부산대 학생", "20대 방문객", "인근 거주민"],
    trafficFeature: "대학가 보행 유동 중심",
    accessFeature: "부산대 대학로 접근성 우수",
    recommendedBusinesses: [...new Set(recommendedBusinesses)].slice(0, 4),
    salesPotential: hasFood ? "보통" : "낮음",
    deliveryFit: hasFood ? "보통" : "낮음",
    evidence: [
      `250m 반경 주요 업종: ${topCategories.join(", ") || "데이터 부족"}`,
      "상권 유형: 부산대 앞 대학가 근린상권",
      "주 고객층: 대학생, 20대 방문객, 인근 거주민",
    ],
  };
}
