export const leaseOutputJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["report", "variables", "confidence", "warnings", "condition"],
  properties: {
    report: {
      type: "object",
      additionalProperties: false,
      required: [
        "targetSummary",
        "businessAnalysis",
        "salesAnalysis",
        "populationAnalysis",
        "localStatus",
        "customerCharacteristics",
        "deliverySalesAnalysis",
      ],
    },
    variables: {
      type: "object",
      additionalProperties: false,
      required: [
        "MAIN_HEADLINE",
        "ENGLISH_HEADLINE_LINE_1",
        "ENGLISH_HEADLINE_LINE_2",
        "LOCATION_LINE",
        "TRAFFIC_FEATURE_LINE",
        "ACCESS_LINE",
        "RECOMMENDED_BUSINESS_LINE",
        "LEASE_CONDITION_LINE",
        "AGENCY_NAME",
        "PHONE_NUMBER",
        "CTA_LINE",
        "FONT_COLOR",
      ],
    },
    confidence: {
      type: "object",
      additionalProperties: false,
      required: ["overall", "reason"],
    },
    warnings: {
      type: "array",
      items: { type: "string" },
    },
    condition: {
      type: "object",
      additionalProperties: false,
      required: ["posterLine", "webSummary", "internalNote", "disclosureLevel"],
      properties: {
        posterLine: { type: "string" },
        webSummary: { type: "string" },
        internalNote: { type: "string" },
        disclosureLevel: { type: "string" },
      },
    },
  },
};

export function assertLeaseOutputShape(output) {
  const requiredTopLevel = leaseOutputJsonSchema.required;

  for (const key of requiredTopLevel) {
    if (!(key in output)) {
      throw new Error(`분석 결과 누락: ${key}`);
    }
  }

  for (const key of leaseOutputJsonSchema.properties.variables.required) {
    if (!(key in output.variables)) {
      throw new Error(`포스터 변수 누락: ${key}`);
    }
  }

  return output;
}
