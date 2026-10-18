/* Kargonaut Logistics — local demo data (all fictional). No network requests. */
window.KGN_DATA = {
  // code: [name, country, lat, lon, seaport?, domestic(India)?]
  cities: {
    MUM: ["Mumbai", "India", 19.076, 72.8777, true, true],
    DEL: ["Delhi", "India", 28.6139, 77.209, false, true],
    BLR: ["Bengaluru", "India", 12.9716, 77.5946, false, true],
    CHE: ["Chennai", "India", 13.0827, 80.2707, true, true],
    CCU: ["Kolkata", "India", 22.5726, 88.3639, true, true],
    HYD: ["Hyderabad", "India", 17.385, 78.4867, false, true],
    PNQ: ["Pune", "India", 18.5204, 73.8567, false, true],
    AMD: ["Ahmedabad", "India", 23.0225, 72.5714, false, true],
    JAI: ["Jaipur", "India", 26.9124, 75.7873, false, true],
    LKO: ["Lucknow", "India", 26.8467, 80.9462, false, true],
    BGP: ["Bhagalpur", "India", 25.2425, 86.9842, false, true],
    GAU: ["Guwahati", "India", 26.1445, 91.7362, false, true],
    COK: ["Kochi", "India", 9.9312, 76.2673, true, true],
    DXB: ["Dubai", "UAE", 25.2048, 55.2708, true, false],
    SIN: ["Singapore", "Singapore", 1.3521, 103.8198, true, false],
    CMB: ["Colombo", "Sri Lanka", 6.9271, 79.8612, true, false],
    SHA: ["Shanghai", "China", 31.2304, 121.4737, true, false],
    TYO: ["Tokyo", "Japan", 35.6762, 139.6503, true, false],
    RTM: ["Rotterdam", "Netherlands", 51.9244, 4.4777, true, false],
    FRA: ["Frankfurt", "Germany", 50.1109, 8.6821, false, false],
    LON: ["London", "UK", 51.5074, -0.1278, true, false],
    NBO: ["Nairobi", "Kenya", -1.2921, 36.8219, false, false],
    NYC: ["New York", "USA", 40.7128, -74.006, true, false],
    SYD: ["Sydney", "Australia", -33.8688, 151.2093, true, false]
  },

  // Pricing model (₹). Distances are great-circle km × a mode factor.
  rates: {
    road: { label: "Road", factor: 1.2, perKgKm: 0.010, base: 149, divisor: 5000 },
    air:  { label: "Air",  factor: 1.0, perKgKm: 0.022, base: 499, divisor: 6000 },
    sea:  { label: "Sea",  factor: 1.35, perKgKm: 0.0012, base: 1999, divisor: 1000 }
  },
  service: {
    economy: { label: "Economy", mult: 1.0 },
    express: { label: "Express", mult: 1.5 },
    sameday: { label: "Same-day", mult: 2.4 }
  },
  fuelRate: 0.12,
  gstRate: 0.18,
  sameDayMaxRoadKm: 700,

  // Sample shipments for the tracker. Times are hours relative to "now".
  samples: {
    "KGN-48213-IN": { from: "MUM", to: "DEL", mode: "road", service: "Express", weight: 18, stage: 4, pieces: 2,
      events: [[-50, "Picked up", "Collected from Andheri East pickup point"], [-46, "In transit", "Departed Bhiwandi gateway hub"], [null, "Customs", "Not required for domestic lanes"], [-6, "Out for delivery", "With rider at Okhla delivery centre"], [-2, "Delivered", "Signed by R. Mehta at reception"]] },
    "KGN-77520-AE": { from: "DXB", to: "BLR", mode: "air", service: "Express", weight: 6.5, stage: 2, pieces: 1, etaHours: 30,
      events: [[-40, "Picked up", "Collected in Jebel Ali Free Zone"], [-28, "In transit", "Flight KG 214 landed at Bengaluru air cargo terminal"], [-3, "Customs", "Under review: commercial invoice received"], [null, "Out for delivery", ""], [null, "Delivered", ""]] },
    "KGN-30911-SG": { from: "SIN", to: "CHE", mode: "sea", service: "Economy", weight: 420, stage: 1, pieces: 12, etaHours: 96, progress: 0.62,
      events: [[-110, "Picked up", "Container loaded at Pasir Panjang terminal"], [-90, "In transit", "Vessel MV Coral Lantern sailing, Bay of Bengal"], [null, "Customs", ""], [null, "Out for delivery", ""], [null, "Delivered", ""]] },
    "KGN-10458-IN": { from: "BGP", to: "CCU", mode: "road", service: "Economy", weight: 3.2, stage: 3, pieces: 1, etaHours: 5,
      events: [[-30, "Picked up", "Collected in Tilka Manjhi, Bhagalpur"], [-22, "In transit", "Cleared Kolkata sort centre"], [null, "Customs", "Not required for domestic lanes"], [-1, "Out for delivery", "Rider assigned, Salt Lake sector V"], [null, "Delivered", ""]] },
    "KGN-66092-NL": { from: "RTM", to: "MUM", mode: "sea", service: "Express", weight: 1250, stage: 1, pieces: 30, etaHours: 260, progress: 0.35, delayed: true,
      events: [[-220, "Picked up", "Loaded at Maasvlakte II"], [-150, "In transit", "Delayed: weather hold near Suez canal"], [null, "Customs", ""], [null, "Out for delivery", ""], [null, "Delivered", ""]] }
  },

  // Coverage map hubs
  hubs: [
    { id: "MUM", type: "Gateway", major: true, area: "640k sq ft", daily: "92,000", links: ["DEL", "BLR", "AMD", "DXB", "SIN", "RTM"] },
    { id: "DEL", type: "Gateway", major: true, area: "510k sq ft", daily: "78,500", links: ["MUM", "JAI", "LKO", "FRA", "CCU"] },
    { id: "BLR", type: "Air hub", major: true, area: "320k sq ft", daily: "51,200", links: ["CHE", "HYD", "COK", "SIN"] },
    { id: "CHE", type: "Sea port", area: "280k sq ft", daily: "39,800", links: ["BLR", "SIN", "CMB"] },
    { id: "CCU", type: "Sea port", area: "240k sq ft", daily: "31,000", links: ["BGP", "GAU", "DEL", "SIN"] },
    { id: "HYD", type: "Regional", area: "190k sq ft", daily: "28,400", links: ["BLR", "MUM"] },
    { id: "AMD", type: "Regional", area: "150k sq ft", daily: "21,700", links: ["MUM", "JAI"] },
    { id: "JAI", type: "Regional", area: "90k sq ft", daily: "12,300", links: ["DEL", "AMD"] },
    { id: "LKO", type: "Regional", area: "85k sq ft", daily: "11,900", links: ["DEL", "BGP"] },
    { id: "BGP", type: "Spoke", area: "40k sq ft", daily: "6,800", links: ["CCU", "LKO"] },
    { id: "GAU", type: "Spoke", area: "55k sq ft", daily: "7,400", links: ["CCU"] },
    { id: "COK", type: "Sea port", area: "120k sq ft", daily: "14,600", links: ["BLR", "DXB"] },
    { id: "DXB", type: "Intl gateway", major: true, area: "300k sq ft", daily: "44,000", links: ["MUM", "COK", "RTM", "NBO", "LON"] },
    { id: "SIN", type: "Intl gateway", major: true, area: "260k sq ft", daily: "40,500", links: ["CHE", "MUM", "SHA", "SYD", "TYO"] },
    { id: "RTM", type: "Sea port", area: "220k sq ft", daily: "33,100", links: ["MUM", "FRA", "LON", "NYC"] },
    { id: "FRA", type: "Air hub", area: "180k sq ft", daily: "26,000", links: ["DEL", "RTM", "NYC"] },
    { id: "LON", type: "Partner", area: "60k sq ft", daily: "9,200", links: ["RTM", "DXB"] },
    { id: "NBO", type: "Partner", area: "45k sq ft", daily: "5,100", links: ["DXB"] },
    { id: "SHA", type: "Sea port", area: "210k sq ft", daily: "35,900", links: ["SIN", "TYO"] },
    { id: "TYO", type: "Partner", area: "70k sq ft", daily: "8,800", links: ["SHA", "SIN"] },
    { id: "SYD", type: "Partner", area: "50k sq ft", daily: "6,200", links: ["SIN"] },
    { id: "NYC", type: "Partner", area: "90k sq ft", daily: "10,400", links: ["RTM", "FRA"] }
  ],

  // Flat map projection shared with the SVG dot maps
  map: { W: 1000, H: 420, LAT0: 78, LAT1: -56 }
};
