export function parseLeaseAddressInput(rawInput) {
  if (!rawInput || typeof rawInput !== "string") {
    throw new Error("주소를 입력해주세요.");
  }

  const cleaned = rawInput.replace(/\s+/g, " ").trim();
  const floorMatch = cleaned.match(
    /\s+(지하\s*\d*층?|지하|B\s*\d+(?:F|층)?|\d+\s*(?:층|F))$/i,
  );
  const rawFloor = floorMatch ? floorMatch[1].replace(/\s+/g, "") : "";
  const addressOnly = floorMatch ? cleaned.slice(0, floorMatch.index).trim() : cleaned;
  const normalizedAddress = normalizeBusanAddress(addressOnly);
  const roadInfo = extractRoadInfo(normalizedAddress);

  return {
    rawInput: cleaned,
    addressOnly: normalizedAddress,
    floorInput: rawFloor,
    floorType: parseFloorType(rawFloor),
    roadName: roadInfo.roadName,
    buildingNumber: roadInfo.buildingNumber,
    buildingSubNumber: roadInfo.buildingSubNumber,
  };
}

function normalizeBusanAddress(address) {
  return address
    .replace(/^부산\s+/, "부산광역시 ")
    .replace(/^부산시\s+/, "부산광역시 ")
    .trim();
}

function extractRoadInfo(address) {
  const match = address.match(
    /금정구\s+([가-힣0-9]+(?:로|길|번길))\s+(\d+)(?:-(\d+))?/,
  );

  if (!match) {
    return {
      roadName: "",
      buildingNumber: null,
      buildingSubNumber: null,
    };
  }

  return {
    roadName: match[1],
    buildingNumber: Number(match[2]),
    buildingSubNumber: match[3] ? Number(match[3]) : null,
  };
}

export function parseFloorType(floorInput) {
  if (!floorInput) return "unknown";

  const text = String(floorInput).trim().toLowerCase();

  if (text.includes("지하") || text.startsWith("b")) {
    return "basement";
  }

  const numberMatch = text.match(/\d+/);
  const floorNumber = numberMatch ? Number(numberMatch[0]) : null;

  if (floorNumber === 1) return "first";
  if (floorNumber === 2) return "second";
  if (floorNumber && floorNumber >= 3) return "upper";

  return "unknown";
}
