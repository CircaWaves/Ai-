import { parseLeaseAnalyzeInput } from "../schemas/input.schema";
import { parseLeaseAddressInput } from "../utils/leaseAddressParser";
import { PNU_FLOOR_RULES } from "../config/pnuFloorRules";
import { detectPnuZoneByRoadInfo } from "./zoneDetect.service";
import { generateLeaseVariablesByRule } from "./ruleWriter.service";

export async function analyzeLease(body) {
  const input = parseLeaseAnalyzeInput(body);
  const rawAddressInput = buildRawAddressInput(input);
  const parsedAddress = parseLeaseAddressInput(rawAddressInput);
  const zone = detectPnuZoneByRoadInfo(parsedAddress);
  const result = generateLeaseVariablesByRule({
    input,
    parsedAddress,
    zone,
  });
  const floorRule = PNU_FLOOR_RULES[parsedAddress.floorType] || PNU_FLOOR_RULES.unknown;

  return {
    ok: true,
    address: parsedAddress.addressOnly,
    parsedAddress,
    zone,
    tradeArea: {
      name: "부산대학교 대학로 상권",
      areaLabel: zone.label,
      roadZone: {
        id: zone.id,
        label: zone.label,
        shortLabel: zone.variables.LOCATION_LINE,
        distanceMeters: "-",
      },
      floor: {
        id: floorRule.id,
        label: floorRule.label,
      },
      distanceFromCenter: "-",
    },
    rawAnalysis: {
      snapshots: [],
      features: {
        zone,
        floor: floorRule,
        parsedAddress,
      },
    },
    condition: result.condition,
    result,
  };
}

function buildRawAddressInput(input) {
  const address = String(input.address || "").trim();

  if (address.match(/\s+(반지하|옥탑|지하\s*\d*층?|지하|B\s*\d+(?:F|층)?|\d+\s*(?:층|F))$/i)) {
    return address;
  }

  return [address, input.floor].filter(Boolean).join(" ");
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
