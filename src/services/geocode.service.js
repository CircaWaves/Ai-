import { PNU_TRADE_AREA } from "../config/pnuTradeArea";

const KNOWN_PNU_POINTS = [
  {
    match: ["부산대역"],
    address: "부산광역시 금정구 장전동 부산대역 인근",
    lat: 35.2301,
    lng: 129.0882,
    region3: "장전동",
  },
  {
    match: ["부산대", "부산대학교", "대학로", "장전동"],
    address: "부산광역시 금정구 장전동 부산대학교 대학로 인근",
    lat: PNU_TRADE_AREA.center.lat,
    lng: PNU_TRADE_AREA.center.lng,
    region3: "장전동",
  },
];

export async function geocodeAddress(address) {
  const query = String(address || "").trim();
  const kakaoKey = import.meta.env.VITE_KAKAO_REST_API_KEY;

  if (kakaoKey) {
    try {
      return await geocodeWithKakao(query, kakaoKey);
    } catch (error) {
      console.warn(error);
    }
  }

  const fallback = KNOWN_PNU_POINTS.find((point) =>
    point.match.some((keyword) => query.includes(keyword)),
  );

  if (!fallback) {
    throw new Error(
      "주소 좌표 변환에 실패했습니다. 부산대, 장전동, 대학로 등 위치 단서를 포함해 입력하세요.",
    );
  }

  return {
    address: fallback.address,
    lat: fallback.lat,
    lng: fallback.lng,
    region1: "부산광역시",
    region2: "금정구",
    region3: fallback.region3,
    source: "local-fallback",
  };
}

async function geocodeWithKakao(address, kakaoKey) {
  const url = new URL("https://dapi.kakao.com/v2/local/search/address.json");
  url.searchParams.set("query", address);

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `KakaoAK ${kakaoKey}`,
    },
  });

  if (!res.ok) {
    throw new Error("카카오 주소 좌표 변환에 실패했습니다.");
  }

  const data = await res.json();
  const first = data.documents?.[0];

  if (!first) {
    throw new Error("해당 주소를 찾을 수 없습니다.");
  }

  return {
    address: first.address_name,
    lat: Number(first.y),
    lng: Number(first.x),
    region1: first.address?.region_1depth_name,
    region2: first.address?.region_2depth_name,
    region3: first.address?.region_3depth_name,
    source: "kakao",
  };
}
