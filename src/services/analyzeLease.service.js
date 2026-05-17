import { parseLeaseAnalyzeInput } from "../schemas/input.schema";
import { geocodeAddress } from "./geocode.service";
import { validatePnuTradeArea, extractPnuFeatures } from "./featureExtract.service";
import { getNearbyMarketSnapshot } from "./marketData.service";
import { generateLeaseCopy } from "./gptWriter.service";

export async function analyzeLease(body) {
  const input = parseLeaseAnalyzeInput(body);
  const geo = await geocodeAddress(input.address);
  const areaCheck = validatePnuTradeArea(geo.lat, geo.lng);

  if (!areaCheck.isInside) {
    return {
      ok: false,
      code: "OUT_OF_PNU_TRADE_AREA",
      message: "입력한 주소가 부산대 앞 임대 게시물 자동작성 대상 범위를 벗어났습니다.",
      distanceFromCenter: areaCheck.distanceFromCenter,
    };
  }

  const snapshots = await Promise.all(
    [150, 250, 350].map((radiusMeters) =>
      getNearbyMarketSnapshot({
        lat: geo.lat,
        lng: geo.lng,
        radiusMeters,
      }),
    ),
  );

  const features = extractPnuFeatures({
    areaLabel: areaCheck.areaLabel,
    snapshots,
  });

  const result = await generateLeaseCopy({
    input,
    features,
  });

  return {
    ok: true,
    address: geo.address,
    coordinate: {
      lat: geo.lat,
      lng: geo.lng,
    },
    tradeArea: {
      name: "부산대학교 대학로 상권",
      areaLabel: areaCheck.areaLabel,
      distanceFromCenter: areaCheck.distanceFromCenter,
    },
    rawAnalysis: {
      snapshots,
      features,
    },
    result,
  };
}

export function variablesToPosterValues(variables) {
  return {
    mainHeadline: variables.MAIN_HEADLINE,
    englishHeadline: `${variables.ENGLISH_HEADLINE_LINE_1} ${variables.ENGLISH_HEADLINE_LINE_2}`,
    locationLine: variables.LOCATION_LINE,
    trafficFeatureLine: variables.TRAFFIC_FEATURE_LINE,
    accessLine: variables.ACCESS_LINE,
    recommendedBusinessLine: variables.RECOMMENDED_BUSINESS_LINE,
    leaseConditionLine: variables.LEASE_CONDITION_LINE,
    agencyName: variables.AGENCY_NAME,
    phoneNumber: variables.PHONE_NUMBER,
    ctaLine: variables.CTA_LINE,
    fontColor: variables.FONT_COLOR,
  };
}
