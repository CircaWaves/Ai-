const DEFAULT_INPUT = {
  agencyName: "OO공인중개사",
  phoneNumber: "010-1234-5678",
};

export function parseLeaseAnalyzeInput(body) {
  const input = {
    ...DEFAULT_INPUT,
    ...body,
  };

  if (!input.address || String(input.address).trim().length < 5) {
    throw new Error("주소는 5자 이상 입력하세요.");
  }

  const parsedAreaPyeong = parseAreaPyeong(input.areaPyeong);

  if (input.areaPyeong !== undefined && input.areaPyeong !== "" && parsedAreaPyeong === null) {
    throw new Error("면적은 숫자로 입력하세요.");
  }

  return {
    ...input,
    address: String(input.address).trim(),
    areaPyeong:
      input.areaPyeong === undefined || input.areaPyeong === ""
        ? undefined
        : parsedAreaPyeong,
  };
}

function parseAreaPyeong(value) {
  if (value === undefined || value === "") return undefined;

  if (typeof value === "number") {
    return Number.isNaN(value) ? null : value;
  }

  const match = String(value).match(/\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : null;
}
