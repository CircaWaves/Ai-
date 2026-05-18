export function makeLeaseCondition({ input, context = {} }) {
  const deposit = normalizeText(input.deposit);
  const monthlyRent = normalizeText(input.monthlyRent);
  const premium = normalizeText(input.premium);
  const managementFee = normalizeText(input.managementFee);
  const availableFrom = normalizeText(input.availableFrom);
  const priceDisclosure = normalizePriceDisclosure(input.priceDisclosure);

  const floorType = context.floorType;
  const zoneId = context.zoneId;
  const conditionText = [deposit, monthlyRent, premium].filter(Boolean).join(" ");
  const isNegotiable = conditionText.includes("협의");
  const isPremiumNone = getIsPremiumNone(premium);
  const isImmediate = availableFrom.includes("즉시") || availableFrom.includes("바로");
  const hasDeposit = Boolean(deposit);
  const hasRent = Boolean(monthlyRent);

  let posterLine = "";
  let disclosureLevel = "summary";

  if (isPremiumNone) {
    posterLine = "권리금 없음";
  } else if (isImmediate) {
    posterLine = "즉시입점 가능";
  } else if (priceDisclosure === "public" && hasDeposit && hasRent && !isNegotiable) {
    posterLine = formatDepositRentLine(deposit, monthlyRent);
    disclosureLevel = "public";
  } else if (priceDisclosure === "negotiable") {
    posterLine = "보증금·월세 협의";
    disclosureLevel = "negotiable";
  } else if (isNegotiable) {
    posterLine = "보증금·월세 협의";
    disclosureLevel = "negotiable";
  } else if ((hasDeposit || hasRent) && priceDisclosure === "hidden") {
    posterLine = getHiddenConditionLine({ floorType, zoneId });
    disclosureLevel = "hidden";
  } else {
    posterLine = "임대조건 협의";
    disclosureLevel = "negotiable";
  }

  return {
    posterLine,
    webSummary: makeWebConditionSummary({
      deposit,
      monthlyRent,
      premium,
      managementFee,
      availableFrom,
    }),
    internalNote: makeInternalConditionNote({ premium, isPremiumNone, availableFrom }),
    disclosureLevel,
  };
}

function normalizeText(value) {
  if (!value) return "";
  return String(value).trim();
}

function normalizePriceDisclosure(value) {
  if (["public", "hidden", "negotiable"].includes(value)) {
    return value;
  }

  return "hidden";
}

function getIsPremiumNone(premium) {
  if (!premium) return false;

  const text = premium.replace(/\s+/g, "");

  if (text.includes("없음") || text.includes("무권리")) {
    return true;
  }

  const numeric = Number(text.replace(/[^\d]/g, ""));

  return Number.isFinite(numeric) && numeric === 0;
}

function getHiddenConditionLine({ floorType, zoneId }) {
  if (floorType === "upper" || floorType === "second") return "합리적 임대조건";
  if (floorType === "basement") return "공간활용 조건문의";
  if (zoneId === "north_gate_food") return "식당창업 조건문의";
  if (zoneId === "main_gate_alley") return "소형창업 조건";

  return "임대조건 문의";
}

function formatDepositRentLine(deposit, monthlyRent) {
  return `보 ${formatMoneyShort(deposit)} / 월 ${formatMoneyShort(monthlyRent)}`;
}

function formatMoneyShort(value) {
  const text = String(value).replace(/[^\d]/g, "");

  if (!text) return value;

  const num = Number(text);

  if (num >= 10000) {
    return `${Math.round(num / 10000)}억`;
  }

  if (num >= 1000) {
    return `${Math.round(num / 1000)}천`;
  }

  return `${num}`;
}

function makeWebConditionSummary({
  deposit,
  monthlyRent,
  premium,
  managementFee,
  availableFrom,
}) {
  const parts = [];

  if (deposit) parts.push(`보증금 ${formatMoneyFull(deposit)}`);
  if (monthlyRent) parts.push(`월세 ${formatMoneyFull(monthlyRent)}`);
  if (managementFee) parts.push(`관리비 ${formatMoneyFull(managementFee)}`);
  if (premium) parts.push(`권리금 ${formatPremiumFull(premium)}`);
  if (availableFrom) parts.push(`입점 ${availableFrom}`);

  return parts.length ? parts.join(" / ") : "임대조건 협의";
}

function formatMoneyFull(value) {
  const raw = String(value).trim();

  if (!raw) return "";
  if (raw.includes("협의")) return raw;
  if (/[억만원]/.test(raw)) return raw;

  const numeric = raw.replace(/[^\d]/g, "");
  return numeric ? `${numeric}만원` : raw;
}

function formatPremiumFull(value) {
  if (getIsPremiumNone(value)) return "없음";
  return formatMoneyFull(value);
}

function makeInternalConditionNote({ premium, isPremiumNone, availableFrom }) {
  const notes = [];

  if (isPremiumNone) {
    notes.push("권리금 없음은 임대인 확인 필요");
  }

  if (availableFrom) {
    notes.push(`입점 가능일 확인: ${availableFrom}`);
  }

  if (premium && !isPremiumNone) {
    notes.push("권리금 조건 확인 필요");
  }

  return notes.join(" / ");
}
