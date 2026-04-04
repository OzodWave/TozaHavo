/* ═══════════════════════════════════════════════════════════
   TozaHavo · js/i18n.js
   Complete Multi-language system — UZ / RU / EN
   With onLanguageChange callback for dynamic content re-render
   ═══════════════════════════════════════════════════════════ */

var TozaI18n = (function () {
    "use strict";

    var STORAGE_KEY = "tozahavo-lang";
    var currentLang = "uz";
    var changeCallbacks = [];

    /* ══════════════════════════════════════════════════════
       COMPLETE TRANSLATIONS — every visible string
       ══════════════════════════════════════════════════════ */
    var translations = {

        /* ────────────────────── O'ZBEK (UZ) ────────────────────── */
        uz: {
            // ── Navbar ──
            nav_dashboard: "Boshqaruv paneli",
            nav_map: "Xarita",
            nav_about: "Biz haqimizda",
            live_indicator: "Jonli · Toshkent",

            // ── Page heading ──
            page_title: "Havo Sifati Indeksi",
            page_subtitle: "Toshkent bo'ylab real vaqtda ifloslanish monitoringi — barcha tumanlardan 12 ta sensor stansiyasidan har 5 daqiqada yangilanadi.",
            document_title: "TozaHavo — Havo Sifati · Toshkent",

            // ── AQI card ──
            aqi_card_title: "Toshkent Umumiy AQI",
            aqi_card_desc: "Toshkentning barcha tumanlaridagi real vaqtdagi zarrachalar konsentratsiyasi va ifloslovchi darajalar.",
            last_updated: "Oxirgi yangilanish:",

            // ── Health advisory ──
            health_advisory: "Sog'liqni saqlash maslahati",
            loading_advisory: "Sog'liqni saqlash maslahati yuklanmoqda…",

            // ── Quick stats ──
            dominant_pollutant: "Asosiy Ifloslovchi",
            stations_label: "Stansiyalar",
            stations_online: "onlayn",
            humidity_label: "Namlik",

            // ── District status labels ──
            status_good: "Yaxshi",
            status_moderate: "O'rtacha",
            status_unhealthy: "Sezgir guruhlar uchun zararli",
            status_hazardous: "Xavfli",

            // ── District names ──
            district_bektemir: "Bektemir",
            district_chilonzor: "Chilonzor",
            district_mirobod: "Mirobod",
            district_mirzo_ulugbek: "Mirzo Ulug'bek",
            district_olmazor: "Olmazor",
            district_sergeli: "Sergeli",
            district_shayxontohur: "Shayxontohur",
            district_uchtepa: "Uchtepa",
            district_yakkasaroy: "Yakkasaroy",
            district_yunusobod: "Yunusobod",
            district_yashnobod: "Yashnobod",

            // ── Sidebar ──
            sidebar_title: "Toshkent tumanlari",
            sidebar_subtitle: "Xaritada ko'rish uchun tumanni bosing",
            live_label: "Jonli",
            view_on_map: "Xarita",

            // ── Map section ──
            map_title: "Sensor Xaritasi",
            map_subtitle: "Interaktiv xarita — tumanlarni kattalashtirish uchun kartani bosing",
            legend_good: "Yaxshi",
            legend_moderate: "O'rtacha",
            legend_unhealthy: "Zararli",
            legend_hazardous: "Xavfli",

            // ── AQI Color Legend ──
            color_legend_title: "Ranglar nima anglatadi?",
            color_legend_range_good: "0–50",
            color_legend_label_good: "Yaxshi",
            color_legend_desc_good: "Havo sifati qoniqarli va xavf kam yoki umuman yo'q.",
            color_legend_range_moderate: "51–100",
            color_legend_label_moderate: "O'rtacha",
            color_legend_desc_moderate: "Qabul qilinadi; ba'zi ifloslovchilar sezgir shaxslarga ta'sir qilishi mumkin.",
            color_legend_range_unhealthy: "101–150",
            color_legend_label_unhealthy: "Sezgir guruhlar uchun zararli",
            color_legend_desc_unhealthy: "Sezgir guruhlar sog'lig'iga ta'sir ko'rsatishi mumkin.",
            color_legend_range_hazardous: "151+",
            color_legend_label_hazardous: "Xavfli",
            color_legend_desc_hazardous: "Har bir kishi jiddiy sog'liq ta'siriga duch kelishi mumkin.",

            // ── Footer ──
            footer_rights: "© 2026 Barcha huquqlar himoyalangan",
            footer_privacy: "Maxfiylik",
            footer_terms: "Shartlar",
            footer_api: "API",

            // ── AQI tier labels ──
            tier_good: "YAXSHI",
            tier_moderate: "O'RTACHA",
            tier_unhealthy_sensitive: "SEZGIR GURUHLAR UCHUN ZARARLI",
            tier_hazardous: "XAVFLI",

            // ── Recommendations — Good ──
            rec_good_1: "Havo sifati a'lo — <strong>ochiq havoda faoliyat</strong>dan bemalol zavqlaning.",
            rec_good_2: "Yugurish, velosiped haydash va barcha ochiq havo sporti uchun ajoyib sharoit.",
            rec_good_3: "Derazalarni oching va <strong>toza havo</strong>ni kiriting.",
            rec_good_4: "Bugun hech qanday yosh guruhi uchun ehtiyot choralari kerak emas.",

            // ── Recommendations — Moderate ──
            rec_mod_1: "Havo sifati qabul qilinadi, ammo <strong>o'ta sezgir</strong> shaxslar uchun xavotirli bo'lishi mumkin.",
            rec_mod_2: "Sezgir shaxslar uzoq muddatli tashqi faoliyatni kamaytirishi kerak.",
            rec_mod_3: "<strong>Nafas olish kasalliklari</strong> bo'lsa, havo tozalagichni yoqib qo'ying.",
            rec_mod_4: "Oddiy aholi oddiy faoliyatni davom ettirishi mumkin.",

            // ── Recommendations — Unhealthy for Sensitive ──
            rec_usg_1: "Tashqarida, ayniqsa asosiy yo'llar yaqinida <strong>N95 niqob</strong> taqing.",
            rec_usg_2: "Derazalarni yoping va ichkarida <strong>havo tozalagich</strong> ishlating.",
            rec_usg_3: "AQI 100 dan pastga tushguncha og'ir tashqi mashqlarni cheklang.",
            rec_usg_4: "Bolalar va keksalar iloji boricha uyda qolishlari kerak.",

            // ── Recommendations — Hazardous ──
            rec_haz_1: "<strong>Sog'liq haqida ogohlantirish:</strong> hamma jiddiy ta'sirlarga duch kelishi mumkin.",
            rec_haz_2: "Uyda qoling va darhol <strong>barcha derazalarni yoping</strong>.",
            rec_haz_3: "Tashqariga chiqish kerak bo'lsa, <strong>N95/P100 niqob</strong> taqing.",
            rec_haz_4: "Har bir xonada havo tozalagichlarni <strong>maksimal</strong> rejimda ishlating.",

            // ── Theme ──
            theme_light: "Kunduzgi rejim",
            theme_dark: "Tungi rejim"
        },

        /* ────────────────────── РУССКИЙ (RU) ────────────────────── */
        ru: {
            // ── Navbar ──
            nav_dashboard: "Панель",
            nav_map: "Карта",
            nav_about: "О нас",
            live_indicator: "Онлайн · Ташкент",

            // ── Page heading ──
            page_title: "Индекс Качества Воздуха",
            page_subtitle: "Мониторинг загрязнения воздуха в Ташкенте в реальном времени — обновление каждые 5 минут с 12 станций во всех районах.",
            document_title: "TozaHavo — Качество Воздуха · Ташкент",

            // ── AQI card ──
            aqi_card_title: "Общий AQI Ташкента",
            aqi_card_desc: "Концентрация частиц и уровни загрязняющих веществ в реальном времени по всем районам Ташкента.",
            last_updated: "Последнее обновление:",

            // ── Health advisory ──
            health_advisory: "Рекомендации по здоровью",
            loading_advisory: "Загрузка рекомендаций…",

            // ── Quick stats ──
            dominant_pollutant: "Основной загрязнитель",
            stations_label: "Станции",
            stations_online: "онлайн",
            humidity_label: "Влажность",

            // ── District status labels ──
            status_good: "Хорошо",
            status_moderate: "Умеренно",
            status_unhealthy: "Вредно (ЧГ)",
            status_hazardous: "Опасно",

            // ── District names ──
            district_bektemir: "Бектемир",
            district_chilonzor: "Чилонзор",
            district_mirobod: "Мирабод",
            district_mirzo_ulugbek: "Мирзо Улугбек",
            district_olmazor: "Олмазор",
            district_sergeli: "Сергели",
            district_shayxontohur: "Шайхонтохур",
            district_uchtepa: "Учтепа",
            district_yakkasaroy: "Яккасарой",
            district_yunusobod: "Юнусобод",
            district_yashnobod: "Яшнобод",

            // ── Sidebar ──
            sidebar_title: "Районы Ташкента",
            sidebar_subtitle: "Нажмите на район для просмотра на карте",
            live_label: "Онлайн",
            view_on_map: "Карта",

            // ── Map section ──
            map_title: "Карта датчиков",
            map_subtitle: "Интерактивная карта — нажмите на район для увеличения",
            legend_good: "Хорошо",
            legend_moderate: "Умеренно",
            legend_unhealthy: "Вредно (ЧГ)",
            legend_hazardous: "Опасно",

            // ── AQI Color Legend ──
            color_legend_title: "Что означают цвета?",
            color_legend_range_good: "0–50",
            color_legend_label_good: "Хорошо",
            color_legend_desc_good: "Качество воздуха удовлетворительное, риск минимальный.",
            color_legend_range_moderate: "51–100",
            color_legend_label_moderate: "Умеренно",
            color_legend_desc_moderate: "Приемлемо; некоторые загрязнители могут вызвать беспокойство у чувствительных лиц.",
            color_legend_range_unhealthy: "101–150",
            color_legend_label_unhealthy: "Вредно для чувствительных групп",
            color_legend_desc_unhealthy: "Чувствительные группы могут испытывать негативные последствия.",
            color_legend_range_hazardous: "151+",
            color_legend_label_hazardous: "Опасно",
            color_legend_desc_hazardous: "Каждый может столкнуться с серьёзными последствиями для здоровья.",

            // ── Footer ──
            footer_rights: "© 2026 Все права защищены",
            footer_privacy: "Конфиденциальность",
            footer_terms: "Условия",
            footer_api: "API",

            // ── AQI tier labels ──
            tier_good: "ХОРОШО",
            tier_moderate: "УМЕРЕННО",
            tier_unhealthy_sensitive: "ВРЕДНО ДЛЯ ЧУВСТВИТЕЛЬНЫХ ГРУПП",
            tier_hazardous: "ОПАСНО",

            // ── Recommendations — Good ──
            rec_good_1: "Качество воздуха отличное — наслаждайтесь <strong>активностями на улице</strong>.",
            rec_good_2: "Отличные условия для бега, велоспорта и всех видов спорта на открытом воздухе.",
            rec_good_3: "Откройте окна и впустите <strong>свежий воздух</strong>.",
            rec_good_4: "Никаких мер предосторожности не требуется ни для одной возрастной группы.",

            // ── Recommendations — Moderate ──
            rec_mod_1: "Качество воздуха приемлемо, но может вызвать беспокойство у <strong>особо чувствительных</strong> лиц.",
            rec_mod_2: "Чувствительным лицам следует сократить длительные нагрузки на открытом воздухе.",
            rec_mod_3: "Держите очиститель воздуха включённым при <strong>заболеваниях дыхательных путей</strong>.",
            rec_mod_4: "Население может продолжать обычную деятельность.",

            // ── Recommendations — Unhealthy for Sensitive ──
            rec_usg_1: "Носите <strong>маску N95</strong> на улице, особенно вблизи главных дорог.",
            rec_usg_2: "Закройте окна и используйте <strong>очиститель воздуха</strong> в помещении.",
            rec_usg_3: "Ограничьте интенсивные нагрузки на улице, пока AQI не упадёт ниже 100.",
            rec_usg_4: "Дети и пожилые должны по возможности оставаться дома.",

            // ── Recommendations — Hazardous ──
            rec_haz_1: "<strong>Предупреждение:</strong> каждый может испытать серьёзные последствия для здоровья.",
            rec_haz_2: "Оставайтесь дома и немедленно <strong>закройте все окна</strong>.",
            rec_haz_3: "Носите <strong>маску N95/P100</strong>, если необходимо выйти.",
            rec_haz_4: "Включите очистители воздуха на <strong>максимум</strong> во всех комнатах.",

            // ── Theme ──
            theme_light: "Светлая тема",
            theme_dark: "Тёмная тема"
        },

        /* ────────────────────── ENGLISH (EN) ────────────────────── */
        en: {
            // ── Navbar ──
            nav_dashboard: "Dashboard",
            nav_map: "Map",
            nav_about: "About",
            live_indicator: "Live · Tashkent",

            // ── Page heading ──
            page_title: "Air Quality Index",
            page_subtitle: "Real-time pollution monitoring across Tashkent — updated every 5 minutes from 12 sensor stations across all districts.",
            document_title: "TozaHavo — Air Quality · Tashkent",

            // ── AQI card ──
            aqi_card_title: "Tashkent Overall AQI",
            aqi_card_desc: "Real-time particulate concentration and pollutant levels across all districts of Tashkent.",
            last_updated: "Last updated:",

            // ── Health advisory ──
            health_advisory: "Health Advisory",
            loading_advisory: "Loading health advisory…",

            // ── Quick stats ──
            dominant_pollutant: "Dominant Pollutant",
            stations_label: "Stations",
            stations_online: "online",
            humidity_label: "Humidity",

            // ── District status labels ──
            status_good: "Good",
            status_moderate: "Moderate",
            status_unhealthy: "Unhealthy (SG)",
            status_hazardous: "Hazardous",

            // ── District names ──
            district_bektemir: "Bektemir",
            district_chilonzor: "Chilanzar",
            district_mirobod: "Mirabad",
            district_mirzo_ulugbek: "Mirzo Ulugbek",
            district_olmazor: "Olmazor",
            district_sergeli: "Sergeli",
            district_shayxontohur: "Shaykhantahur",
            district_uchtepa: "Uchtepa",
            district_yakkasaroy: "Yakkasaray",
            district_yunusobod: "Yunusabad",
            district_yashnobod: "Yashnabad",

            // ── Sidebar ──
            sidebar_title: "Tashkent Districts",
            sidebar_subtitle: "Click a district to explore on the map",
            live_label: "Live",
            view_on_map: "Map",

            // ── Map section ──
            map_title: "Sensor Map",
            map_subtitle: "Interactive map — click a district card to zoom in",
            legend_good: "Good",
            legend_moderate: "Moderate",
            legend_unhealthy: "Unhealthy SG",
            legend_hazardous: "Hazardous",

            // ── AQI Color Legend ──
            color_legend_title: "What do the colors mean?",
            color_legend_range_good: "0–50",
            color_legend_label_good: "Good",
            color_legend_desc_good: "Air quality is satisfactory and poses little or no risk.",
            color_legend_range_moderate: "51–100",
            color_legend_label_moderate: "Moderate",
            color_legend_desc_moderate: "Acceptable; some pollutants may concern sensitive individuals.",
            color_legend_range_unhealthy: "101–150",
            color_legend_label_unhealthy: "Unhealthy for Sensitive Groups",
            color_legend_desc_unhealthy: "Sensitive groups may experience health effects.",
            color_legend_range_hazardous: "151+",
            color_legend_label_hazardous: "Hazardous",
            color_legend_desc_hazardous: "Everyone may experience serious health effects.",

            // ── Footer ──
            footer_rights: "© 2026 All rights reserved",
            footer_privacy: "Privacy",
            footer_terms: "Terms",
            footer_api: "API",

            // ── AQI tier labels ──
            tier_good: "GOOD",
            tier_moderate: "MODERATE",
            tier_unhealthy_sensitive: "UNHEALTHY FOR SENSITIVE GROUPS",
            tier_hazardous: "HAZARDOUS",

            // ── Recommendations — Good ──
            rec_good_1: 'Air quality is excellent — enjoy <strong>outdoor activities</strong> freely.',
            rec_good_2: "Great conditions for running, cycling, and all outdoor sports.",
            rec_good_3: 'Open your windows and let the <strong>fresh air</strong> in.',
            rec_good_4: "No precautions needed for any age group today.",

            // ── Recommendations — Moderate ──
            rec_mod_1: 'Air quality is acceptable but may concern <strong>unusually sensitive</strong> individuals.',
            rec_mod_2: "Sensitive individuals should consider reducing prolonged outdoor exertion.",
            rec_mod_3: 'Keep an air purifier running if you have <strong>respiratory conditions</strong>.',
            rec_mod_4: "General public can continue normal activities.",

            // ── Recommendations — Unhealthy for Sensitive ──
            rec_usg_1: 'Wear an <strong>N95 mask</strong> outdoors, especially near major roads.',
            rec_usg_2: 'Keep windows closed and use an <strong>air purifier</strong> indoors.',
            rec_usg_3: "Limit strenuous outdoor exercise until AQI drops below 100.",
            rec_usg_4: "Children & elderly should remain indoors if possible.",

            // ── Recommendations — Hazardous ──
            rec_haz_1: '<strong>Health alert:</strong> everyone may experience serious health effects.',
            rec_haz_2: 'Stay indoors and <strong>close all windows</strong> immediately.',
            rec_haz_3: 'Wear an <strong>N95/P100 mask</strong> if you must go outside.',
            rec_haz_4: 'Run air purifiers on <strong>maximum</strong> in every occupied room.',

            // ── Theme ──
            theme_light: "Light mode",
            theme_dark: "Dark mode"
        }
    };

    /* ══════════════════════════════════════════════════════
       CORE FUNCTIONS
       ══════════════════════════════════════════════════════ */

    /** Get a translation by key. Falls back to EN, then returns the key. */
    function t(key) {
        var lang = translations[currentLang];
        if (lang && lang[key] !== undefined) return lang[key];
        if (translations.en && translations.en[key] !== undefined) return translations.en[key];
        return key;
    }

    /** Apply translations to all static [data-i18n] and [data-i18n-html] elements */
    function applyTranslations() {
        document.querySelectorAll("[data-i18n]").forEach(function (el) {
            el.textContent = t(el.getAttribute("data-i18n"));
        });
        document.querySelectorAll("[data-i18n-html]").forEach(function (el) {
            el.innerHTML = t(el.getAttribute("data-i18n-html"));
        });
    }

    /** Set the active language, persist, apply, and notify listeners */
    function setLanguage(langCode) {
        if (!translations[langCode]) return;
        currentLang = langCode;

        // 1. Persist to localStorage
        try { localStorage.setItem(STORAGE_KEY, langCode); } catch (e) {}

        // 2. Update <html lang>
        document.documentElement.lang = langCode;

        // 3. Update document title
        document.title = t("document_title");

        // 4. Apply static translations
        applyTranslations();

        // 5. Update language pill active state
        document.querySelectorAll(".lang-pill").forEach(function (pill) {
            if (pill.getAttribute("data-lang") === langCode) {
                pill.classList.add("lang-pill--active");
            } else {
                pill.classList.remove("lang-pill--active");
            }
        });

        // 6. Fire onLanguageChange callbacks (for app.js dynamic content)
        changeCallbacks.forEach(function (cb) {
            try { cb(langCode); } catch (e) {
                console.error("[TozaI18n] Callback error:", e);
            }
        });
    }

    /** Register a callback to be fired when language changes */
    function onLanguageChange(cb) {
        if (typeof cb === "function") changeCallbacks.push(cb);
    }

    /** Initialize: read saved lang, apply, bind pill clicks */
    function init() {
        try {
            var saved = localStorage.getItem(STORAGE_KEY);
            if (saved && translations[saved]) currentLang = saved;
        } catch (e) {}

        setLanguage(currentLang);

        document.querySelectorAll(".lang-pill").forEach(function (pill) {
            pill.addEventListener("click", function () {
                setLanguage(this.getAttribute("data-lang"));
            });
        });
    }

    /* ══════════════════════════════════════════════════════
       PUBLIC API
       ══════════════════════════════════════════════════════ */
    return {
        init: init,
        t: t,
        setLanguage: setLanguage,
        applyTranslations: applyTranslations,
        onLanguageChange: onLanguageChange,
        getCurrentLang: function () { return currentLang; },
        translations: translations
    };

})();
