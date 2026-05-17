import { getDistanceMeters } from "../utils/geo";

const PNU_SAMPLE_STORES = [
  ["s-001", "대학로커피", "음식", "카페", "커피전문점", 35.2319, 129.0837],
  ["s-002", "장전분식", "음식", "분식", "분식", 35.2312, 129.0834],
  ["s-003", "정문디저트", "음식", "디저트", "디저트카페", 35.2322, 129.0841],
  ["s-004", "부산대김밥", "음식", "간이음식", "김밥", 35.2314, 129.0845],
  ["s-005", "청년헤어", "서비스", "미용", "미용실", 35.2309, 129.0838],
  ["s-006", "장전생활문구", "소매", "생활용품", "문구", 35.2325, 129.0847],
  ["s-007", "대학로스터디", "서비스", "학원", "스터디카페", 35.2308, 129.0844],
  ["s-008", "테이크아웃랩", "음식", "카페", "테이크아웃", 35.2311, 129.0852],
  ["s-009", "골목라멘", "음식", "일식", "라멘", 35.2326, 129.0832],
  ["s-010", "장전세탁", "서비스", "생활서비스", "세탁", 35.2299, 129.084],
  ["s-011", "부대앞소품", "소매", "패션잡화", "소품샵", 35.2305, 129.0833],
  ["s-012", "학생식당가", "음식", "한식", "한식", 35.2318, 129.0856],
].map(([id, name, categoryLarge, categoryMiddle, categorySmall, lat, lng]) => ({
  id,
  name,
  categoryLarge,
  categoryMiddle,
  categorySmall,
  address: "부산광역시 금정구 장전동",
  lat,
  lng,
}));

export async function getNearbyMarketSnapshot(params) {
  const stores = await loadStoresFromDatabase();
  const nearby = stores
    .map((store) => ({
      ...store,
      distance: getDistanceMeters(
        { lat: params.lat, lng: params.lng },
        { lat: store.lat, lng: store.lng },
      ),
    }))
    .filter((store) => store.distance <= params.radiusMeters)
    .sort((a, b) => a.distance - b.distance);

  const categoryCounts = {};

  for (const store of nearby) {
    const key = store.categoryMiddle || store.categoryLarge || "기타";
    categoryCounts[key] = (categoryCounts[key] || 0) + 1;
  }

  const topCategories = Object.entries(categoryCounts)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  return {
    radiusMeters: params.radiusMeters,
    totalStores: nearby.length,
    categoryCounts,
    topCategories,
    nearbyStoresSample: nearby.slice(0, 20),
  };
}

async function loadStoresFromDatabase() {
  return PNU_SAMPLE_STORES;
}
