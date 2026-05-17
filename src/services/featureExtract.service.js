import { PNU_TRADE_AREA } from "../config/pnuTradeArea";
import { PNU_ROAD_ZONES, PNU_MAX_ANALYSIS_RADIUS_METERS } from "../config/pnuRoadZones";
import { PNU_FLOOR_RULES, PNU_ZONE_FLOOR_BUSINESS_MATRIX } from "../config/pnuFloorRules";
import { getDistanceMeters } from "../utils/geo";
import { parseFloor } from "../utils/floor";

export function validatePnuTradeArea(lat, lng) {
  const distance = getDistanceMeters(PNU_TRADE_AREA.center, { lat, lng });
  const nearestZone = findNearestPnuZone({ lat, lng });
  const allowedDistance = Math.min(distance, nearestZone?.distanceMeters ?? Infinity);

  return {
    isInside:
      distance <= PNU_TRADE_AREA.radiusMeters.maxAllowed ||
      allowedDistance <= PNU_MAX_ANALYSIS_RADIUS_METERS,
    distanceFromCenter: Math.round(distance),
    nearestZone,
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
  const floor = parseFloor(params.input?.floor);
  const zone = params.zone ?? findNearestPnuZone(params.coordinate);
  const zoneRule = zone?.zone ?? PNU_ROAD_ZONES[1];
  const floorRule = PNU_FLOOR_RULES[floor.id] ?? PNU_FLOOR_RULES.unknown;
  const matrixBusinesses =
    PNU_ZONE_FLOOR_BUSINESS_MATRIX[zoneRule.id]?.[floor.id] ??
    floorRule.recommendedBusinesses ??
    zoneRule.recommendedBusinesses;
  const main = params.snapshots.find((snapshot) => snapshot.radiusMeters === 250);
  const topCategories = main?.topCategories.map((item) => item.category) ?? [];
  const nearbyBusinessHints = getNearbyBusinessHints(topCategories);
  const recommendedBusinesses = [
    ...matrixBusinesses,
    ...nearbyBusinessHints,
    ...zoneRule.recommendedBusinesses,
  ];
  const salesPotential = getSalesPotential(zoneRule, floor.id);

  return {
    areaLabel: zoneRule.shortLabel,
    zone: {
      id: zoneRule.id,
      label: zoneRule.label,
      shortLabel: zoneRule.shortLabel,
      distanceMeters: Math.round(zone?.distanceMeters ?? 0),
    },
    floor,
    tradeAreaType: "대학가 근린상권",
    mainCustomer: zoneRule.customerGroups,
    trafficFeature: floorRule.trafficFeatureLine || zoneRule.trafficFeatureLine,
    accessFeature: floorRule.accessLine || zoneRule.accessLine,
    recommendedBusinesses: [...new Set(recommendedBusinesses)].slice(0, 4),
    salesPotential,
    deliveryFit: zoneRule.deliveryFit,
    copyBase: {
      locationLine: zoneRule.locationLine,
      trafficFeatureLine: floorRule.trafficFeatureLine || zoneRule.trafficFeatureLine,
      accessLine: floorRule.accessLine || zoneRule.accessLine,
      ctaLine: floorRule.ctaLine || zoneRule.ctaLine,
      zoneCtaLine: zoneRule.ctaLine,
      floorFocus: floorRule.reportFocus,
      zoneSalesPotential: zoneRule.salesPotential,
    },
    evidence: [
      `250m 반경 주요 업종: ${topCategories.join(", ") || "데이터 부족"}`,
      `상권권역: ${zoneRule.label}`,
      `층수 기준: ${floorRule.label}`,
      `주 고객층: ${zoneRule.customerGroups.join(", ")}`,
    ],
  };
}

export function findNearestPnuZone(coordinate) {
  if (!coordinate) return null;

  return PNU_ROAD_ZONES.map((zone) => ({
    zone,
    distanceMeters: getDistanceMeters(zone.center, coordinate),
  }))
    .sort((a, b) => {
      const withinA = a.distanceMeters <= a.zone.radiusMeters;
      const withinB = b.distanceMeters <= b.zone.radiusMeters;

      if (withinA !== withinB) return withinA ? -1 : 1;
      if (a.distanceMeters !== b.distanceMeters) return a.distanceMeters - b.distanceMeters;
      return b.zone.priority - a.zone.priority;
    })
    [0];
}

function getNearbyBusinessHints(topCategories) {
  const hints = [];

  if (topCategories.some((category) => ["분식", "한식", "간이음식", "일식"].some((keyword) => category.includes(keyword)))) {
    hints.push("간편식");
  }

  if (topCategories.some((category) => ["카페", "디저트"].some((keyword) => category.includes(keyword)))) {
    hints.push("테이크아웃");
  }

  if (topCategories.some((category) => ["미용", "학원", "생활서비스"].some((keyword) => category.includes(keyword)))) {
    hints.push("생활서비스");
  }

  return hints;
}

function getSalesPotential(zoneRule, floorId) {
  if (floorId === "first" && ["pnu_station_core", "main_gate", "north_gate_food"].includes(zoneRule.id)) {
    return "높음";
  }

  if (floorId === "basement" || floorId === "upper") {
    return "보통";
  }

  return "보통";
}
