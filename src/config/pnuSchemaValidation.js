export function validatePnuSchemaCoverage({
  roadZones,
  businessMatrix,
  fallbackRules,
  floorRules,
}) {
  const zoneIds = new Set(roadZones.map((zone) => zone.id));
  const matrixIds = new Set(Object.keys(businessMatrix));
  const fallbackIds = new Set(fallbackRules.map((rule) => rule.id));
  const floorIds = Object.keys(floorRules);

  const errors = [];
  const warnings = [];

  for (const id of zoneIds) {
    if (!matrixIds.has(id)) {
      errors.push(`PNU_ROAD_ZONES id가 matrix에 없습니다: ${id}`);
    }
  }

  for (const id of matrixIds) {
    if (!zoneIds.has(id)) {
      errors.push(`matrix id가 PNU_ROAD_ZONES에 없습니다: ${id}`);
    }
  }

  for (const id of fallbackIds) {
    if (!zoneIds.has(id)) {
      errors.push(`fallback id가 PNU_ROAD_ZONES에 없습니다: ${id}`);
    }

    if (!matrixIds.has(id)) {
      errors.push(`fallback id가 matrix에 없습니다: ${id}`);
    }
  }

  for (const [zoneId, floorMatrix] of Object.entries(businessMatrix)) {
    for (const floorId of floorIds) {
      if (!floorMatrix[floorId]) {
        warnings.push(`${zoneId}에 ${floorId} 층수 추천 업종이 없습니다.`);
      }
    }
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
  };
}
