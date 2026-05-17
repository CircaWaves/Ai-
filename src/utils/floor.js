export function parseFloor(value) {
  const raw = String(value || "").trim();

  if (!raw) {
    return { id: "unknown", label: "층수 미입력", numeric: null };
  }

  const normalized = raw.toLowerCase().replace(/\s/g, "");

  if (
    normalized.includes("지하") ||
    normalized.includes("b1") ||
    normalized.includes("b층") ||
    normalized.includes("basement")
  ) {
    return { id: "basement", label: "지하", numeric: -1 };
  }

  const match = normalized.match(/-?\d+/);
  const numeric = match ? Number(match[0]) : null;

  if (numeric === 1 || normalized.includes("일층")) {
    return { id: "first", label: "1층", numeric: 1 };
  }

  if (numeric === 2 || normalized.includes("이층")) {
    return { id: "second", label: "2층", numeric: 2 };
  }

  if (numeric !== null && numeric >= 3) {
    return { id: "upper", label: "3층 이상", numeric };
  }

  return { id: "unknown", label: raw, numeric: null };
}
