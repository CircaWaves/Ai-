const DEFAULT_INPUT = {
  agencyName: "원상가 지니부동산",
  phoneNumber: "010-4117-6994",
};

export function parseLeaseAnalyzeInput(body) {
  const input = {
    ...DEFAULT_INPUT,
    ...body,
  };

  if (!input.address || String(input.address).trim().length < 5) {
    throw new Error("주소는 5자 이상 입력하세요.");
  }

  if (
    input.areaPyeong !== undefined &&
    input.areaPyeong !== "" &&
    Number.isNaN(Number(input.areaPyeong))
  ) {
    throw new Error("면적은 숫자로 입력하세요.");
  }

  return {
    ...input,
    address: String(input.address).trim(),
    areaPyeong:
      input.areaPyeong === undefined || input.areaPyeong === ""
        ? undefined
        : Number(input.areaPyeong),
  };
}
