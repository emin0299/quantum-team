/* Quantum Team – sayfaları icerik.js dosyasındaki bilgilerle doldurur.
 * Metinleri değiştirmek için bu dosyaya değil, icerik.js dosyasına bakın.
 *
 * Her sayfanın <body> etiketindeki data-sayfa değeri hangi bölümlerin çalışacağını belirler:
 * ana, basvuru, test, durum, sponsorluk, takim, haberler, panel */

(function () {
  'use strict';

  // Site tek adresle çalışsın: www.quantumteam.com.tr → quantumteam.com.tr
  if (location.hostname.indexOf('www.') === 0) {
    location.replace(location.href.replace('//www.', '//'));
    return;
  }

  const KOK = window.KOK || '';                       // İngilizce sayfalar alt klasörde olduğu için '../'
  const DIL = document.documentElement.lang === 'en' ? 'en' : 'tr';
  const SAYFA = document.body.dataset.sayfa || '';
  const I = DIL === 'en' && window.ICERIK_EN ? birlestir(window.ICERIK, window.ICERIK_EN) : window.ICERIK;

  const SOZ = {
    tr: {
      takimlar: 'Takımlar', basarilar: 'Başarılar', haberler: 'Haberler', sponsorluk: 'Sponsorluk', iletisim: 'İletişim',
      basvur: 'Başvur', menuAc: 'Menüyü aç', basaDon: 'Başa dön ↑', anaSayfa: 'ana sayfa', dilDegistir: 'English',
      takimi: 'takımı', kapali: 'Başvurular kapalı', acik: 'Başvurular açık', kapaliUzun: 'Başvurular şu an kapalı',
      kaldi: 'Başvuruların kapanmasına', kaldiSon: 'kaldı', gun: 'gün', saat: 'saat', dakika: 'dakika',
      detay: 'Takımı incele', sorgula: 'Başvurumu sorgula', test: 'Hangi takım sana uygun?',
    },
    en: {
      takimlar: 'Teams', basarilar: 'Achievements', haberler: 'News', sponsorluk: 'Sponsorship', iletisim: 'Contact',
      basvur: 'Join us', menuAc: 'Open menu', basaDon: 'Back to top ↑', anaSayfa: 'home page', dilDegistir: 'Türkçe',
      takimi: 'team', kapali: 'Applications closed', acik: 'Applications open', kapaliUzun: 'Applications are closed',
      kaldi: 'Applications close in', kaldiSon: '', gun: 'days', saat: 'hours', dakika: 'minutes',
      detay: 'View team', sorgula: 'Check my application', test: 'Which team fits you?',
    },
  }[DIL];

  // 24x24 çizgi ikonlar
  const IKON = {
    kupa: '<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M17 6h3a3 3 0 0 1-3 4M7 6H4a3 3 0 0 0 3 4"/>',
    araba: '<path d="M3 14l2-5a2 2 0 0 1 1.9-1.4h10.2A2 2 0 0 1 19 9l2 5v3a1 1 0 0 1-1 1h-1.5M3 14v3a1 1 0 0 0 1 1h1.5M3 14h18M9.5 18h5"/><circle cx="7.5" cy="18" r="1.9"/><circle cx="16.5" cy="18" r="1.9"/><path d="M12.5 9.5l-1.5 2.5h2l-1.5 2.5"/>',
    roket: '<path d="M12 2c3 2.4 4.5 5.8 4.5 9.8V17h-9v-5.2C7.5 7.8 9 4.4 12 2z"/><path d="M7.5 13.5L4.5 17v3l3-1.6M16.5 13.5l3 3.5v3l-3-1.6M10 20.5l2 1.5 2-1.5"/><circle cx="12" cy="9.5" r="1.6"/>',
    iha: '<path d="M12 3.5v17M2.5 11.5l9.5 2 9.5-2M8.5 20.5h7"/><circle cx="5" cy="8" r="2.2"/><circle cx="19" cy="8" r="2.2"/><path d="M5 10.2v2M19 10.2v2"/>',
    blokzincir: '<rect x="3" y="3" width="7.5" height="7.5" rx="1.5"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5"/><path d="M10.5 6.75h3.75v6.75M13.5 17.25H9.75V10.5"/>',
    jet: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2"/><path d="M12 10c0-3 1.5-5 4-6M14 12c3 0 5 1.5 6 4M12 14c0 3-1.5 5-4 6M10 12c-3 0-5-1.5-6-4"/>',
    sualti: '<path d="M3 11c0-1.8 1.6-3 3.6-3H16l4 3-4 3H6.6C4.6 14 3 12.8 3 11z"/><path d="M15.5 8l2-3M15.5 14l2 3M7 11h5"/><path d="M3 20c1.5-1 3 1 4.5 0s3 1 4.5 0 3 1 4.5 0 3 1 4.5 0"/>',
    mekanik: '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4z"/>',
    elektronik: '<rect x="7" y="7" width="10" height="10" rx="1.5"/><rect x="10" y="10" width="4" height="4"/><path d="M9.5 3v4M14.5 3v4M9.5 17v4M14.5 17v4M3 9.5h4M3 14.5h4M17 9.5h4M17 14.5h4"/>',
    yazilim: '<path d="M8 7l-5 5 5 5M16 7l5 5-5 5M14 4l-4 16"/>',
    medya: '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
    instagram: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.6" fill="currentColor"/>',
    linkedin: '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 10.5V17M8 7.2v.1M12 17v-3.8a2.2 2.2 0 0 1 4.4 0V17M12 10.5V17"/>',
    eposta: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3.5 7l8.5 6 8.5-6"/>',
    konum: '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
    tik: '<circle cx="12" cy="12" r="9"/><path d="M8 12.2l2.8 2.8L16 9.5"/>',
    dis: '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
    ok: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    saat: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    takvim: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    arama: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
    paylas: '<circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="M8.2 10.9l7.6-4.4M8.2 13.1l7.6 4.4"/>',
    indir: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
    kalp: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
    kasket: '<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v5c3 2 9 2 12 0v-5M22 9v6"/>',
  };

  // ------------------------------------------------------------ Yardımcılar

  function birlestir(a, b) {
    if (Array.isArray(a) && Array.isArray(b)) return a.map((x, i) => (i in b ? birlestir(x, b[i]) : x));
    if (a && b && typeof a === 'object' && typeof b === 'object' && !Array.isArray(b)) {
      const s = Object.assign({}, a);
      Object.keys(b).forEach(k => { s[k] = k in a ? birlestir(a[k], b[k]) : b[k]; });
      return s;
    }
    return b === undefined ? a : b;
  }

  function ikon(ad) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" ' +
      'stroke-linejoin="round" aria-hidden="true">' + (IKON[ad] || '') + '</svg>';
  }

  function esc(t) {
    return String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // icerik.js'teki 'img/...' yollarını alt klasördeki sayfalar için düzeltir
  function yol(p) {
    return !p || /^(https?:|mailto:|#|\.\.?\/)/.test(p) ? p : KOK + p;
  }

  function hepsi(secici) {
    return document.querySelectorAll(secici);
  }

  function doldur(secici, html) {
    hepsi(secici).forEach(el => { el.innerHTML = html; });
  }

  function goster(secici, var_) {
    hepsi(secici).forEach(el => { el.hidden = !var_; });
  }

  function parametre(ad) {
    return new URLSearchParams(location.search).get(ad);
  }

  function takimBul(ad) {
    return I.takimlar.find(t => t.ad === ad || t.kod === ad);
  }

  function sakla(anahtar, deger) {
    try {
      if (deger === undefined) return localStorage.getItem(anahtar);
      localStorage.setItem(anahtar, deger);
    } catch (e) { /* gizli sekmede depolama kapalı olabilir */ }
    return null;
  }

  function tarihYazi(iso) {
    const [y, a, g] = String(iso).split('-').map(Number);
    if (!y) return esc(iso);
    const aylar = DIL === 'en'
      ? ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
      : ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
    return a ? (g ? g + ' ' : '') + aylar[a - 1] + ' ' + y : String(y);
  }

  // ------------------------------------------------------------ Başvuru durumu (açık/kapalı + geri sayım)

  function sonTarih() {
    const t = I.basvuru.sonTarih;
    const d = t ? new Date(t) : null;
    return d && !isNaN(d) ? d : null;
  }

  function basvuruAcik() {
    const son = sonTarih();
    return I.basvuru.acik && !(son && Date.now() > son.getTime());
  }

  function geriSayim() {
    const son = sonTarih();
    const alanlar = hepsi('[data-geri-sayim]');
    if (!son || !alanlar.length) return;
    const guncelle = () => {
      const kalan = son.getTime() - Date.now();
      if (kalan <= 0 || !I.basvuru.acik) {
        alanlar.forEach(el => { el.hidden = true; });
        return;
      }
      const g = Math.floor(kalan / 864e5);
      const s = Math.floor((kalan % 864e5) / 36e5);
      const d = Math.floor((kalan % 36e5) / 6e4);
      const parca = (sayi, birim) => '<strong>' + sayi + '</strong> ' + birim;
      const metin = g > 0 ? parca(g, SOZ.gun) + ' ' + parca(s, SOZ.saat) : parca(s, SOZ.saat) + ' ' + parca(d, SOZ.dakika);
      alanlar.forEach(el => {
        el.hidden = false;
        el.innerHTML = ikon('saat') + '<span>' + SOZ.kaldi + ' ' + metin + (SOZ.kaldiSon ? ' ' + SOZ.kaldiSon : '') + '</span>';
      });
    };
    guncelle();
    setInterval(guncelle, 30000);
  }

  // ------------------------------------------------------------ Üst menü ve alt bilgi (her sayfada ortak)

  function sablon() {
    const ana = KOK + './';
    const anaSayfada = SAYFA === 'ana';
    const bolum = id => (anaSayfada ? '#' + id : ana + '#' + id);
    const dilLink = DIL === 'en' ? KOK + './' : 'en/';

    const menu = DIL === 'en'
      ? [['#teams', SOZ.takimlar], ['#achievements', SOZ.basarilar], ['#sponsorship', SOZ.sponsorluk], ['#iletisim', SOZ.iletisim]]
      : [[bolum('takimlar'), SOZ.takimlar], [bolum('basarilar'), SOZ.basarilar], ['haberler.html', SOZ.haberler],
        ['sponsorluk.html', SOZ.sponsorluk], ['#iletisim', SOZ.iletisim]];

    doldur('[data-ust-alan]',
      '<div class="kap ust__ic">' +
      '<a class="marka" href="' + ana + '" aria-label="Quantum Team ' + SOZ.anaSayfa + '">' +
      '<img src="' + KOK + 'img/logo-64.png" alt="" width="36" height="36"><span>QUANTUM<small>Team</small></span></a>' +
      '<nav class="menu" id="menu" aria-label="Menü">' +
      menu.map(([h, y]) => '<a href="' + h + '"' + (location.pathname.endsWith(h) ? ' aria-current="page"' : '') + '>' + y + '</a>').join('') +
      '<a class="menu__dil" href="' + dilLink + '" lang="' + (DIL === 'en' ? 'tr' : 'en') + '">' + SOZ.dilDegistir + '</a>' +
      '<a class="dugme dugme--kucuk" href="' + KOK + 'basvuru.html">' + SOZ.basvur + '</a>' +
      '</nav>' +
      '<button class="menu-ac" type="button" aria-expanded="false" aria-controls="menu" data-menu-ac>' +
      '<span></span><span></span><span></span><span class="gizli">' + SOZ.menuAc + '</span></button></div>');

    doldur('[data-alt-alan]',
      '<div class="kap alt__ic"><div class="alt__marka">' +
      '<img src="' + KOK + 'img/logo-192.png" alt="QUANTUM Yeni Nesil Teknoloji Kulübü" width="72" height="72">' +
      '<img src="' + KOK + 'img/erciyes-logo.png" alt="Erciyes Üniversitesi" width="116" height="72">' +
      '<p><strong>' + esc(I.kulup.tamAd) + '</strong><br>' + esc(I.kulup.universite) + '</p></div>' +
      '<div class="alt__iletisim" data-iletisim></div></div>' +
      '<div class="kap alt__son"><p>© ' + new Date().getFullYear() + ' Quantum Team</p>' +
      '<span class="alt__linkler">' + (DIL === 'tr' ? '<a href="' + KOK + 'panel.html">Kaptan paneli</a>' : '') +
      '<a href="#icerik">' + SOZ.basaDon + '</a></span></div>');
  }

  // ------------------------------------------------------------ Ana sayfa bölümleri

  function rakamlar() {
    doldur('[data-rakamlar]', I.rakamlar.map(r =>
      '<div class="rakam belir"><strong>' + esc(r.deger) + '</strong><span>' + esc(r.etiket) + '</span></div>').join(''));
  }

  function hakkimizda() {
    doldur('[data-hakkimizda]', I.hakkimizda.map(p => '<p class="belir">' + esc(p) + '</p>').join(''));
  }

  function takimKarti(t) {
    const gorsel = t.gorsel
      ? '<div class="takim__gorsel"><img src="' + esc(yol(t.gorsel)) + '" alt="' + esc(t.ad) + '" loading="lazy">' +
        '<span class="takim__ikon">' + ikon(t.ikon) + '</span></div>'
      : '<div class="takim__gorsel takim__gorsel--ikon">' + ikon(t.ikon) + '</div>';
    const govde = gorsel + '<div class="takim__govde"><h3>' + esc(t.ad) + '</h3><p>' + esc(t.aciklama) + '</p>' +
      '<div class="etiketler">' + t.kategoriler.map(k => '<span>' + esc(k) + '</span>').join('') + '</div>' +
      (DIL === 'tr' ? '<span class="takim__link">' + SOZ.detay + ikon('ok') + '</span>' : '') + '</div>';
    return DIL === 'tr'
      ? '<a class="takim belir" href="' + KOK + 'takim.html?t=' + esc(t.kod) + '">' + govde + '</a>'
      : '<article class="takim belir">' + govde + '</article>';
  }

  function takimlar() {
    doldur('[data-takimlar]', I.takimlar.map(takimKarti).join(''));
  }

  function basariKarti(b) {
    return '<article class="basari belir"><img src="' + esc(yol(b.gorsel)) + '" alt="' + esc(b.baslik + ' ' + b.yil) + '" loading="lazy">' +
      '<div class="basari__ic"><p class="basari__derece">' + ikon('kupa') + esc(b.derece) + '</p>' +
      '<p class="basari__yil">' + esc(b.yil) + '</p><h3>' + esc(b.baslik) + '</h3><p>' + esc(b.takim) + ' ' + SOZ.takimi + '</p></div></article>';
  }

  function basarilar() {
    doldur('[data-basarilar]', I.basarilar.map(basariKarti).join(''));
  }

  function birimler() {
    doldur('[data-birimler]', I.birimler.map(b =>
      '<div class="birim belir"><div class="birim__ikon">' + ikon(b.ikon) + '</div><h3>' + esc(b.ad) + '</h3>' +
      '<p>' + esc(b.aciklama) + '</p></div>').join(''));
  }

  function kaptanKarti(k) {
    return '<figure class="kaptan belir"><div class="kaptan__foto"><img src="' + esc(yol(k.gorsel)) + '" alt="' + esc(k.ad) + '" ' +
      'loading="lazy" style="object-position:' + esc(k.odak || '50% 30%') + '"></div>' +
      '<figcaption><strong>' + esc(k.ad) + '</strong><span>' + esc(k.gorev) + '</span></figcaption></figure>';
  }

  function kaptanlar() {
    doldur('[data-kaptanlar]', I.kaptanlar.map(kaptanKarti).join(''));
    goster('[data-danisman-bolumu]', !!(I.danisman && I.danisman.ad));
    if (I.danisman && I.danisman.ad) doldur('[data-danisman]', kaptanKarti(I.danisman));
  }

  // Köşedeki duyuru kartı (panelde gösterilmez, kapatılınca bir daha çıkmaz)
  function duyuru() {
    const d = I.duyuru;
    if (!d || !d.metin || SAYFA === 'panel' || SAYFA === 'durum' || sakla('qt-duyuru') === d.kimlik) return;
    const kart = document.createElement('aside');
    kart.className = 'duyuru';
    kart.setAttribute('role', 'status');
    kart.innerHTML = '<button type="button" class="duyuru__kapat" aria-label="' + (DIL === 'en' ? 'Close' : 'Kapat') + '">×</button>' +
      '<strong>' + esc(d.baslik) + '</strong><p>' + esc(d.metin) + '</p>' +
      (d.link ? '<a class="dugme dugme--kucuk" href="' + esc(yol(d.link)) + '">' + esc(d.linkYazi || d.link) + '</a>' : '');
    kart.querySelector('button').onclick = () => { sakla('qt-duyuru', d.kimlik); kart.remove(); };
    if (d.link) kart.querySelector('a').addEventListener('click', () => sakla('qt-duyuru', d.kimlik));
    document.body.appendChild(kart);
  }

  function sponsorlar() {
    goster('[data-sponsor-bolumu]', I.sponsorlar.length > 0);
    doldur('[data-sponsorlar]', I.sponsorlar.map(s => {
      const logo = '<img src="' + esc(yol(s.logo)) + '" alt="' + esc(s.ad) + '" loading="lazy">';
      return s.link
        ? '<a class="sponsor belir" href="' + esc(s.link) + '" target="_blank" rel="noopener">' + logo + '</a>'
        : '<div class="sponsor belir">' + logo + '</div>';
    }).join(''));
  }

  function mezunlar() {
    goster('[data-mezun-bolumu]', I.mezunlar.length > 0);
    doldur('[data-mezunlar]', I.mezunlar.map(m => {
      const bas = (m.ad || '?').split(' ').map(p => p[0]).slice(0, 2).join('');
      const ic = '<span class="mezun__bas">' + esc(bas) + '</span><div><strong>' + esc(m.ad) + '</strong>' +
        '<span>' + esc(m.simdi) + '</span><small>' + esc([m.takim, m.donem].filter(Boolean).join(' · ')) + '</small></div>';
      return m.linkedin
        ? '<a class="mezun belir" href="' + esc(m.linkedin) + '" target="_blank" rel="noopener">' + ic + '</a>'
        : '<div class="mezun belir">' + ic + '</div>';
    }).join(''));
  }

  function iletisim() {
    const k = I.kulup;
    const satir = (link, ad, yazi, dis) =>
      '<a href="' + esc(link) + '"' + (dis ? ' target="_blank" rel="noopener"' : '') + '>' + ikon(ad) + esc(yazi) + '</a>';
    doldur('[data-iletisim]',
      satir('mailto:' + k.eposta, 'eposta', k.eposta) +
      satir(k.instagram, 'instagram', '@eruquantumteam', true) +
      satir(k.linkedin, 'linkedin', 'LinkedIn', true) +
      satir(k.haritaLinki, 'konum', k.adres, true));
    hepsi('[data-eposta-link]').forEach(a => { a.href = 'mailto:' + k.eposta; a.textContent = k.eposta; });
  }

  // ------------------------------------------------------------ Haberler

  function csvOku(metin) {
    const satirlar = [];
    let satir = [], alan = '', tirnak = false;
    for (let i = 0; i < metin.length; i++) {
      const c = metin[i];
      if (tirnak) {
        if (c === '"' && metin[i + 1] === '"') { alan += '"'; i++; }
        else if (c === '"') tirnak = false;
        else alan += c;
      } else if (c === '"') tirnak = true;
      else if (c === ',') { satir.push(alan); alan = ''; }
      else if (c === '\n' || c === '\r') {
        if (c === '\r' && metin[i + 1] === '\n') i++;
        satir.push(alan); satirlar.push(satir); satir = []; alan = '';
      } else alan += c;
    }
    if (alan || satir.length) { satir.push(alan); satirlar.push(satir); }
    const [baslik, ...veri] = satirlar;
    if (!baslik) return [];
    const b = baslik.map(x => x.trim().toLowerCase());
    return veri.filter(r => r.some(Boolean)).map(r => Object.fromEntries(b.map((k, i) => [k, (r[i] || '').trim()])));
  }

  function haberKarti(h) {
    const ic = (h.gorsel ? '<div class="haber__gorsel"><img src="' + esc(yol(h.gorsel)) + '" alt="" loading="lazy"></div>' : '') +
      '<div class="haber__govde"><time datetime="' + esc(h.tarih) + '">' + tarihYazi(h.tarih) + '</time>' +
      '<h3>' + esc(h.baslik) + '</h3><p>' + esc(h.ozet) + '</p></div>';
    return h.link
      ? '<a class="haber belir" href="' + esc(yol(h.link)) + '">' + ic + '</a>'
      : '<article class="haber belir">' + ic + '</article>';
  }

  async function haberler() {
    const alanlar = hepsi('[data-haberler]');
    if (!alanlar.length) return;
    let liste = (I.haberler || []).slice();
    if (I.haberTablosu) {
      try {
        const metin = await fetch(I.haberTablosu).then(r => r.text());
        liste = liste.concat(csvOku(metin).filter(h => h.baslik));
      } catch (e) { /* tablo açılamazsa sadece icerik.js'teki haberler gösterilir */ }
    }
    liste.sort((a, b) => String(b.tarih).localeCompare(String(a.tarih)));
    goster('[data-haber-bolumu]', liste.length > 0);
    alanlar.forEach(el => {
      const sinir = Number(el.dataset.sinir) || liste.length;
      el.innerHTML = liste.length
        ? liste.slice(0, sinir).map(haberKarti).join('')
        : '<p class="bos">Henüz haber yok.</p>';
    });
    belirme();
  }

  // ------------------------------------------------------------ Başvuru sayfası

  function basvuru() {
    const b = I.basvuru;
    const acik = basvuruAcik();
    doldur('[data-basvuru-not]', esc(b.not));

    hepsi('[data-basvuru-durum]').forEach(el => {
      el.textContent = acik ? SOZ.acik : SOZ.kapaliUzun;
      el.className = 'durum ' + (acik ? 'durum--acik' : 'durum--kapali');
    });

    hepsi('[data-form-dugme]').forEach(a => {
      if (acik) {
        a.href = b.formLinki;
      } else {
        a.removeAttribute('href');
        a.classList.add('dugme--pasif');
        a.setAttribute('aria-disabled', 'true');
        a.textContent = SOZ.kapali;
      }
    });

    doldur('[data-takim-secimi]', I.takimlar.map(t =>
      '<a class="takim-secim belir" href="' + KOK + 'takim.html?t=' + esc(t.kod) + '">' + ikon(t.ikon) +
      '<div><strong>' + esc(t.ad) + '</strong><small>' + esc(t.kategoriler.join(' · ')) + '</small></div></a>').join(''));
    doldur('[data-en-fazla]', String(b.enFazlaTakim || 2));

    doldur('[data-sss]', I.sss.map(s =>
      '<details class="belir"><summary>' + esc(s.soru) + '</summary><p>' +
      esc(s.cevap).replace('{eposta}', '<a href="mailto:' + esc(I.kulup.eposta) + '">' + esc(I.kulup.eposta) + '</a>') +
      '</p></details>').join(''));
  }

  // ------------------------------------------------------------ Takım sayfası

  function takimSayfasi() {
    const t = takimBul(parametre('t'));
    const alan = document.querySelector('[data-takim-sayfasi]');
    if (!t) {
      alan.innerHTML = '<section class="sayfa-basi"><div class="kap"><h1>Takım bulunamadı</h1>' +
        '<p class="sayfa-basi__metin">Aradığın takım burada yok. Tüm takımlarımız aşağıda.</p></div></section>' +
        '<section class="bolum"><div class="kap"><div class="takimlar">' + I.takimlar.map(takimKarti).join('') + '</div></div></section>';
      return;
    }
    document.title = t.ad + ' | Quantum Team';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.content = 'Quantum Team ' + t.ad + ' takımı. ' + t.aciklama;

    const kaptan = I.kaptanlar.filter(k => k.takim === t.ad);
    const basari = I.basarilar.filter(b => b.takim === t.ad);
    const digerleri = I.takimlar.filter(x => x !== t);

    alan.innerHTML =
      '<section class="takim-basi' + (t.gorsel ? '' : ' takim-basi--ikon') + '">' +
      (t.gorsel ? '<img class="takim-basi__gorsel" src="' + esc(yol(t.gorsel)) + '" alt="">' : '') +
      '<div class="kap takim-basi__ic"><a class="geri" href="./#takimlar">← ' + SOZ.takimlar + '</a>' +
      '<span class="takim-basi__ikon">' + ikon(t.ikon) + '</span><h1>' + esc(t.ad) + '</h1>' +
      '<p class="sayfa-basi__metin">' + esc(t.aciklama) + '</p>' +
      '<div class="etiketler">' + t.kategoriler.map(k => '<span>' + esc(k) + '</span>').join('') + '</div></div></section>' +

      (t.ozellikler && t.ozellikler.length
        ? '<section class="bolum"><div class="kap"><p class="bolum__etiket">Teknik bilgiler</p><h2>Öne çıkanlar</h2>' +
          '<dl class="ozellikler">' + t.ozellikler.map(o => '<div class="belir"><dt>' + esc(o.ad) + '</dt><dd>' + esc(o.deger) + '</dd></div>').join('') +
          '</dl></div></section>'
        : '') +

      (basari.length
        ? '<section class="bolum bolum--koyu"><div class="kap"><p class="bolum__etiket">Başarılar</p><h2>Yarışma geçmişi</h2>' +
          '<div class="basarilar basarilar--tek">' + basari.map(basariKarti).join('') + '</div></div></section>'
        : '') +

      (t.galeri && t.galeri.length
        ? '<section class="bolum"><div class="kap"><p class="bolum__etiket">Galeri</p><h2>Fotoğraflar</h2><div class="galeri">' +
          t.galeri.map(g => '<a class="belir" href="' + esc(yol(g)) + '" target="_blank" rel="noopener"><img src="' + esc(yol(g)) + '" alt="' + esc(t.ad) + '" loading="lazy"></a>').join('') +
          '</div></div></section>'
        : '') +

      (kaptan.length
        ? '<section class="bolum"><div class="kap"><p class="bolum__etiket">Ekip</p><h2>Takım kaptanı</h2>' +
          '<div class="kaptanlar kaptanlar--az">' + kaptan.map(kaptanKarti).join('') + '</div></div></section>'
        : '') +

      '<section class="bolum"><div class="kap"><div class="katil"><div><h2>' + esc(t.ad) + ' takımında yer almak ister misin?</h2>' +
      '<p>' + esc(I.basvuru.not) + '</p></div><a class="dugme dugme--buyuk" href="basvuru.html">Başvuru bilgileri</a></div></div></section>' +

      '<section class="bolum bolum--koyu"><div class="kap"><p class="bolum__etiket">Diğer takımlar</p><h2>Diğer takımlarımız</h2>' +
      '<div class="takimlar">' + digerleri.map(takimKarti).join('') + '</div></div></section>';
  }

  // ------------------------------------------------------------ Sponsorluk sayfası

  function sponsorlukSayfasi() {
    const s = I.sponsorluk;
    doldur('[data-sp-neden]', s.neden.map(n => '<div class="birim belir"><div class="birim__ikon">' + ikon('tik') + '</div>' +
      '<h3>' + esc(n.baslik) + '</h3><p>' + esc(n.aciklama) + '</p></div>').join(''));
    doldur('[data-sp-gorunurluk]', s.gorunurluk.map(g => '<li class="belir">' + ikon('tik') + esc(g) + '</li>').join(''));
    doldur('[data-sp-destek]', s.destekTurleri.map(d => '<div class="grup belir"><h3>' + esc(d.baslik) + '</h3>' +
      '<p class="kucuk-not">' + esc(d.aciklama) + '</p></div>').join(''));
    hepsi('[data-sp-dosya]').forEach(a => {
      a.hidden = !s.dosya;
      if (s.dosya) a.href = yol(s.dosya);
    });
    // mailto bilgisayarda mail programı yoksa hiçbir şey yapmıyor, bu yüzden düğme Gmail'de yeni mail açar
    const konu = encodeURIComponent(DIL === 'en' ? 'Sponsorship' : 'Sponsorluk');
    hepsi('[data-sp-mail]').forEach(a => {
      a.href = 'https://mail.google.com/mail/?view=cm&fs=1&to=' + encodeURIComponent(I.kulup.eposta) + '&su=' + konu;
      a.target = '_blank';
      a.rel = 'noopener';
    });
    hepsi('[data-sp-adres]').forEach(p => {
      p.innerHTML = (DIL === 'en' ? 'Or write to ' : 'Ya da doğrudan yazın: ') +
        '<a href="mailto:' + esc(I.kulup.eposta) + '?subject=' + konu + '">' + esc(I.kulup.eposta) + '</a> ' +
        '<button type="button" class="metin-dugme">' + (DIL === 'en' ? 'Copy' : 'Kopyala') + '</button>';
      const b = p.querySelector('button');
      b.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(I.kulup.eposta);
          b.textContent = DIL === 'en' ? 'Copied' : 'Kopyalandı';
        } catch (e) {
          prompt(DIL === 'en' ? 'Copy the address:' : 'Adresi kopyala:', I.kulup.eposta);
        }
      });
    });
  }

  // ------------------------------------------------------------ Takım testi

  function testSayfasi() {
    const alan = document.querySelector('[data-test]');
    const T = I.test;
    const sorular = T.sorular;
    const TAKIM_KODLARI = Object.keys(T.takimlar);
    const BIRIM_KODLARI = Object.keys(T.birimler);
    const cevaplar = [];

    function soruGoster(i) {
      const s = sorular[i];
      alan.innerHTML =
        '<div class="test__ilerleme" role="progressbar" aria-valuemin="0" aria-valuemax="' + sorular.length + '" aria-valuenow="' + i + '">' +
        '<span style="width:' + ((i + 1) / sorular.length * 100) + '%"></span></div>' +
        '<p class="test__sayac">Soru ' + (i + 1) + ' / ' + sorular.length + '</p>' +
        '<h2 class="test__soru" tabindex="-1">' + esc(s.soru) + '</h2>' +
        '<div class="test__cevaplar">' + s.cevaplar.map((c, j) =>
          '<button type="button" class="test__cevap' + (cevaplar[i] === j ? ' secili' : '') + '" data-j="' + j + '">' +
          '<span class="test__emoji" aria-hidden="true">' + esc(c.emoji || String.fromCharCode(65 + j)) + '</span>' + esc(c.yazi) + '</button>').join('') +
        '</div>' + (i > 0 ? '<button type="button" class="geri geri--dugme" data-geri>← Önceki soru</button>' : '');
      alan.querySelector('.test__soru').focus({ preventScroll: true });
      alan.querySelectorAll('.test__cevap').forEach(b => b.addEventListener('click', () => {
        cevaplar[i] = Number(b.dataset.j);
        b.classList.add('secili');
        setTimeout(() => (i + 1 < sorular.length ? soruGoster(i + 1) : sonucHesapla()), 180);
      }));
      const geri = alan.querySelector('[data-geri]');
      if (geri) geri.addEventListener('click', () => soruGoster(i - 1));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function sonucHesapla() {
      const puan = {};
      cevaplar.forEach((j, i) => {
        const p = sorular[i].cevaplar[j].puan;
        Object.keys(p).forEach(k => { puan[k] = (puan[k] || 0) + p[k]; });
      });
      const sirali = TAKIM_KODLARI.slice().sort((a, b) => (puan[b] || 0) - (puan[a] || 0));
      const birim = BIRIM_KODLARI.reduce((a, b) => ((puan[b] || 0) > (puan[a] || 0) ? b : a));
      const oranlar = {};
      const enYuksek = puan[sirali[0]] || 1;
      sirali.forEach(k => { oranlar[k] = Math.round((puan[k] || 0) / enYuksek * 100); });
      const kod = sirali[0] + '.' + sirali[1] + '.' + birim + '.' + sirali.map(k => oranlar[k]).join('-');
      history.replaceState(null, '', location.pathname + '?sonuc=' + kod);
      sonucGoster(kod, true);
    }

    // Sonuç linkten de açılabilir: test.html?sonuc=araba.roket.yazilim.100-80-60-40-20-10
    function sonucCoz(kod) {
      const [t1, t2, b, oran] = String(kod || '').split('.');
      if (!T.takimlar[t1] || !T.takimlar[t2] || !T.birimler[b]) return null;
      const oranlar = String(oran || '').split('-').map(Number);
      const sira = [t1, t2].concat(TAKIM_KODLARI.filter(k => k !== t1 && k !== t2));
      return { t1, t2, b, cubuklar: sira.map((k, i) => ({ k, oran: isFinite(oranlar[i]) ? oranlar[i] : 0 })) };
    }

    function sonucGoster(kod, kendisi) {
      const s = sonucCoz(kod);
      if (!s) return;
      const ana = T.takimlar[s.t1];
      const ikinci = T.takimlar[s.t2];
      const birimAd = (I.birimler.find(b => b.kod === s.b) || {}).ad || '';
      const takimA = takimBul(ana.ad);
      const url = location.origin + location.pathname + '?sonuc=' + kod;
      const metin = 'Quantum Team takım testinde benim tipim: "' + ana.unvan + '" (' + ana.ad + ' takımı, ' + birimAd + ' birimi). Seninki ne?';

      alan.innerHTML =
        '<div class="test__sonuc">' +
        '<p class="bolum__etiket">' + (kendisi ? 'Senin sonucun' : 'Bir arkadaşının sonucu') + '</p>' +
        '<h2 tabindex="-1">' + (kendisi ? 'Senin tipin: ' : 'Tipi: ') + '<span>' + esc(ana.unvan) + '</span></h2>' +
        '<p class="sayfa-basi__metin">' + esc(ana.aciklama) + '</p>' +
        '<div class="test__kartlar">' + (takimA ? takimKarti(takimA) : '') +
        '<div class="test__yan">' +
        '<div class="birim"><p class="kucuk-not">İkinci tercihin</p><h3>' + esc(ikinci.ad) + '</h3><p>' + esc(ikinci.unvan) + '</p></div>' +
        '<div class="birim"><div class="birim__ikon">' + ikon((I.birimler.find(b => b.kod === s.b) || {}).ikon) + '</div>' +
        '<p class="kucuk-not">Birim önerisi</p><h3>' + esc(birimAd) + '</h3><p>' + esc(T.birimler[s.b]) + '</p></div></div></div>' +
        '<div class="uyum"><h3>Takımlarla uyumun</h3>' + s.cubuklar.map(c =>
          '<div class="uyum__satir"><span>' + esc(T.takimlar[c.k].ad) + '</span><div class="uyum__cubuk"><span style="width:' + c.oran + '%"></span></div><b>%' + c.oran + '</b></div>').join('') + '</div>' +
        '<p class="kucuk-not">Formda en fazla ' + (I.basvuru.enFazlaTakim || 2) + ' takım seçebilirsin. Bu test sadece fikir vermek için, istediğin takımı seçmekte özgürsün.</p>' +
        (kendisi
          ? '<div class="paylas"><h3>Sonucunu paylaş</h3><div class="paylas__dugmeler">' +
            (navigator.share ? '<button type="button" class="paylas__dugme" data-paylas-yerel>' + ikon('paylas') + 'Paylaş</button>' : '') +
            '<a class="paylas__dugme paylas__dugme--whatsapp" target="_blank" rel="noopener" href="https://wa.me/?text=' + encodeURIComponent(metin + ' ' + url) + '">WhatsApp</a>' +
            '<a class="paylas__dugme" target="_blank" rel="noopener" href="https://twitter.com/intent/tweet?text=' + encodeURIComponent(metin) + '&url=' + encodeURIComponent(url) + '">X</a>' +
            '<a class="paylas__dugme" target="_blank" rel="noopener" href="https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(url) + '">LinkedIn</a>' +
            '<a class="paylas__dugme" target="_blank" rel="noopener" href="https://t.me/share/url?url=' + encodeURIComponent(url) + '&text=' + encodeURIComponent(metin) + '">Telegram</a>' +
            '<button type="button" class="paylas__dugme" data-kopyala>' + ikon('dis') + '<span>Linki kopyala</span></button>' +
            '<button type="button" class="paylas__dugme paylas__dugme--hikaye" data-hikaye>' + ikon('indir') + '<span>Instagram hikâyesi için görsel</span></button>' +
            '</div></div>'
          : '') +
        '<div class="dugmeler"><a class="dugme dugme--buyuk" href="basvuru.html">Başvuru bilgileri</a>' +
        '<button type="button" class="dugme dugme--ikincil" data-tekrar>' + (kendisi ? 'Testi tekrarla' : 'Sen de çöz') + '</button></div></div>';

      alan.querySelectorAll('.belir').forEach(el => el.classList.add('gorundu'));
      alan.querySelector('h2').focus({ preventScroll: true });
      alan.querySelector('[data-tekrar]').addEventListener('click', () => {
        cevaplar.length = 0;
        history.replaceState(null, '', location.pathname);
        soruGoster(0);
      });
      const kopyala = alan.querySelector('[data-kopyala]');
      if (kopyala) kopyala.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(url);
          kopyala.querySelector('span').textContent = 'Link kopyalandı';
        } catch (e) {
          prompt('Linki kopyala:', url);
        }
      });
      const yerel = alan.querySelector('[data-paylas-yerel]');
      if (yerel) yerel.addEventListener('click', () => navigator.share({ title: 'Quantum Team', text: metin, url }).catch(() => {}));
      const hikaye = alan.querySelector('[data-hikaye]');
      if (hikaye) hikaye.addEventListener('click', () => hikayeGorseli(s, birimAd, hikaye));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // 1080x1920 boyutunda, Instagram hikâyesine uygun sonuç görseli
    async function hikayeGorseli(s, birimAd, dugme) {
      const ana = T.takimlar[s.t1];
      const c = document.createElement('canvas');
      c.width = 1080;
      c.height = 1920;
      const x = c.getContext('2d');
      const zemin = x.createLinearGradient(0, 0, 1080, 1920);
      zemin.addColorStop(0, '#1b2159');
      zemin.addColorStop(0.55, '#0a0d24');
      zemin.addColorStop(1, '#050716');
      x.fillStyle = zemin;
      x.fillRect(0, 0, 1080, 1920);
      const parilti = x.createRadialGradient(200, 300, 0, 200, 300, 900);
      parilti.addColorStop(0, 'rgba(125,140,255,0.45)');
      parilti.addColorStop(1, 'rgba(125,140,255,0)');
      x.fillStyle = parilti;
      x.fillRect(0, 0, 1080, 1920);
      if (document.fonts) await document.fonts.ready;

      const logo = await new Promise(r => { const im = new Image(); im.onload = () => r(im); im.onerror = () => r(null); im.src = yol('img/logo-192.png'); });
      if (logo) x.drawImage(logo, 90, 110, 120, 120);
      x.fillStyle = '#eef0ff';
      x.font = '700 52px "Space Grotesk", sans-serif';
      x.fillText('QUANTUM TEAM', 240, 185);

      const satir = (metin, y, boyut, renk, kalin) => {
        x.fillStyle = renk;
        x.font = (kalin ? '700 ' : '500 ') + boyut + 'px "Space Grotesk", sans-serif';
        const kelimeler = String(metin).split(' ');
        let s1 = '';
        const satirlar = [];
        kelimeler.forEach(k => {
          const dene = s1 ? s1 + ' ' + k : k;
          if (x.measureText(dene).width > 900 && s1) { satirlar.push(s1); s1 = k; } else s1 = dene;
        });
        satirlar.push(s1);
        satirlar.forEach((t, i) => x.fillText(t, 90, y + i * boyut * 1.15));
        return y + satirlar.length * boyut * 1.15;
      };
      let y = satir('Takım testinde benim tipim', 520, 56, '#a9aed8');
      y = satir(ana.unvan, y + 120, 128, '#b8c1ff', true);
      y = satir(ana.ad + ' takımı', y + 50, 68, '#eef0ff', true);
      y = satir('İkinci tercih: ' + T.takimlar[s.t2].ad, y + 40, 44, '#a9aed8');
      y = satir('Birim: ' + birimAd, y + 10, 44, '#a9aed8');

      s.cubuklar.slice(0, 4).forEach((cb, i) => {
        const yy = y + 110 + i * 90;
        x.fillStyle = '#a9aed8';
        x.font = '500 36px Inter, sans-serif';
        x.fillText(T.takimlar[cb.k].ad, 90, yy);
        x.fillStyle = 'rgba(255,255,255,0.1)';
        x.fillRect(90, yy + 18, 900, 16);
        x.fillStyle = i === 0 ? '#ffcf5c' : '#7d8cff';
        x.fillRect(90, yy + 18, 900 * cb.oran / 100, 16);
      });

      x.fillStyle = '#7d8cff';
      x.beginPath();
      x.roundRect ? x.roundRect(90, 1640, 900, 150, 75) : x.rect(90, 1640, 900, 150);
      x.fill();
      x.fillStyle = '#0a0d24';
      x.font = '700 50px "Space Grotesk", sans-serif';
      x.textAlign = 'center';
      x.fillText('Sen de çöz: quantumteam.com.tr', 540, 1732);

      const blob = await new Promise(r => c.toBlob(r, 'image/png'));
      const dosya = new File([blob], 'quantum-team-sonucum.png', { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [dosya] })) {
        navigator.share({ files: [dosya], title: 'Quantum Team' }).catch(() => {});
        return;
      }
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = dosya.name;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
      dugme.querySelector('span').textContent = 'Görsel indirildi, hikâyene ekleyebilirsin';
    }

    const paylasilan = parametre('sonuc');
    if (paylasilan && sonucCoz(paylasilan)) sonucGoster(paylasilan, false);
    else alan.querySelector('[data-basla]').addEventListener('click', () => soruGoster(0));
  }

  // ------------------------------------------------------------ Başvuru sorgulama

  function kodDuzelt(k) {
    const temiz = String(k || '').toUpperCase().replace(/[^A-Z0-9]/g, '').replace(/^QT/, '');
    return temiz ? 'QT-' + temiz : '';
  }

  // Google arada bir cevap yerine hata sayfası döndürüyor, o zaman bir kez daha denenir
  async function api(parametreler, tekrar) {
    const url = I.api + '?' + new URLSearchParams(parametreler).toString();
    const metin = await fetch(url).then(r => r.text());
    try {
      return JSON.parse(metin);
    } catch (e) {
      if (tekrar) throw e;
      await new Promise(r => setTimeout(r, 1500));
      return api(parametreler, true);
    }
  }

  function durumSayfasi() {
    const form = document.querySelector('[data-durum-form]');
    const girdi = form.querySelector('input');
    const sonucAlani = document.querySelector('[data-durum-sonuc]');

    if (!I.api) {
      sonucAlani.innerHTML = '<div class="bilgi">Bu özellik çok yakında açılacak. Şimdilik başvuru durumunu onay mailinden takip edebilirsin.</div>';
      form.querySelector('button').disabled = true;
      return;
    }

    const ilk = parametre('kod') || sakla('qt-kod');
    if (ilk) girdi.value = kodDuzelt(ilk);

    form.addEventListener('submit', async e => {
      e.preventDefault();
      const kod = kodDuzelt(girdi.value);
      if (!/^QT-[A-Z0-9]{6}$/.test(kod)) {
        sonucAlani.innerHTML = '<div class="bilgi bilgi--hata">Kod "QT-" ile başlayan 9 karakterden oluşur. Örnek: QT-7KD2MX</div>';
        return;
      }
      girdi.value = kod;
      sonucAlani.innerHTML = '<div class="bilgi">Sorgulanıyor…</div>';
      try {
        const c = await api({ islem: 'durum', kod });
        sonucGoster(kod, c);
        if (c.durum && c.durum !== 'yok') sakla('qt-kod', kod);
      } catch (hata) {
        sonucAlani.innerHTML = '<div class="bilgi bilgi--hata">Şu an sorgulama yapılamıyor. Biraz sonra tekrar dene.</div>';
      }
    });

    if (ilk && parametre('kod')) form.requestSubmit();

    function sonucGoster(kod, c) {
      if (c.durum === 'yok') {
        sonucAlani.innerHTML = '<div class="bilgi bilgi--hata">Bu koda ait bir başvuru bulunamadı. Kodu mailindeki gibi yazdığından emin ol.</div>';
        return;
      }
      const selam = c.ad ? 'Merhaba ' + esc(c.ad) + ',' : 'Merhaba,';
      const liste = c.mulakatlar || [];
      const planli = liste.some(m => m.durum === 'planlandi' || m.durum === 'geldi');
      const etiket = {
        bekliyor: ['Planlanıyor', 'durum--kapali'], planlandi: ['Mülakatın planlandı', 'durum--plan'],
        geldi: ['Girişin yapıldı', 'durum--acik'], sonuc: ['Sonuç açıklandı', 'durum--acik'],
      };
      const sonucMetni = { Kabul: 'Tebrikler, takıma kabul edildin! Detaylar mailinde.', Yedek: 'Yedek listedesin. Detaylar mailinde.', Ret: 'Bu dönem olmadı. Detaylar mailinde.' };

      const kartlar = liste.map(m => {
        const [yazi, sinif] = etiket[m.durum] || etiket.bekliyor;
        let ic = '';
        if (m.durum === 'bekliyor') {
          ic = '<p class="kucuk-not">Bu takımın mülakat planı hazırlanıyor. Tarih, saat ve yer belli olunca mail alacaksın.</p>';
        } else if (m.durum === 'sonuc') {
          ic = '<p>' + esc(sonucMetni[m.sonuc] || 'Sonuç mailine göz at.') + '</p>';
        } else {
          ic = '<dl class="durum-kart__bilgi"><div><dt>' + ikon('takvim') + 'Tarih</dt><dd>' + esc(m.tarih) + '</dd></div>' +
            '<div><dt>' + ikon('saat') + 'Saat</dt><dd>' + esc(m.saat) + '</dd></div>' +
            '<div><dt>' + ikon('konum') + 'Yer</dt><dd>' + esc(m.yer) + '</dd></div></dl>' +
            (m.durum === 'planlandi' ? '<div class="dugmeler">' +
              (m.takvim ? '<a class="dugme dugme--kucuk" href="' + esc(m.takvim) + '" target="_blank" rel="noopener">' + ikon('takvim') + 'Takvimime ekle</a>' : '') +
              (m.konum ? '<a class="dugme dugme--ikincil dugme--kucuk" href="' + esc(m.konum) + '" target="_blank" rel="noopener">' + ikon('konum') + 'Yol tarifi</a>' : '') + '</div>' : '');
        }
        return '<div class="mulakat-kart"><div class="mulakat-kart__ust"><h3>' + esc(m.takim) + '</h3>' +
          '<p class="durum ' + sinif + '">' + yazi + '</p></div>' + ic + '</div>';
      }).join('');

      sonucAlani.innerHTML = '<div class="durum-kart belir gorundu"><h2>' + selam + '</h2>' +
        '<p>' + (liste.length > 1 ? 'Başvurduğun ' + liste.length + ' takımın mülakatı ayrı yapılıyor.' : 'Başvurun bize ulaştı.') + '</p>' +
        '<div class="mulakat-listesi">' + (kartlar || '<p class="kucuk-not">Başvurun alındı. Mülakat bilgilerin belli olunca e-posta ile bildirilecek.</p>') + '</div>' +
        (planli ? '<div class="qr"><div class="qr__kod" data-qr></div><div><h3>Giriş kodun</h3>' +
          '<p>Mülakat günü girişte bu QR kodu göster. Telefonun yanında değilse kodu söylemen de yeterli. İki takımın mülakatında da aynı kod geçerli.</p>' +
          '<p class="qr__yazi">' + esc(kod) + '</p></div></div>' : '') + '</div>';
      if (planli) qrCiz(kod);
    }
  }

  function qrCiz(metin) {
    const alan = document.querySelector('[data-qr]');
    if (!alan) return;
    if (!window.qrcode) {
      alan.textContent = metin;
      return;
    }
    const qr = window.qrcode(0, 'M');
    qr.addData(metin);
    qr.make();
    alan.innerHTML = qr.createSvgTag({ cellSize: 6, margin: 2, scalable: true });
  }

  // ------------------------------------------------------------ Etkileşim

  function ikonlar() {
    hepsi('[data-ikon]').forEach(el => { el.outerHTML = ikon(el.dataset.ikon); });
  }

  function ustMenu() {
    const ust = document.querySelector('[data-ust]');
    const dugme = document.querySelector('[data-menu-ac]');
    const menu = document.getElementById('menu');
    if (!ust || !dugme || !menu) return;
    const seffaf = !!document.querySelector('.kapak');
    const guncelle = () => ust.classList.toggle('ust--dolu', !seffaf || window.scrollY > 40 || menu.classList.contains('acik'));
    guncelle();
    if (seffaf) window.addEventListener('scroll', guncelle, { passive: true });

    const kapat = () => {
      menu.classList.remove('acik');
      dugme.setAttribute('aria-expanded', 'false');
      guncelle();
    };
    dugme.addEventListener('click', () => {
      const acik = menu.classList.toggle('acik');
      dugme.setAttribute('aria-expanded', String(acik));
      guncelle();
    });
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', kapat));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') kapat(); });
  }

  let gozcu = null;
  function belirme() {
    const ogeler = hepsi('.belir:not(.gorundu)');
    if (!('IntersectionObserver' in window)) {
      ogeler.forEach(el => el.classList.add('gorundu'));
      return;
    }
    gozcu = gozcu || new IntersectionObserver(girdiler => {
      girdiler.forEach(g => {
        if (g.isIntersecting) {
          g.target.classList.add('gorundu');
          gozcu.unobserve(g.target);
        }
      });
    }, { rootMargin: '0px 0px -6% 0px' });
    ogeler.forEach(el => gozcu.observe(el));
  }

  function analitik() {
    if (!I.analitik) return;
    const s = document.createElement('script');
    s.defer = true;
    s.src = 'https://static.cloudflareinsights.com/beacon.min.js';
    s.dataset.cfBeacon = JSON.stringify({ token: I.analitik });
    document.head.appendChild(s);
  }

  function uygulama() {
    if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
      navigator.serviceWorker.register(KOK + 'sw.js').catch(() => {});
    }
  }

  // Kaptan paneli (js/panel.js) aynı yardımcıları kullanır
  window.QT = { ikon, esc, kodDuzelt, sakla, parametre, belirme };

  // ------------------------------------------------------------ Başlat

  sablon();
  duyuru();
  iletisim();
  rakamlar();
  hakkimizda();
  takimlar();
  basarilar();
  birimler();
  kaptanlar();
  sponsorlar();
  mezunlar();
  basvuru();
  if (SAYFA === 'takim') takimSayfasi();
  if (SAYFA === 'sponsorluk' || document.querySelector('[data-sp-neden]')) sponsorlukSayfasi();
  if (SAYFA === 'test') testSayfasi();
  if (SAYFA === 'durum') durumSayfasi();
  ikonlar();
  geriSayim();
  ustMenu();
  belirme();
  haberler();
  analitik();
  uygulama();
})();
