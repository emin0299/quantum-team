/* Quantum Team – Kaptan paneli
 * Google ile giriş yapan yetkili, başvuruları görür, mülakat planını hazırlar, QR ile giriş yapar ve sonuçları gönderir.
 * Bütün yetki kontrolleri sunucuda (Apps Script) yapılır. Bu dosya sadece arayüzdür. */

(function () {
  'use strict';

  const I = window.ICERIK;
  const { ikon, esc, kodDuzelt, sakla, parametre } = window.QT;
  const $ = s => document.querySelector(s);
  const $$ = s => Array.from(document.querySelectorAll(s));

  const durum = { token: '', kullanici: null, basvurular: [], gruplar: [], grupsuz: [], grupBoyutu: 50, takim: '', sekme: 'ozet' };
  const TOKEN = 'qt-panel-token';

  // ------------------------------------------------------------ Sunucu

  // Sadece okuyan istekler. Google arada bir cevap yerine hata sayfası döndürüyor, bunlar bir kez daha denenir.
  const OKUMA = ['oturum', 'veri', 'basvurular', 'gruplar', 'basvuru', 'planOnizle'];

  async function api(islem, veri, tekrar) {
    const metin = await fetch(I.api, {
      method: 'POST',
      body: JSON.stringify(Object.assign({ islem, token: durum.token }, veri || {})),
    }).then(r => r.text());
    let cevap;
    try {
      cevap = JSON.parse(metin);
    } catch (e) {
      if (!tekrar && OKUMA.indexOf(islem) !== -1) {
        await new Promise(r => setTimeout(r, 1500));
        return api(islem, veri, true);
      }
      throw new Error(OKUMA.indexOf(islem) !== -1
        ? 'Sunucuya ulaşılamadı. Biraz sonra sayfayı yenileyin.'
        : 'Sunucunun cevabı gelmedi ama işlem yapılmış olabilir. Güncel durum yeniden yüklendi, lütfen kontrol edin.');
    }
    if (cevap.oturum === false) {
      cikis(cevap.hata);
      throw new Error(cevap.hata);
    }
    return cevap;
  }

  function bildir(metin, tur) {
    const alan = $('[data-bildirim]');
    alan.innerHTML = metin ? '<div class="bilgi ' + (tur ? 'bilgi--' + tur : '') + '">' + metin + '</div>' : '';
    if (metin) alan.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  async function calistir(dugme, is) {
    const eski = dugme ? dugme.innerHTML : '';
    if (dugme) { dugme.disabled = true; dugme.innerHTML = 'Bekleyin…'; }
    try {
      return await is();
    } catch (hata) {
      if (hata.message) bildir(esc(hata.message), 'hata');
      // Kullanıcı işleminde hata olduysa ekrandaki durum eskimiş olabilir, veriler yeniden yüklensin
      if (dugme && durum.token) yenile(true);
    } finally {
      if (dugme) { dugme.disabled = false; dugme.innerHTML = eski; }
    }
    return null;
  }

  // ------------------------------------------------------------ Oturum

  function tokenGecerli(t) {
    try {
      const yuk = JSON.parse(atob(t.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      return yuk.exp * 1000 > Date.now() + 60000;
    } catch (e) {
      return false;
    }
  }

  function girisEkrani(mesaj) {
    $('[data-uygulama]').hidden = true;
    $('[data-giris-ekrani]').hidden = false;
    $('[data-giris-mesaj]').innerHTML = mesaj ? '<div class="bilgi bilgi--hata">' + esc(mesaj) + '</div>' : '';
    const alan = $('[data-google-dugme]');
    const kimlik = I.panel && I.panel.googleClientId;
    if (!I.api || !kimlik) {
      alan.innerHTML = '<div class="bilgi">Panel henüz kurulmadı. <code>icerik.js</code> dosyasında <code>api</code> ve ' +
        '<code>panel.googleClientId</code> alanlarının doldurulması gerekiyor.</div>';
      return;
    }
    const kur = () => {
      if (!window.google || !google.accounts) return setTimeout(kur, 200);
      google.accounts.id.initialize({ client_id: kimlik, callback: r => oturumAc(r.credential), auto_select: true, ux_mode: 'popup' });
      alan.innerHTML = '';
      google.accounts.id.renderButton(alan, { theme: 'filled_black', size: 'large', shape: 'pill', text: 'signin_with', locale: 'tr', width: 280 });
      google.accounts.id.prompt();
    };
    kur();
  }

  async function oturumAc(token) {
    durum.token = token;
    try {
      const c = await fetch(I.api, { method: 'POST', body: JSON.stringify({ islem: 'oturum', token }) }).then(r => r.json());
      if (c.hata) return girisEkrani(c.hata);
      try { sessionStorage.setItem(TOKEN, token); } catch (e) { /* gizli sekme */ }
      durum.kullanici = c.kullanici;
      baslat();
    } catch (e) {
      girisEkrani('Sunucuya ulaşılamadı. İnternet bağlantını kontrol edip tekrar dene.');
    }
  }

  function cikis(mesaj) {
    try { sessionStorage.removeItem(TOKEN); } catch (e) { /* gizli sekme */ }
    durum.token = '';
    if (window.google && google.accounts) google.accounts.id.disableAutoSelect();
    girisEkrani(mesaj);
  }

  // ------------------------------------------------------------ Başlangıç

  function baslat() {
    const k = durum.kullanici;
    $('[data-giris-ekrani]').hidden = true;
    $('[data-uygulama]').hidden = false;
    $('[data-ad]').textContent = k.ad.split(' ')[0];
    $('[data-rol]').textContent = k.rol === 'Yönetici' ? 'Yönetici paneli' : 'Kaptan paneli';
    $('[data-takimlarim]').textContent = k.rol === 'Yönetici' ? 'Bütün takımları görüyorsun. Plan ve sonuç onayları sende.' : k.takimlar.join(' · ');
    const secim = $('[data-takim-filtre]');
    secim.innerHTML = (k.takimlar.length > 1 ? '<option value="">Bütün takımlarım</option>' : '') +
      k.takimlar.map(t => '<option>' + esc(t) + '</option>').join('');
    durum.takim = secim.value;
    secim.onchange = () => { durum.takim = secim.value; ciz(); };
    $('[data-cikis]').onclick = () => cikis();
    $$('[data-sekme]').forEach(b => { b.onclick = () => sekmeAc(b.dataset.sekme); });
    const ilk = (location.hash || '').slice(1);
    sekmeAc(['ozet', 'basvurular', 'plan', 'giris', 'sonuc', 'rapor'].indexOf(ilk) !== -1 ? ilk : 'ozet');
    yenile();
  }

  // sessiz: hata sonrası arka planda yenilerken ekrandaki hata mesajı silinmesin
  async function yenile(sessiz) {
    await calistir(null, async () => {
      const v = await api('veri');
      if (v.hata) throw new Error(v.hata);
      durum.basvurular = v.liste;
      durum.gruplar = v.gruplar;
      durum.grupsuz = v.grupsuz;
      durum.grupBoyutu = v.grupBoyutu;
      const mesaj = sessiz ? $('[data-bildirim]').innerHTML : null;
      ciz();
      if (sessiz) $('[data-bildirim]').innerHTML = mesaj;
    });
  }

  function sekmeAc(ad) {
    durum.sekme = ad;
    $$('[data-sekme]').forEach(b => b.setAttribute('aria-selected', String(b.dataset.sekme === ad)));
    $$('[data-bolum]').forEach(s => { s.hidden = s.dataset.bolum !== ad; });
    history.replaceState(null, '', '#' + ad);
    bildir('');
    ciz();
  }

  // Seçili takıma göre süzülmüş veriler
  function benimMi(takim) {
    return !durum.takim || durum.takim === takim;
  }
  function mulakatlarim() {
    const liste = [];
    durum.basvurular.forEach(b => b.mulakatlar.forEach(m => { if (benimMi(m.takim)) liste.push(Object.assign({ b }, m)); }));
    return liste;
  }

  function ciz() {
    if (!durum.kullanici) return;
    const yonetici = durum.kullanici.rol === 'Yönetici';
    const planOnay = durum.gruplar.filter(g => benimMi(g.takim) && g.durum === 'Onay bekliyor').length;
    const sonucOnay = mulakatlarim().filter(m => m.sonucDurum === 'Onay bekliyor').length;
    rozet('plan', planOnay);
    rozet('sonuc', sonucOnay);
    ({ ozet: ozetCiz, basvurular: basvuruCiz, plan: planCiz, giris: girisCiz, sonuc: sonucCiz, rapor: raporCiz })[durum.sekme](yonetici);
  }

  function rozet(ad, sayi) {
    const r = $('[data-rozet="' + ad + '"]');
    r.hidden = !sayi;
    r.textContent = sayi;
  }

  // "16.10 11:10" biçiminde, Türkiye saatiyle
  function saat(iso) {
    if (!iso) return '';
    const p = {};
    new Intl.DateTimeFormat('tr-TR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Europe/Istanbul' })
      .formatToParts(new Date(iso)).forEach(x => { p[x.type] = x.value; });
    return p.day + '.' + p.month + ' ' + p.hour + ':' + p.minute;
  }

  function mulakatDurumu(m) {
    if (m.sonucDurum === 'Gönderildi') return ['Sonuç: ' + m.sonuc, 'yesil'];
    if (m.sonuc) return ['Sonuç: ' + m.sonuc + (m.sonucDurum ? ' (onayda)' : ''), 'mor'];
    if (m.geldi) return ['Geldi', 'yesil'];
    if (m.mail) return [saat(m.zaman), 'mavi'];
    if (m.grup) {
      const g = durum.gruplar.find(x => String(x.no) === String(m.grup));
      return [g && g.durum === 'Onay bekliyor' ? 'Plan onayda' : 'Grup ' + m.grup + ', plan bekliyor', 'sari'];
    }
    return ['Grup bekliyor', 'gri'];
  }

  // ------------------------------------------------------------ Özet

  function ozetCiz(yonetici) {
    const takimlar = durum.kullanici.takimlar.filter(benimMi);
    const kartlar = takimlar.map(t => {
      const m = mulakatlarim().filter(x => x.takim === t);
      const sayi = f => m.filter(f).length;
      return '<div class="ozet-kart"><h3>' + esc(t) + '</h3><dl>' +
        '<div><dt>Başvuru</dt><dd>' + m.length + '</dd></div>' +
        '<div><dt>Davet</dt><dd>' + sayi(x => x.mail) + '</dd></div>' +
        '<div><dt>Geldi</dt><dd>' + sayi(x => x.geldi) + '</dd></div>' +
        '<div><dt>Kabul</dt><dd>' + sayi(x => x.sonuc === 'Kabul') + '</dd></div></dl></div>';
    }).join('');

    const yapilacak = [];
    durum.gruplar.filter(g => benimMi(g.takim)).forEach(g => {
      if (g.durum === 'Plan bekleniyor') yapilacak.push(['plan', 'Grup ' + g.no + ' (' + g.takim + ', ' + g.tur + ', ' + g.aday + ' aday) için mülakat planı hazırlanmalı.' + (g.not ? ' Yönetici notu: ' + g.not : '')]);
      if (g.durum === 'Onay bekliyor') yapilacak.push(['plan', yonetici ? 'Grup ' + g.no + ' (' + g.takim + ') planı onayınızı bekliyor.' : 'Grup ' + g.no + ' planı yönetici onayı bekliyor.']);
      if (g.durum === 'Yarım kaldı') yapilacak.push(['plan', 'Grup ' + g.no + ' maillerinin bir kısmı kota yüzünden gitmedi. Tekrar onaylayın.']);
    });
    const bekleyenSonuc = {};
    mulakatlarim().filter(m => m.sonucDurum === 'Onay bekliyor').forEach(m => { bekleyenSonuc[m.takim] = (bekleyenSonuc[m.takim] || 0) + 1; });
    Object.keys(bekleyenSonuc).forEach(t => yapilacak.push(['sonuc', t + ': ' + bekleyenSonuc[t] + ' adayın sonucu ' + (yonetici ? 'onayınızı bekliyor.' : 'yönetici onayı bekliyor.')]));

    $('[data-bolum="ozet"]').innerHTML =
      '<div class="ozet-kartlar">' + kartlar + '</div>' +
      '<h2 class="panel__h2">Yapılacaklar</h2>' +
      (yapilacak.length
        ? '<ul class="yapilacak">' + yapilacak.map(([s, m]) => '<li><button type="button" data-git="' + s + '">' + esc(m) + ikon('ok') + '</button></li>').join('') + '</ul>'
        : '<p class="bos">Şu an bekleyen bir iş yok.</p>');
    $$('[data-git]').forEach(b => { b.onclick = () => sekmeAc(b.dataset.git); });
  }

  // ------------------------------------------------------------ Başvurular

  let arama = '';
  let turFiltre = '';
  let asamaFiltre = '';

  // Mülakatın hangi aşamada olduğu (başvuru ve rapor filtreleri için)
  const ASAMALAR = [['grup', 'Plan bekliyor'], ['planlandi', 'Mülakatı planlandı'], ['gelmedi', 'Mülakat saati geçti, gelmedi'],
    ['geldi', 'Geldi, sonuç girilmedi'], ['Kabul', 'Kabul'], ['Yedek', 'Yedek'], ['Ret', 'Ret'], ['gonderildi', 'Sonuç maili gitti']];
  function asamada(m, a) {
    if (!a) return true;
    if (a === 'grup') return !m.mail;
    if (a === 'planlandi') return m.mail && !m.geldi && !m.sonuc;
    if (a === 'gelmedi') return m.mail && !m.geldi && m.zaman && new Date(m.zaman) < new Date();
    if (a === 'geldi') return m.geldi && !m.sonuc;
    if (a === 'gonderildi') return m.sonucDurum === 'Gönderildi';
    return m.sonuc === a;
  }
  const asamaSecimi = (secili, veri) => '<select ' + veri + '><option value="">Bütün aşamalar</option>' +
    ASAMALAR.map(([d, y]) => '<option value="' + d + '"' + (secili === d ? ' selected' : '') + '>' + y + '</option>').join('') + '</select>';

  function basvuruCiz() {
    const kutu = $('[data-bolum="basvurular"]');
    if (!kutu.querySelector('[data-ara]')) {
      kutu.innerHTML = '<div class="filtre"><input type="search" data-ara placeholder="İsim, bölüm ya da kod ara">' +
        '<select data-tur><option value="">Bütün öğretim türleri</option><option>İkinci Öğretim</option><option>Örgün Öğretim</option></select>' +
        asamaSecimi(asamaFiltre, 'data-asama') +
        '<span class="filtre__sayi" data-sayi></span></div><div class="liste-tablo" data-liste></div>';
      kutu.querySelector('[data-ara]').oninput = e => { arama = e.target.value.toLocaleLowerCase('tr-TR'); listeCiz(); };
      kutu.querySelector('[data-tur]').onchange = e => { turFiltre = e.target.value; listeCiz(); };
      kutu.querySelector('[data-asama]').onchange = e => { asamaFiltre = e.target.value; listeCiz(); };
    }
    listeCiz();
  }

  function listeCiz() {
    const liste = durum.basvurular
      .filter(b => b.mulakatlar.some(m => benimMi(m.takim) && asamada(m, asamaFiltre)))
      .filter(b => !turFiltre || b.tur === turFiltre)
      .filter(b => !arama || (b.ad + ' ' + b.bolum + ' ' + b.kod).toLocaleLowerCase('tr-TR').includes(arama))
      .sort((a, b) => String(b.tarih).localeCompare(String(a.tarih)));
    $('[data-sayi]').textContent = liste.length + ' başvuru';
    $('[data-liste]').innerHTML = liste.length ? liste.map(b =>
      '<button type="button" class="satir" data-kod="' + esc(b.kod) + '">' +
      '<span class="satir__ad"><strong>' + esc(b.ad) + '</strong><small>' + esc([b.bolum, b.sinif].filter(Boolean).join(' · ')) + '</small></span>' +
      '<span class="satir__tur">' + esc(b.tur) + '</span>' +
      '<span class="satir__durum">' + b.mulakatlar.filter(m => benimMi(m.takim)).map(m => {
        const [yazi, renk] = mulakatDurumu(m);
        return '<span class="etiket etiket--' + renk + '">' + (durum.takim ? '' : esc(m.takim) + ': ') + esc(yazi) + '</span>';
      }).join('') + '</span>' +
      '<span class="satir__kod">' + esc(b.kod) + '</span></button>').join('')
      : '<p class="bos">Bu filtreye uyan başvuru yok.</p>';
    $$('[data-kod]').forEach(s => { s.onclick = () => basvuruDetayi(s.dataset.kod); });
  }

  async function basvuruDetayi(kod) {
    pencereAc('<p class="bilgi">Yükleniyor…</p>');
    const d = await calistir(null, () => api('basvuru', { kod }));
    if (!d) return;
    if (d.hata) return pencereAc('<div class="bilgi bilgi--hata">' + esc(d.hata) + '</div>');
    const b = durum.basvurular.find(x => x.kod === kod) || { mulakatlar: [], takimlar: [] };
    pencereAc('<p class="bolum__etiket">' + esc(d.kod) + '</p><h2>' + esc(d.ad) + '</h2>' +
      '<div class="etiketler">' + b.takimlar.map(t => '<span>' + esc(t) + '</span>').join('') + '</div>' +
      '<div class="aday-mulakat">' + b.mulakatlar.map(m => {
        const [yazi, renk] = mulakatDurumu(m);
        return '<div><strong>' + esc(m.takim) + '</strong><span>' + (m.mail ? esc(saat(m.zaman)) + (m.yer ? ' · ' + esc(m.yer) : '') : 'Mülakat henüz planlanmadı') +
          '</span><span class="etiket etiket--' + renk + '">' + esc(yazi) + '</span></div>';
      }).join('') + '</div>' +
      '<dl class="cevaplar">' + d.cevaplar.map(c => {
        const link = /^https?:\/\//.test(c.cevap);
        return '<div><dt>' + esc(c.soru) + '</dt><dd>' + (link ? '<a href="' + esc(c.cevap) + '" target="_blank" rel="noopener">' + esc(c.cevap) + '</a>' : esc(c.cevap)) + '</dd></div>';
      }).join('') + '</dl>');
  }

  // ------------------------------------------------------------ Mülakat planı

  function planCiz(yonetici) {
    const gruplar = durum.gruplar.filter(g => benimMi(g.takim))
      .sort((a, b) => ['Onay bekliyor', 'Yarım kaldı', 'Plan bekleniyor', 'Gönderildi'].indexOf(a.durum) -
        ['Onay bekliyor', 'Yarım kaldı', 'Plan bekleniyor', 'Gönderildi'].indexOf(b.durum) || b.no - a.no);
    const grupsuz = durum.grupsuz.filter(g => benimMi(g.takim));

    $('[data-bolum="plan"]').innerHTML =
      '<p class="bolum__giris">Bir takımın aynı öğretim türünde ' + durum.grupBoyutu + ' adayı olunca grup kendiliğinden açılır. ' +
      'Adayları istediğiniz gün ve saatteki oturumlara yerleştirip onaya gönderin. Yönetici onaylayınca her adaya kendi saatiyle mail gider.</p>' +
      (gruplar.length ? gruplar.map(g => grupKarti(g, yonetici)).join('') : '<p class="bos">Henüz mülakat grubu yok.</p>') +
      (grupsuz.length
        ? '<h2 class="panel__h2">Gruba atanmamış adaylar</h2><p class="kucuk-not">Başvurular kapandığında kalan adaylardan grup oluşturun.</p>' +
          '<div class="grupsuz">' + grupsuz.map(g => '<div class="grupsuz__satir"><span><strong>' + esc(g.takim) + '</strong> · ' + esc(g.tur) +
            ' · ' + g.aday + ' aday</span><button type="button" class="dugme dugme--ikincil dugme--kucuk" data-grup-olustur="' +
            esc(g.takim) + '|' + esc(g.tur) + '">Grup oluştur</button></div>').join('') + '</div>'
        : '');

    $$('[data-grup-olustur]').forEach(b => {
      b.onclick = () => calistir(b, async () => {
        const [takim, tur] = b.dataset.grupOlustur.split('|');
        if (!confirm(takim + ' – ' + tur + ' için bekleyen adaylardan yeni bir grup oluşturulsun mu?')) return;
        const c = await api('grupOlustur', { takim, tur });
        if (c.hata) throw new Error(c.hata);
        bildir('Grup ' + c.grup + ' oluşturuldu (' + c.aday + ' aday). Şimdi planını hazırlayabilirsiniz.', 'tamam');
        await yenile();
      });
    });
    gruplar.filter(g => g.durum === 'Plan bekleniyor').forEach(planDuzenCiz);
    $$('[data-onayla]').forEach(b => {
      b.onclick = () => calistir(b, async () => {
        const g = durum.gruplar.find(x => String(x.no) === b.dataset.onayla);
        if (!confirm('Grup ' + g.no + ' (' + g.takim + ', ' + g.aday + ' aday) için mülakat mailleri adaylara gönderilsin mi?\n\nGiden mail geri alınamaz.')) return;
        const c = await api('planOnayla', { grup: g.no });
        if (c.hata) throw new Error(c.hata);
        bildir(c.gonderilen + ' adaya mülakat maili gönderildi.' + (c.uyari ? ' ' + esc(c.uyari) : ''), c.uyari ? '' : 'tamam');
        await yenile();
      });
    });
    $$('[data-reddet]').forEach(b => {
      b.onclick = () => calistir(b, async () => {
        const not = prompt('Kaptana ne düzeltmesini söylemek istersiniz?');
        if (not === null) return;
        const c = await api('planReddet', { grup: b.dataset.reddet, not });
        if (c.hata) throw new Error(c.hata);
        bildir('Plan düzeltme için geri gönderildi.', 'tamam');
        await yenile();
      });
    });
  }

  function grupKarti(g, yonetici) {
    const renk = { 'Plan bekleniyor': 'sari', 'Onay bekliyor': 'mor', 'Yarım kaldı': 'sari', 'Gönderildi': 'yesil' }[g.durum] || 'gri';
    const ust = '<div class="grup-kart__ust"><div><p class="bolum__etiket">Grup ' + esc(g.no) + '</p><h3>' + esc(g.takim) + ' · ' + esc(g.tur) + '</h3>' +
      '<p class="kucuk-not">' + g.aday + ' aday · ' + esc(g.olusturma) + ' tarihinde açıldı</p></div>' +
      '<span class="etiket etiket--' + renk + '">' + esc(g.durum) + '</span></div>';

    if (g.durum === 'Plan bekleniyor') {
      return '<article class="grup-kart">' + ust + (g.not ? '<div class="bilgi">Yönetici notu: ' + esc(g.not) + '</div>' : '') +
        '<div class="plan-duzen" data-plan-duzen="' + esc(g.no) + '"></div></article>';
    }
    const ozet = '<dl class="plan-ozet"><div><dt>Tarih(ler)</dt><dd>' + esc(g.tarih) + '</dd></div>' +
      (g.plan ? '' : '<div><dt>Saat</dt><dd>' + esc(g.baslangic) + (g.bitis ? '–' + esc(g.bitis) : '') + (g.aralik ? ', ' + esc(g.aralik) + ' dk' : '') + '</dd></div>' +
        '<div><dt>Yer</dt><dd>' + esc(g.yer) + '</dd></div>') +
      (g.hazirlayan ? '<div><dt>Hazırlayan</dt><dd>' + esc(g.hazirlayan) + '</dd></div>' : '') +
      (g.onaylayan ? '<div><dt>Onaylayan</dt><dd>' + esc(g.onaylayan) + '</dd></div>' : '') + '</dl>' +
      (g.plan ? kayitliProgram(g) : '');
    const islem = g.durum === 'Onay bekliyor' || g.durum === 'Yarım kaldı'
      ? (yonetici
        ? '<div class="dugmeler"><button type="button" class="dugme" data-onayla="' + esc(g.no) + '">Onayla ve mailleri gönder</button>' +
          (g.durum === 'Onay bekliyor' ? '<button type="button" class="dugme dugme--ikincil" data-reddet="' + esc(g.no) + '">Düzeltme iste</button>' : '') + '</div>'
        : '<p class="kucuk-not">Yönetici onayladığında adaylara mail gidecek.</p>')
      : '<p class="kucuk-not">' + g.mail + ' adaya mail gitti · ' + g.gelen + ' aday geldi</p>';
    return '<article class="grup-kart">' + ust + ozet + islem + '</article>';
  }

  // Kaydedilmiş oturum planını oturum oturum gösterir (onay bekleyen ve gönderilmiş gruplar için)
  function kayitliProgram(g) {
    const adlar = {};
    grupAdaylari(g).forEach(a => { adlar[a.kod] = a.ad; });
    return '<div class="oturum-ozetleri">' + g.plan.oturumlar.map((o, n) => {
      const saatler = oturumSaatleri(o);
      const sure = Number(o.aralik) || 30;
      return '<details class="program"><summary>' + (n + 1) + '. oturum · ' + esc(o.tarih) + ' · ' + saatYazi(saatler[0]) + '–' +
        saatYazi(saatler[saatler.length - 1] + sure) + (o.ogle ? ' (öğle arası ' + esc(o.ogle) + ')' : '') + ' · ' + o.adaylar.length + ' aday · ' + esc(o.yer) + '</summary><ol>' +
        o.adaylar.map((k, i) => '<li><span>' + saatYazi(saatler[i]) + '</span>' + esc(adlar[k] || k) + '</li>').join('') +
        '</ol></details>';
    }).join('') + '</div>';
  }

  // ------------------------------------------------------------ Plan düzenleyici (oturumlar)
  // Her oturumun günü, başlangıcı, aday başı süresi ve yeri ayrı. Adaylar oturumlara elle ya da topluca eklenir,
  // oturum içindeki sıraları değiştirilebilir. Taslak bu tarayıcıda saklanır, "Onaya gönder" ile sunucuya gider.

  const taslaklar = {};
  const filtreler = {};
  const TASLAK = 'qt-plan-taslak-';

  function dakika(s) {
    const m = String(s || '').match(/^(\d{1,2})[:.](\d{2})/);
    return m ? Number(m[1]) * 60 + Number(m[2]) : null;
  }
  function saatYazi(d) {
    if (d === null || isNaN(d)) return '--:--';
    const s = Math.floor(d / 60) % 24;
    const k = d % 60;
    return (s < 10 ? '0' : '') + s + ':' + (k < 10 ? '0' : '') + k;
  }
  // "12:30-13:30" -> { bas, bitis } (dakika)
  function ogleOku(s) {
    const p = String(s || '').split(/\s*[-–]\s*/);
    if (p.length !== 2) return null;
    const bas = dakika(p[0]);
    const bitis = dakika(p[1]);
    return bas === null || bitis === null || bitis <= bas ? null : { bas, bitis };
  }
  // Oturumdaki her adayın dakikası (sunucudaki oturumDakikalari ile aynı hesap)
  function oturumSaatleri(o) {
    const bas = dakika(o.baslangic);
    const ara = Number(o.aralik) || 0;
    const ogle = ogleOku(o.ogle);
    const saatler = [];
    let t = bas;
    o.adaylar.forEach(() => {
      if (t === null) return saatler.push(null);
      if (ogle && ara && t < ogle.bitis && t + ara > ogle.bas) t = ogle.bitis;
      saatler.push(t);
      t += ara;
    });
    return saatler;
  }
  // "15.10.2026" -> "2026-10-15" (tarih kutusu için)
  function isoTarih(s) {
    const m = String(s || '').match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
    return m ? m[3] + '-' + m[2].padStart(2, '0') + '-' + m[1].padStart(2, '0') : String(s || '');
  }
  function kisaTarih(iso) {
    const m = String(iso || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) return 'Tarih seçilmedi';
    const t = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    return t.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'long' });
  }

  // Gruptaki adaylar, başvuru sırasıyla. "diger": adayın başka takımlardaki mülakatları
  function grupAdaylari(g) {
    return durum.basvurular
      .map(b => ({ b, m: b.mulakatlar.find(m => String(m.grup) === String(g.no) && m.takim === g.takim) }))
      .filter(x => x.m)
      .sort((x, y) => String(x.b.tarih).localeCompare(String(y.b.tarih)))
      .map(({ b }) => ({
        kod: b.kod, ad: b.ad, bolum: [b.bolum, b.sinif].filter(Boolean).join(' · '), bolumAdi: b.bolum || '', sinif: b.sinif || '',
        digerTakimlar: b.takimlar.filter(t => t !== g.takim),
        diger: b.mulakatlar.filter(m => m.takim !== g.takim).map(m => m.takim + (m.mail ? ' ' + saat(m.zaman) : '')),
      }));
  }

  function yeniOturum(g, onceki) {
    return {
      tarih: '', baslangic: onceki ? '' : (g.baslangic || '10:00'), aralik: onceki ? onceki.aralik : (Number(g.aralik) || 10),
      ogle: onceki ? onceki.ogle || '' : '', yer: onceki ? onceki.yer : '', konum: onceki ? onceki.konum : '', adaylar: [],
    };
  }

  function taslak(g) {
    if (taslaklar[g.no]) return taslaklar[g.no];
    let t = null;
    try { t = JSON.parse(localStorage.getItem(TASLAK + g.no) || 'null'); } catch (e) { /* tarayıcı izin vermedi */ }
    if (!t && g.plan) t = { oturumlar: g.plan.oturumlar.map(o => Object.assign({}, o, { tarih: isoTarih(o.tarih), adaylar: o.adaylar.slice() })) };
    if (!t || !Array.isArray(t.oturumlar) || !t.oturumlar.length) t = { oturumlar: [yeniOturum(g)] };
    taslaklar[g.no] = t;
    return t;
  }
  function taslakSakla(no) {
    try { localStorage.setItem(TASLAK + no, JSON.stringify(taslaklar[no])); } catch (e) { /* tarayıcı izin vermedi */ }
  }
  function taslakSil(no) {
    delete taslaklar[no];
    try { localStorage.removeItem(TASLAK + no); } catch (e) { /* tarayıcı izin vermedi */ }
  }

  function planDuzenCiz(g) {
    const kutu = $('[data-plan-duzen="' + g.no + '"]');
    if (!kutu) return;
    const t = taslak(g);
    const adaylar = grupAdaylari(g);
    const bilgi = {};
    adaylar.forEach(a => { bilgi[a.kod] = a; });
    // Gruptan çıkmış adayları taslaktan temizle
    t.oturumlar.forEach(o => { o.adaylar = o.adaylar.filter(k => bilgi[k]); });
    const atanmis = new Set([].concat(...t.oturumlar.map(o => o.adaylar)));
    const bekleyen = adaylar.filter(a => !atanmis.has(a.kod));
    const f = filtreler[g.no] = filtreler[g.no] || { tercih: '', bolum: '', sinif: '', ara: '' };
    const uyar = a => (!f.tercih || (f.tercih === '-' ? !a.digerTakimlar.length : f.tercih === '+' ? a.digerTakimlar.length : a.digerTakimlar.indexOf(f.tercih) !== -1)) &&
      (!f.bolum || a.bolumAdi === f.bolum) && (!f.sinif || a.sinif === f.sinif) &&
      (!f.ara || (a.ad + ' ' + a.bolum).toLocaleLowerCase('tr-TR').includes(f.ara));
    const gorunen = () => bekleyen.filter(uyar);
    const tekil = liste => liste.filter((v, i) => v && liste.indexOf(v) === i).sort((a, b) => a.localeCompare(b, 'tr'));
    const digerler = tekil([].concat(...adaylar.map(a => a.digerTakimlar)));
    const secim = (ad, bos, degerler, etiket) => '<select data-filtre="' + ad + '" aria-label="' + etiket + '"><option value="">' + bos + '</option>' +
      degerler.map(([v, y]) => '<option value="' + esc(v) + '"' + (f[ad] === v ? ' selected' : '') + '>' + esc(y) + '</option>').join('') + '</select>';
    const secenekler = sec => t.oturumlar.map((o, n) => '<option value="' + n + '"' + (n === sec ? ' selected' : '') + '>' + (n + 1) + '. oturum</option>').join('');

    kutu.innerHTML =
      '<p class="plan-duzen__durum">' + adaylar.length + ' aday · ' + t.oturumlar.length + ' oturum · ' +
        (bekleyen.length ? '<strong class="sari-yazi">' + (adaylar.length - bekleyen.length) + ' aday planda, ' + bekleyen.length + ' aday bekliyor</strong>' : '<strong class="yesil-yazi">Bütün adaylar yerleşti</strong>') + '</p>' +
      (bekleyen.length ? '<p class="kucuk-not">Hepsini yerleştirmek zorunda değilsiniz. Planda olmayan adaylar, plan onaylanınca gruptan çıkar ve "Gruba atanmamış adaylar" listesine döner. Onlar için sonra yeni grup açabilirsiniz.</p>' : '') +
      '<div class="oturumlar">' + t.oturumlar.map((o, n) => {
        const saatler = oturumSaatleri(o);
        return '<section class="oturum" data-oturum="' + n + '">' +
          '<header class="oturum__ust"><h4>' + (n + 1) + '. oturum</h4><span class="oturum__ozet" data-ozet></span>' +
          (t.oturumlar.length > 1 ? '<button type="button" class="metin-dugme" data-oturum-sil>Oturumu sil</button>' : '') + '</header>' +
          '<div class="oturum__alanlar">' +
            '<label class="alan"><span>Tarih</span><input type="date" name="tarih" value="' + esc(o.tarih) + '"></label>' +
            '<label class="alan"><span>Başlangıç</span><input type="time" name="baslangic" value="' + esc(o.baslangic) + '"></label>' +
            '<label class="alan"><span>Aday başı süre (dk)</span><input type="number" min="0" step="1" name="aralik" value="' + esc(o.aralik) + '"></label>' +
            '<label class="alan"><span>Öğle arası (isteğe bağlı)</span><input name="ogle" value="' + esc(o.ogle || '') + '" placeholder="12:30-13:30"></label>' +
            '<label class="alan alan--iki"><span>Yer</span><input name="yer" value="' + esc(o.yer) + '" placeholder="Mühendislik Fakültesi B Blok, Z-12"></label>' +
            '<label class="alan alan--genis"><span>Konum linki (isteğe bağlı)</span><input name="konum" value="' + esc(o.konum) + '" placeholder="Google Haritalar linki"></label>' +
          '</div>' +
          (o.adaylar.length
            ? '<ol class="oturum__liste">' + o.adaylar.map((k, i) => {
                const a = bilgi[k];
                return '<li data-kod="' + esc(k) + '"><span class="oturum__saat" data-saat>' + saatYazi(saatler[i]) + '</span>' +
                  '<span class="oturum__ad"><strong>' + esc(a.ad) + '</strong><small>' + esc(a.bolum) +
                  (a.diger.length ? ' · <span class="sari-yazi">Ayrıca: ' + esc(a.diger.join(', ')) + '</span>' : '') + '</small></span>' +
                  '<span class="oturum__arac">' +
                    '<button type="button" class="ikon-dugme" data-yukari title="Yukarı" aria-label="Yukarı"' + (i ? '' : ' disabled') + '>↑</button>' +
                    '<button type="button" class="ikon-dugme" data-asagi title="Aşağı" aria-label="Aşağı"' + (i < o.adaylar.length - 1 ? '' : ' disabled') + '>↓</button>' +
                    (t.oturumlar.length > 1 ? '<select data-tasi aria-label="Başka oturuma taşı">' + secenekler(n) + '</select>' : '') +
                    '<button type="button" class="ikon-dugme" data-cikar title="Oturumdan çıkar" aria-label="Oturumdan çıkar">×</button>' +
                  '</span></li>';
              }).join('') + '</ol>'
            : '<p class="kucuk-not">Bu oturumda henüz aday yok.</p>') +
          (bekleyen.length
            ? '<div class="oturum__ekle">Bekleyen adaylardan<span data-filtre-notu></span> sıradaki <input type="number" min="1" value="' + Math.min(bekleyen.length, 10) + '" data-ekle-sayi aria-label="Eklenecek aday sayısı"> kişiyi <button type="button" class="dugme dugme--ikincil dugme--kucuk" data-ekle>bu oturuma ekle</button></div>'
            : '') +
          '</section>';
      }).join('') + '</div>' +
      '<button type="button" class="dugme dugme--ikincil dugme--kucuk" data-oturum-ekle>+ Yeni oturum (başka gün ya da saat)</button>' +
      (bekleyen.length
        ? '<h4 class="plan-duzen__baslik">Bekleyen adaylar (' + bekleyen.length + ')</h4>' +
          '<p class="kucuk-not">Belli adayları seçip istediğiniz oturuma ekleyebilirsiniz. Filtre seçiliyken "sıradaki N kişiyi ekle" de sadece filtreye uyanlardan ekler.</p>' +
          '<div class="bekleyen__filtre"><input type="search" data-filtre="ara" placeholder="İsim ya da bölüm ara" value="' + esc(f.ara) + '">' +
            secim('tercih', 'Bütün tercihler', [['-', 'Sadece ' + g.takim + ' seçenler'], ['+', 'Başka takım da seçenler']].concat(digerler.map(d => [d, g.takim + ' + ' + d]))) +
            secim('bolum', 'Bütün bölümler', tekil(adaylar.map(a => a.bolumAdi)).map(b => [b, b])) +
            secim('sinif', 'Bütün sınıflar', tekil(adaylar.map(a => a.sinif)).map(b => [b, b])) +
            '<span class="filtre__sayi" data-filtre-sayi></span></div>' +
          '<div class="bekleyen__arac"><label class="kutucuk"><input type="checkbox" data-hepsi> Görünenlerin hepsini seç</label>' +
          '<select data-hedef aria-label="Hedef oturum">' + secenekler(0) + '</select>' +
          '<button type="button" class="dugme dugme--kucuk" data-secilenleri-ekle>Seçilenleri ekle</button></div>' +
          '<div class="bekleyen">' + bekleyen.map(a =>
            '<label class="bekleyen__satir" data-bekleyen="' + esc(a.kod) + '"><input type="checkbox" value="' + esc(a.kod) + '"><span><strong>' + esc(a.ad) + '</strong><small>' + esc(a.bolum) +
            (a.diger.length ? ' · <span class="sari-yazi">Ayrıca: ' + esc(a.diger.join(', ')) + '</span>' : '') + '</small></span></label>').join('') + '</div>'
        : '') +
      '<div class="plan-form__onizleme" data-onizleme></div>' +
      '<div class="dugmeler"><button type="button" class="dugme dugme--ikincil" data-onizle>Kontrol et</button>' +
      '<button type="button" class="dugme" data-gonder>' + (durum.kullanici.rol === 'Yönetici' ? 'Kaydet' : 'Onaya gönder') + '</button></div>';

    const degisti = () => { taslakSakla(g.no); planDuzenCiz(g); };
    const oturumKutusu = el => el.closest('[data-oturum]');
    const oturumNo = el => Number(oturumKutusu(el).dataset.oturum);

    // Alan değişince sadece saatler ve özet güncellenir, yazarken odak kaybolmasın
    const ozetGuncelle = n => {
      const o = t.oturumlar[n];
      const s = kutu.querySelector('[data-oturum="' + n + '"]');
      const saatler = oturumSaatleri(o);
      const son = saatler[saatler.length - 1];
      s.querySelectorAll('[data-saat]').forEach((el, i) => { el.textContent = saatYazi(saatler[i]); });
      s.querySelector('[data-ozet]').textContent = kisaTarih(o.tarih) +
        (saatler.length && son !== null ? ' · ' + saatYazi(saatler[0]) + '–' + saatYazi(son + (Number(o.aralik) || 30)) : '') +
        (ogleOku(o.ogle) ? ' · öğle arası ' + o.ogle : '') + ' · ' + o.adaylar.length + ' aday';
    };
    t.oturumlar.forEach((o, n) => ozetGuncelle(n));
    kutu.querySelectorAll('.oturum__alanlar input').forEach(inp => {
      inp.oninput = () => {
        const n = oturumNo(inp);
        t.oturumlar[n][inp.name] = inp.value;
        taslakSakla(g.no);
        ozetGuncelle(n);
      };
    });

    kutu.querySelector('[data-oturum-ekle]').onclick = () => {
      t.oturumlar.push(yeniOturum(g, t.oturumlar[t.oturumlar.length - 1]));
      degisti();
      const son = kutu.querySelector('[data-oturum="' + (t.oturumlar.length - 1) + '"] input[name="tarih"]');
      if (son) son.focus();
    };
    kutu.querySelectorAll('[data-oturum-sil]').forEach(b => {
      b.onclick = () => {
        const n = oturumNo(b);
        if (t.oturumlar[n].adaylar.length && !confirm((n + 1) + '. oturum silinsin mi? İçindeki ' + t.oturumlar[n].adaylar.length + ' aday bekleyenlere döner.')) return;
        t.oturumlar.splice(n, 1);
        degisti();
      };
    });
    kutu.querySelectorAll('[data-ekle]').forEach(b => {
      b.onclick = () => {
        const n = oturumNo(b);
        const sayi = Math.max(1, Number(oturumKutusu(b).querySelector('[data-ekle-sayi]').value) || 0);
        t.oturumlar[n].adaylar.push(...gorunen().slice(0, sayi).map(a => a.kod));
        degisti();
      };
    });
    kutu.querySelectorAll('.oturum__liste li').forEach(li => {
      const n = oturumNo(li);
      const liste = t.oturumlar[n].adaylar;
      const i = liste.indexOf(li.dataset.kod);
      const yer = (j) => { [liste[i], liste[j]] = [liste[j], liste[i]]; degisti(); };
      li.querySelector('[data-yukari]').onclick = () => yer(i - 1);
      li.querySelector('[data-asagi]').onclick = () => yer(i + 1);
      li.querySelector('[data-cikar]').onclick = () => { liste.splice(i, 1); degisti(); };
      const tasi = li.querySelector('[data-tasi]');
      if (tasi) tasi.onchange = () => { liste.splice(i, 1); t.oturumlar[Number(tasi.value)].adaylar.push(li.dataset.kod); degisti(); };
    });
    const hepsi = kutu.querySelector('[data-hepsi]');
    if (hepsi) {
      hepsi.onchange = () => kutu.querySelectorAll('.bekleyen__satir:not([hidden]) input').forEach(c => { c.checked = hepsi.checked; });
      // Filtre: liste yeniden çizilmez, satırlar gizlenir (arama kutusunda odak kaybolmasın)
      const filtreUygula = () => {
        const uyanlar = new Set(gorunen().map(a => a.kod));
        kutu.querySelectorAll('[data-bekleyen]').forEach(el => {
          el.hidden = !uyanlar.has(el.dataset.bekleyen);
          if (el.hidden) el.querySelector('input').checked = false;
        });
        const aktif = f.tercih || f.bolum || f.sinif || f.ara;
        kutu.querySelector('[data-filtre-sayi]').textContent = aktif ? uyanlar.size + ' / ' + bekleyen.length + ' aday' : bekleyen.length + ' aday';
        kutu.querySelectorAll('[data-filtre-notu]').forEach(el => { el.textContent = aktif ? ' (filtreye uyan ' + uyanlar.size + ' kişi)' : ''; });
        hepsi.checked = false;
      };
      kutu.querySelectorAll('[data-filtre]').forEach(el => {
        el.oninput = () => {
          f[el.dataset.filtre] = el.dataset.filtre === 'ara' ? el.value.trim().toLocaleLowerCase('tr-TR') : el.value;
          filtreUygula();
        };
      });
      filtreUygula();
      kutu.querySelector('[data-secilenleri-ekle]').onclick = () => {
        const secili = Array.from(kutu.querySelectorAll('.bekleyen input:checked')).map(c => c.value);
        if (!secili.length) return bildir('Önce eklemek istediğiniz adayları işaretleyin.', 'hata');
        t.oturumlar[Number(kutu.querySelector('[data-hedef]').value)].adaylar.push(...secili);
        degisti();
      };
    }

    const onizleme = kutu.querySelector('[data-onizleme]');
    const gonderilecek = () => ({ oturumlar: t.oturumlar.map(o => Object.assign({}, o)) });
    const uyariHtml = u => (u && u.length ? '<div class="bilgi"><strong>Dikkat:</strong><ul>' + u.map(x => '<li>' + esc(x) + '</li>').join('') + '</ul></div>' : '');
    kutu.querySelector('[data-onizle]').onclick = e => calistir(e.currentTarget, async () => {
      const c = await api('planOnizle', { grup: g.no, plan: gonderilecek() });
      onizleme.innerHTML = c.hata
        ? '<div class="bilgi bilgi--hata">' + esc(c.hata) + '</div>'
        : '<div class="bilgi bilgi--tamam">Plan geçerli. İlk mülakat: <strong>' + esc(c.ilk) + '</strong>, son mülakat: <strong>' + esc(c.son) + '</strong></div>' + uyariHtml(c.uyarilar);
    });
    kutu.querySelector('[data-gonder]').onclick = e => calistir(e.currentTarget, async () => {
      const c = await api('planKaydet', { grup: g.no, plan: gonderilecek() });
      if (c.hata) {
        onizleme.innerHTML = '<div class="bilgi bilgi--hata">' + esc(c.hata) + '</div>';
        return;
      }
      taslakSil(g.no);
      bildir((durum.kullanici.rol === 'Yönetici'
        ? 'Plan kaydedildi. Göndermek için "Onayla ve mailleri gönder" butonunu kullanın.'
        : 'Plan onaya gönderildi. Yönetici onaylayınca adaylara mail gidecek.') +
        (c.uyarilar && c.uyarilar.length ? ' Dikkat: ' + esc(c.uyarilar.join(' ')) : ''), 'tamam');
      await yenile();
    });
  }

  // ------------------------------------------------------------ QR giriş

  let okuyucu = null;
  function girisCiz() {
    const kutu = $('[data-bolum="giris"]');
    if (kutu.dataset.hazir) return;
    kutu.dataset.hazir = '1';
    kutu.innerHTML = '<div class="dar"><p class="bolum__giris">Adayın telefonundaki QR kodu okutun ya da başvuru kodunu yazın. ' +
      'Aday iki takıma başvurduysa sizin takımınızdaki mülakatı işaretlenir.</p>' +
      '<div class="okuyucu" id="okuyucu"></div>' +
      '<button type="button" class="dugme dugme--buyuk" data-kamera>' + ikon('medya') + 'Kamerayı aç</button>' +
      '<form class="sorgu" data-giris-form><label class="gizli" for="giris-kod">Aday kodu</label>' +
      '<input id="giris-kod" type="text" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="QT-XXXXXX" maxlength="12">' +
      '<button class="dugme" type="submit">İşaretle</button></form>' +
      '<div data-giris-sonuc aria-live="assertive"></div><h2 class="kucuk-baslik">Bu oturumda işaretlenenler</h2><ol class="gecmis" data-gecmis></ol></div>';

    let son = '';
    const sonuc = kutu.querySelector('[data-giris-sonuc]');
    async function isaretle(ham) {
      const kod = kodDuzelt(ham);
      if (!/^QT-[A-Z0-9]{6}$/.test(kod) || kod === son) return;
      son = kod;
      setTimeout(() => { son = ''; }, 4000);
      sonuc.innerHTML = '<div class="bilgi">' + esc(kod) + ' kontrol ediliyor…</div>';
      try {
        const c = await api('giris', { kod });
        if (c.hata) {
          sonuc.innerHTML = '<div class="bilgi bilgi--hata">' + esc(c.hata) + '</div>';
          return;
        }
        sonuc.innerHTML = '<div class="bilgi bilgi--tamam"><strong>' + esc(c.ad) + '</strong><br>' + esc(c.takim) + ' · ' + esc(c.saat) +
          '<br>Geldi olarak işaretlendi' + (c.zatenGeldi ? ' (daha önce işaretlenmişti)' : '') + '</div>';
        kutu.querySelector('[data-gecmis]').insertAdjacentHTML('afterbegin', '<li><strong>' + esc(c.ad) + '</strong> <span>' + esc(c.takim) + ' · ' + esc(c.saat) + '</span></li>');
        if (navigator.vibrate) navigator.vibrate(120);
        const b = durum.basvurular.find(x => x.kod === kod);
        if (b) b.mulakatlar.forEach(m => { if (m.takim === c.takim) m.geldi = true; });
      } catch (e) {
        sonuc.innerHTML = '<div class="bilgi bilgi--hata">Bağlantı hatası. Tekrar deneyin.</div>';
      }
    }
    kutu.querySelector('[data-giris-form]').onsubmit = e => {
      e.preventDefault();
      const girdi = e.target.querySelector('input');
      son = '';
      isaretle(girdi.value);
      girdi.value = '';
    };
    const kamera = kutu.querySelector('[data-kamera]');
    kamera.onclick = () => {
      if (!window.Html5Qrcode) {
        sonuc.innerHTML = '<div class="bilgi bilgi--hata">Kamera okuyucu yüklenemedi. Kodu elle girebilirsiniz.</div>';
        return;
      }
      kamera.hidden = true;
      okuyucu = new window.Html5Qrcode('okuyucu');
      okuyucu.start({ facingMode: 'environment' }, { fps: 10, qrbox: 240 }, isaretle, () => {}).catch(() => {
        kamera.hidden = false;
        sonuc.innerHTML = '<div class="bilgi bilgi--hata">Kameraya erişilemedi. Tarayıcıya kamera izni verin ya da kodu elle girin.</div>';
      });
    };
  }

  // ------------------------------------------------------------ Sonuçlar

  const kaydediliyor = new Set();
  const sira = {};
  function sonucCiz(yonetici) {
    const takimlar = durum.kullanici.takimlar.filter(benimMi);
    const kutu = $('[data-bolum="sonuc"]');
    kutu.innerHTML = '<p class="bolum__giris">Mülakat maili gitmiş adayların sonucunu seçin ve onaya gönderin. ' +
      'Yönetici onaylayınca Kabul, Yedek ve Ret mailleri adaylara gider. Gönderilen sonuç değiştirilemez.</p>' +
      takimlar.map(t => {
        const liste = mulakatlarim().filter(m => m.takim === t && m.mail).sort((a, b) => String(a.zaman).localeCompare(String(b.zaman)));
        if (!liste.length) return '';
        const yeni = liste.filter(m => m.sonuc && !m.sonucDurum).length;
        const onayda = liste.filter(m => m.sonucDurum === 'Onay bekliyor').length;
        return '<article class="grup-kart"><div class="grup-kart__ust"><h3>' + esc(t) + '</h3><span class="kucuk-not">' +
          liste.filter(m => m.geldi).length + ' / ' + liste.length + ' aday geldi</span></div>' +
          '<div class="sonuc-liste">' + liste.map(m => {
            const kilitli = m.sonucDurum === 'Gönderildi';
            const anahtar = m.b.kod + '|' + t;
            return '<div class="sonuc-satir' + (m.geldi ? '' : ' sonuc-satir--gelmedi') + '"><span><strong>' + esc(m.b.ad) + '</strong><small>' +
              esc(saat(m.zaman)) + (m.sonucDurum ? ' · ' + esc(m.sonucDurum.toLowerCase()) : '') +
              (kaydediliyor.has(anahtar) ? ' · <span class="sari-yazi">kaydediliyor…</span>' : '') + '</small></span>' +
              '<div class="sonuc-satir__arac"><button type="button" class="geldi-dugme" ' + (kilitli ? 'disabled ' : '') + 'aria-pressed="' + m.geldi +
              '" data-geldi="' + esc(anahtar) + '">' + (m.geldi ? '✓ Geldi' : 'Gelmedi') + '</button>' +
              '<div class="secenekler" role="group" aria-label="' + esc(m.b.ad) + ' sonucu">' +
              ['Kabul', 'Yedek', 'Ret'].map(s => '<button type="button" ' + (kilitli ? 'disabled ' : '') + 'aria-pressed="' + (m.sonuc === s) + '" data-sonuc="' +
                esc(m.b.kod) + '|' + esc(t) + '|' + s + '">' + s + '</button>').join('') + '</div></div></div>';
          }).join('') + '</div>' +
          '<div class="dugmeler">' +
          (yeni ? '<button type="button" class="dugme" data-onaya="' + esc(t) + '">' + yeni + ' sonucu ' + (yonetici ? 'gönderime hazırla' : 'onaya gönder') + '</button>' : '') +
          (yonetici && onayda ? '<button type="button" class="dugme" data-sonuc-onayla="' + esc(t) + '">' + onayda + ' sonuç mailini gönder</button>' +
            '<button type="button" class="dugme dugme--ikincil" data-sonuc-reddet="' + esc(t) + '">Düzeltme iste</button>' : '') +
          (!yonetici && onayda ? '<p class="kucuk-not">' + onayda + ' sonuç yönetici onayı bekliyor.</p>' : '') +
          '</div></article>';
      }).join('') || '<p class="bos">Henüz mülakat maili gönderilmiş aday yok.</p>';

    // Seçim ekranda hemen görünür, kayıt arkada sırayla yapılır. Hata olursa eski hale döner.
    const hemen = (anahtar, degisim, islem, veri) => {
      const [kod, takim] = anahtar.split('|');
      const hedef = durum.basvurular.find(x => x.kod === kod).mulakatlar.find(x => x.takim === takim);
      const eski = { sonuc: hedef.sonuc, sonucDurum: hedef.sonucDurum, geldi: hedef.geldi };
      Object.assign(hedef, degisim(hedef));
      kaydediliyor.add(anahtar);
      ciz();
      sira[anahtar] = (sira[anahtar] || Promise.resolve()).then(async () => {
        try {
          const c = await api(islem, Object.assign({ kod, takim }, veri));
          if (c.hata) throw new Error(c.hata);
          if (typeof c.geldi === 'boolean') hedef.geldi = c.geldi;
        } catch (hata) {
          Object.assign(hedef, eski);
          bildir(esc(hata.message), 'hata');
          yenile(true);
        }
        kaydediliyor.delete(anahtar);
        if (durum.sekme === 'sonuc') ciz();
      });
    };
    $$('[data-sonuc]').forEach(b => {
      b.onclick = () => {
        const [kod, takim, sonuc] = b.dataset.sonuc.split('|');
        const m = mulakatlarim().find(x => x.b.kod === kod && x.takim === takim);
        const yeni = m.sonuc === sonuc ? '' : sonuc;
        hemen(kod + '|' + takim, h => ({ sonuc: yeni, sonucDurum: '', geldi: yeni === 'Kabul' || yeni === 'Yedek' || h.geldi }), 'sonucKaydet', { sonuc: yeni });
      };
    });
    $$('[data-geldi]').forEach(b => {
      b.onclick = () => {
        const deger = b.getAttribute('aria-pressed') !== 'true';
        hemen(b.dataset.geldi, () => ({ geldi: deger }), 'geldi', { geldi: deger });
      };
    });
    const tus = (secici, islem, onay, mesaj) => $$(secici).forEach(b => {
      b.onclick = () => calistir(b, async () => {
        const takim = b.getAttribute(secici.slice(1, -1));
        if (onay && !confirm(onay(takim))) return;
        const c = await api(islem, { takim });
        if (c.hata) throw new Error(c.hata);
        bildir(mesaj(c), c.uyari ? '' : 'tamam');
        await yenile();
      });
    });
    tus('[data-onaya]', 'sonucOnayaGonder', null, c => c.sayi + ' sonuç ' + (yonetici ? 'gönderime hazır.' : 'onaya gönderildi.'));
    tus('[data-sonuc-onayla]', 'sonucOnayla', t => t + ' için onay bekleyen sonuç mailleri adaylara gönderilsin mi?\n\nGiden mail geri alınamaz.',
      c => c.gonderilen + ' sonuç maili gönderildi.' + (c.uyari ? ' ' + c.uyari : ''));
    tus('[data-sonuc-reddet]', 'sonucReddet', null, () => 'Sonuçlar düzeltme için kaptana geri gönderildi.');
  }

  // ------------------------------------------------------------ Rapor
  // Bütün adaylar ve mülakatları tek tabloda: süzme, sıralama ve Excel'e aktarma

  const rapor = { ara: '', asama: '', sira: 'tarih', artan: false };
  const RAPOR_SUTUNLARI = [
    ['tarih', 'Başvuru', r => r.tarih ? saat(r.tarih) : ''],
    ['kod', 'Kod', r => r.kod], ['ad', 'Ad Soyad', r => r.ad], ['bolum', 'Bölüm', r => r.bolum], ['sinif', 'Sınıf', r => r.sinif],
    ['tur', 'Öğretim', r => r.tur], ['takim', 'Takım', r => r.takim], ['tercih', 'Tercih', r => r.tercih], ['grup', 'Grup', r => r.grup],
    ['zaman', 'Mülakat', r => r.zaman ? saat(r.zaman) : ''], ['yer', 'Yer', r => r.yer], ['geldi', 'Geldi', r => (r.geldi ? 'Evet' : r.mail ? 'Hayır' : '')],
    ['sonuc', 'Sonuç', r => r.sonuc], ['sonucDurum', 'Sonuç maili', r => r.sonucDurum === 'Gönderildi' ? 'Gitti' : r.sonucDurum],
    ['eposta', 'E-posta', r => r.eposta], ['telefon', 'Telefon', r => r.telefon],
  ];

  function raporSatirlari() {
    const satirlar = [];
    durum.basvurular.forEach(b => b.mulakatlar.forEach(m => {
      if (!benimMi(m.takim) || !asamada(m, rapor.asama)) return;
      const r = Object.assign({}, m, { kod: b.kod, ad: b.ad, bolum: b.bolum, sinif: b.sinif, tur: b.tur, tarih: b.tarih,
        eposta: b.eposta || '', telefon: b.telefon || '', tercih: b.takimlar.indexOf(m.takim) !== -1 ? (b.takimlar.indexOf(m.takim) + 1) + '. tercih' : '', grup: m.grup ? String(m.grup) : '' });
      if (rapor.ara && !(r.ad + ' ' + r.bolum + ' ' + r.kod + ' ' + r.eposta).toLocaleLowerCase('tr-TR').includes(rapor.ara)) return;
      satirlar.push(r);
    }));
    const deger = r => (rapor.sira === 'geldi' ? String(r.geldi) : String(r[rapor.sira] || ''));
    satirlar.sort((a, b) => deger(a).localeCompare(deger(b), 'tr', { numeric: true }) * (rapor.artan ? 1 : -1));
    return satirlar;
  }

  function raporCiz() {
    const kutu = $('[data-bolum="rapor"]');
    if (!kutu.querySelector('[data-rapor-ara]')) {
      kutu.innerHTML = '<p class="bolum__giris">Bütün adayların başvuru, mülakat ve sonuç bilgileri. Bir aday iki takıma başvurduysa iki satırda görünür. ' +
        'Sütun başlığına tıklayarak sıralayabilirsiniz.</p>' +
        '<div class="filtre"><input type="search" data-rapor-ara placeholder="İsim, bölüm, kod ya da e-posta ara">' + asamaSecimi(rapor.asama, 'data-rapor-asama') +
        '<button type="button" class="dugme dugme--kucuk" data-excel>Excel olarak indir</button></div>' +
        '<div class="rapor-ozet" data-rapor-ozet></div><div class="rapor-kap" data-rapor-tablo></div>';
      kutu.querySelector('[data-rapor-ara]').oninput = e => { rapor.ara = e.target.value.trim().toLocaleLowerCase('tr-TR'); raporTablo(); };
      kutu.querySelector('[data-rapor-asama]').onchange = e => { rapor.asama = e.target.value; raporTablo(); };
      kutu.querySelector('[data-excel]').onclick = e => calistir(e.currentTarget, excelIndir);
    }
    raporTablo();
  }

  function raporTablo() {
    const satirlar = raporSatirlari();
    const say = f => satirlar.filter(f).length;
    $('[data-rapor-ozet]').innerHTML = [
      [new Set(satirlar.map(r => r.kod)).size, 'aday'], [satirlar.length, 'mülakat'], [say(r => r.mail), 'davet'], [say(r => r.geldi), 'geldi'],
      [say(r => r.sonuc === 'Kabul'), 'kabul'], [say(r => r.sonuc === 'Yedek'), 'yedek'], [say(r => r.sonuc === 'Ret'), 'ret'],
    ].map(([n, y]) => '<span><strong>' + n + '</strong> ' + y + '</span>').join('');
    $('[data-rapor-tablo]').innerHTML = satirlar.length
      ? '<table class="rapor"><thead><tr>' + RAPOR_SUTUNLARI.map(([k, y]) => '<th><button type="button" data-sirala="' + k + '">' + y +
          (rapor.sira === k ? (rapor.artan ? ' ▲' : ' ▼') : '') + '</button></th>').join('') + '</tr></thead><tbody>' +
        satirlar.map(r => '<tr data-rapor-kod="' + esc(r.kod) + '">' + RAPOR_SUTUNLARI.map(([k, , f]) => '<td' + (k === 'sonuc' && r.sonuc ? ' class="rapor__' + esc(r.sonuc.toLowerCase()) + '"' : '') + '>' + esc(f(r)) + '</td>').join('') + '</tr>').join('') +
        '</tbody></table>'
      : '<p class="bos">Bu filtreye uyan kayıt yok.</p>';
    $$('[data-sirala]').forEach(b => {
      b.onclick = () => {
        rapor.artan = rapor.sira === b.dataset.sirala ? !rapor.artan : true;
        rapor.sira = b.dataset.sirala;
        raporTablo();
      };
    });
    $$('[data-rapor-kod]').forEach(tr => { tr.onclick = () => basvuruDetayi(tr.dataset.raporKod); });
  }

  // Excel dosyası için SheetJS sadece gerektiğinde yüklenir. Yüklenemezse Excel'in açabildiği CSV indirilir.
  function yukle(adres) {
    return new Promise((tamam, hata) => {
      const s = document.createElement('script');
      s.src = adres;
      s.onload = tamam;
      s.onerror = hata;
      document.head.appendChild(s);
    });
  }
  async function excelIndir() {
    const satirlar = raporSatirlari();
    const tablo = [RAPOR_SUTUNLARI.map(([, y]) => y)].concat(satirlar.map(r => RAPOR_SUTUNLARI.map(([, , f]) => f(r))));
    const ad = 'quantum-rapor-' + new Date().toISOString().slice(0, 10);
    try {
      if (!window.XLSX) await yukle('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js');
      const sayfa = XLSX.utils.aoa_to_sheet(tablo);
      sayfa['!cols'] = RAPOR_SUTUNLARI.map((c, i) => ({ wch: Math.min(40, Math.max(8, ...tablo.map(r => String(r[i]).length))) }));
      const kitap = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(kitap, sayfa, 'Rapor');
      XLSX.writeFile(kitap, ad + '.xlsx');
    } catch (e) {
      const csv = '\ufeff' + tablo.map(r => r.map(h => '"' + String(h).replace(/"/g, '""') + '"').join(';')).join('\r\n');
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
      a.download = ad + '.csv';
      a.click();
    }
  }

  // ------------------------------------------------------------ Pencere

  function pencereAc(html) {
    const p = $('[data-pencere]');
    $('[data-pencere-icerik]').innerHTML = html;
    if (!p.open) p.showModal();
  }
  $('[data-pencere-kapat]').onclick = () => $('[data-pencere]').close();
  $('[data-pencere]').addEventListener('click', e => { if (e.target === e.currentTarget) e.currentTarget.close(); });

  // ------------------------------------------------------------ Başlat

  // Sadece bilgisayardaki test sunucusunda: ?test=eposta ile Google girişi olmadan dene
  const test = location.hostname === 'localhost' && parametre('test');
  let kayitli = '';
  try { kayitli = sessionStorage.getItem(TOKEN) || ''; } catch (e) { /* gizli sekme */ }
  if (test) oturumAc('test:' + test);
  else if (kayitli && tokenGecerli(kayitli)) oturumAc(kayitli);
  else girisEkrani();
})();
