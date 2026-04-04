/* ═══════════════════════════════════════════════════════════
   TozaHavo · js/map.js
   Leaflet map — district markers, AQI circles & fly-to logic
   ═══════════════════════════════════════════════════════════ */

var TozaMap = (function () {
    "use strict";

    /* ── District coordinates ─────────────────────────── */
    var DISTRICTS = {
        "Bektemir":          { lat: 41.2142, lng: 69.3344 },
        "Chilonzor":         { lat: 41.2587, lng: 69.1986 },
        "Mirobod":           { lat: 41.2922, lng: 69.2784 },
        "Mirzo Ulug'bek":    { lat: 41.3125, lng: 69.3353 },
        "Olmazor":           { lat: 41.3305, lng: 69.2048 },
        "Sergeli":           { lat: 41.2233, lng: 69.2819 },
        "Yunusobod":         { lat: 41.3547, lng: 69.2867 },
        "Yashnobod":         { lat: 41.2978, lng: 69.3357 },
        "Yakkasaroy":        { lat: 41.2796, lng: 69.2671 },
        "Shayxontohur":      { lat: 41.3260, lng: 69.2350 },
        "Uchtepa":           { lat: 41.2890, lng: 69.2100 }
    };

    var map, markers = {}, circles = {};

    /* ── AQI ➜ color ──────────────────────────────────── */
    function aqiColor(aqi) {
        if (aqi <= 50)  return "#22c55e";   // green
        if (aqi <= 100) return "#f59e0b";   // amber
        if (aqi <= 150) return "#f97316";   // orange
        return "#ef4444";                    // red
    }

    function aqiLabel(aqi) {
        if (aqi <= 50)  return "Good";
        if (aqi <= 100) return "Moderate";
        if (aqi <= 150) return "Unhealthy for Sensitive";
        return "Hazardous";
    }

    /* ── Custom SVG marker ────────────────────────────── */
    function createIcon(color) {
        var svg =
            '<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">' +
            '<circle cx="18" cy="18" r="16" fill="' + color + '" fill-opacity="0.18" stroke="' + color + '" stroke-width="2.5"/>' +
            '<circle cx="18" cy="18" r="7" fill="' + color + '"/>' +
            '</svg>';
        return L.divIcon({
            html: svg,
            className: "",
            iconSize: [36, 36],
            iconAnchor: [18, 18],
            popupAnchor: [0, -20]
        });
    }

    /* ── Popup builder ────────────────────────────────── */
    function buildPopup(name, aqi) {
        var color = aqiColor(aqi);
        var label = aqiLabel(aqi);
        var bg = color.replace(")", ",0.12)").replace("rgb", "rgba").replace("#", "");
        // Simple inline rgba from hex
        var r = parseInt(color.slice(1, 3), 16);
        var g = parseInt(color.slice(3, 5), 16);
        var b = parseInt(color.slice(5, 7), 16);
        var bgRGBA = "rgba(" + r + "," + g + "," + b + ",0.12)";

        return '<div style="font-family:\'Outfit\',sans-serif;min-width:200px;padding:4px 2px;">' +
            '<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">' +
            '<div style="width:32px;height:32px;border-radius:10px;background:' + bgRGBA + ';display:flex;align-items:center;justify-content:center;">' +
            '<svg width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6" fill="' + color + '"/></svg>' +
            '</div>' +
            '<div>' +
            '<div style="font-weight:700;font-size:14px;color:#1f2937;line-height:1.2;">' + name + '</div>' +
            '<div style="font-size:11px;color:#9ba5b1;font-weight:400;margin-top:1px;">Sensor Station</div>' +
            '</div>' +
            '</div>' +
            '<div style="display:flex;align-items:center;justify-content:space-between;background:' + bgRGBA + ';border-radius:10px;padding:10px 12px;">' +
            '<div>' +
            '<div style="font-size:10px;text-transform:uppercase;letter-spacing:0.06em;font-weight:600;color:' + color + ';margin-bottom:2px;">AQI</div>' +
            '<div style="font-size:26px;font-weight:800;color:' + color + ';line-height:1;">' + aqi + '</div>' +
            '</div>' +
            '<div style="font-size:10px;font-weight:600;color:' + color + ';background:rgba(255,255,255,0.7);border-radius:6px;padding:4px 8px;max-width:110px;text-align:center;line-height:1.3;">' + label + '</div>' +
            '</div>' +
            '</div>';
    }

    /* ── Initialize ───────────────────────────────────── */
    function init() {
        map = L.map("map", {
            center: [41.2995, 69.2401],
            zoom: 12,
            zoomControl: false,
            attributionControl: true,
            scrollWheelZoom: true
        });

        L.control.zoom({ position: "topright" }).addTo(map);

        L.tileLayer(
            "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
            {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
                subdomains: "abcd",
                maxZoom: 19
            }
        ).addTo(map);
    }

    /* ── Place / update markers & circles ─────────────── */
    function updateMarkers(districtData) {
        // districtData = [ { name, aqi }, ... ]
        districtData.forEach(function (d) {
            var coords = DISTRICTS[d.name];
            if (!coords) return;

            var color = aqiColor(d.aqi);
            var ll = [coords.lat, coords.lng];

            // --- Marker ---
            if (markers[d.name]) {
                markers[d.name].setIcon(createIcon(color));
                markers[d.name].setPopupContent(buildPopup(d.name, d.aqi));
            } else {
                markers[d.name] = L.marker(ll, { icon: createIcon(color) })
                    .addTo(map)
                    .bindPopup(buildPopup(d.name, d.aqi), {
                        maxWidth: 280,
                        closeButton: true,
                        className: "tozahavo-popup"
                    });
            }

            // --- Circle (2 km radius) ---
            if (circles[d.name]) {
                circles[d.name].setStyle({
                    color: color,
                    fillColor: color
                });
            } else {
                circles[d.name] = L.circle(ll, {
                    radius: 2000,
                    color: color,
                    fillColor: color,
                    fillOpacity: 0.10,
                    weight: 1.5,
                    opacity: 0.35
                }).addTo(map);
            }
        });
    }

    /* ── Fly to a district ────────────────────────────── */
    function zoomToDistrict(districtName) {
        var coords = DISTRICTS[districtName];
        if (!coords) return;
        map.flyTo([coords.lat, coords.lng], 14, {
            duration: 1.6,
            easeLinearity: 0.25
        });
        // open popup
        if (markers[districtName]) {
            setTimeout(function () {
                markers[districtName].openPopup();
            }, 1700);
        }
    }

    /* ── Get district coordinate list ─────────────────── */
    function getDistricts() {
        return DISTRICTS;
    }

    /* ── Public API ───────────────────────────────────── */
    return {
        init: init,
        updateMarkers: updateMarkers,
        zoomToDistrict: zoomToDistrict,
        getDistricts: getDistricts,
        aqiColor: aqiColor,
        aqiLabel: aqiLabel
    };

})();