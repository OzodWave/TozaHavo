/* ═══════════════════════════════════════════════════════════
   TozaHavo · js/app.js  v5.0
   Multi-Source Real-Time AQI Dashboard
   Priority: IQAir (best) → WAQI → OWM (model data)
   ═══════════════════════════════════════════════════════════ */

(function () {
  "use strict";

  /* ── CONFIG ─────────────────────────────────────── */
  var WAQI_TOKEN = "57d701371e06caf0c90423f940d09d902cbb6385";
  var IQAIR_KEY  = "8168003e-faac-4039-bce0-b974cb29b84d";
  var OWM_KEY    = "1fa907e719b3f7cd70db5851488911eb";

  var TASHKENT   = { lat: 41.2995, lng: 69.2401 };
  var CACHE_TTL  = 30;
  var REFRESH_MS = 300000;

  /* ── 11 DISTRICTS ───────────────────────────────── */
  var DISTRICTS = [
    { id: "bektemir",      name: "Bektemir",       lat: 41.2087, lng: 69.3345 },
    { id: "chilonzor",     name: "Chilonzor",      lat: 41.2587, lng: 69.1986 },
    { id: "mirobod",       name: "Mirobod",        lat: 41.2981, lng: 69.2692 },
    { id: "mirzo-ulugbek", name: "Mirzo Ulug'bek", lat: 41.3125, lng: 69.3353 },
    { id: "olmazor",       name: "Olmazor",        lat: 41.3280, lng: 69.2150 },
    { id: "sergeli",       name: "Sergeli",        lat: 41.2233, lng: 69.2819 },
    { id: "shayxontohur",  name: "Shayxontohur",   lat: 41.3233, lng: 69.2467 },
    { id: "uchtepa",       name: "Uchtepa",        lat: 41.3050, lng: 69.2020 },
    { id: "yakkasaroy",    name: "Yakkasaroy",     lat: 41.2850, lng: 69.2750 },
    { id: "yunusobod",     name: "Yunusobod",      lat: 41.3547, lng: 69.2867 },
    { id: "yashnobod",     name: "Yashnobod",      lat: 41.2950, lng: 69.3380 },
  ];

  /* ── TIERS ──────────────────────────────────────── */
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

  /* ── LOGGING ────────────────────────────────────── */
  function log(m) { console.log("%c[TozaHavo]%c " + m, "color:#16b364;font-weight:bold", "color:inherit"); }
  function warn(m) { console.warn("[TozaHavo] ⚠ " + m); }
  function err(m) { console.error("[TozaHavo] ✗ " + m); }

  /* ── EPA PM2.5 → AQI ───────────────────────────── */
  function pm25ToAQI(pm) {
    if (pm < 0) return 0;
    var bp = [[0,12,0,50],[12.1,35.4,51,100],[35.5,55.4,101,150],[55.5,150.4,151,200],[150.5,250.4,201,300],[250.5,350.4,301,400],[350.5,500.4,401,500]];
    for (var i = 0; i < bp.length; i++) {
      if (pm >= bp[i][0] && pm <= bp[i][1]) {
        return Math.round(((bp[i][3]-bp[i][2])/(bp[i][1]-bp[i][0]))*(pm-bp[i][0])+bp[i][2]);
      }
    }
    return pm > 500 ? 500 : 0;
  }

  /* ── HELPERS ────────────────────────────────────── */
  function getTier(a) {
    for (var i = 0; i < TIERS.length; i++) if (a >= TIERS[i].min && a <= TIERS[i].max) return TIERS[i];
    return TIERS[3];
  }

  function ringOff(a, c) { return c - Math.round(c * Math.min(a / 300, 1)); }

  function now() {
    var d = new Date();
    var M = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    return M[d.getMonth()]+" "+String(d.getDate()).padStart(2,"0")+", "+d.getFullYear()+" · "+String(d.getHours()).padStart(2,"0")+":"+String(d.getMinutes()).padStart(2,"0")+" UTC+5";
  }

  /* ── CACHE ──────────────────────────────────────── */
  function cGet(k) { try { var r=localStorage.getItem(k); if(!r)return null; var o=JSON.parse(r); return (Date.now()-o.t)/60000<CACHE_TTL?o.d:null; } catch(e){return null;} }
  function cGetStale(k) { try { var r=localStorage.getItem(k); return r?JSON.parse(r).d:null; } catch(e){return null;} }
  function cSet(k,d) { try { localStorage.setItem(k,JSON.stringify({t:Date.now(),d:d})); } catch(e){} }

  /* ── FETCH WRAPPER ──────────────────────────────── */
  function F(url, ms) {
    ms = ms || 12000;
    return new Promise(function(ok, no) {
      var t = setTimeout(function(){ no(new Error("Timeout")); }, ms);
      fetch(url).then(function(r){
        clearTimeout(t);
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      }).then(ok).catch(function(e){ clearTimeout(t); no(e); });
    });
  }

  /* ── JSONP (WAQI on file://) ────────────────────── */
  function JP(url, cb) {
    return new Promise(function(ok, no) {
      var t = setTimeout(function(){ cl(); no(new Error("JSONP timeout")); }, 15000);
      window[cb] = function(d) { clearTimeout(t); cl(); ok(d); };
      function cl() { delete window[cb]; if(s.parentNode) s.parentNode.removeChild(s); }
      var s = document.createElement("script");
      s.src = url + "&callback=" + cb;
      s.onerror = function() { clearTimeout(t); cl(); no(new Error("JSONP error")); };
      document.head.appendChild(s);
    });
  }

  /* ══════════════════════════════════════════════════
     SOURCE 1: IQAir — MOST RELIABLE for Tashkent
     Uses real ground station data
     ══════════════════════════════════════════════════ */
  function fetchIQAir(lat, lng) {
    lat = lat || TASHKENT.lat;
    lng = lng || TASHKENT.lng;
    var url = "https://api.airvisual.com/v2/nearest_city?lat=" + lat + "&lon=" + lng + "&key=" + IQAIR_KEY;
    return F(url).then(function(j) {
      if (j.status !== "success") throw new Error(j.data ? j.data.message : "unknown");
      var p = j.data.current.pollution;
      var w = j.data.current.weather;
      log("IQAir ✓ AQI=" + p.aqius + " | pollutant=" + p.mainus + " | humidity=" + w.hu + "% | city=" + j.data.city);
      return { src:"IQAir", aqi:p.aqius, pollutant:p.mainus, humidity:w.hu, temp:w.tp };
    }).catch(function(e) { warn("IQAir failed: " + e.message); return null; });
  }

  /* ══════════════════════════════════════════════════
     SOURCE 2: WAQI
     Tashkent station only has SO₂, O₃, CO — no PM2.5!
     ══════════════════════════════════════════════════ */
  function fetchWAQI() {
    var url = "https://api.waqi.info/feed/tashkent/?token=" + WAQI_TOKEN;
    var isFile = location.protocol === "file:";
    var p = isFile ? JP(url, "_wCb") : F(url);
    return p.then(function(j) {
      if (j.status !== "ok") throw new Error("WAQI bad status");
      var d = j.data, q = d.iaqi || {};
      var hasPM = !!(q.pm25 && q.pm25.v != null);
      log("WAQI ✓ AQI=" + d.aqi + " | PM2.5=" + (hasPM ? q.pm25.v : "N/A") + " | SO₂=" + (q.so2?q.so2.v:"?") + " | dominant=" + d.dominentpol);
      if (!hasPM) warn("WAQI has NO PM2.5 data! AQI=" + d.aqi + " is based on SO₂ only — UNRELIABLE");
      return { src:"WAQI", aqi:d.aqi, hasPM:hasPM, iaqi:q, dom:d.dominentpol, humidity:q.h?q.h.v:null, time:d.time };
    }).catch(function(e) { warn("WAQI failed: " + e.message); return null; });
  }

  /* ══════════════════════════════════════════════════
     SOURCE 3: OpenWeatherMap
     Model data — less reliable for Central Asia
     ══════════════════════════════════════════════════ */
  function fetchOWM(lat, lng) {
    lat = lat || TASHKENT.lat;
    lng = lng || TASHKENT.lng;
    var url = "https://api.openweathermap.org/data/2.5/air_pollution?lat=" + lat + "&lon=" + lng + "&appid=" + OWM_KEY;
    return F(url).then(function(j) {
      if (!j.list || !j.list[0]) throw new Error("No data");
      var c = j.list[0].components;
      var aqi = pm25ToAQI(c.pm2_5);
      log("OWM ✓ PM2.5=" + c.pm2_5.toFixed(1) + "µg/m³ → AQI=" + aqi + " | PM10=" + c.pm10.toFixed(1) + " | O₃=" + c.o3.toFixed(1));
      return {
        src:"OWM", aqi:aqi, pm25:c.pm2_5, pm10:c.pm10,
        o3: +(c.o3/2).toFixed(1), no2: +(c.no2/1.88).toFixed(1),
        so2: +(c.so2/2.62).toFixed(1), co: +(c.co/1145).toFixed(1),
        raw:c
      };
    }).catch(function(e) { warn("OWM failed: " + e.message); return null; });
  }

  /* ══════════════════════════════════════════════════
     AGGREGATION — Smart weighted average
     IQAir = weight 3 (real station, best for Tashkent)
     WAQI  = weight 2 (if has PM2.5) or weight 0 (SO₂-only)
     OWM   = weight 1 (model data, often inaccurate here)
     ══════════════════════════════════════════════════ */
  function aggregate(iqair, waqi, owm) {
    var s = [];

    if (iqair && iqair.aqi > 0) s.push({ v: iqair.aqi, w: 3, n: "IQAir" });

    if (waqi && waqi.aqi > 0) {
      if (waqi.hasPM) {
        s.push({ v: waqi.aqi, w: 2, n: "WAQI" });
      } else if (s.length === 0) {
        // Only use SO₂-based WAQI if nothing else available
        s.push({ v: waqi.aqi, w: 1, n: "WAQI(SO₂)" });
        warn("Using WAQI SO₂-only AQI as fallback — unreliable");
      } else {
        log("WAQI AQI=" + waqi.aqi + " skipped (SO₂-only, better sources available)");
      }
    }

    if (owm && owm.aqi > 0) {
      // Check if OWM is suspiciously different from IQAir
      if (iqair && iqair.aqi > 30 && owm.aqi < 10) {
        warn("OWM AQI=" + owm.aqi + " vs IQAir=" + iqair.aqi + " — OWM model data unreliable, skipping");
      } else {
        s.push({ v: owm.aqi, w: 1, n: "OWM" });
      }
    }

    if (s.length === 0) return null;

    var sum = 0, tw = 0;
    s.forEach(function(x) { sum += x.v * x.w; tw += x.w; });
    var final = Math.round(sum / tw);

    var detail = s.map(function(x) { return x.n + "=" + x.v + "×" + x.w; }).join(" + ");
    log("━━━ FINAL AQI: " + final + " (" + detail + ") ━━━");
    return final;
  }

  /* ── Merge pollutant values ─────────────────────── */
  function mergePoll(owm, waqi) {
    var w = (waqi && waqi.iaqi) || {};
    var o = (owm && owm.raw) || {};
    function wv(k) { return w[k] && w[k].v != null ? w[k].v : null; }
    function ov(k,d) { return o[k] != null ? +(o[k]/(d||1)).toFixed(1) : null; }
    return {
      pm25: wv("pm25") || ov("pm2_5"),
      pm10: wv("pm10") || ov("pm10"),
      o3:   wv("o3")   || ov("o3", 2),
      no2:  wv("no2")  || ov("no2", 1.88),
      so2:  wv("so2")  || ov("so2", 2.62),
      co:   wv("co")   || ov("co", 1145),
    };
  }

  /* ══════════════════════════════════════════════════
     DOM UPDATE — Robust, with retry
     ══════════════════════════════════════════════════ */
  function updateUI(aqi, poll, humidity, srcStatus) {
    if (aqi == null) return;
    var tier = getTier(aqi);

    log("Updating UI: AQI=" + aqi + " tier=" + tier.label);

    // AQI value
    var el = document.getElementById("aqi-main-value");
    if (el) { el.textContent = aqi; log("  ✓ aqi-main-value = " + aqi); }
    else err("  ✗ #aqi-main-value NOT FOUND!");

    // Ring
    var ring = document.getElementById("aqi-ring-progress");
    if (ring) { ring.style.strokeDashoffset = ringOff(aqi, 440); ring.style.stroke = tier.color; log("  ✓ ring updated"); }
    else err("  ✗ #aqi-ring-progress NOT FOUND!");

    // Badge
    var badge = document.getElementById("aqi-main-badge");
    if (badge) {
      badge.className = "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide " + tier.badgeBg + " " + tier.textCls + " mb-3";
      badge.innerHTML = '<i class="ph-fill ph-warning-circle text-sm"></i> ' + tier.label;
      log("  ✓ badge = " + tier.label);
    } else err("  ✗ #aqi-main-badge NOT FOUND!");

    // Description
    var desc = document.getElementById("aqi-main-description");
    if (desc) { desc.textContent = tier.desc; log("  ✓ description updated"); }
    else err("  ✗ #aqi-main-description NOT FOUND!");

    // Timestamp
    var ts = document.getElementById("aqi-main-timestamp");
    if (ts) { ts.textContent = now(); log("  ✓ timestamp updated"); }

    // Recommendations
    var rec = document.getElementById("recommendation-text");
    if (rec) {
      rec.innerHTML = tier.tips.map(function(t) {
        return '<li class="flex items-start gap-2"><i class="' + t.icon + ' ' + tier.iconCls + ' mt-0.5"></i><span>' + t.html + '</span></li>';
      }).join("");
      log("  ✓ recommendations updated");
    } else err("  ✗ #recommendation-text NOT FOUND!");

    // Recommendation card border
    var rc = document.getElementById("recommendation-card");
    if (rc) {
      rc.className = rc.className.replace(/border-(emerald|amber|orange|red)-\d+/g, "").trim();
      rc.classList.add(tier.borderCls);
    }

    // Pollutant pills
    var pills = document.querySelectorAll(".pill-value");
    if (pills.length > 0) {
      var keys = ["pm25","pm10","o3","no2","so2","co"];
      pills.forEach(function(p, i) {
        var v = poll[keys[i]];
        p.textContent = v != null ? v : "—";
      });
      log("  ✓ " + pills.length + " pollutant pills updated");
    } else err("  ✗ .pill-value elements NOT FOUND!");

    // Dominant pollutant
    var dom = document.getElementById("dominant-pollutant");
    if (dom) {
      var best = "PM2.5";
      if (poll.pm25 != null && pm25ToAQI(poll.pm25) > 0) best = "PM2.5";
      else if (poll.so2 != null && poll.so2 > 3) best = "SO₂";
      else if (poll.o3 != null && poll.o3 > 40) best = "O₃";
      dom.textContent = best;
    }

    // Humidity
    var hum = document.getElementById("humidity-value");
    if (hum && humidity != null) hum.textContent = humidity + "%";

    // Source indicator
    showSources(srcStatus);

    // Save globally for i18n re-render
    window._tozahavoState = { aqi:aqi, poll:poll, humidity:humidity, src:srcStatus, tier:tier };
  }

  /* ── Source status display ──────────────────────── */
  function showSources(s) {
    var el = document.getElementById("data-sources");
    if (!el) {
      el = document.createElement("p");
      el.id = "data-sources";
      el.className = "mt-2 flex items-center gap-2 text-xs text-white/30 font-mono flex-wrap";
      var parent = document.getElementById("aqi-main-timestamp");
      if (parent) {
        var pp = parent.closest("p") || parent.parentElement;
        if (pp && pp.parentNode) pp.parentNode.insertBefore(el, pp.nextSibling);
      }
    }
    var n = 0;
    var h = ["WAQI","IQAir","OWM"].map(function(name) {
      var ok = s[name];
      if (ok) n++;
      return '<span style="color:' + (ok?"#22c55e":"#ef4444") + '">' + (ok?"✓":"✗") + '</span>' + name;
    }).join(" · ");
    el.innerHTML = "Manbalar: " + h + " (" + n + "/3)";
  }

  /* ── Update district card ───────────────────────── */
  function updateDist(id, aqi) {
    var card = document.querySelector('[data-district="' + id + '"]');
    if (!card || aqi == null) return;
    var tier = getTier(aqi);

    var ring = card.querySelector(".mini-ring");
    if (ring) { ring.setAttribute("stroke", tier.color); ring.setAttribute("stroke-dashoffset", ringOff(aqi, 138)); }

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
  }

  /* ══════════════════════════════════════════════════
     MAIN PIPELINE
     ══════════════════════════════════════════════════ */
  function run() {
    log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    log("Fetching from 3 sources...");

    // Loading state
    var v = document.getElementById("aqi-main-value");
    if (v) v.textContent = "...";

    // Check cache
    var cached = cGet("th_main_v5");
    if (cached) {
      log("Cache HIT — showing cached data while fetching fresh");
      updateUI(cached.aqi, cached.poll, cached.hum, cached.src);
    }

    var cachedD = cGet("th_dist_v5");
    if (cachedD) {
      cachedD.forEach(function(d) { updateDist(d.id, d.aqi); });
    }

    // Fetch all 3 in parallel
    Promise.all([
      fetchIQAir(),
      fetchWAQI(),
      fetchOWM(),
    ]).then(function(res) {
      var iqair = res[0];
      var waqi  = res[1];
      var owm   = res[2];

      var srcStatus = { WAQI: !!waqi, IQAir: !!iqair, OWM: !!owm };
      var active = (waqi?1:0) + (iqair?1:0) + (owm?1:0);
      log("Sources active: " + active + "/3");

      // Aggregate
      var finalAQI = aggregate(iqair, waqi, owm);
      var poll = mergePoll(owm, waqi);

      // If OWM has PM2.5 but it seems wrong, and IQAir is available, note it
      if (owm && iqair && owm.pm25 < 3 && iqair.aqi > 30) {
        log("Note: OWM PM2.5=" + owm.pm25 + " seems too low vs IQAir AQI=" + iqair.aqi);
      }

      var humidity = (iqair ? iqair.humidity : null) || (waqi ? waqi.humidity : null);

      log("Merged pollutants: PM2.5=" + poll.pm25 + " PM10=" + poll.pm10 + " O₃=" + poll.o3 + " NO₂=" + poll.no2 + " SO₂=" + poll.so2 + " CO=" + poll.co);

      if (finalAQI != null) {
        updateUI(finalAQI, poll, humidity, srcStatus);
        cSet("th_main_v5", { aqi:finalAQI, poll:poll, hum:humidity, src:srcStatus });

        // Also update UI after short delay (in case i18n overwrites)
        setTimeout(function() { updateUI(finalAQI, poll, humidity, srcStatus); }, 1500);
      } else {
        var stale = cGetStale("th_main_v5");
        if (stale) { warn("All failed — using stale cache"); updateUI(stale.aqi, stale.poll, stale.hum, stale.src); }
        else { err("All sources failed, no cache!"); if(v) v.textContent = "!"; }
      }

      // Districts
      fetchDistricts();

    }).catch(function(e) {
      err("Pipeline error: " + e.message);
      var stale = cGetStale("th_main_v5");
      if (stale) updateUI(stale.aqi, stale.poll, stale.hum, stale.src);
    });
  }

  /* ── District fetching ──────────────────────────── */
  function fetchDistricts() {
    log("Fetching 11 districts via IQAir + OWM...");
    var results = [];

    DISTRICTS.forEach(function(d, i) {
      setTimeout(function() {
        // Try IQAir first (best data), fallback to OWM
        fetchIQAir(d.lat, d.lng).then(function(iq) {
          if (iq && iq.aqi > 0) {
            log("District " + d.name + ": IQAir AQI=" + iq.aqi);
            updateDist(d.id, iq.aqi);
            results.push({ id:d.id, aqi:iq.aqi });
          } else {
            // Fallback to OWM
            return fetchOWM(d.lat, d.lng).then(function(o) {
              var aqi = o ? o.aqi : null;
              if (aqi != null) {
                log("District " + d.name + ": OWM AQI=" + aqi + " (fallback)");
                updateDist(d.id, aqi);
                results.push({ id:d.id, aqi:aqi });
              } else {
                warn("District " + d.name + ": no data from any source");
              }
            });
          }
        }).then(function() {
          if (results.length >= DISTRICTS.length) {
            cSet("th_dist_v5", results);
            log("All " + results.length + " districts loaded ✓");
          }
        });
      }, i * 2000); // 2 second stagger for IQAir rate limits
    });
  }

  /* ══════════════════════════════════════════════════
     INIT
     ══════════════════════════════════════════════════ */
  log("TozaHavo v5.0 — Multi-Source Pipeline");
  log("Protocol: " + location.protocol);
  log("IQAir key: " + IQAIR_KEY.substring(0, 8) + "...");
  log("OWM key: " + OWM_KEY.substring(0, 8) + "...");
  log("WAQI key: " + WAQI_TOKEN.substring(0, 8) + "...");

  // Wait for DOM to be fully ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() {
      log("DOM ready — starting pipeline");
      setTimeout(run, 500);
    });
  } else {
    log("DOM already ready — starting pipeline");
    setTimeout(run, 500);
  }

  // Auto-refresh
  setInterval(run, REFRESH_MS);

  // Expose for i18n re-render
  window.tozahavoRefreshUI = function() {
    var s = window._tozahavoState;
    if (s) { log("Re-rendering UI (i18n callback)"); updateUI(s.aqi, s.poll, s.humidity, s.src); }
  };

  log("Auto-refresh: every 5 min | Ready.");

})();
