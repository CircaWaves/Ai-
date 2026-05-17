export function clampText(value, maxLength) {
  const text = String(value || "").trim();

  if (!maxLength || text.length <= maxLength) {
    return text;
  }

  return text.slice(0, maxLength);
}
