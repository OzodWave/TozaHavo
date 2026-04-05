/* ═══════════════════════════════════════════════════════════
   TozaHavo · js/app.js
   Multi-Source Real-Time AQI Dashboard
   Sources: OpenWeatherMap (primary) + IQAir + WAQI
   ═══════════════════════════════════════════════════════════ */

(function () {
  "use strict";

  /* ── API Configuration ──────────────────────────── */
  var CONFIG = {
    WAQI_TOKEN: "57d701371e06caf0c90423f940d09d902cbb6385",
    IQAIR_KEY:  "8168003e-faac-4039-bce0-b974cb29b84d",
    OWM_KEY:    "1fa907e719b3f7cd70db5851488911eb",

    TASHKENT_LAT: 41.2995,
    TASHKENT_LNG: 69.2401,

    CACHE_KEY:      "tozahavo_main_v2",
    DISTRICT_CACHE: "tozahavo_districts_v2",
    CACHE_TTL:      30, // minutes
    REFRESH:        300000, // 5 minutes
  };

  /* ── 11 Districts ───────────────────────────────── */
  var DISTRICTS = [
    { id: "bektemir",      lat: 41.2087, lng: 69.3345 },
    { id: "chilonzor",     lat: 41.2587, lng: 69.1986 },
    { id: "mirobod",       lat: 41.2981, lng: 69.2692 },
    { id: "mirzo-ulugbek", lat: 41.3125, lng: 69.3353 },
    { id: "olmazor",       lat: 41.3280, lng: 69.2150 },
    { id: "sergeli",       lat: 41.2233, lng: 69.2819 },
    { id: "shayxontohur",  lat: 41.3233, lng: 69.2467 },
    { id: "uchtepa",       lat: 41.3050, lng: 69.2020 },
    { id: "yakkasaroy",    lat: 41.2850, lng: 69.2750 },
    { id: "yunusobod",     lat: 41.3547, lng: 69.2867 },
    { id: "yashnobod",     lat: 41.2950, lng: 69.3380 },
  ];

  /* ── DOM References ─────────────────────────────── */
  var $ = function (sel) { return document.querySelector(sel); };
  var $aqiValue       = $("#aqi-main-value");
  var $aqiRing        = $("#aqi-ring-progress");
  var $aqiBadge       = $("#aqi-main-badge");
  var $aqiDescription = $("#aqi-main-description");
  var $aqiTimestamp   = $("#aqi-main-timestamp");
  var $recText        = $("#recommendation-text");
  var $recCard        = $("#recommendation-card");
  var $dominant       = $("#dominant-pollutant");
  var $humidity       = $("#humidity-value");
  var $pills          = document.querySelectorAll(".pill-value");

  /* ── AQI Tier System ────────────────────────────── */
  var TIERS = [
    {
      min: 0, max: 50, label: "YAXSHI", color: "#22c55e",
      textCls: "text-emerald-300", badgeBg: "bg-emerald-400/15",
      borderCls: "border-emerald-400", iconCls: "text-emerald-500",
      desc: "Havo sifati a'lo — ochiq havoda faoliyatdan bemalol zavqlaning.",
      tips: [
        { icon: "ph-bold ph-sun",            html: 'Havo sifati a\'lo — <strong class="text-surface-800">ochiq havoda faoliyat</strong>dan bemalol zavqlaning.' },
        { icon: "ph-bold ph-bicycle",         html: "Yugurish, velosiped haydash va barcha ochiq havo sporti uchun ajoyib sharoit." },
        { icon: "ph-bold ph-window",          html: 'Derazalarni oching va <strong class="text-surface-800">toza havo</strong>ni kiriting.' },
        { icon: "ph-bold ph-smiley",          html: "Bugun hech qanday yosh guruhi uchun ehtiyot choralari kerak emas." },
      ],
    },
    {
      min: 51, max: 100, label: "O'RTACHA", color: "#f59e0b",
      textCls: "text-amber-300", badgeBg: "bg-amber-400/15",
      borderCls: "border-amber-400", iconCls: "text-amber-500",
      desc: "Qabul qilinadi; ba'zi ifloslovchilar sezgir shaxslarga ta'sir qilishi mumkin.",
      tips: [
        { icon: "ph-bold ph-eye",             html: 'Havo sifati qabul qilinadi, lekin <strong class="text-surface-800">sezgir odamlar</strong> uchun xavfli bo\'lishi mumkin.' },
        { icon: "ph-bold ph-person-simple-run", html: "Sezgir shaxslar uzoq muddatli ochiq havoda mashqlarni kamaytirishi kerak." },
        { icon: "ph-bold ph-house",           html: '<strong class="text-surface-800">Nafas kasalliklari</strong> bo\'lsa, havo tozalagichni yoqib qo\'ying.' },
        { icon: "ph-bold ph-info",            html: "Umumiy aholi oddiy faoliyatni davom ettirishi mumkin." },
      ],
    },
    {
      min: 101, max: 150, label: "SEZGIR GURUHLAR UCHUN ZARARLI", color: "#f97316",
      textCls: "text-orange-300", badgeBg: "bg-orange-400/15",
      borderCls: "border-orange-400", iconCls: "text-orange-500",
      desc: "Sezgir guruhlar sog'lig'iga ta'sir ko'rsatishi mumkin.",
      tips: [
        { icon: "ph-bold ph-mask-happy",      html: 'Ochiq havoda <strong class="text-surface-800">N95 niqob</strong> taqing, ayniqsa katta yo\'llar yaqinida.' },
        { icon: "ph-bold ph-house",           html: 'Derazalarni yoping va <strong class="text-surface-800">havo tozalagich</strong> ishlating.' },
        { icon: "ph-bold ph-person-simple-run", html: "AQI 100 dan pastga tushguncha ochiq havoda og'ir mashqlarni cheklang." },
        { icon: "ph-bold ph-baby",            html: "Bolalar va keksalar iloji bo'lsa uyda qolishlari kerak." },
      ],
    },
    {
      min: 151, max: 500, label: "XAVFLI", color: "#ef4444",
      textCls: "text-red-300", badgeBg: "bg-red-400/15",
      borderCls: "border-red-400", iconCls: "text-red-500",
      desc: "Har bir kishi jiddiy sog'liq ta'siriga duch kelishi mumkin.",
      tips: [
        { icon: "ph-bold ph-warning-circle",  html: '<strong class="text-surface-800">Sog\'liq ogohlantirishi:</strong> hamma jiddiy ta\'sirlarni his qilishi mumkin.' },
        { icon: "ph-bold ph-house",           html: 'Uyda qoling va <strong class="text-surface-800">barcha derazalarni yoping</strong>.' },
        { icon: "ph-bold ph-mask-happy",      html: 'Tashqariga chiqish kerak bo\'lsa <strong class="text-surface-800">N95/P100 niqob</strong> taqing.' },
        { icon: "ph-bold ph-fan",             html: 'Havo tozalagichlarni har xonada <strong class="text-surface-800">maksimal</strong> rejimda ishlating.' },
      ],
    },
  ];

  /* ── EPA PM2.5 → US AQI Breakpoint Formula ─────── */
  function pm25ToAQI(pm) {
    if (pm < 0) return 0;
    var bp = [
      [0, 12, 0, 50],
      [12.1, 35.4, 51, 100],
      [35.5, 55.4, 101, 150],
      [55.5, 150.4, 151, 200],
      [150.5, 250.4, 201, 300],
      [250.5, 350.4, 301, 400],
      [350.5, 500.4, 401, 500]
    ];
    for (var i = 0; i < bp.length; i++) {
      if (pm >= bp[i][0] && pm <= bp[i][1]) {
        return Math.round(((bp[i][3] - bp[i][2]) / (bp[i][1] - bp[i][0])) * (pm - bp[i][0]) + bp[i][2]);
      }
    }
    return pm > 500 ? 500 : 0;
  }

  /* ── Helper Functions ───────────────────────────── */
  function getTier(aqi) {
    for (var i = 0; i < TIERS.length; i++) {
      if (aqi >= TIERS[i].min && aqi <= TIERS[i].max) return TIERS[i];
    }
    return TIERS[TIERS.length - 1];
  }

  function ringOffset(aqi, circumference) {
    var pct = Math.min(aqi / 300, 1);
    return circumference - Math.round(circumference * pct);
  }

  function formatTime() {
    var d = new Date();
    var months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    return months[d.getMonth()] + " " +
      String(d.getDate()).padStart(2, "0") + ", " +
      d.getFullYear() + " · " +
      String(d.getHours()).padStart(2, "0") + ":" +
      String(d.getMinutes()).padStart(2, "0") + " UTC+5";
  }

  function log(msg) { console.log("[TozaHavo] " + msg); }
  function warn(msg) { console.warn("[TozaHavo] ⚠ " + msg); }

  /* ── Cache System ───────────────────────────────── */
  function cacheGet(key) {
    try {
      var raw = localStorage.getItem(key);
      if (!raw) return null;
      var obj = JSON.parse(raw);
      var age = (Date.now() - obj.ts) / 60000;
      return age < CONFIG.CACHE_TTL ? obj.data : null;
    } catch (e) { return null; }
  }

  function cacheGetStale(key) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw).data : null;
    } catch (e) { return null; }
  }

  function cacheSet(key, data) {
    try { localStorage.setItem(key, JSON.stringify({ ts: Date.now(), data: data })); }
    catch (e) { /* ignore */ }
  }

  /* ── Safe Fetch with Timeout ────────────────────── */
  function safeFetch(url, timeout) {
    timeout = timeout || 10000;
    return new Promise(function (resolve, reject) {
      var timer = setTimeout(function () { reject(new Error("Timeout")); }, timeout);
      fetch(url)
        .then(function (r) { clearTimeout(timer); return r.json(); })
        .then(resolve)
        .catch(function (e) { clearTimeout(timer); reject(e); });
    });
  }

  /* ── JSONP Fetch (for WAQI on file:// protocol) ── */
  function jsonpFetch(url, cbName) {
    return new Promise(function (resolve, reject) {
      var timer = setTimeout(function () { cleanup(); reject(new Error("JSONP timeout")); }, 15000);
      window[cbName] = function (data) { clearTimeout(timer); cleanup(); resolve(data); };
      function cleanup() { delete window[cbName]; if (s.parentNode) s.parentNode.removeChild(s); }
      var s = document.createElement("script");
      s.src = url + "&callback=" + cbName;
      s.onerror = function () { clearTimeout(timer); cleanup(); reject(new Error("JSONP error")); };
      document.head.appendChild(s);
    });
  }

  /* ══════════════════════════════════════════════════
     SOURCE 1: OpenWeatherMap (PRIMARY — has PM2.5)
     ══════════════════════════════════════════════════ */
  function fetchOWM(lat, lng) {
    var url = "https://api.openweathermap.org/data/2.5/air_pollution?lat=" + lat + "&lon=" + lng + "&appid=" + CONFIG.OWM_KEY;
    return safeFetch(url)
      .then(function (json) {
        if (!json.list || !json.list[0]) throw new Error("No OWM data");
        var c = json.list[0].components;
        var aqi = pm25ToAQI(c.pm2_5);
        log("OWM: PM2.5=" + c.pm2_5.toFixed(1) + " µg/m³ → AQI=" + aqi +
            " | PM10=" + c.pm10.toFixed(1) + " NO₂=" + c.no2.toFixed(1) +
            " SO₂=" + c.so2.toFixed(1) + " O₃=" + c.o3.toFixed(1) + " CO=" + c.co.toFixed(1));
        return {
          source: "OWM",
          aqi: aqi,
          pm25: c.pm2_5,
          pm10: c.pm10,
          o3: +(c.o3 / 2.0).toFixed(1),
          no2: +(c.no2 / 1.88).toFixed(1),
          so2: +(c.so2 / 2.62).toFixed(1),
          co: +(c.co / 1145).toFixed(1),
          humidity: null,
          raw: c,
        };
      })
      .catch(function (e) {
        warn("OWM failed: " + e.message);
        return null;
      });
  }

  /* ══════════════════════════════════════════════════
     SOURCE 2: IQAir (using nearest_city with coordinates — more reliable)
     ══════════════════════════════════════════════════ */
  function fetchIQAir() {
    // Use nearest_city with coordinates — avoids city_not_found errors
    var url = "https://api.airvisual.com/v2/nearest_city?lat=" + CONFIG.TASHKENT_LAT + "&lon=" + CONFIG.TASHKENT_LNG + "&key=" + CONFIG.IQAIR_KEY;
    return safeFetch(url)
      .then(function (json) {
        if (json.status !== "success" || !json.data) throw new Error("IQAir error: " + (json.data && json.data.message || "unknown"));
        var p = json.data.current.pollution;
        var w = json.data.current.weather;
        log("IQAir: AQI=" + p.aqius + " | Main pollutant=" + p.mainus + " | Humidity=" + w.hu + "% | City=" + json.data.city);
        return {
          source: "IQAir",
          aqi: p.aqius,
          mainPollutant: p.mainus,
          humidity: w.hu,
          temp: w.tp,
        };
      })
      .catch(function (e) {
        warn("IQAir failed: " + e.message);
        return null;
      });
  }

  /* ══════════════════════════════════════════════════
     SOURCE 3: WAQI
     ══════════════════════════════════════════════════ */
  function fetchWAQI() {
    var url = "https://api.waqi.info/feed/tashkent/?token=" + CONFIG.WAQI_TOKEN;
    var isFile = window.location.protocol === "file:";

    var promise = isFile
      ? jsonpFetch(url, "_waqiCb")
      : safeFetch(url);

    return promise
      .then(function (json) {
        if (json.status !== "ok" || !json.data) throw new Error("WAQI error");
        var d = json.data;
        var iaqi = d.iaqi || {};
        var hasPM25 = !!(iaqi.pm25 && iaqi.pm25.v !== undefined);

        log("WAQI: AQI=" + d.aqi +
            " | PM2.5=" + (hasPM25 ? iaqi.pm25.v : "n/a") +
            " | SO₂=" + (iaqi.so2 ? iaqi.so2.v : "n/a") +
            " | O₃=" + (iaqi.o3 ? iaqi.o3.v : "n/a") +
            " | CO=" + (iaqi.co ? iaqi.co.v : "n/a"));

        if (!hasPM25) {
          warn("WAQI is missing PM2.5 — AQI=" + d.aqi + " is likely SO₂-only and unreliable!");
        }

        return {
          source: "WAQI",
          aqi: d.aqi,
          hasPM25: hasPM25,
          iaqi: iaqi,
          dominentpol: d.dominentpol,
          humidity: iaqi.h ? iaqi.h.v : null,
          time: d.time,
        };
      })
      .catch(function (e) {
        warn("WAQI failed: " + e.message);
        return null;
      });
  }

  /* ══════════════════════════════════════════════════
     AGGREGATION ENGINE
     ══════════════════════════════════════════════════ */
  function aggregateAQI(owm, iqair, waqi) {
    var sources = [];

    // OWM PM2.5-based AQI — most reliable
    if (owm && owm.aqi > 0) {
      sources.push({ value: owm.aqi, weight: 3, name: "OWM" });
    }

    // IQAir pre-calculated US AQI
    if (iqair && iqair.aqi > 0) {
      sources.push({ value: iqair.aqi, weight: 2, name: "IQAir" });
    }

    // WAQI — only trust if it has PM2.5 or if other sources aren't available
    if (waqi && waqi.aqi > 0) {
      var waqiSuspect = (!waqi.hasPM25 && waqi.aqi < 15 && sources.length > 0 && sources[0].value > 40);
      if (waqiSuspect) {
        warn("WAQI AQI=" + waqi.aqi + " discarded (SO₂-only, other sources show >" + sources[0].value + ")");
      } else {
        sources.push({ value: waqi.aqi, weight: waqi.hasPM25 ? 2 : 1, name: "WAQI" });
      }
    }

    if (sources.length === 0) return null;
    if (sources.length === 1) {
      log("Final AQI: " + sources[0].value + " (single source: " + sources[0].name + ")");
      return sources[0].value;
    }

    // Outlier detection — if one differs by >60% from average of others, discard
    if (sources.length >= 3) {
      for (var i = sources.length - 1; i >= 0; i--) {
        var others = sources.filter(function (_, j) { return j !== i; });
        var othersAvg = others.reduce(function (s, o) { return s + o.value; }, 0) / others.length;
        if (Math.abs(sources[i].value - othersAvg) / othersAvg > 0.6) {
          warn("Outlier: " + sources[i].name + "=" + sources[i].value + " vs avg=" + Math.round(othersAvg) + " → discarded");
          sources.splice(i, 1);
        }
      }
    }

    // Weighted average
    var totalW = 0, sum = 0;
    sources.forEach(function (s) { sum += s.value * s.weight; totalW += s.weight; });
    var final = Math.round(sum / totalW);

    var detail = sources.map(function (s) { return s.name + ":" + s.value + "×" + s.weight; }).join(" + ");
    log("Final AQI: " + final + " (" + detail + ")");

    return final;
  }

  /* ── Merge Pollutant Data ───────────────────────── */
  function mergePollutants(owm, waqi) {
    var w = (waqi && waqi.iaqi) || {};
    var o = (owm && owm.raw) || {};

    function wVal(key) { return w[key] && w[key].v !== undefined ? w[key].v : null; }
    function oVal(key, div) { return o[key] !== undefined ? +(o[key] / (div || 1)).toFixed(1) : null; }

    return {
      pm25: wVal("pm25") || oVal("pm2_5", 1),
      pm10: wVal("pm10") || oVal("pm10", 1),
      o3:   wVal("o3")   || oVal("o3", 2.0),
      no2:  wVal("no2")  || oVal("no2", 1.88),
      so2:  wVal("so2")  || oVal("so2", 2.62),
      co:   wVal("co")   || oVal("co", 1145),
    };
  }

  /* ── Find Dominant Pollutant ────────────────────── */
  function findDominant(pollutants) {
    var best = "PM2.5", bestAqi = 0;
    if (pollutants.pm25 !== null) { var a = pm25ToAQI(pollutants.pm25); if (a > bestAqi) { bestAqi = a; best = "PM2.5"; } }
    if (pollutants.pm10 !== null) { var a2 = pm25ToAQI(pollutants.pm10 * 0.5); if (a2 > bestAqi) { bestAqi = a2; best = "PM10"; } }
    if (pollutants.o3 !== null && pollutants.o3 > 50)  { best = "O₃"; }
    if (pollutants.no2 !== null && pollutants.no2 > 40) { best = "NO₂"; }
    return best;
  }

  /* ══════════════════════════════════════════════════
     UI UPDATE FUNCTIONS
     ══════════════════════════════════════════════════ */
  function updateMainUI(aqi, pollutants, humidity, sources) {
    if (aqi === null) { if ($aqiValue) $aqiValue.textContent = "—"; return; }
    var tier = getTier(aqi);

    // AQI value & ring
    if ($aqiValue) $aqiValue.textContent = aqi;
    if ($aqiRing) {
      $aqiRing.style.strokeDashoffset = ringOffset(aqi, 440);
      $aqiRing.style.stroke = tier.color;
    }

    // Badge
    if ($aqiBadge) {
      $aqiBadge.className = "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide " + tier.badgeBg + " " + tier.textCls + " mb-3";
      $aqiBadge.innerHTML = '<i class="ph-fill ph-warning-circle text-sm"></i> ' + tier.label;
    }

    // Description
    if ($aqiDescription) $aqiDescription.textContent = tier.desc;

    // Timestamp
    if ($aqiTimestamp) $aqiTimestamp.textContent = formatTime();

    // Recommendations
    if ($recText) {
      $recText.innerHTML = tier.tips.map(function (t) {
        return '<li class="flex items-start gap-2"><i class="' + t.icon + " " + tier.iconCls + ' mt-0.5"></i><span>' + t.html + "</span></li>";
      }).join("");
    }

    // Recommendation card border
    if ($recCard) {
      $recCard.className = $recCard.className.replace(/border-\w+-\d+/g, "").trim();
      $recCard.classList.add(tier.borderCls);
    }

    // Pollutant pills
    var keys = ["pm25", "pm10", "o3", "no2", "so2", "co"];
    $pills.forEach(function (el, i) {
      var val = pollutants[keys[i]];
      el.textContent = val !== null && val !== undefined ? val : "—";
    });

    // Dominant pollutant
    if ($dominant) $dominant.textContent = findDominant(pollutants);

    // Humidity
    if ($humidity && humidity !== null) $humidity.textContent = humidity + "%";

    // Data source indicator
    updateSourceIndicator(sources);
  }

  /* ── Source Indicator ───────────────────────────── */
  function updateSourceIndicator(sources) {
    var existing = document.getElementById("data-sources");
    if (!existing) {
      existing = document.createElement("p");
      existing.id = "data-sources";
      existing.className = "mt-2 flex items-center gap-2 text-xs text-white/30 font-mono";
      var tsParent = $aqiTimestamp ? $aqiTimestamp.closest("p") : null;
      if (tsParent && tsParent.parentNode) {
        tsParent.parentNode.insertBefore(existing, tsParent.nextSibling);
      }
    }
    var count = 0;
    var parts = ["WAQI", "IQAir", "OWM"].map(function (name) {
      var ok = sources[name.toLowerCase()] || sources[name];
      if (ok) count++;
      return '<span style="color:' + (ok ? "#22c55e" : "#ef4444") + '">' + (ok ? "✓" : "✗") + "</span> " + name;
    });
    existing.innerHTML = "Manbalar: " + parts.join(" · ") + " (" + count + "/3)";
  }

  /* ── Update District Card ───────────────────────── */
  function updateDistrict(districtId, aqi) {
    var card = document.querySelector('[data-district="' + districtId + '"]');
    if (!card || aqi === null) return;

    var tier = getTier(aqi);

    // Mini ring
    var ring = card.querySelector(".mini-ring");
    if (ring) {
      ring.setAttribute("stroke", tier.color);
      ring.setAttribute("stroke-dashoffset", ringOffset(aqi, 138));
    }

    // AQI number
    var txt = card.querySelector('text[font-size="14"]');
    if (txt) txt.textContent = aqi;

    // Status text
    var statusP = card.querySelector('p[class*="text-[0.7rem]"]');
    if (statusP) {
      var labels = { "#22c55e": "Yaxshi", "#f59e0b": "O'rtacha", "#f97316": "Zararli (SG)", "#ef4444": "Xavfli" };
      statusP.textContent = labels[tier.color] || "—";
      statusP.className = "text-[0.7rem] font-medium mt-0.5";
      var colorCls = { "#22c55e": "text-emerald-500", "#f59e0b": "text-amber-500", "#f97316": "text-orange-500", "#ef4444": "text-red-500" };
      statusP.classList.add(colorCls[tier.color] || "text-surface-400");
    }
  }

  /* ══════════════════════════════════════════════════
     MAIN DATA PIPELINE
     ══════════════════════════════════════════════════ */
  function fetchAllData() {
    log("Fetching data from all sources...");

    // Show loading
    if ($aqiValue) $aqiValue.textContent = "...";

    // Check cache first
    var cached = cacheGet(CONFIG.CACHE_KEY);
    if (cached) {
      log("Using cached main data (age < " + CONFIG.CACHE_TTL + " min)");
      updateMainUI(cached.aqi, cached.pollutants, cached.humidity, cached.sources);
    }

    var cachedDistricts = cacheGet(CONFIG.DISTRICT_CACHE);
    if (cachedDistricts) {
      log("Using cached district data");
      cachedDistricts.forEach(function (d) { updateDistrict(d.id, d.aqi); });
    }

    // Fetch all 3 sources in parallel
    Promise.all([
      fetchOWM(CONFIG.TASHKENT_LAT, CONFIG.TASHKENT_LNG),
      fetchIQAir(),
      fetchWAQI(),
    ]).then(function (results) {
      var owm = results[0];
      var iqair = results[1];
      var waqi = results[2];

      var sources = {
        owm: !!owm,
        iqair: !!iqair,
        waqi: !!waqi,
      };

      log("Sources status: OWM=" + (owm ? "✓" : "✗") + " IQAir=" + (iqair ? "✓" : "✗") + " WAQI=" + (waqi ? "✓" : "✗"));

      // Aggregate AQI
      var finalAQI = aggregateAQI(owm, iqair, waqi);

      // Merge pollutants
      var pollutants = mergePollutants(owm, waqi);
      log("Pollutants: PM2.5=" + pollutants.pm25 + " PM10=" + pollutants.pm10 +
          " O₃=" + pollutants.o3 + " NO₂=" + pollutants.no2 +
          " SO₂=" + pollutants.so2 + " CO=" + pollutants.co);

      // Humidity — prefer IQAir (more accurate), fallback WAQI
      var humidity = (iqair && iqair.humidity) || (waqi && waqi.humidity) || null;

      // Update UI
      if (finalAQI !== null) {
        updateMainUI(finalAQI, pollutants, humidity, sources);
        cacheSet(CONFIG.CACHE_KEY, { aqi: finalAQI, pollutants: pollutants, humidity: humidity, sources: sources });
      } else {
        // Try stale cache
        var stale = cacheGetStale(CONFIG.CACHE_KEY);
        if (stale) {
          warn("All sources failed — using stale cache");
          updateMainUI(stale.aqi, stale.pollutants, stale.humidity, stale.sources);
        } else {
          warn("All sources failed — no cache available");
          if ($aqiValue) $aqiValue.textContent = "!";
        }
      }

      // Fetch districts
      fetchDistrictData();

    }).catch(function (e) {
      warn("Pipeline error: " + e.message);
      var stale = cacheGetStale(CONFIG.CACHE_KEY);
      if (stale) updateMainUI(stale.aqi, stale.pollutants, stale.humidity, stale.sources);
    });
  }

  /* ══════════════════════════════════════════════════
     DISTRICT DATA (OWM for each district)
     ══════════════════════════════════════════════════ */
  function fetchDistrictData() {
    log("Fetching district data for " + DISTRICTS.length + " districts...");

    var districtResults = [];

    DISTRICTS.forEach(function (district, index) {
      setTimeout(function () {
        fetchOWM(district.lat, district.lng)
          .then(function (owm) {
            var aqi = owm ? owm.aqi : null;
            if (aqi !== null) {
              log("District " + district.id + ": PM2.5=" + owm.pm25.toFixed(1) + " → AQI=" + aqi);
              updateDistrict(district.id, aqi);
              districtResults.push({ id: district.id, aqi: aqi });
            } else {
              warn("District " + district.id + ": no data");
              updateDistrict(district.id, null);
            }

            // Cache after all districts loaded
            if (districtResults.length === DISTRICTS.length || index === DISTRICTS.length - 1) {
              cacheSet(CONFIG.DISTRICT_CACHE, districtResults);
            }
          });
      }, index * 1200); // 1.2 second stagger
    });
  }

  /* ══════════════════════════════════════════════════
     INITIALIZATION
     ══════════════════════════════════════════════════ */
  log("Initializing multi-source pipeline...");
  log("Protocol: " + window.location.protocol);

  // Initial fetch
  fetchAllData();

  // Auto-refresh every 5 minutes
  setInterval(fetchAllData, CONFIG.REFRESH);

  log("Dashboard ready — auto-refresh every 5 minutes");

})();
