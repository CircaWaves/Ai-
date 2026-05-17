import { PNU_ROAD_ZONE_FALLBACK_RULES } from "../config/pnuRoadZoneFallbackRules";

export function detectPnuZoneByRoadInfo(parsedAddress) {
  const { roadName, buildingNumber } = parsedAddress;

  if (!roadName || !buildingNumber) {
    return getUnknownZone();
  }

  const matched = PNU_ROAD_ZONE_FALLBACK_RULES.find((rule) => {
    return (
      rule.roadName === roadName &&
      buildingNumber >= rule.minBuildingNumber &&
      buildingNumber <= rule.maxBuildingNumber
    );
  });

  return matched || getUnknownZone();
}

function getUnknownZone() {
  return {
    id: "pnu_unknown",
    label: "부산대 인접상권",
    variables: {
      LOCATION_LINE: "부산대 인접상권",
      TRAFFIC_FEATURE_LINE: "대학가 수요 입지",
      ACCESS_LINE: "상권 접근성 확인 필요",
      RECOMMENDED_BUSINESS_LINE: "카페·분식·서비스 추천",
      CTA_LINE: "상권분석 임대문의",
    },
    recommendedBusinesses: ["카페", "분식", "생활서비스"],
  };
}
