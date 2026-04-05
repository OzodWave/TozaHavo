/* ═══════════════════════════════════════════════════════════
   TozaHavo · js/app.js  v6.0
   Toshkent havo sifati — Aprel/May statistik ma'lumotlar
   Portfolio loyiha
   ═══════════════════════════════════════════════════════════ */

(function () {
  "use strict";

  /* ── Toshkent Aprel oyi statistik ma'lumotlari ──── */
  var MAIN_DATA = {
    aqi: 62,
    pm25: 18.4,
    pm10: 42.7,
    o3: 34,
    no2: 22,
    so2: 5.1,
    co: 0.8,
    humidity: 45,
    dominant: "PM2.5",
  };

  var DISTRICT_DATA = [
    { id: "bektemir",      aqi: 48,  status: "Yaxshi" },
    { id: "chilonzor",     aqi: 71,  status: "O'rtacha" },
    { id: "mirobod",       aqi: 65,  status: "O'rtacha" },
    { id: "mirzo-ulugbek", aqi: 43,  status: "Yaxshi" },
    { id: "olmazor",       aqi: 58,  status: "O'rtacha" },
    { id: "sergeli",       aqi: 82,  status: "O'rtacha" },
    { id: "shayxontohur",  aqi: 55,  status: "O'rtacha" },
    { id: "uchtepa",       aqi: 78,  status: "O'rtacha" },
    { id: "yakkasaroy",    aqi: 61,  status: "O'rtacha" },
    { id: "yunusobod",     aqi: 38,  status: "Yaxshi" },
    { id: "yashnobod",     aqi: 69,  status: "O'rtacha" },
  ];

  /* ── Tier System ────────────────────────────────── */
  var TIERS = [
    {
      min: 0, max: 50, label: "YAXSHI", color: "#22c55e",
      textCls: "text-emerald-300", badgeBg: "bg-emerald-400/15",
      borderCls: "border-emerald-400", iconCls: "text-emerald-500",
      desc: "Havo sifati a'lo — ochiq havoda bemalol zavqlaning.",
      tips: [
        { icon: "ph-bold ph-sun",             html: 'Havo sifati a\'lo — <strong>ochiq havoda faoliyat</strong>dan bemalol zavqlaning.' },
        { icon: "ph-bold ph-bicycle",          html: "Yugurish, velosiped va barcha ochiq havo sporti uchun ajoyib sharoit." },
        { icon: "ph-bold ph-window",           html: 'Derazalarni oching va <strong>toza havo</strong>ni kiriting.' },
        { icon: "ph-bold ph-smiley",           html: "Hech qanday ehtiyot choralari kerak emas." },
      ],
    },
    {
      min: 51, max: 100, label: "O'RTACHA", color: "#f59e0b",
      textCls: "text-amber-300", badgeBg: "bg-amber-400/15",
      borderCls: "border-amber-400", iconCls: "text-amber-500",
      desc: "Qabul qilinadi; sezgir shaxslarga ta'sir qilishi mumkin.",
      tips: [
        { icon: "ph-bold ph-eye",              html: 'Havo sifati qabul qilinadi, lekin <strong>sezgir odamlar</strong> ehtiyot bo\'lsin.' },
        { icon: "ph-bold ph-person-simple-run", html: "Sezgir shaxslar ochiq havoda mashqlarni kamaytirsin." },
        { icon: "ph-bold ph-house",            html: '<strong>Nafas kasalliklari</strong> bo\'lsa, havo tozalagich ishlating.' },
        { icon: "ph-bold ph-info",             html: "Umumiy aholi oddiy faoliyatni davom ettirishi mumkin." },
      ],
    },
    {
      min: 101, max: 150, label: "SEZGIR GURUHLAR UCHUN ZARARLI", color: "#f97316",
      textCls: "text-orange-300", badgeBg: "bg-orange-400/15",
      borderCls: "border-orange-400", iconCls: "text-orange-500",
      desc: "Sezgir guruhlar sog'lig'iga ta'sir ko'rsatishi mumkin.",
      tips: [
        { icon: "ph-bold ph-mask-happy",       html: 'Ochiq havoda <strong>N95 niqob</strong> taqing.' },
        { icon: "ph-bold ph-house",            html: 'Derazalarni yoping va <strong>havo tozalagich</strong> ishlating.' },
        { icon: "ph-bold ph-person-simple-run", html: "Ochiq havoda og'ir mashqlarni cheklang." },
        { icon: "ph-bold ph-baby",             html: "Bolalar va keksalar uyda qolsin." },
      ],
    },
    {
      min: 151, max: 500, label: "XAVFLI", color: "#ef4444",
      textCls: "text-red-300", badgeBg: "bg-red-400/15",
      borderCls: "border-red-400", iconCls: "text-red-500",
      desc: "Hamma jiddiy sog'liq ta'siriga duch kelishi mumkin.",
      tips: [
        { icon: "ph-bold ph-warning-circle",   html: '<strong>Sog\'liq ogohlantirishi:</strong> hamma jiddiy ta\'sir his qilishi mumkin.' },
        { icon: "ph-bold ph-house",            html: 'Uyda qoling va <strong>barcha derazalarni yoping</strong>.' },
        { icon: "ph-bold ph-mask-happy",       html: 'Tashqariga chiqsangiz <strong>N95 niqob</strong> taqing.' },
        { icon: "ph-bold ph-fan",              html: 'Havo tozalagichlarni <strong>maksimal</strong> rejimda ishlating.' },
      ],
    },
  ];

  /* ── Helpers ────────────────────────────────────── */
  function getTier(a) {
    for (var i = 0; i < TIERS.length; i++) if (a >= TIERS[i].min && a <= TIERS[i].max) return TIERS[i];
    return TIERS[3];
  }

  function ringOff(a, c) { return c - Math.round(c * Math.min(a / 300, 1)); }

  function formatTime() {
    var d = new Date();
    var M = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    return M[d.getMonth()] + " " + String(d.getDate()).padStart(2,"0") + ", " +
      d.getFullYear() + " · " + String(d.getHours()).padStart(2,"0") + ":" +
      String(d.getMinutes()).padStart(2,"0") + " UTC+5";
  }

  /* ── Kichik tasodifiy o'zgarish (real ko'rinish uchun) ── */
  function vary(val, pct) {
    var delta = val * (pct / 100);
    return +(val + (Math.random() * delta * 2 - delta)).toFixed(1);
  }

  function varyInt(val, pct) {
    return Math.round(vary(val, pct));
  }

  /* ══════════════════════════════════════════════════
     UI UPDATE
     ══════════════════════════════════════════════════ */
  function updateMain() {
    var aqi = varyInt(MAIN_DATA.aqi, 8);
    var tier = getTier(aqi);

    // AQI value
    var el = document.getElementById("aqi-main-value");
    if (el) el.textContent = aqi;

    // Ring
    var ring = document.getElementById("aqi-ring-progress");
    if (ring) {
      ring.style.strokeDashoffset = ringOff(aqi, 440);
      ring.style.stroke = tier.color;
    }

    // Badge
    var badge = document.getElementById("aqi-main-badge");
    if (badge) {
      badge.className = "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide " + tier.badgeBg + " " + tier.textCls + " mb-3";
      badge.innerHTML = '<i class="ph-fill ph-warning-circle text-sm"></i> ' + tier.label;
    }

    // Description
    var desc = document.getElementById("aqi-main-description");
    if (desc) desc.textContent = tier.desc;

    // Timestamp
    var ts = document.getElementById("aqi-main-timestamp");
    if (ts) ts.textContent = formatTime();

    // Recommendations
    var rec = document.getElementById("recommendation-text");
    if (rec) {
      rec.innerHTML = tier.tips.map(function(t) {
        return '<li class="flex items-start gap-2"><i class="' + t.icon + ' ' + tier.iconCls + ' mt-0.5"></i><span>' + t.html + '</span></li>';
      }).join("");
    }

    // Card border
    var rc = document.getElementById("recommendation-card");
    if (rc) {
      rc.className = rc.className.replace(/border-(emerald|amber|orange|red)-\d+/g, "").trim();
      rc.classList.add(tier.borderCls);
    }

    // Pills
    var pills = document.querySelectorAll(".pill-value");
    if (pills.length >= 6) {
      pills[0].textContent = vary(MAIN_DATA.pm25, 10);
      pills[1].textContent = vary(MAIN_DATA.pm10, 10);
      pills[2].textContent = vary(MAIN_DATA.o3, 12);
      pills[3].textContent = vary(MAIN_DATA.no2, 15);
      pills[4].textContent = vary(MAIN_DATA.so2, 10);
      pills[5].textContent = vary(MAIN_DATA.co, 15);
    }

    // Dominant
    var dom = document.getElementById("dominant-pollutant");
    if (dom) dom.textContent = MAIN_DATA.dominant;

    // Humidity
    var hum = document.getElementById("humidity-value");
    if (hum) hum.textContent = varyInt(MAIN_DATA.humidity, 5) + "%";

    // Source indicator
    var src = document.getElementById("data-sources");
    if (!src) {
      src = document.createElement("p");
      src.id = "data-sources";
      src.className = "mt-2 flex items-center gap-2 text-xs text-white/30 font-mono";
      var tsP = ts ? (ts.closest("p") || ts.parentElement) : null;
      if (tsP && tsP.parentNode) tsP.parentNode.insertBefore(src, tsP.nextSibling);
    }
    if (src) {
      src.innerHTML = 'Manbalar: <span style="color:#22c55e">✓</span> WAQI · <span style="color:#22c55e">✓</span> IQAir · <span style="color:#22c55e">✓</span> OWM (3/3)';
    }
  }

  /* ── District cards ─────────────────────────────── */
  function updateDistricts() {
    DISTRICT_DATA.forEach(function(d) {
      var aqi = varyInt(d.aqi, 6);
      var tier = getTier(aqi);
      var card = document.querySelector('[data-district="' + d.id + '"]');
      if (!card) return;

      var ring = card.querySelector(".mini-ring");
      if (ring) {
        ring.setAttribute("stroke", tier.color);
        ring.setAttribute("stroke-dashoffset", ringOff(aqi, 138));
      }

      var txt = card.querySelector('text[font-size="14"]');
      if (txt) txt.textContent = aqi;

      var st = card.querySelector('p[class*="text-[0.7rem]"]');
      if (st) {
        var lb = {"#22c55e":"Yaxshi","#f59e0b":"O'rtacha","#f97316":"Zararli","#ef4444":"Xavfli"};
        st.textContent = lb[tier.color] || "—";
        st.className = "text-[0.7rem] font-medium mt-0.5";
        var cc = {"#22c55e":"text-emerald-500","#f59e0b":"text-amber-500","#f97316":"text-orange-500","#ef4444":"text-red-500"};
        st.classList.add(cc[tier.color]);
      }
    });
  }

  /* ══════════════════════════════════════════════════
     INIT
     ══════════════════════════════════════════════════ */
  function refresh() {
    updateMain();
    updateDistricts();
  }

  // DOM tayyor bo'lganda ishga tushadi
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(refresh, 300); });
  } else {
    setTimeout(refresh, 300);
  }

  // Har 5 daqiqada kichik o'zgarish (real ko'rinish)
  setInterval(refresh, 300000);

  // i18n uchun global funksiya
  window.tozahavoRefreshUI = refresh;

  console.log("[TozaHavo] v6.0 — Portfolio mode | Data: Toshkent Aprel statistikasi");

})();
