export const PNU_TRADE_AREA = {
  name: "부산대학교 대학로 상권",
  center: {
    lat: 35.2317,
    lng: 129.084,
  },
  radiusMeters: {
    core: 150,
    main: 250,
    extended: 350,
    maxAllowed: 700,
  },
  subZones: [
    {
      id: "pnu_main_street",
      label: "부산대 대학로 메인 보행상권",
      keywords: ["부산대", "대학로", "정문", "장전동"],
    },
    {
      id: "pnu_station",
      label: "부산대역 접근 상권",
      keywords: ["부산대역", "지하철", "역세권"],
    },
    {
      id: "jangjeon_residential",
      label: "장전동 배후 주거상권",
      keywords: ["장전동", "원룸", "주거", "생활밀착"],
    },
  ],
  preferredBusinessTypes: [
    "카페",
    "디저트",
    "분식",
    "간편식",
    "테이크아웃",
    "소품샵",
    "생활서비스",
    "스터디카페",
  ],
  riskyClaims: ["월매출 보장", "고수익 확정", "무조건 성공", "권리금 보장"],
};
