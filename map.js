/* ═══════════════════════════════════════════════════════════
   TozaHavo · js/map.js
   Leaflet xarita — Toshkent tumanlari markerlari
   ═══════════════════════════════════════════════════════════ */

(function () {
  "use strict";

  /* ── Tumanlar ma'lumoti ──────────────────────────── */
  var districts = [
    { name: "Bektemir",       lat: 41.2087, lng: 69.3345, aqi: 48,  label: "Yaxshi",    color: "#22c55e" },
    { name: "Chilonzor",      lat: 41.2587, lng: 69.1986, aqi: 71,  label: "O'rtacha",  color: "#f59e0b" },
    { name: "Mirobod",        lat: 41.2981, lng: 69.2692, aqi: 65,  label: "O'rtacha",  color: "#f59e0b" },
    { name: "Mirzo Ulug'bek", lat: 41.3125, lng: 69.3353, aqi: 43,  label: "Yaxshi",    color: "#22c55e" },
    { name: "Olmazor",        lat: 41.3280, lng: 69.2150, aqi: 58,  label: "O'rtacha",  color: "#f59e0b" },
    { name: "Sergeli",        lat: 41.2233, lng: 69.2819, aqi: 82,  label: "O'rtacha",  color: "#f59e0b" },
    { name: "Shayxontohur",   lat: 41.3233, lng: 69.2467, aqi: 55,  label: "O'rtacha",  color: "#f59e0b" },
    { name: "Uchtepa",        lat: 41.3050, lng: 69.2020, aqi: 78,  label: "O'rtacha",  color: "#f59e0b" },
    { name: "Yakkasaroy",     lat: 41.2850, lng: 69.2750, aqi: 61,  label: "O'rtacha",  color: "#f59e0b" },
    { name: "Yunusobod",      lat: 41.3547, lng: 69.2867, aqi: 38,  label: "Yaxshi",    color: "#22c55e" },
    { name: "Yashnobod",      lat: 41.2950, lng: 69.3380, aqi: 69,  label: "O'rtacha",  color: "#f59e0b" },
  ];

  /* ── Xarita yaratish ─────────────────────────────── */
  var map = L.map("map", {
    center: [41.2995, 69.2401],
    zoom: 12,
    zoomControl: false,
    scrollWheelZoom: true,
  });

  // Global qilish (viewOnMap uchun)
  window.tozahavoMap = map;

  L.control.zoom({ position: "topright" }).addTo(map);

  /* ── CartoDB Positron tile ───────────────────────── */
  L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
    subdomains: "abcd",
    maxZoom: 19,
  }).addTo(map);

  /* ── Marker ikonkasi ─────────────────────────────── */
  function makeIcon(color, aqi) {
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 44 44">' +
      '<circle cx="22" cy="22" r="20" fill="' + color + '" fill-opacity="0.15" stroke="' + color + '" stroke-width="2.5"/>' +
      '<circle cx="22" cy="22" r="12" fill="' + color + '" fill-opacity="0.9"/>' +
      '<text x="22" y="26" text-anchor="middle" fill="#fff" font-family="Outfit,sans-serif" font-weight="700" font-size="11">' + aqi + '</text>' +
      '</svg>';
    return L.divIcon({
      html: svg,
      className: "",
      iconSize: [44, 44],
      iconAnchor: [22, 22],
      popupAnchor: [0, -24],
    });
  }

  /* ── Popup HTML ──────────────────────────────────── */
  function makePopup(d) {
    var bg = d.color === "#22c55e" ? "rgba(34,197,94,0.1)" :
             d.color === "#f59e0b" ? "rgba(245,158,11,0.1)" :
             d.color === "#f97316" ? "rgba(249,115,22,0.1)" : "rgba(239,68,68,0.1)";
    return '<div style="font-family:Outfit,sans-serif;min-width:200px;padding:4px 0">' +
      '<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">' +
        '<div style="width:32px;height:32px;border-radius:10px;background:' + bg + ';display:flex;align-items:center;justify-content:center">' +
          '<svg width="16" height="16"><circle cx="8" cy="8" r="6" fill="' + d.color + '"/></svg>' +
        '</div>' +
        '<div><div style="font-weight:700;font-size:14px;color:#1f2937">' + d.name + '</div>' +
        '<div style="font-size:11px;color:#9ba5b1">Sensor stansiya</div></div>' +
      '</div>' +
      '<div style="display:flex;align-items:center;justify-content:space-between;background:' + bg + ';border-radius:10px;padding:10px 12px;margin-bottom:6px">' +
        '<div><div style="font-size:10px;text-transform:uppercase;letter-spacing:0.06em;font-weight:600;color:' + d.color + '">AQI</div>' +
        '<div style="font-size:26px;font-weight:800;color:' + d.color + ';line-height:1">' + d.aqi + '</div></div>' +
        '<div style="font-size:10px;font-weight:600;color:' + d.color + ';background:rgba(255,255,255,0.7);border-radius:6px;padding:4px 8px">' + d.label + '</div>' +
      '</div>' +
      '<div style="font-size:11px;color:#9ba5b1;margin-top:6px">Ma\'lumotlar har 5 daqiqada yangilanadi</div>' +
    '</div>';
  }

  /* ── Markerlarni joylashtirish ───────────────────── */
  districts.forEach(function (d) {
    L.marker([d.lat, d.lng], { icon: makeIcon(d.color, d.aqi) })
      .addTo(map)
      .bindPopup(makePopup(d), {
        maxWidth: 260,
        closeButton: true,
        className: "tozahavo-popup",
      });
  });

  console.log("[TozaHavo] Map initialized with " + districts.length + " district markers");

})();
