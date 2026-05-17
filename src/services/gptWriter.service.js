import { assertLeaseOutputShape } from "../schemas/output.schema";
import { clampText } from "../utils/textLimit";

const BANNED_WORDS = ["매출 보장", "고수익 보장", "무조건 성공", "월매출 확정", "권리금 보장"];

export async function generateLeaseCopy({ input, features }) {
  const recommended = features.recommendedBusinesses.join("·");
  const leaseCondition = buildLeaseConditionLine(input);

  const output = {
    report: {
      targetSummary: `해당 점포는 ${features.areaLabel}에 위치한 임대 대상지로, ${features.mainCustomer.join(", ")} 중심의 생활·식음 수요를 고려할 수 있는 입지입니다.`,
      businessAnalysis: `${features.evidence[0]} 기준으로 소형 창업형 업종과 생활밀착 업종 검토가 가능합니다.`,
      salesAnalysis: `정확한 매출 보장은 어렵지만, ${features.trafficFeature} 특성을 고려하면 점심·저녁 시간대와 포장 수요 중심의 매출 잠재력을 검토할 수 있습니다.`,
      populationAnalysis: `주 고객층은 ${features.mainCustomer.join(", ")}으로 볼 수 있으며, 가격 접근성과 빠른 이용 편의성이 중요합니다.`,
      localStatus:
        "부산대 앞 대학로는 보행 환경과 시각 이미지가 중요한 상권으로, 정돈된 임대 게시물 사용이 지역 미관 개선에 적합합니다.",
      customerCharacteristics:
        "학생과 20대 방문객은 명확한 가격대, 빠른 이용, 접근성을 중시하므로 짧고 직관적인 업종 제안이 효과적입니다.",
      deliverySalesAnalysis: `배달 실매출 데이터가 없는 경우 단정은 어렵지만, ${recommended} 업종은 포장 및 배달 대응 가능성을 함께 검토할 수 있습니다.`,
    },
    variables: {
      MAIN_HEADLINE: "임대",
      ENGLISH_HEADLINE_LINE_1: "FOR",
      ENGLISH_HEADLINE_LINE_2: "LEASE",
      LOCATION_LINE: clampText(features.areaLabel.replace("보행상권", "주요상권"), 24),
      TRAFFIC_FEATURE_LINE: clampText(features.trafficFeature + " 입지", 28),
      ACCESS_LINE: clampText(features.accessFeature, 28),
      RECOMMENDED_BUSINESS_LINE: clampText(`${recommended} 추천`, 28),
      LEASE_CONDITION_LINE: clampText(leaseCondition, 28),
      AGENCY_NAME: input.agencyName,
      PHONE_NUMBER: input.phoneNumber,
      CTA_LINE: clampText("상권분석 임대문의", 24),
      FONT_COLOR: "#0033D9",
    },
    confidence: {
      overall: "보통",
      reason:
        "부산대 앞 상권 범위와 업종 밀도는 로컬 기준으로 분석했으나, 실제 매출·배달매출 데이터는 별도 연동이 필요합니다.",
    },
    warnings: ["실제 매출 보장 표현은 사용하지 않았습니다.", "배달매출은 추정 분석으로만 표현했습니다."],
  };

  validateAdCopy(output.variables);
  return assertLeaseOutputShape(output);
}

export function validateAdCopy(variables) {
  const joined = Object.values(variables).join(" ");

  for (const word of BANNED_WORDS) {
    if (joined.includes(word)) {
      throw new Error(`금지 표현이 포함되었습니다: ${word}`);
    }
  }
}

function buildLeaseConditionLine(input) {
  const parts = [];

  if (input.deposit) parts.push(`보증금 ${input.deposit}`);
  if (input.monthlyRent) parts.push(`월세 ${input.monthlyRent}`);
  if (input.floor) parts.push(input.floor);
  if (input.areaPyeong) parts.push(`${input.areaPyeong}평`);

  return parts.length ? parts.join(" · ") : "임대조건 협의 가능";
}
