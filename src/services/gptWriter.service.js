import { assertLeaseOutputShape } from "../schemas/output.schema";
import { clampText } from "../utils/textLimit";

const BANNED_WORDS = ["매출 보장", "고수익 보장", "무조건 성공", "월매출 확정", "권리금 보장"];

export async function generateLeaseCopy({ input, features }) {
  const recommended = features.recommendedBusinesses.join("·");
  const leaseCondition = buildLeaseConditionLine(input);
  const copyBase = features.copyBase;

  const output = {
    report: {
      targetSummary: `해당 점포는 ${features.zone.label}에 속한 ${features.floor.label} 임대 대상지로, ${features.mainCustomer.join(", ")} 중심의 수요를 고려할 수 있는 입지입니다.`,
      businessAnalysis: `${features.evidence[0]} 기준에 ${features.floor.label} 업종 적합성을 결합하면 ${recommended} 업종 검토가 자연스럽습니다.`,
      salesAnalysis: `${copyBase.zoneSalesPotential}가 있으나 실제 매출은 보장할 수 없으므로, 임대 문구는 수요 가능성과 운영 적합성 중심으로 표현했습니다.`,
      populationAnalysis: `주 고객층은 ${features.mainCustomer.join(", ")}으로 볼 수 있으며, 가격 접근성과 빠른 이용 편의성이 중요합니다.`,
      localStatus:
        `${features.zone.shortLabel}은 부산대 주변에서도 권역 성격이 뚜렷하므로, 정돈된 임대 게시물과 짧은 권역 문구가 지역 미관 개선에 적합합니다.`,
      customerCharacteristics:
        `${copyBase.floorFocus} 따라서 포스터에는 업종을 길게 설명하기보다 권역과 층수에 맞는 추천 업종을 짧게 제시하는 편이 효과적입니다.`,
      deliverySalesAnalysis: `배달 실매출 데이터가 없는 경우 단정은 어렵지만, 이 권역의 배달·포장 적합도는 ${features.deliveryFit} 수준으로 보고 ${recommended} 업종의 포장 대응 가능성을 검토할 수 있습니다.`,
    },
    variables: {
      MAIN_HEADLINE: "임대",
      ENGLISH_HEADLINE_LINE_1: "FOR",
      ENGLISH_HEADLINE_LINE_2: "LEASE",
      LOCATION_LINE: clampText(copyBase.locationLine, 24),
      TRAFFIC_FEATURE_LINE: clampText(copyBase.trafficFeatureLine, 28),
      ACCESS_LINE: clampText(copyBase.accessLine, 28),
      RECOMMENDED_BUSINESS_LINE: clampText(`${recommended} 추천`, 28),
      LEASE_CONDITION_LINE: clampText(leaseCondition, 28),
      AGENCY_NAME: input.agencyName,
      PHONE_NUMBER: input.phoneNumber,
      CTA_LINE: clampText(copyBase.ctaLine, 24),
      FONT_COLOR: "#0033D9",
    },
    confidence: {
      overall: "보통",
      reason:
        "권역 좌표, 주소 키워드, 층수 룰, 로컬 업종 스냅샷을 결합했으나 실제 매출·배달매출 데이터는 별도 연동이 필요합니다.",
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
