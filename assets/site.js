// Language: German for German-language browsers, English for everyone else. The choice is remembered.
(function () {
  var root = document.documentElement;
  var saved = null;
  try { saved = localStorage.getItem('cl-lang'); } catch (e) { /* storage blocked */ }
  var lang = saved || ((navigator.language || 'en').toLowerCase().indexOf('de') === 0 ? 'de' : 'en');
  setLang(lang);

  function setLang(l) {
    root.setAttribute('data-lang', l);
    root.setAttribute('lang', l);
    var title = document.querySelector('meta[name="title-' + l + '"]');
    if (title) document.title = title.content;
    var btns = document.querySelectorAll('.lang button');
    for (var i = 0; i < btns.length; i++) btns[i].setAttribute('aria-pressed', btns[i].getAttribute('data-l') === l ? 'true' : 'false');
  }

  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('.lang button');
    if (!b) return;
    var l = b.getAttribute('data-l');
    setLang(l);
    try { localStorage.setItem('cl-lang', l); } catch (err) { /* storage blocked */ }
  });

  document.addEventListener('DOMContentLoaded', function () {
    setLang(root.getAttribute('data-lang'));
    var nav = document.querySelector('.nav');
    var onScroll = function () { if (nav) nav.classList.toggle('scrolled', window.scrollY > 8); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Price in the visitor's currency (App Store prices). Unknown country: the general wording stays.
    var p = localPrice();
    if (p) {
      var ps = document.querySelectorAll('.price');
      for (var k = 0; k < ps.length; k++) {
        ps[k].textContent = ps[k].hasAttribute('data-de')
          ? 'mit dem Abo für ' + p.de[0] + ' im Monat oder ' + p.de[1] + ' im Jahr'
          : 'a subscription for ' + p.en[0] + ' a month or ' + p.en[1] + ' a year';
      }
    }

    // Animated illustrations stand still for people who prefer reduced motion.
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      var svgs = document.querySelectorAll('svg.anim');
      for (var s = 0; s < svgs.length; s++) { try { svgs[s].pauseAnimations(); svgs[s].setCurrentTime(2.2); } catch (err) { /* no SMIL */ } }
    }

    var els = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) { for (var i = 0; i < els.length; i++) els[i].classList.add('in'); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    for (var j = 0; j < els.length; j++) io.observe(els[j]);
  });

  // Country from the browser language (de-CH, en-US …), otherwise from the time zone.
  function localPrice() {
    var EURO = ['AT','BE','CY','DE','EE','ES','FI','FR','GR','HR','IE','IT','LT','LU','LV','MT','NL','PT','SI','SK'];
    var c = '';
    var langs = navigator.languages || [navigator.language || ''];
    for (var i = 0; i < langs.length && !c; i++) { var m = /-([A-Za-z]{2})$/.exec(langs[i] || ''); if (m) c = m[1].toUpperCase(); }
    var tz = '';
    try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (e) { /* old browser */ }
    if (tz === 'Europe/Zurich') c = 'CH';                       // the time zone wins for Switzerland (de-DE browsers in Zurich)
    else if (!c) {
      var TZ = { 'Europe/Vienna': 'AT', 'Europe/Berlin': 'DE', 'Europe/Paris': 'FR', 'Europe/Rome': 'IT', 'Europe/Madrid': 'ES', 'Europe/Amsterdam': 'NL',
                 'Europe/Brussels': 'BE', 'Europe/Luxembourg': 'LU', 'Europe/Lisbon': 'PT', 'Europe/Dublin': 'IE', 'Europe/Helsinki': 'FI', 'Europe/Athens': 'GR' };
      c = TZ[tz] || (/^America\/(New_York|Chicago|Denver|Los_Angeles|Phoenix|Anchorage)$/.test(tz) ? 'US' : '');
    }
    if (c === 'CH') return { de: ['CHF 10', 'CHF 90'], en: ['CHF 10', 'CHF 90'] };
    if (EURO.indexOf(c) >= 0) return { de: ['9,99 €', '89,99 €'], en: ['€9.99', '€89.99'] };
    if (c === 'US') return { de: ['9,99 $', '89,99 $'], en: ['$9.99', '$89.99'] };
    return null;
  }
})();
