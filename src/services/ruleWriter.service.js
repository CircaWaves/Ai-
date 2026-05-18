import { PNU_FLOOR_RULES } from "../config/pnuFloorRules";
import { assertLeaseOutputShape } from "../schemas/output.schema";
import { makeLeaseCondition } from "../utils/leaseCondition";

export function generateLeaseVariablesByRule({ input, parsedAddress, zone }) {
  const floorRule = PNU_FLOOR_RULES[parsedAddress.floorType] || PNU_FLOOR_RULES.unknown;
  const condition = makeLeaseCondition({
    input,
    context: {
      floorType: floorRule.id,
      zoneId: zone.id,
    },
  });
  const recommendedBusinesses = pickRecommendedBusinesses({
    zone,
    floorRule,
  });

  const variables = {
    MAIN_HEADLINE: "임대",
    ENGLISH_HEADLINE_LINE_1: "FOR",
    ENGLISH_HEADLINE_LINE_2: "LEASE",
    LOCATION_LINE: limitText(zone.variables.LOCATION_LINE, 24),
    TRAFFIC_FEATURE_LINE: limitText(pickTrafficLine({ zone, floorRule }), 28),
    ACCESS_LINE: limitText(pickAccessLine({ zone, floorRule }), 28),
    RECOMMENDED_BUSINESS_LINE: limitText(`${recommendedBusinesses.join("·")} 추천`, 28),
    LEASE_CONDITION_LINE: limitText(condition.posterLine, 28),
    AGENCY_NAME: input.agencyName ?? "OO공인중개사",
    PHONE_NUMBER: input.phoneNumber || "010-1234-5678",
    CTA_LINE: limitText(floorRule.ctaLine || zone.variables.CTA_LINE, 24),
    FONT_COLOR: "#0033D9",
  };

  validateAdCopy(variables);

  return assertLeaseOutputShape({
    report: makeReport({
      parsedAddress,
      zone,
      floorRule,
      recommendedBusinesses,
    }),
    variables,
    confidence: {
      overall: "보통",
      reason: "도로명·건물번호와 층수 정보를 기준으로 부산대 주변 상권 문구를 생성했습니다.",
    },
    warnings: [
      "정확한 매출 보장 표현은 사용하지 않았습니다.",
      "층수별 추천 업종은 임대 홍보용 참고 분석입니다.",
    ],
    condition,
  });
}

function pickTrafficLine({ zone, floorRule }) {
  if (floorRule.id === "first") {
    return floorRule.trafficPhrase;
  }

  if (floorRule.id === "basement") {
    return "독립공간 활용 입지";
  }

  if (floorRule.id === "upper") {
    return "공간활용 우수 입지";
  }

  return floorRule.trafficPhrase || zone.variables.TRAFFIC_FEATURE_LINE;
}

function pickAccessLine({ zone, floorRule }) {
  if (floorRule.id === "first") {
    return zone.variables.ACCESS_LINE || floorRule.accessPhrase;
  }

  return floorRule.accessPhrase || zone.variables.ACCESS_LINE;
}

function pickRecommendedBusinesses({ zone, floorRule }) {
  const zoneBusinesses = zone.recommendedBusinesses || [];
  const floorBusinesses = floorRule.recommendedBusinesses || [];
  const merged =
    floorRule.id === "first"
      ? [...zoneBusinesses, ...floorBusinesses]
      : [...floorBusinesses, ...zoneBusinesses];

  return [...new Set(merged)].slice(0, 3);
}

function makeReport({ parsedAddress, zone, floorRule, recommendedBusinesses }) {
  return {
    targetSummary:
      `${parsedAddress.addressOnly}에 위치한 ${floorRule.label} 임대 대상지입니다. ` +
      `해당 주소는 ${zone.label}으로 분류됩니다.`,
    businessAnalysis:
      `${zone.label}의 상권 성격과 ${floorRule.label} 특성을 고려하면 ` +
      `${recommendedBusinesses.join(", ")} 업종이 적합합니다.`,
    salesAnalysis:
      "정확한 매출 보장은 어렵지만, 권역 특성과 층수에 따라 유입 방식이 달라집니다. " +
      "1층은 보행 노출, 지하와 2층 이상은 목적방문성이 중요합니다.",
    populationAnalysis:
      "주요 고객층은 부산대 학생, 교직원, 인근 장전동 거주민, 방문객으로 볼 수 있습니다.",
    localStatus:
      "부산대 주변은 도로별·출입문별로 상권 성격이 달라 권역과 층수를 함께 고려한 임대 안내가 필요합니다.",
    customerCharacteristics:
      "학생과 20대 방문객은 접근성, 가격, 빠른 이용을 중시하며, 목적방문 업종은 층수 적합성이 중요합니다.",
    deliverySalesAnalysis:
      "배달 실매출 데이터가 없는 경우 단정은 어렵지만, 식사·간편식 업종은 포장 및 배달 대응 가능성이 있습니다.",
  };
}

function limitText(text, maxLength) {
  if (!text) return "";
  return text.length > maxLength ? text.slice(0, maxLength) : text;
}

function validateAdCopy(variables) {
  const bannedWords = [
    "매출 보장",
    "고수익 보장",
    "무조건 성공",
    "월매출 확정",
    "권리금 보장",
    "대박",
  ];
  const joined = Object.values(variables).join(" ");

  for (const word of bannedWords) {
    if (joined.includes(word)) {
      throw new Error(`금지 광고 문구가 포함되었습니다: ${word}`);
    }
  }
}
