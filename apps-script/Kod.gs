/**
 * Quantum Team başvuru, mülakat ve kaptan paneli otomasyonu (sürüm 2)
 *
 * Bu kod formun yanıtlarının düştüğü Google E-Tablo'ya eklenir
 * (E-Tablo > Uzantılar > Apps Script). Kurulum adımları için KURULUM.md dosyasına bakın.
 *
 * Akış:
 *  1. Aday formda en fazla iki takım seçer. Form gönderilince adaya başvuru kodlu onay maili gider
 *     ve seçtiği her takım için "Mülakatlar" sayfasına ayrı bir satır açılır.
 *  2. Bir takımın aynı öğretim türündeki bekleyen aday sayısı GRUP_BOYUTU'na ulaşınca grup açılır,
 *     takım kaptanına ve yöneticiye haber verilir.
 *  3. Kaptan sitedeki panelden mülakat planını (tarih, saat, yer) hazırlayıp onaya gönderir.
 *  4. Ana hesap (yönetici) panelden onaylayınca her adaya kendi saatiyle mülakat maili gider.
 *  5. Mülakattan yaklaşık 24 saat önce hatırlatma gider. Mülakat günü panelden QR ile giriş yapılır.
 *  6. Kaptan sonuçları (Kabul, Yedek, Ret) girip onaya gönderir. Yönetici onaylayınca sonuç mailleri gider.
 */

const AYAR = {
  KULUP_ADI: 'Quantum Yeni Nesil Teknoloji Kulübü',
  GONDEREN_ADI: 'Quantum Team',
  WEB_SITESI: 'https://quantumteam.com.tr',
  // Site yayına girince doldurun. Doluysa maillere ilgili butonlar eklenir.
  DURUM_SAYFASI: '',            // örnek: 'https://quantumteam.com.tr/durum.html'
  PANEL_SAYFASI: '',            // örnek: 'https://quantumteam.com.tr/panel.html'
  ANA_RENK: '#4a2fbd',

  // Google Cloud'da oluşturulan OAuth istemci kimliği. Sitedeki icerik.js ile aynı olmalı.
  GOOGLE_CLIENT_ID: '',

  GRUP_BOYUTU: 50,
  // Kaptan ve yöneticiye giden bildirimler: 'ozet' her gün OZET_SAATI'nde bekleyen işlerin tek bir özeti,
  // 'aninda' her olayda ayrı mail, 'kapali' hiç mail yok (işler sadece panelde görünür). Adaylara giden mailler etkilenmez.
  BILDIRIM: 'ozet',
  OZET_SAATI: 9,
  YONETICI_MAIL: '',            // Boş kalırsa kodu kuran hesabın adresi kullanılır
  SAAT_DILIMI: 'Europe/Istanbul',

  // Formdaki takım sorusunun seçenekleri. "secenek" formdaki yazıyla birebir aynı olmalı.
  TAKIMLAR: [
    { ad: 'Elektromobil', secenek: 'Elektromobil (Elektrikli Araç)', desen: /elektromobil|elektrikli ara/i },
    { ad: 'Roket', secenek: 'Roket', desen: /^(?!.*su\s*alt).*roket/i },
    { ad: 'İnsansız Hava Araçları', secenek: 'İnsansız Hava Araçları (İHA)', desen: /hava ara|[iİ]HA\b/i },
    { ad: 'Blokzincir', secenek: 'Blokzincir', desen: /blok\s*zincir|blockchain/i },
    { ad: 'Jet Motoru Tasarımı', secenek: 'Jet Motoru Tasarımı', desen: /jet/i },
    { ad: 'Su Altı Roketi', secenek: 'Su Altı Roketi', desen: /su\s*alt/i },
  ],
  EN_FAZLA_TAKIM: 2,

  // Her öğrenim türünün mülakatları ayrı planlanır. Yeni grupta bu saatler hazır gelir.
  OGRENIM_TURLERI: [
    { ad: 'İkinci Öğretim', desen: /[iİ]kinci|2\.\s*öğ/i, baslangic: '10:00', bitis: '17:00' },
    { ad: 'Örgün Öğretim', desen: /örgün|normal|1\.\s*öğ/i, baslangic: '17:00', bitis: '20:00' },
  ],
  VARSAYILAN_BASLANGIC: '10:00',
  VARSAYILAN_BITIS: '17:00',
  VARSAYILAN_ARALIK: 10,        // dakika

  YANIT_SAYFASI: '',            // Boş kalırsa forma bağlı sayfa otomatik bulunur
  EPOSTA_SUTUNU: '',            // Boş kalırsa başlığında "e-posta" / "mail" geçen sütun kullanılır
  AD_SUTUNU: '',
  OGRENIM_SUTUNU: '',
  TAKIM_SUTUNU: '',             // Boş kalırsa başlığında "hangi takım" geçen sütun kullanılır
};

const METIN = {
  ONAY: {
    konu: 'Başvurunuz alındı',
    baslik: 'Başvurunuz bize ulaştı',
    paragraflar: [
      '{kulup} başvuru formunu doldurduğunuz için teşekkür ederiz. Başvurunuz başarıyla alındı.',
      'Seçtiğiniz her takımın mülakatı ayrı yapılır. Mülakat tarihi, saati ve yeri belli olduğunda ' +
        'her takım için size ayrı bir e-posta göndereceğiz. Şimdilik yapmanız gereken bir şey yok.',
    ],
    sonParagraflar: [
      'Başvuru kodunuzu saklayın. Başvurunuzun durumunu takip ederken ve mülakat günü girişte bu kodu kullanacaksınız.',
      'Sorunuz olursa bu e-postayı yanıtlayarak bize yazabilirsiniz.',
    ],
  },
  MULAKAT: {
    konu: '{takim} mülakat bilgileriniz',
    baslik: '{takim} mülakatınız planlandı',
    paragraflar: [
      '{takim} takımı mülakatınızın bilgileri aşağıda. Lütfen belirtilen saatten 5-10 dakika önce mülakat yerinde olun.',
    ],
    sonParagraflar: [
      'Butona basarak mülakatı Google Takvim\'e ekleyebilirsiniz. Ekteki dosyayı açarak telefonunuzun takvimine de ' +
        'ekleyebilirsiniz. Mülakattan bir gün önce size ayrıca hatırlatma göndereceğiz.',
      'Mülakat günü girişte başvuru kodunuzu ya da "Giriş QR kodum" sayfasındaki QR kodu göstermeniz yeterli.',
      'Bu saatte katılamayacaksanız lütfen bu e-postayı yanıtlayarak en kısa sürede bize bildirin.',
    ],
  },
  HATIRLATMA: {
    konu: 'Hatırlatma: Yarın {takim} mülakatınız var',
    baslik: '{takim} mülakatınız yarın',
    paragraflar: ['Yarınki mülakatınızı hatırlatmak istedik. Bilgiler aşağıda.'],
    sonParagraflar: ['Katılamayacaksanız lütfen bu e-postayı yanıtlayarak bize haber verin. Görüşmek üzere!'],
  },
  KABUL: {
    konu: '{takim} takımına kabul edildiniz',
    baslik: 'Tebrikler, aramıza hoş geldiniz!',
    paragraflar: [
      'Mülakat sürecinin sonunda {takim} takımına kabul edildiğinizi bildirmekten mutluluk duyuyoruz.',
      'Takım kaptanınız ilk toplantı ve sonraki adımlar için yakında sizinle iletişime geçecek.',
    ],
    sonParagraflar: ['Sorunuz olursa bu e-postayı yanıtlayarak bize yazabilirsiniz. Birlikte çalışmak için sabırsızlanıyoruz!'],
  },
  YEDEK: {
    konu: '{takim} mülakat sonucunuz',
    baslik: 'Yedek listedesiniz',
    paragraflar: [
      '{takim} takımı mülakatına katıldığınız için teşekkür ederiz. Şu an yedek listedesiniz.',
      'Takımda yer açıldığında öncelikle yedek listedeki adaylarla iletişime geçiyoruz.',
    ],
    sonParagraflar: ['Gösterdiğiniz ilgi için teşekkür ederiz.'],
  },
  RET: {
    konu: '{takim} mülakat sonucunuz',
    baslik: 'Mülakat sonucunuz',
    paragraflar: [
      '{takim} takımı mülakatına katıldığınız için teşekkür ederiz.',
      'Bu dönem sizinle birlikte çalışamayacağız. Bu karar sizin potansiyelinizle ilgili değil, takımın bu dönemki ' +
        'ihtiyaçlarıyla ilgili. Eğitim ve etkinliklerimize katılmaya devam edebilir, bir sonraki dönem tekrar başvurabilirsiniz.',
    ],
    sonParagraflar: ['Gösterdiğiniz ilgi için teşekkür eder, başarılar dileriz.'],
  },
};

const SAYFA = { GRUP: 'Gruplar', MULAKAT: 'Mülakatlar', YETKILI: 'Yetkililer' };
const ESKI_SAYFALAR = ['Mülakat Grupları', 'Mülakat Programı'];

// "Gruplar" sayfası sütunları (0'dan başlar)
const G = { NO: 0, TAKIM: 1, TUR: 2, ADAY: 3, OLUSTURMA: 4, TARIH: 5, BASLANGIC: 6, BITIS: 7, ARALIK: 8, OGLE: 9,
  YER: 10, KONUM: 11, DURUM: 12, HAZIRLAYAN: 13, ONAYLAYAN: 14, NOT: 15, PLAN: 16 };
// "Plan" sütununda panelden hazırlanan oturumlar (hangi aday hangi gün ve saatte) saklanır.
// Tarih, saat ve yer sütunları o planın özetidir. "Plan" boşsa tarih/saat sütunlarından sırayla saat verilir.
const GRUP_BASLIKLARI = ['Grup No', 'Takım', 'Öğrenim Türü', 'Aday Sayısı', 'Oluşturulma', 'Tarih(ler)', 'Başlangıç',
  'Bitiş', 'Aralık (dk)', 'Öğle Arası', 'Yer', 'Konum Linki', 'Durum', 'Hazırlayan', 'Onaylayan', 'Not', 'Plan'];

// "Mülakatlar" sayfası sütunları: her aday-takım çifti için bir satır
const M = { KOD: 0, AD: 1, EPOSTA: 2, TUR: 3, TAKIM: 4, GRUP: 5, ZAMAN: 6, YER: 7, MAIL: 8, HATIRLATMA: 9,
  GELDI: 10, SONUC: 11, SONUC_DURUM: 12, SONUC_MAIL: 13, BASVURU: 14 };
const MULAKAT_BASLIKLARI = ['Başvuru Kodu', 'Ad Soyad', 'E-posta', 'Öğrenim Türü', 'Takım', 'Grup No', 'Mülakat Zamanı',
  'Yer', 'Mülakat Maili', 'Hatırlatma', 'Geldi', 'Sonuç', 'Sonuç Durumu', 'Sonuç Maili', 'Başvuru Zamanı'];

const Y = { EPOSTA: 0, AD: 1, ROL: 2, TAKIMLAR: 3 };
const YETKILI_BASLIKLARI = ['E-posta (Gmail)', 'Ad Soyad', 'Rol', 'Takımlar'];

const DURUM_SUTUNLARI = { ONAY: 'Onay Maili', KOD: 'Başvuru Kodu' };
const KOD_HARFLERI = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // karışan 0/O ve 1/I yok

const DURUM = { BEKLIYOR: 'Plan bekleniyor', ONAYDA: 'Onay bekliyor', YARIM: 'Yarım kaldı', GONDERILDI: 'Gönderildi' };
const SONUCLAR = ['Kabul', 'Yedek', 'Ret'];
const ROL = { YONETICI: 'Yönetici', KAPTAN: 'Kaptan' };

const AYLAR = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
const GUNLER = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];

// ================================================================ Menü ve kurulum

function onOpen() {
  const menu = SpreadsheetApp.getUi().createMenu('Mülakat');
  menu.addItem('Örnek mailleri bana gönder', 'testMailleriGonder')
    .addItem('Onay maili almamışlara şimdi gönder', 'eksikOnaylariGonder')
    .addItem('Mülakat planını onayla (panel yokken)', 'menudenOnayla')
    .addSeparator()
    .addItem('Formu güncelle (tek takım sorusu)', 'formuGuncelle')
    .addItem('Kurulum (bir kez çalıştırın)', 'kurulum')
    .addToUi();
}

function kurulum() {
  const ss = SpreadsheetApp.getActive();
  ss.setSpreadsheetTimeZone(AYAR.SAAT_DILIMI);

  ScriptApp.getProjectTriggers()
    .filter(t => ['formGonderildi', 'saatlikKontrol'].indexOf(t.getHandlerFunction()) !== -1)
    .forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('formGonderildi').forSpreadsheet(ss).onFormSubmit().create();
  ScriptApp.newTrigger('saatlikKontrol').timeBased().everyHours(1).create();

  grupSayfasi();
  mulakatSayfasi();
  yetkiliSayfasi();
  sutunlar(yanitSayfasi());
  eskiSayfalariKaldir();

  bildir('Kurulum tamamlandı.\n\n' +
    '• Her yeni başvuruya kodlu onay maili gidecek.\n' +
    '• Kaptanları "' + SAYFA.YETKILI + '" sayfasına Gmail adresleriyle ekleyin.\n' +
    '• Mailleri görmek için menüden "Örnek mailleri bana gönder" seçeneğini deneyin.');
}

// Sürüm 1'den kalan boş sayfaları kaldırır. İçinde veri olan sayfaya dokunmaz.
function eskiSayfalariKaldir() {
  const ss = SpreadsheetApp.getActive();
  ESKI_SAYFALAR.forEach(ad => {
    const sayfa = ss.getSheetByName(ad);
    if (sayfa && sayfa.getLastRow() <= 1) ss.deleteSheet(sayfa);
  });
}

// Formdaki eski "yarışma grubu" sorusunu ve bölümlerini tek bir takım sorusuyla değiştirir
function formuGuncelle() {
  const form = FormApp.openByUrl(SpreadsheetApp.getActive().getFormUrl());
  const eski = form.getItems().find(o => /hangi yarışma grubunda/i.test(o.getTitle()));

  // Yarım kalmış bir çalıştırmadan sonra tekrar çalıştırılabilir: soru varsa yeniden eklenmez
  if (!form.getItems().some(o => /hangi takım/i.test(o.getTitle()))) {
    const sira = eski ? eski.getIndex() : form.getItems().length;
    const soru = form.addCheckboxItem()
      .setTitle('Hangi takımlarda yer almak istersiniz?')
      .setHelpText('En fazla ' + AYAR.EN_FAZLA_TAKIM + ' takım seçebilirsiniz. Her takımın mülakatı ayrı yapılır. ' +
        'Takımlar hakkında bilgi için: ' + AYAR.WEB_SITESI)
      .setChoiceValues(AYAR.TAKIMLAR.map(t => t.secenek))
      .setRequired(true)
      .setValidation(FormApp.createCheckboxValidation()
        .setHelpText('En fazla ' + AYAR.EN_FAZLA_TAKIM + ' takım seçebilirsiniz.')
        .requireSelectAtMost(AYAR.EN_FAZLA_TAKIM).build());
    form.moveItem(soru.getIndex(), sira);
  }

  // Önce bölümlere yönlendiren eski soru silinir, yoksa Google bölümlerin silinmesine izin vermez
  let silinen = 0;
  if (eski) {
    form.deleteItem(eski);
    silinen++;
  }
  // Sonra yarışma bölümleri ve onların alt soruları
  const silinecek = form.getItems().filter(o =>
    /hangi yarışma ekibimizde/i.test(o.getTitle()) ||
    (o.getType() === FormApp.ItemType.PAGE_BREAK && /elektrikli araç|nsansız hava/i.test(o.getTitle())));
  silinecek.reverse().forEach(o => form.deleteItem(o));
  silinen += silinecek.length;

  bildir('Form güncellendi.\n\n• "Hangi takımlarda yer almak istersiniz?" sorusu hazır (en fazla ' +
    AYAR.EN_FAZLA_TAKIM + ' seçim).\n• Eski yarışma grubu sorusu ve bölümleri kaldırıldı (' + silinen + ' öğe).');
}

// ================================================================ Tetikleyiciler

function formGonderildi(e) {
  kilitle(() => {
    const sayfa = e.range.getSheet();
    const s = sutunlar(sayfa);
    const satir = e.range.getRow();
    const deger = sayfa.getRange(satir, 1, 1, sayfa.getLastColumn()).getValues()[0];
    onayMailiGonder(sayfa, s, satir, deger);
    adayiKaydet(sayfa, s, satir, deger);
    gruplariKontrolEt();
  });
}

// Her saat çalışır: kota yüzünden gidemeyen mailleri, kayıtları ve hatırlatmaları tamamlar
function saatlikKontrol() {
  kilitle(() => {
    const sayfa = yanitSayfasi();
    const s = sutunlar(sayfa);
    const son = sayfa.getLastRow();
    if (son >= 2) {
      const veri = sayfa.getRange(2, 1, son - 1, sayfa.getLastColumn()).getValues();
      const kayitli = new Set(mulakatVerisi().map(r => r[M.KOD] + '|' + r[M.TAKIM]));
      veri.forEach((deger, i) => {
        if (!String(deger[s.eposta - 1]).trim()) return;
        if (!deger[s.onay - 1]) onayMailiGonder(sayfa, s, i + 2, deger);
        const kod = String(deger[s.kod - 1]).trim();
        if (!kod || secilenTakimlar(deger, s).some(t => !kayitli.has(kod + '|' + t))) adayiKaydet(sayfa, s, i + 2, deger);
      });
    }
    gruplariKontrolEt();
    hatirlatmalariGonder();
    gunlukOzet();
  });
}

function kilitle(is) {
  const kilit = LockService.getScriptLock();
  kilit.waitLock(30000);
  try {
    return is();
  } finally {
    kilit.releaseLock();
  }
}

// ================================================================ Başvuru kaydı ve onay maili

function onayMailiGonder(sayfa, s, satir, deger) {
  if (deger[s.onay - 1]) return false;
  const eposta = String(deger[s.eposta - 1]).trim();
  if (!eposta || kotaYok()) return false;

  const kod = kodVer(sayfa, s, satir, deger);
  const takimlar = secilenTakimlar(deger, s);
  const kutu = [['Başvuru kodu', kod]];
  if (takimlar.length) kutu.push(['Takımlar', takimlar.join(', ')]);
  mailGonder(eposta, METIN.ONAY, adSoyad(deger, s), {
    kutu,
    butonlar: AYAR.DURUM_SAYFASI ? [{ yazi: 'Başvurumu takip et', link: durumLinki(kod) }] : [],
  });
  sayfa.getRange(satir, s.onay).setValue(new Date());
  deger[s.onay - 1] = new Date();
  return true;
}

// Adayın seçtiği her takım için "Mülakatlar" sayfasına bir satır açar (varsa tekrar açmaz)
function adayiKaydet(sayfa, s, satir, deger) {
  const eposta = String(deger[s.eposta - 1]).trim();
  if (!eposta) return;
  const kod = kodVer(sayfa, s, satir, deger);
  const ms = mulakatSayfasi();
  const mevcut = new Set(mulakatVerisi().filter(r => r[M.KOD] === kod).map(r => r[M.TAKIM]));
  const tur = ogrenimTuru(deger, s) || 'Belirtilmemiş';
  const zaman = deger[0] instanceof Date ? deger[0] : new Date();
  secilenTakimlar(deger, s).filter(t => !mevcut.has(t)).forEach(takim => {
    const r = new Array(MULAKAT_BASLIKLARI.length).fill('');
    r[M.KOD] = kod;
    r[M.AD] = adSoyad(deger, s);
    r[M.EPOSTA] = eposta;
    r[M.TUR] = tur;
    r[M.TAKIM] = takim;
    r[M.GELDI] = false;
    r[M.BASVURU] = zaman;
    ms.appendRow(r);
    ms.getRange(ms.getLastRow(), M.GELDI + 1).insertCheckboxes();
  });
}

// Satırın başvuru kodunu döndürür, yoksa yeni ve benzersiz bir kod üretip yazar
function kodVer(sayfa, s, satir, deger) {
  const mevcut = String(deger[s.kod - 1] || '').trim();
  if (mevcut) return mevcut;
  const son = sayfa.getLastRow();
  const kullanilan = new Set(son > 1 ? sayfa.getRange(2, s.kod, son - 1, 1).getValues().map(r => String(r[0])) : []);
  let kod;
  do {
    kod = 'QT-';
    for (let i = 0; i < 6; i++) kod += KOD_HARFLERI.charAt(Math.floor(Math.random() * KOD_HARFLERI.length));
  } while (kullanilan.has(kod));
  sayfa.getRange(satir, s.kod).setValue(kod);
  deger[s.kod - 1] = kod;
  return kod;
}

function secilenTakimlar(deger, s) {
  if (!s.takim) return [];
  const bulunan = [];
  String(deger[s.takim - 1]).split(/\s*,\s*(?=\S)/).forEach(parca => {
    const t = AYAR.TAKIMLAR.find(x => x.secenek === parca.trim()) || AYAR.TAKIMLAR.find(x => x.desen.test(parca));
    if (t && bulunan.indexOf(t.ad) === -1) bulunan.push(t.ad);
  });
  return bulunan.slice(0, AYAR.EN_FAZLA_TAKIM);
}

function ogrenimTuru(deger, s) {
  if (!s.tur) return '';
  const cevap = String(deger[s.tur - 1]);
  const bulunan = AYAR.OGRENIM_TURLERI.find(t => t.desen.test(cevap));
  return bulunan ? bulunan.ad : '';
}

function durumLinki(kod) {
  return AYAR.DURUM_SAYFASI + '?kod=' + encodeURIComponent(kod);
}

function eksikOnaylariGonder() {
  saatlikKontrol();
  SpreadsheetApp.getUi().alert('Eksik onay mailleri ve kayıtlar tamamlandı.' +
    (kotaYok() ? '\n\nGünlük mail kotası doldu. Kalanlar saatlik kontrolde otomatik gönderilecek.' : ''));
}

// ================================================================ Gruplama

// Bir takımın aynı öğretim türündeki gruba atanmamış aday sayısı GRUP_BOYUTU'na ulaştıysa grup açar
function gruplariKontrolEt() {
  const veri = mulakatVerisi();
  const siralar = {};
  veri.forEach((r, i) => {
    if (r[M.GRUP] !== '') return;
    const k = r[M.TAKIM] + '|' + r[M.TUR];
    (siralar[k] = siralar[k] || []).push(i);
  });
  Object.keys(siralar).forEach(k => {
    const [takim, tur] = k.split('|');
    const liste = siralar[k];
    while (liste.length >= AYAR.GRUP_BOYUTU) grupOlustur(takim, tur, liste.splice(0, AYAR.GRUP_BOYUTU));
  });
}

// "indeksler": mulakatVerisi() içindeki satır sıraları
function grupOlustur(takim, tur, indeksler) {
  const gs = grupSayfasi();
  const ms = mulakatSayfasi();
  const no = gs.getLastRow(); // 1. satır başlık olduğu için grup sayısı + 1
  indeksler.forEach(i => ms.getRange(i + 2, M.GRUP + 1).setValue(no));
  const saat = turAyari(tur);

  const satir = new Array(GRUP_BASLIKLARI.length).fill('');
  satir[G.NO] = no;
  satir[G.TAKIM] = takim;
  satir[G.TUR] = tur;
  satir[G.ADAY] = indeksler.length;
  satir[G.OLUSTURMA] = new Date();
  satir[G.BASLANGIC] = saat.baslangic;
  satir[G.BITIS] = saat.bitis;
  satir[G.ARALIK] = AYAR.VARSAYILAN_ARALIK;
  satir[G.DURUM] = DURUM.BEKLIYOR;
  gs.appendRow(satir);

  const alicilar = takimYetkilileri(takim).concat([yoneticiMail()]);
  bildirimMaili({
    to: Array.from(new Set(alicilar)).join(','),
    subject: 'Mülakat grubu ' + no + ' hazır: ' + takim + ' – ' + tur + ' (' + indeksler.length + ' aday)',
    name: AYAR.GONDEREN_ADI,
    body: takim + ' takımı için ' + tur + ' adaylarından ' + indeksler.length + ' kişilik mülakat grubu ' + no + ' oluştu.\n\n' +
      'Kaptan panelinden mülakat tarihini, saatini ve yerini girip onaya gönderin.\n' +
      (AYAR.PANEL_SAYFASI ? 'Panel: ' + AYAR.PANEL_SAYFASI + '\n' : '') +
      '\nYönetici onaylamadan adaylara mail gitmez.',
  });
  return no;
}

function turAyari(tur) {
  const bulunan = AYAR.OGRENIM_TURLERI.find(t => t.ad === tur);
  return {
    baslangic: bulunan ? bulunan.baslangic : AYAR.VARSAYILAN_BASLANGIC,
    bitis: bulunan ? bulunan.bitis : AYAR.VARSAYILAN_BITIS,
  };
}

// ================================================================ Mülakat planı: hazırla, onayla, gönder

// Planı doğrular ve her adayın gün, saat ve yerini hesaplar.
// plan.oturumlar varsa panelden gelen oturum planıdır: her oturumun kendi günü, başlangıcı, aday başı süresi, yeri
// ve sıralı aday kodları vardır. Yoksa eski biçim: tarih(ler), başlangıç, bitiş, aralık ve öğle arasıyla sırayla dağıtılır.
function planHesapla(grupNo, plan) {
  const grup = grupBul(grupNo);
  if (!grup) return { hata: 'Grup bulunamadı.' };
  const adaylar = mulakatVerisi().map((r, i) => ({ r, i })).filter(x => String(x.r[M.GRUP]) === String(grupNo));
  const sonuc = plan && Array.isArray(plan.oturumlar) ? oturumPlani(adaylar, plan.oturumlar) : siraliPlan(adaylar, plan || {});
  if (sonuc.hata) return sonuc;
  const atamalar = sonuc.atamalar;
  const sirali = atamalar.slice().sort((a, b) => slotZamani(a).getTime() - slotZamani(b).getTime());
  const yazi = a => uzunTarih(a.tarih) + ' ' + dakikaYazi(a.dakika);
  const disarida = sonuc.disarida || [];
  return {
    grup, adaylar, atamalar, disarida, oturumlar: sonuc.oturumlar || null,
    ilk: sirali.length ? yazi(sirali[0]) : '',
    son: sirali.length ? yazi(sirali[sirali.length - 1]) : '',
    uyarilar: (disarida.length ? [disarida.length + ' aday bu plana alınmadı. Plan onaylanınca bu adaylar gruptan çıkar ve ' +
      '"Gruba atanmamış adaylar" listesine döner. Onlar için sonra yeni grup açabilirsiniz.'] : [])
      .concat(sonuc.uyarilar || [], cakismalar(grup.deger[G.TAKIM], atamalar)),
  };
}

// Oturumdaki adayların gün içindeki dakikaları. Öğle arasına denk gelen aday arasının bitişine kayar.
function oturumDakikalari(bas, aralik, ogle, adet) {
  const dakikalar = [];
  let t = bas;
  for (let k = 0; k < adet; k++) {
    if (ogle && aralik && t < ogle.bitis && t + aralik > ogle.bas) t = ogle.bitis;
    dakikalar.push(t);
    t += aralik;
  }
  return dakikalar;
}

function oturumPlani(adaylar, oturumlar) {
  if (!oturumlar.length) return { hata: 'En az bir oturum ekleyin.' };
  const kodlar = {};
  adaylar.forEach(x => { kodlar[x.r[M.KOD]] = x; });
  const atanan = {};
  const atamalar = [];
  const temiz = [];
  const uyarilar = [];
  for (let n = 0; n < oturumlar.length; n++) {
    const o = oturumlar[n] || {};
    const ad = (n + 1) + '. oturum';
    const liste = Array.isArray(o.adaylar) ? o.adaylar.map(String) : [];
    if (!liste.length) continue; // boş oturum kaydedilmez
    const tarih = tarihOku(o.tarih);
    if (!tarih) return { hata: ad + ': tarih okunamadı.' };
    const bas = saatDakika(o.baslangic);
    if (bas === null) return { hata: ad + ': başlangıç saati okunamadı. 10:00 biçiminde yazın.' };
    const aralikYazi = String(o.aralik === undefined || o.aralik === null ? '' : o.aralik).trim();
    const aralik = Number(aralikYazi.replace(',', '.'));
    if (aralikYazi === '' || !(aralik >= 0)) return { hata: ad + ': aday başı süreyi dakika olarak yazın.' };
    const ogleYazi = String(o.ogle || '').trim();
    const ogle = ogleYazi ? ogleOku(ogleYazi) : null;
    if (ogleYazi && !ogle) return { hata: ad + ': öğle arası okunamadı. 12:30-13:30 biçiminde yazın.' };
    const yer = String(o.yer || '').trim();
    if (!yer) return { hata: ad + ': mülakat yerini yazın.' };
    const konum = String(o.konum || '').trim();
    const dakikalar = oturumDakikalari(bas, aralik, ogle, liste.length);
    for (let k = 0; k < liste.length; k++) {
      const x = kodlar[liste[k]];
      if (!x) return { hata: liste[k] + ' kodlu aday bu grupta değil. Sayfayı yenileyip tekrar deneyin.' };
      if (atanan[liste[k]]) return { hata: x.r[M.AD] + ' iki ayrı oturuma eklenmiş.' };
      atanan[liste[k]] = true;
      if (dakikalar[k] >= 24 * 60) return { hata: ad + ': son adayın saati gece yarısını geçiyor.' };
      atamalar.push({ x, tarih, dakika: dakikalar[k], sure: aralik || 30, yer, konum });
    }
    temiz.push({ tarih: noktaliTarih(tarih), baslangic: dakikaYazi(bas), aralik, ogle: ogle ? dakikaYazi(ogle.bas) + '-' + dakikaYazi(ogle.bitis) : '',
      yer, konum, adaylar: liste, _bitis: dakikalar[dakikalar.length - 1] + (aralik || 30), _bas: bas });
  }
  if (!atamalar.length) return { hata: 'Plana en az bir aday ekleyin.' };
  // Aynı yerde saatleri üst üste binen oturumlar. Farklı salonlarda aynı anda mülakat olabileceği için sadece uyarı.
  for (let a = 0; a < temiz.length; a++) {
    for (let b = a + 1; b < temiz.length; b++) {
      const [p, q] = [temiz[a], temiz[b]];
      if (p.tarih === q.tarih && p.yer === q.yer && p._bas < q._bitis && q._bas < p._bitis) {
        uyarilar.push((a + 1) + '. ve ' + (b + 1) + '. oturum aynı gün ve aynı yerde, saatleri üst üste biniyor.');
      }
    }
  }
  temiz.forEach(o => { delete o._bas; delete o._bitis; });
  return { atamalar, oturumlar: temiz, uyarilar, disarida: adaylar.filter(x => !atanan[x.r[M.KOD]]) };
}

// Eski biçim: adaylar başvuru sırasıyla gün gün, aralıklarla dağıtılır
function siraliPlan(adaylar, plan) {
  const tarihler = String(plan.tarih || '').split(/[,;\n]+/).map(t => t.trim()).filter(Boolean).map(tarihOku);
  if (!tarihler.length || tarihler.some(t => !t)) return { hata: 'Tarih okunamadı. 15.10.2026 biçiminde yazın.' };
  const bas = saatDakika(plan.baslangic);
  if (bas === null) return { hata: 'Başlangıç saati okunamadı. 10:00 biçiminde yazın.' };
  const bitis = plan.bitis ? saatDakika(plan.bitis) : 24 * 60;
  if (bitis === null || bitis <= bas) return { hata: 'Bitiş saati okunamadı ya da başlangıçtan önce.' };
  const aralik = Number(String(plan.aralik || '').replace(',', '.')) || 0;
  if (aralik < 0) return { hata: 'Aralık negatif olamaz.' };
  const ogle = plan.ogle ? ogleOku(plan.ogle) : null;
  if (plan.ogle && !ogle) return { hata: 'Öğle arası okunamadı. 12:00-13:00 biçiminde yazın.' };
  const yer = String(plan.yer || '').trim();
  if (!yer) return { hata: 'Mülakat yerini yazın.' };
  const slotlar = slotlariOlustur(tarihler, bas, bitis, aralik, ogle);
  if (slotlar.length < adaylar.length) {
    return { hata: adaylar.length + ' aday var ama bu ayarlarla sadece ' + slotlar.length + ' saat çıkıyor. ' +
      'Virgülle bir gün daha ekleyin ya da aralığı kısaltın.' };
  }
  const konum = String(plan.konum || '').trim();
  return { atamalar: adaylar.map((x, i) => ({ x, tarih: slotlar[i].tarih, dakika: slotlar[i].dakika, sure: aralik || 30, yer, konum })) };
}

// Aynı adayın başka takımdaki mülakatıyla çakışan saatler (gönderilmiş ya da onay bekleyen planlar)
function cakismalar(takim, atamalar) {
  const diger = {};
  const ekle = (kod, t, zaman, sure) => { (diger[kod] = diger[kod] || []).push({ takim: t, bas: zaman.getTime(), sure }); };
  const planli = {};
  grupVerisi().forEach(g => {
    if (g[G.TAKIM] === takim || g[G.DURUM] !== DURUM.ONAYDA) return;
    const p = planJson(g[G.PLAN]);
    if (!p) return;
    p.oturumlar.forEach(o => {
      const tarih = tarihOku(o.tarih);
      const bas = saatDakika(o.baslangic);
      if (!tarih || bas === null) return;
      const dakikalar = oturumDakikalari(bas, Number(o.aralik) || 0, o.ogle ? ogleOku(o.ogle) : null, (o.adaylar || []).length);
      (o.adaylar || []).forEach((kod, k) => {
        ekle(kod, g[G.TAKIM], slotZamani({ tarih, dakika: dakikalar[k] }), Number(o.aralik) || 30);
        planli[kod + '|' + g[G.TAKIM]] = true;
      });
    });
  });
  mulakatVerisi().forEach(r => {
    if (r[M.TAKIM] === takim || !(r[M.ZAMAN] instanceof Date) || !r[M.MAIL] || planli[r[M.KOD] + '|' + r[M.TAKIM]]) return;
    ekle(r[M.KOD], r[M.TAKIM], r[M.ZAMAN], 30);
  });
  const uyarilar = [];
  atamalar.forEach(a => {
    const bas = slotZamani(a).getTime();
    (diger[a.x.r[M.KOD]] || []).forEach(d => {
      if (bas < d.bas + d.sure * 60000 && d.bas < bas + a.sure * 60000) {
        uyarilar.push(a.x.r[M.AD] + ': ' + d.takim + ' mülakatıyla çakışıyor (' +
          Utilities.formatDate(new Date(d.bas), AYAR.SAAT_DILIMI, 'dd.MM HH:mm') + ').');
      }
    });
  });
  return uyarilar;
}

function planJson(metin) {
  try {
    const p = JSON.parse(String(metin || ''));
    return p && Array.isArray(p.oturumlar) ? p : null;
  } catch (e) {
    return null;
  }
}

// Gruplar sayfasındaki satırdan kayıtlı planı okur
function kayitliPlan(d) {
  return planJson(d[G.PLAN]) || { tarih: d[G.TARIH], baslangic: d[G.BASLANGIC], bitis: d[G.BITIS], aralik: d[G.ARALIK],
    ogle: d[G.OGLE], yer: d[G.YER], konum: d[G.KONUM] };
}

function noktaliTarih(t) {
  return (t.d < 10 ? '0' : '') + t.d + '.' + (t.m < 10 ? '0' : '') + t.m + '.' + t.y;
}

function planKaydet(kullanici, grupNo, plan) {
  const grup = grupBul(grupNo);
  if (!grup) return { hata: 'Grup bulunamadı.' };
  if (!yetkiliMi(kullanici, grup.deger[G.TAKIM])) return { hata: 'Bu takımın planını hazırlama yetkiniz yok.' };
  if (grup.deger[G.DURUM] === DURUM.GONDERILDI) return { hata: 'Bu grubun mailleri gönderildi, plan değiştirilemez.' };
  const h = planHesapla(grupNo, plan);
  if (h.hata) return h;

  const gs = grupSayfasi();
  const yaz = (sutun, deger) => gs.getRange(grup.satir, sutun + 1).setValue(deger);
  if (h.oturumlar) {
    // Tarih, saat ve yer sütunlarına planın okunur bir özeti yazılır
    const tekil = liste => liste.filter((v, i) => v !== '' && liste.indexOf(v) === i);
    const sirali = h.atamalar.slice().sort((a, b) => slotZamani(a).getTime() - slotZamani(b).getTime());
    const sonu = sirali[sirali.length - 1];
    yaz(G.TARIH, tekil(h.oturumlar.map(o => o.tarih)).join(', '));
    yaz(G.BASLANGIC, dakikaYazi(sirali[0].dakika));
    yaz(G.BITIS, dakikaYazi(sonu.dakika + sonu.sure));
    yaz(G.ARALIK, tekil(h.oturumlar.map(o => String(o.aralik))).join(' / '));
    yaz(G.OGLE, tekil(h.oturumlar.map(o => o.ogle)).join(', '));
    yaz(G.YER, tekil(h.oturumlar.map(o => o.yer)).join(' / '));
    yaz(G.KONUM, tekil(h.oturumlar.map(o => o.konum))[0] || '');
    yaz(G.PLAN, JSON.stringify({ oturumlar: h.oturumlar }));
  } else {
    yaz(G.TARIH, String(plan.tarih).trim());
    yaz(G.BASLANGIC, String(plan.baslangic).trim());
    yaz(G.BITIS, String(plan.bitis || '').trim());
    yaz(G.ARALIK, String(plan.aralik || '').trim());
    yaz(G.OGLE, String(plan.ogle || '').trim());
    yaz(G.YER, String(plan.yer).trim());
    yaz(G.KONUM, String(plan.konum || '').trim());
    yaz(G.PLAN, '');
  }
  yaz(G.DURUM, DURUM.ONAYDA);
  yaz(G.HAZIRLAYAN, kullanici.ad + ' <' + kullanici.email + '>');
  yaz(G.NOT, '');

  if (kullanici.rol !== ROL.YONETICI) {
    const oturumYazisi = h.oturumlar
      ? 'Oturumlar:\n' + h.oturumlar.map(o => '• ' + o.tarih + ' ' + o.baslangic + ', ' + o.adaylar.length + ' aday, ' + o.yer).join('\n')
      : 'Yer: ' + plan.yer;
    bildirimMaili({
      to: yoneticiMail(),
      subject: 'Onay bekliyor: ' + grup.deger[G.TAKIM] + ' mülakat planı (grup ' + grupNo + ')',
      name: AYAR.GONDEREN_ADI,
      body: kullanici.ad + ', ' + grup.deger[G.TAKIM] + ' takımı için mülakat planı hazırladı.\n\n' +
        'Grup: ' + grupNo + ' (' + grup.deger[G.TUR] + ', ' + h.atamalar.length + ' aday)\n' +
        'İlk mülakat: ' + h.ilk + '\nSon mülakat: ' + h.son + '\n' + oturumYazisi + '\n' +
        (h.uyarilar.length ? '\nDikkat:\n' + h.uyarilar.map(u => '• ' + u).join('\n') + '\n' : '') +
        '\nOnaylamak ya da geri göndermek için kaptan paneline girin.' +
        (AYAR.PANEL_SAYFASI ? '\n' + AYAR.PANEL_SAYFASI : '') + '\n\nSiz onaylamadan adaylara mail gitmez.',
    });
  }
  return { tamam: true, ilk: h.ilk, son: h.son, aday: h.atamalar.length, uyarilar: h.uyarilar };
}

function planReddet(kullanici, grupNo, not) {
  if (kullanici.rol !== ROL.YONETICI) return { hata: 'Sadece yönetici geri gönderebilir.' };
  const grup = grupBul(grupNo);
  if (!grup || grup.deger[G.DURUM] !== DURUM.ONAYDA) return { hata: 'Onay bekleyen böyle bir grup yok.' };
  const gs = grupSayfasi();
  gs.getRange(grup.satir, G.DURUM + 1).setValue(DURUM.BEKLIYOR);
  gs.getRange(grup.satir, G.NOT + 1).setValue(String(not || '').trim());
  const hazirlayan = String(grup.deger[G.HAZIRLAYAN]).match(/<(.+)>/);
  if (hazirlayan) {
    bildirimMaili({
      to: hazirlayan[1],
      subject: 'Mülakat planı geri gönderildi: ' + grup.deger[G.TAKIM] + ' (grup ' + grupNo + ')',
      name: AYAR.GONDEREN_ADI,
      body: 'Hazırladığınız mülakat planı düzeltme için geri gönderildi.\n\nNot: ' + (not || '-') +
        '\n\nPlanı panelden düzenleyip tekrar onaya gönderebilirsiniz.' + (AYAR.PANEL_SAYFASI ? '\n' + AYAR.PANEL_SAYFASI : ''),
    });
  }
  return { tamam: true };
}

// Yönetici onayı: gruptaki her adaya kendi saatiyle mülakat maili gönderir
function planOnayla(kullanici, grupNo) {
  if (kullanici.rol !== ROL.YONETICI) return { hata: 'Sadece yönetici onaylayabilir.' };
  const grup = grupBul(grupNo);
  if (!grup || [DURUM.ONAYDA, DURUM.YARIM].indexOf(grup.deger[G.DURUM]) === -1) return { hata: 'Onay bekleyen böyle bir grup yok.' };
  const d = grup.deger;
  const h = planHesapla(grupNo, kayitliPlan(d));
  if (h.hata) return h;

  const ms = mulakatSayfasi();
  let gonderilen = 0;
  let kotaBitti = false;
  h.atamalar.forEach(a => {
    const x = a.x;
    if (kotaBitti || x.r[M.MAIL]) return; // daha önce gönderilmiş
    if (kotaYok()) {
      kotaBitti = true;
      return;
    }
    const zaman = slotZamani(a);
    const p = { yer: a.yer, konum: a.konum, sure: a.sure, takim: d[G.TAKIM] };
    mailGonder(x.r[M.EPOSTA], METIN.MULAKAT, x.r[M.AD], mulakatBilgisi(a, zaman, p, x.r[M.KOD]), '', { takim: p.takim });
    ms.getRange(x.i + 2, M.ZAMAN + 1, 1, 3).setValues([[zaman, a.yer, new Date()]]);
    gonderilen++;
  });
  const gs = grupSayfasi();
  // Plana alınmayan adaylar gruptan çıkar, "Gruba atanmamış adaylar" listesine döner
  h.disarida.forEach(x => ms.getRange(x.i + 2, M.GRUP + 1).setValue(''));
  if (h.disarida.length) gs.getRange(grup.satir, G.ADAY + 1).setValue(h.atamalar.length);
  gs.getRange(grup.satir, G.DURUM + 1).setValue(kotaBitti ? DURUM.YARIM : DURUM.GONDERILDI);
  gs.getRange(grup.satir, G.ONAYLAYAN + 1).setValue(kullanici.ad + ' · ' + Utilities.formatDate(new Date(), AYAR.SAAT_DILIMI, 'dd.MM.yyyy HH:mm'));
  if (kotaBitti) {
    return { tamam: true, gonderilen, uyari: 'Günlük mail kotası doldu. Kalan adaylar için yarın tekrar "Onayla" deyin. ' +
      'Mail almış adaylara tekrar gitmez ve saatleri değişmez.' };
  }
  return { tamam: true, gonderilen };
}

// Panel kurulmadan önce yöneticinin E-Tablo'dan onay vermesi için. Planı "Gruplar" sayfasına elle yazıp
// bu menüyü kullanın. Onay penceresinde ilk ve son adayın saati gösterilir.
function menudenOnayla() {
  const ui = SpreadsheetApp.getUi();
  const cevap = ui.prompt('Mülakat planını onayla', 'Onaylanacak grup numarasını yazın:', ui.ButtonSet.OK_CANCEL);
  if (cevap.getSelectedButton() !== ui.Button.OK) return;
  const no = cevap.getResponseText().trim();
  const grup = grupBul(no);
  if (!grup) return ui.alert('Grup ' + no + ' bulunamadı.');
  const d = grup.deger;
  const h = planHesapla(no, kayitliPlan(d));
  if (h.hata) return ui.alert('Grup ' + no + ': ' + h.hata);
  const emin = ui.alert('Mülakat mailleri gönderilsin mi?', 'Grup ' + no + ': ' + d[G.TAKIM] + ' – ' + d[G.TUR] +
    ' (' + h.atamalar.length + ' aday)\nİlk: ' + h.ilk + '\nSon: ' + h.son + '\nYer: ' + d[G.YER], ui.ButtonSet.YES_NO);
  if (emin !== ui.Button.YES) return;
  if (d[G.DURUM] !== DURUM.YARIM) grupSayfasi().getRange(grup.satir, G.DURUM + 1).setValue(DURUM.ONAYDA);
  const sonuc = kilitle(() => planOnayla({ rol: ROL.YONETICI, ad: 'Yönetim', takimlar: [] }, no));
  ui.alert(sonuc.hata || (sonuc.gonderilen + ' adaya mülakat maili gönderildi.' + (sonuc.uyari ? '\n\n' + sonuc.uyari : '')));
}

// Takımın gruba atanmamış adaylarından yeni grup açar (başvurular kapandığında)
function kalanlardanGrup(kullanici, takim, tur) {
  if (!yetkiliMi(kullanici, takim)) return { hata: 'Bu takım için yetkiniz yok.' };
  const indeksler = [];
  mulakatVerisi().forEach((r, i) => { if (r[M.GRUP] === '' && r[M.TAKIM] === takim && r[M.TUR] === tur) indeksler.push(i); });
  if (!indeksler.length) return { hata: 'Gruba atanmamış aday yok.' };
  return { tamam: true, grup: grupOlustur(takim, tur, indeksler), aday: indeksler.length };
}

// Aralık 0 ise herkes ilk günün başlangıç saatini alır
function slotlariOlustur(tarihler, bas, bitis, aralik, ogle) {
  if (!aralik) return new Array(10000).fill({ tarih: tarihler[0], dakika: bas });
  const slotlar = [];
  tarihler.forEach(tarih => {
    let t = bas;
    while (t + aralik <= bitis) {
      if (ogle && t < ogle.bitis && t + aralik > ogle.bas) {
        t = ogle.bitis;
        continue;
      }
      slotlar.push({ tarih, dakika: t });
      t += aralik;
    }
  });
  return slotlar;
}

// Adayın oturumundaki konum linki ve mülakat süresi. Kullanımı: const bul = mulakatAyrintisi(); bul(grupNo, kod)
function mulakatAyrintisi() {
  const gruplar = {};
  grupVerisi().forEach(g => {
    const kodlar = {};
    const p = planJson(g[G.PLAN]);
    if (p) p.oturumlar.forEach(o => (o.adaylar || []).forEach(k => { kodlar[k] = { konum: o.konum || '', sure: Number(o.aralik) || 30 }; }));
    gruplar[g[G.NO]] = { genel: { konum: g[G.KONUM], sure: Number(String(g[G.ARALIK]).replace(',', '.')) || 30 }, kodlar };
  });
  return (grupNo, kod) => {
    const g = gruplar[grupNo];
    return g ? g.kodlar[kod] || g.genel : { konum: '', sure: 30 };
  };
}

function takvimLinki(zaman, sure, yer, takim) {
  const bitis = new Date(zaman.getTime() + sure * 60000);
  return 'https://calendar.google.com/calendar/render?action=TEMPLATE' +
    '&text=' + encodeURIComponent(AYAR.GONDEREN_ADI + ' ' + (takim ? takim + ' ' : '') + 'Mülakatı') +
    '&dates=' + utc(zaman) + '/' + utc(bitis) +
    '&location=' + encodeURIComponent(yer) +
    '&details=' + encodeURIComponent(AYAR.KULUP_ADI + ' mülakatı');
}

function mulakatBilgisi(slot, zaman, p, kod) {
  const bitis = new Date(zaman.getTime() + p.sure * 60000);
  const butonlar = [{ yazi: 'Takvimime ekle', link: takvimLinki(zaman, p.sure, p.yer, p.takim) }];
  if (p.konum) butonlar.push({ yazi: 'Yol tarifi', link: p.konum, ikincil: true });
  if (AYAR.DURUM_SAYFASI && kod) butonlar.push({ yazi: 'Giriş QR kodum', link: durumLinki(kod), ikincil: true });
  const kutu = [['Takım', p.takim], ['Tarih', uzunTarih(slot.tarih)], ['Saat', dakikaYazi(slot.dakika)], ['Yer', p.yer]];
  if (kod) kutu.push(['Kod', kod]);
  return { kutu, butonlar, ekler: [icsDosyasi(zaman, bitis, p.yer, p.takim)] };
}

// ================================================================ Hatırlatma

function hatirlatmalariGonder() {
  const ms = mulakatSayfasi();
  const veri = mulakatVerisi();
  const simdi = Date.now();
  const GUN = 24 * 3600 * 1000;
  const ayrinti = mulakatAyrintisi();

  veri.forEach((r, i) => {
    const zaman = r[M.ZAMAN];
    if (!(zaman instanceof Date) || r[M.HATIRLATMA]) return;
    const kalan = zaman.getTime() - simdi;
    if (kalan > GUN || kalan <= 0) return;
    const gonderim = r[M.MAIL];
    if (gonderim instanceof Date && zaman.getTime() - gonderim.getTime() < GUN) {
      ms.getRange(i + 2, M.HATIRLATMA + 1).setValue('Gerek yok');
      return;
    }
    if (kotaYok()) return;
    const konum = ayrinti(r[M.GRUP], r[M.KOD]).konum;
    const bilgi = {
      kutu: [['Takım', r[M.TAKIM]], ['Tarih', uzunTarih(tarihParca(zaman))],
        ['Saat', Utilities.formatDate(zaman, AYAR.SAAT_DILIMI, 'HH:mm')], ['Yer', r[M.YER]], ['Kod', r[M.KOD]]],
      butonlar: konum ? [{ yazi: 'Yol tarifi', link: konum }] : [],
    };
    mailGonder(r[M.EPOSTA], METIN.HATIRLATMA, r[M.AD], bilgi, '', { takim: r[M.TAKIM] });
    ms.getRange(i + 2, M.HATIRLATMA + 1).setValue(new Date());
  });
}

// ================================================================ Kaptan ve yönetici bildirimleri

// Olay anında giden bildirimler sadece BILDIRIM 'aninda' ise gider. 'ozet' ise gunlukOzet toplar.
function bildirimMaili(secenek) {
  if (AYAR.BILDIRIM === 'aninda' && !kotaYok()) MailApp.sendEmail(secenek);
}

// Her gün OZET_SAATI'nde (saatlik kontrolden) bir kez çalışır. Bekleyen işi olan her kişiye tek mail gider.
function gunlukOzet(zorla) {
  if (AYAR.BILDIRIM !== 'ozet' && !zorla) return;
  const simdi = new Date();
  const bugun = Utilities.formatDate(simdi, AYAR.SAAT_DILIMI, 'yyyy-MM-dd');
  const ozellik = PropertiesService.getScriptProperties();
  if (!zorla && (Number(Utilities.formatDate(simdi, AYAR.SAAT_DILIMI, 'H')) < AYAR.OZET_SAATI ||
    ozellik.getProperty('ozetTarihi') === bugun)) return;

  const isler = {};
  const ekle = (kime, is) => { if (kime) (isler[kime.toLowerCase()] = isler[kime.toLowerCase()] || []).push(is); };
  const yonetici = yoneticiMail();
  grupVerisi().forEach(g => {
    const ad = 'Grup ' + g[G.NO] + ' (' + g[G.TAKIM] + ', ' + g[G.TUR] + ', ' + g[G.ADAY] + ' aday)';
    if (g[G.DURUM] === DURUM.BEKLIYOR) {
      takimYetkilileri(g[G.TAKIM]).forEach(e => ekle(e, ad + ' için mülakat planı hazırlanmalı.' +
        (g[G.NOT] ? ' Yönetici düzeltme istedi: ' + g[G.NOT] : '')));
    }
    if (g[G.DURUM] === DURUM.ONAYDA) ekle(yonetici, ad + ' planı onayınızı bekliyor.');
    if (g[G.DURUM] === DURUM.YARIM) ekle(yonetici, ad + ' maillerinin bir kısmı kota yüzünden gitmedi. Tekrar onaylayın.');
  });
  const onayda = {};
  const girilmedi = {};
  mulakatVerisi().forEach(r => {
    if (r[M.SONUC_DURUM] === DURUM.ONAYDA) onayda[r[M.TAKIM]] = (onayda[r[M.TAKIM]] || 0) + 1;
    if (r[M.GELDI] === true && !r[M.SONUC]) girilmedi[r[M.TAKIM]] = (girilmedi[r[M.TAKIM]] || 0) + 1;
  });
  Object.keys(onayda).forEach(t => ekle(yonetici, t + ': ' + onayda[t] + ' adayın sonucu onayınızı bekliyor.'));
  Object.keys(girilmedi).forEach(t => takimYetkilileri(t).forEach(e =>
    ekle(e, t + ': mülakata gelen ' + girilmedi[t] + ' adayın sonucu henüz girilmedi.')));

  Object.keys(isler).forEach(kime => {
    if (kotaYok()) return;
    MailApp.sendEmail({
      to: kime,
      subject: 'Kaptan paneli: bekleyen ' + isler[kime].length + ' iş',
      name: AYAR.GONDEREN_ADI,
      body: 'Merhaba,\n\nPanelde sizi bekleyen işler:\n\n' + isler[kime].map(i => '• ' + i).join('\n') +
        '\n\n' + (AYAR.PANEL_SAYFASI ? 'Panel: ' + AYAR.PANEL_SAYFASI + '\n\n' : '') +
        'Bu özet her gün bekleyen iş varsa bir kez gönderilir.',
    });
  });
  ozellik.setProperty('ozetTarihi', bugun);
}

// ================================================================ Mülakat girişi ve sonuçlar

// QR okutulan adayı "Geldi" olarak işaretler. Aday iki takıma girdiyse kullanıcının takımındaki,
// o da birden fazlaysa zamanı en yakın olan mülakat seçilir.
function girisYap(kullanici, hamKod) {
  const kod = kodTemizle(hamKod);
  if (!kod) return { hata: 'Geçersiz kod.' };
  const veri = mulakatVerisi();
  const adaylar = veri.map((r, i) => ({ r, i }))
    .filter(x => x.r[M.KOD] === kod && x.r[M.MAIL] && yetkiliMi(kullanici, x.r[M.TAKIM]));
  if (!adaylar.length) return { hata: kod + ' için sizin takımınızda planlanmış bir mülakat yok.' };
  const simdi = Date.now();
  adaylar.sort((a, b) => Math.abs(a.r[M.ZAMAN] - simdi) - Math.abs(b.r[M.ZAMAN] - simdi));
  const x = adaylar[0];
  const zatenGeldi = x.r[M.GELDI] === true;
  mulakatSayfasi().getRange(x.i + 2, M.GELDI + 1).setValue(true);
  return {
    tamam: true, ad: x.r[M.AD], takim: x.r[M.TAKIM], zatenGeldi,
    saat: x.r[M.ZAMAN] instanceof Date ? Utilities.formatDate(x.r[M.ZAMAN], AYAR.SAAT_DILIMI, 'dd.MM HH:mm') : '',
  };
}

function sonucKaydet(kullanici, hamKod, takim, sonuc) {
  const kod = kodTemizle(hamKod);
  if (!yetkiliMi(kullanici, takim)) return { hata: 'Bu takım için yetkiniz yok.' };
  if (sonuc && SONUCLAR.indexOf(sonuc) === -1) return { hata: 'Geçersiz sonuç.' };
  const i = mulakatVerisi().findIndex(r => r[M.KOD] === kod && r[M.TAKIM] === takim);
  if (i === -1) return { hata: 'Aday bulunamadı.' };
  const r = mulakatVerisi()[i];
  if (r[M.SONUC_DURUM] === DURUM.GONDERILDI) return { hata: 'Bu adayın sonuç maili gönderildi, değiştirilemez.' };
  const ms = mulakatSayfasi();
  ms.getRange(i + 2, M.SONUC + 1, 1, 2).setValues([[sonuc || '', '']]);
  // Kabul ya da Yedek verilen aday mülakata gelmiş sayılır
  const geldi = sonuc === 'Kabul' || sonuc === 'Yedek' || r[M.GELDI] === true;
  if (geldi && r[M.GELDI] !== true) ms.getRange(i + 2, M.GELDI + 1).setValue(true);
  return { tamam: true, geldi };
}

// Panelden elle "geldi" işareti (QR okutulamadığında)
function geldiKaydet(kullanici, hamKod, takim, deger) {
  const kod = kodTemizle(hamKod);
  if (!yetkiliMi(kullanici, takim)) return { hata: 'Bu takım için yetkiniz yok.' };
  const veri = mulakatVerisi();
  const i = veri.findIndex(r => r[M.KOD] === kod && r[M.TAKIM] === takim);
  if (i === -1) return { hata: 'Aday bulunamadı.' };
  if (!veri[i][M.MAIL]) return { hata: 'Bu adaya henüz mülakat maili gitmedi.' };
  if (veri[i][M.SONUC_DURUM] === DURUM.GONDERILDI) return { hata: 'Bu adayın sonuç maili gönderildi, değiştirilemez.' };
  mulakatSayfasi().getRange(i + 2, M.GELDI + 1).setValue(deger === true);
  return { tamam: true };
}

function sonuclariOnayaGonder(kullanici, takim) {
  if (!yetkiliMi(kullanici, takim)) return { hata: 'Bu takım için yetkiniz yok.' };
  const ms = mulakatSayfasi();
  let sayi = 0;
  mulakatVerisi().forEach((r, i) => {
    if (r[M.TAKIM] === takim && r[M.SONUC] && !r[M.SONUC_DURUM]) {
      ms.getRange(i + 2, M.SONUC_DURUM + 1).setValue(DURUM.ONAYDA);
      sayi++;
    }
  });
  if (!sayi) return { hata: 'Onaya gönderilecek yeni sonuç yok.' };
  if (kullanici.rol !== ROL.YONETICI) {
    bildirimMaili({
      to: yoneticiMail(),
      subject: 'Onay bekliyor: ' + takim + ' mülakat sonuçları (' + sayi + ' aday)',
      name: AYAR.GONDEREN_ADI,
      body: kullanici.ad + ', ' + takim + ' takımı için ' + sayi + ' adayın sonucunu onaya gönderdi.\n\n' +
        'Sonuçları kontrol edip onaylamak için kaptan paneline girin.' + (AYAR.PANEL_SAYFASI ? '\n' + AYAR.PANEL_SAYFASI : '') +
        '\n\nSiz onaylamadan adaylara sonuç maili gitmez.',
    });
  }
  return { tamam: true, sayi };
}

function sonuclariOnayla(kullanici, takim) {
  if (kullanici.rol !== ROL.YONETICI) return { hata: 'Sadece yönetici onaylayabilir.' };
  const ms = mulakatSayfasi();
  let gonderilen = 0;
  let kotaBitti = false;
  mulakatVerisi().forEach((r, i) => {
    if (kotaBitti || r[M.TAKIM] !== takim || r[M.SONUC_DURUM] !== DURUM.ONAYDA) return;
    if (kotaYok()) {
      kotaBitti = true;
      return;
    }
    const sablon = { Kabul: METIN.KABUL, Yedek: METIN.YEDEK, Ret: METIN.RET }[r[M.SONUC]];
    mailGonder(r[M.EPOSTA], sablon, r[M.AD], {}, '', { takim });
    ms.getRange(i + 2, M.SONUC_DURUM + 1, 1, 2).setValues([[DURUM.GONDERILDI, new Date()]]);
    gonderilen++;
  });
  return { tamam: true, gonderilen,
    uyari: kotaBitti ? 'Günlük mail kotası doldu. Kalanlar için yarın tekrar onaylayın.' : '' };
}

function sonuclariReddet(kullanici, takim) {
  if (kullanici.rol !== ROL.YONETICI) return { hata: 'Sadece yönetici geri gönderebilir.' };
  const ms = mulakatSayfasi();
  mulakatVerisi().forEach((r, i) => {
    if (r[M.TAKIM] === takim && r[M.SONUC_DURUM] === DURUM.ONAYDA) ms.getRange(i + 2, M.SONUC_DURUM + 1).setValue('');
  });
  return { tamam: true };
}

// ================================================================ Web uygulaması
//
// Yayınlamak için: Dağıt > Yeni dağıtım > Web uygulaması, "Çalıştıran: Ben", "Erişim: Herkes".
// - doGet: herkese açık başvuru sorgulama (?islem=durum&kod=QT-XXXXXX). Sadece kodu bilen görür.
// - doPost: kaptan paneli. Her istekte Google oturum anahtarı doğrulanır ve "Yetkililer" listesine bakılır.

function doGet(e) {
  const p = (e && e.parameter) || {};
  return yanit(() => (p.islem === 'durum' ? durumSorgula(p.kod) : { hata: 'Geçersiz istek' }));
}

function doPost(e) {
  return yanit(() => {
    const g = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const kullanici = oturumAc(g.token);
    if (kullanici.hata) return kullanici;
    const islem = {
      oturum: () => ({ kullanici, takimlar: AYAR.TAKIMLAR.map(t => t.ad), turler: AYAR.OGRENIM_TURLERI.map(t => t.ad) }),
      basvurular: () => basvuruListesi(kullanici),
      basvuru: () => basvuruDetayi(kullanici, g.kod),
      gruplar: () => grupListesi(kullanici),
      veri: () => Object.assign(basvuruListesi(kullanici), grupListesi(kullanici)), // panel tek istekte yüklensin
      planOnizle: () => planOnizle(kullanici, g.grup, g.plan),
      planKaydet: () => kilitle(() => planKaydet(kullanici, g.grup, g.plan)),
      planOnayla: () => kilitle(() => planOnayla(kullanici, g.grup)),
      planReddet: () => kilitle(() => planReddet(kullanici, g.grup, g.not)),
      grupOlustur: () => kilitle(() => kalanlardanGrup(kullanici, g.takim, g.tur)),
      giris: () => kilitle(() => girisYap(kullanici, g.kod)),
      sonucKaydet: () => kilitle(() => sonucKaydet(kullanici, g.kod, g.takim, g.sonuc)),
      geldi: () => kilitle(() => geldiKaydet(kullanici, g.kod, g.takim, g.geldi)),
      sonucOnayaGonder: () => kilitle(() => sonuclariOnayaGonder(kullanici, g.takim)),
      sonucOnayla: () => kilitle(() => sonuclariOnayla(kullanici, g.takim)),
      sonucReddet: () => kilitle(() => sonuclariReddet(kullanici, g.takim)),
    }[g.islem];
    return islem ? islem() : { hata: 'Geçersiz istek' };
  });
}

function yanit(is) {
  let sonuc;
  try {
    sonuc = is();
  } catch (hata) {
    console.error(hata);
    sonuc = { hata: 'Şu an işlem yapılamıyor. Biraz sonra tekrar deneyin.' };
  }
  return ContentService.createTextOutput(JSON.stringify(sonuc)).setMimeType(ContentService.MimeType.JSON);
}

// Google ile girişte gelen kimlik anahtarını doğrular, kişinin yetkili listesinde olup olmadığına bakar
function oturumAc(token) {
  if (!AYAR.GOOGLE_CLIENT_ID) return { hata: 'Panel henüz kurulmadı (GOOGLE_CLIENT_ID boş).' };
  if (!token) return { hata: 'Oturum açılmamış.', oturum: false };
  const onbellek = CacheService.getScriptCache();
  const anahtar = 'tk_' + Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, token));
  let email = onbellek.get(anahtar);
  if (!email) {
    const cevap = UrlFetchApp.fetch('https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(token),
      { muteHttpExceptions: true });
    if (cevap.getResponseCode() !== 200) return { hata: 'Oturum süresi doldu. Tekrar giriş yapın.', oturum: false };
    const bilgi = JSON.parse(cevap.getContentText());
    const gecerli = bilgi.aud === AYAR.GOOGLE_CLIENT_ID && String(bilgi.email_verified) === 'true' &&
      /accounts\.google\.com$/.test(bilgi.iss) && Number(bilgi.exp) * 1000 > Date.now();
    if (!gecerli) return { hata: 'Oturum doğrulanamadı. Tekrar giriş yapın.', oturum: false };
    email = String(bilgi.email).toLowerCase();
    const kalan = Math.max(60, Math.min(600, Math.floor(Number(bilgi.exp) - Date.now() / 1000)));
    onbellek.put(anahtar, email, kalan);
  }
  const kisi = yetkiliBul(email);
  if (!kisi) return { hata: email + ' adresinin panele erişim yetkisi yok. Yöneticiden "Yetkililer" listesine eklenmeyi isteyin.' };
  return kisi;
}

function yetkiliBul(email) {
  const e = String(email).toLowerCase().trim();
  const kok = yoneticiMail().toLowerCase();
  const satir = yetkiliSayfasi().getDataRange().getValues().slice(1)
    .find(r => String(r[Y.EPOSTA]).toLowerCase().trim() === e);
  if (!satir && e !== kok) return null;
  const rol = e === kok || (satir && String(satir[Y.ROL]).trim() === ROL.YONETICI) ? ROL.YONETICI : ROL.KAPTAN;
  const takimlar = rol === ROL.YONETICI ? AYAR.TAKIMLAR.map(t => t.ad)
    : String(satir[Y.TAKIMLAR]).split(/\s*,\s*/).map(t => t.trim()).filter(t => AYAR.TAKIMLAR.some(x => x.ad === t));
  return { email: e, ad: satir ? String(satir[Y.AD]) || e : 'Yönetim', rol, takimlar };
}

function yetkiliMi(kullanici, takim) {
  return kullanici.rol === ROL.YONETICI || kullanici.takimlar.indexOf(takim) !== -1;
}

function takimYetkilileri(takim) {
  return yetkiliSayfasi().getDataRange().getValues().slice(1)
    .filter(r => String(r[Y.EPOSTA]).includes('@') && String(r[Y.TAKIMLAR]).split(/\s*,\s*/).indexOf(takim) !== -1)
    .map(r => String(r[Y.EPOSTA]).trim());
}

// ---------------------------------------------------------------- Panel verileri

function basvuruListesi(kullanici) {
  const sayfa = yanitSayfasi();
  const s = sutunlar(sayfa);
  const mulakatlar = {};
  mulakatVerisi().forEach(r => {
    if (!yetkiliMi(kullanici, r[M.TAKIM])) return;
    (mulakatlar[r[M.KOD]] = mulakatlar[r[M.KOD]] || []).push({
      takim: r[M.TAKIM], grup: r[M.GRUP], zaman: r[M.ZAMAN] instanceof Date ? r[M.ZAMAN].toISOString() : '',
      mail: !!r[M.MAIL], geldi: r[M.GELDI] === true, sonuc: r[M.SONUC], sonucDurum: r[M.SONUC_DURUM], yer: String(r[M.YER] || ''),
    });
  });
  const veri = sayfa.getDataRange().getValues().slice(1);
  const liste = [];
  veri.forEach(d => {
    const kod = String(d[s.kod - 1]).trim();
    if (!kod || !mulakatlar[kod]) return;
    liste.push({
      kod, ad: adSoyad(d, s), tur: ogrenimTuru(d, s) || '-',
      bolum: s.bolum ? String(d[s.bolum - 1]) : '', sinif: s.sinif ? String(d[s.sinif - 1]) : '',
      tarih: d[0] instanceof Date ? d[0].toISOString() : '', takimlar: secilenTakimlar(d, s),
      eposta: String(d[s.eposta - 1]).trim(), telefon: s.telefon ? String(d[s.telefon - 1]).trim() : '',
      mulakatlar: mulakatlar[kod],
    });
  });
  return { liste };
}

// Başvurunun formdaki bütün cevapları (sadece adayın takımlarından birine yetkisi olan görebilir)
function basvuruDetayi(kullanici, hamKod) {
  const kod = kodTemizle(hamKod);
  const sayfa = yanitSayfasi();
  const s = sutunlar(sayfa);
  const veri = sayfa.getDataRange().getValues();
  const basliklar = veri[0].map(String);
  const d = veri.slice(1).find(r => String(r[s.kod - 1]).trim() === kod);
  if (!d) return { hata: 'Başvuru bulunamadı.' };
  if (!secilenTakimlar(d, s).some(t => yetkiliMi(kullanici, t))) return { hata: 'Bu başvuruyu görme yetkiniz yok.' };
  const gizli = Object.values(DURUM_SUTUNLARI).concat(['Grup No', 'Mülakat Zamanı', 'Mülakat Maili', 'Hatırlatma']);
  const cevaplar = [];
  basliklar.forEach((b, i) => {
    if (!b || gizli.indexOf(b) !== -1 || /hangi yarışma/i.test(b)) return;
    let v = d[i];
    if (v instanceof Date) v = Utilities.formatDate(v, AYAR.SAAT_DILIMI, 'dd.MM.yyyy HH:mm');
    v = String(v).trim();
    if (v) cevaplar.push({ soru: b.replace(/:\s*$/, ''), cevap: v });
  });
  return { kod, ad: adSoyad(d, s), cevaplar };
}

function grupListesi(kullanici) {
  const adaylar = {};
  mulakatVerisi().forEach(r => {
    if (r[M.GRUP] === '') return;
    const g = adaylar[r[M.GRUP]] = adaylar[r[M.GRUP]] || { gelen: 0, mail: 0 };
    if (r[M.GELDI] === true) g.gelen++;
    if (r[M.MAIL]) g.mail++;
  });
  const gruplar = grupSayfasi().getDataRange().getDisplayValues().slice(1)
    .filter(g => yetkiliMi(kullanici, g[G.TAKIM]))
    .map(g => ({
      no: g[G.NO], takim: g[G.TAKIM], tur: g[G.TUR], aday: Number(g[G.ADAY]), olusturma: g[G.OLUSTURMA],
      tarih: g[G.TARIH], baslangic: g[G.BASLANGIC], bitis: g[G.BITIS], aralik: g[G.ARALIK], ogle: g[G.OGLE],
      yer: g[G.YER], konum: g[G.KONUM], durum: g[G.DURUM], hazirlayan: g[G.HAZIRLAYAN].replace(/\s*<.*>/, ''),
      onaylayan: g[G.ONAYLAYAN], not: g[G.NOT], gelen: (adaylar[g[G.NO]] || {}).gelen || 0, mail: (adaylar[g[G.NO]] || {}).mail || 0,
      plan: planJson(g[G.PLAN]),
    }));
  const bekleyen = {};
  mulakatVerisi().forEach(r => {
    if (r[M.GRUP] !== '' || !yetkiliMi(kullanici, r[M.TAKIM])) return;
    const k = r[M.TAKIM] + '|' + r[M.TUR];
    bekleyen[k] = (bekleyen[k] || 0) + 1;
  });
  return {
    gruplar,
    grupsuz: Object.keys(bekleyen).map(k => ({ takim: k.split('|')[0], tur: k.split('|')[1], aday: bekleyen[k] })),
    grupBoyutu: AYAR.GRUP_BOYUTU,
  };
}

function planOnizle(kullanici, grupNo, plan) {
  const grup = grupBul(grupNo);
  if (!grup || !yetkiliMi(kullanici, grup.deger[G.TAKIM])) return { hata: 'Grup bulunamadı.' };
  const h = planHesapla(grupNo, plan);
  if (h.hata) return h;
  return {
    ilk: h.ilk, son: h.son, aday: h.atamalar.length, uyarilar: h.uyarilar,
    liste: h.atamalar.map(a => ({ ad: a.x.r[M.AD], tarih: uzunTarih(a.tarih), saat: dakikaYazi(a.dakika), yer: a.yer })),
  };
}

// ---------------------------------------------------------------- Herkese açık sorgulama

function kodTemizle(kod) {
  const temiz = String(kod || '').toUpperCase().replace(/[^A-Z0-9]/g, '').replace(/^QT/, '');
  return /^[A-Z0-9]{6}$/.test(temiz) ? 'QT-' + temiz : '';
}

// Kodu bilen kişiye sadece kendi başvurusunun durumunu, adını ve mülakat bilgilerini döndürür
function durumSorgula(hamKod) {
  const kod = kodTemizle(hamKod);
  if (!kod) return { durum: 'yok' };
  const sayfa = yanitSayfasi();
  const s = sutunlar(sayfa);
  const d = sayfa.getDataRange().getValues().slice(1).find(r => String(r[s.kod - 1]).trim() === kod);
  if (!d) return { durum: 'yok' };

  const ayrinti = mulakatAyrintisi();
  const mulakatlar = mulakatVerisi().filter(r => r[M.KOD] === kod).map(r => {
    const m = { takim: r[M.TAKIM], durum: 'bekliyor' };
    const zaman = r[M.ZAMAN];
    if (zaman instanceof Date && r[M.MAIL]) {
      m.durum = r[M.GELDI] === true ? 'geldi' : 'planlandi';
      m.tarih = uzunTarih(tarihParca(zaman));
      m.saat = Utilities.formatDate(zaman, AYAR.SAAT_DILIMI, 'HH:mm');
      m.yer = r[M.YER];
      const a = ayrinti(r[M.GRUP], kod);
      m.konum = a.konum;
      m.takvim = takvimLinki(zaman, a.sure, r[M.YER], r[M.TAKIM]);
    }
    if (r[M.SONUC_DURUM] === DURUM.GONDERILDI) {
      m.durum = 'sonuc';
      m.sonuc = r[M.SONUC];
    }
    return m;
  });
  return { durum: 'var', ad: adSoyad(d, s).split(' ')[0] || '', mulakatlar };
}

// ================================================================ Test

function testMailleriGonder() {
  const kime = yoneticiMail();
  const yarin = new Date(Date.now() + 24 * 3600 * 1000);
  const slot = { tarih: tarihParca(yarin), dakika: 10 * 60 + 20 };
  const p = { yer: 'Mühendislik Fakültesi B Blok, Z-12', konum: 'https://maps.google.com', sure: 10, takim: 'Roket' };
  const zaman = slotZamani(slot);
  const kod = 'QT-ORN3K7';
  const ek = { takim: 'Roket' };

  mailGonder(kime, METIN.ONAY, 'Örnek Aday', {
    kutu: [['Başvuru kodu', kod], ['Takımlar', 'Roket, Jet Motoru Tasarımı']],
    butonlar: AYAR.DURUM_SAYFASI ? [{ yazi: 'Başvurumu takip et', link: durumLinki(kod) }] : [],
  }, '[ÖRNEK] ');
  const bilgi = mulakatBilgisi(slot, zaman, p, kod);
  mailGonder(kime, METIN.MULAKAT, 'Örnek Aday', bilgi, '[ÖRNEK] ', ek);
  mailGonder(kime, METIN.HATIRLATMA, 'Örnek Aday', { kutu: bilgi.kutu, butonlar: bilgi.butonlar.slice(1, 2) }, '[ÖRNEK] ', ek);
  mailGonder(kime, METIN.KABUL, 'Örnek Aday', {}, '[ÖRNEK] ', ek);
  bildir('Dört örnek mail ' + kime + ' adresine gönderildi: onay, mülakat, hatırlatma ve kabul.');
}

// ================================================================ Mail şablonu

function mailGonder(kime, sablon, ad, bilgi, konuOnEki, alanlar) {
  const doldur = metin => yerlestir(metin, alanlar);
  const icerik = {
    baslik: doldur(sablon.baslik),
    selam: ad ? 'Merhaba ' + ad + ',' : 'Merhaba,',
    paragraflar: sablon.paragraflar.map(doldur),
    kutu: bilgi.kutu || [],
    sonParagraflar: (sablon.sonParagraflar || []).map(doldur),
    butonlar: bilgi.butonlar || [],
  };
  const secenek = {
    to: kime,
    subject: (konuOnEki || '') + doldur(sablon.konu) + ' | ' + AYAR.GONDEREN_ADI,
    body: mailDuzMetin(icerik),
    htmlBody: mailHtml(icerik),
    name: AYAR.GONDEREN_ADI,
  };
  if (bilgi.ekler) secenek.attachments = bilgi.ekler;
  MailApp.sendEmail(secenek);
}

function yerlestir(metin, alanlar) {
  const a = Object.assign({ kulup: AYAR.KULUP_ADI }, alanlar || {});
  return metin.replace(/\{(\w+)\}/g, (m, k) => (k in a ? a[k] : m));
}

function mailHtml(c) {
  const renk = AYAR.ANA_RENK;
  const p = t => '<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#2b2b3a">' + esc(t) + '</p>';
  const kutu = c.kutu.length
    ? '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" ' +
      'style="margin:4px 0 20px;background:#f4f2ff;border-radius:10px;border-left:4px solid ' + renk + '">' +
      c.kutu.map(([k, v]) =>
        '<tr><td style="padding:10px 16px;font-size:13px;color:#6b6880;width:90px">' + esc(k) + '</td>' +
        '<td style="padding:10px 16px;font-size:16px;font-weight:bold;color:#1c1a2e">' + esc(v) + '</td></tr>'
      ).join('') + '</table>'
    : '';
  const butonlar = c.butonlar.length
    ? '<p style="margin:0 0 20px">' + c.butonlar.map(b =>
        '<a href="' + esc(b.link) + '" style="display:inline-block;margin:0 8px 8px 0;padding:11px 20px;' +
        'border-radius:8px;font-size:14px;font-weight:bold;text-decoration:none;' +
        (b.ikincil ? 'background:#ffffff;color:' + renk + ';border:1px solid ' + renk
          : 'background:' + renk + ';color:#ffffff;border:1px solid ' + renk) + '">' + esc(b.yazi) + '</a>'
      ).join('') + '</p>'
    : '';

  return '<!DOCTYPE html><html><body style="margin:0;padding:0;background:#eeedf5">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eeedf5">' +
    '<tr><td align="center" style="padding:24px 12px">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" ' +
    'style="max-width:560px;background:#ffffff;border-radius:14px;overflow:hidden;' +
    'font-family:Segoe UI,Helvetica,Arial,sans-serif">' +
    '<tr><td style="background:' + renk + ';padding:22px 28px">' +
    '<div style="font-size:12px;letter-spacing:2px;color:#d9d2ff;text-transform:uppercase">' +
    esc(AYAR.GONDEREN_ADI) + '</div>' +
    '<div style="font-size:22px;font-weight:bold;color:#ffffff;margin-top:6px">' + esc(c.baslik) + '</div>' +
    '</td></tr>' +
    '<tr><td style="padding:26px 28px 10px">' +
    p(c.selam) + c.paragraflar.map(p).join('') + kutu + butonlar + c.sonParagraflar.map(p).join('') +
    '</td></tr>' +
    '<tr><td style="padding:16px 28px 22px;border-top:1px solid #eeedf5;font-size:12px;color:#8a879c">' +
    esc(AYAR.KULUP_ADI) + '<br><a href="' + esc(AYAR.WEB_SITESI) + '" style="color:' + renk + '">' +
    esc(AYAR.WEB_SITESI.replace(/^https?:\/\//, '')) + '</a>' +
    '</td></tr></table></td></tr></table></body></html>';
}

function mailDuzMetin(c) {
  const satirlar = [c.selam, ''].concat(c.paragraflar.map(t => t + '\n'));
  c.kutu.forEach(([k, v]) => satirlar.push(k + ': ' + v));
  if (c.kutu.length) satirlar.push('');
  c.butonlar.forEach(b => satirlar.push(b.yazi + ': ' + b.link));
  if (c.butonlar.length) satirlar.push('');
  c.sonParagraflar.forEach(t => satirlar.push(t + '\n'));
  satirlar.push(AYAR.KULUP_ADI, AYAR.WEB_SITESI);
  return satirlar.join('\n');
}

function icsDosyasi(bas, bitis, yer, takim) {
  const kacis = t => String(t).replace(/\\/g, '\\\\').replace(/([,;])/g, '\\$1').replace(/\n/g, '\\n');
  const metin = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Quantum Team//Mulakat//TR', 'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    'UID:' + Utilities.getUuid() + '@quantumteam.com.tr',
    'DTSTAMP:' + utc(new Date()),
    'DTSTART:' + utc(bas),
    'DTEND:' + utc(bitis),
    'SUMMARY:' + kacis(AYAR.GONDEREN_ADI + ' ' + (takim ? takim + ' ' : '') + 'Mülakatı'),
    'LOCATION:' + kacis(yer),
    'DESCRIPTION:' + kacis(AYAR.KULUP_ADI + ' mülakatı'),
    'BEGIN:VALARM', 'TRIGGER:-PT1H', 'ACTION:DISPLAY', 'DESCRIPTION:Mülakat hatırlatması', 'END:VALARM',
    'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n');
  return Utilities.newBlob(metin, 'text/calendar', 'mulakat.ics');
}

function esc(t) {
  return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ================================================================ Sayfalar ve sütunlar

function yanitSayfasi() {
  const ss = SpreadsheetApp.getActive();
  if (AYAR.YANIT_SAYFASI) {
    const sayfa = ss.getSheetByName(AYAR.YANIT_SAYFASI);
    if (!sayfa) throw new Error('"' + AYAR.YANIT_SAYFASI + '" adlı sayfa bulunamadı.');
    return sayfa;
  }
  const sayfa = ss.getSheets().find(sh => sh.getFormUrl());
  if (!sayfa) throw new Error('Forma bağlı yanıt sayfası bulunamadı. AYAR.YANIT_SAYFASI değerini doldurun.');
  return sayfa;
}

function sayfaHazirla(ad, basliklar, ayar) {
  const ss = SpreadsheetApp.getActive();
  let sayfa = ss.getSheetByName(ad);
  if (!sayfa) {
    sayfa = ss.insertSheet(ad);
    sayfa.getRange(1, 1, 1, basliklar.length).setValues([basliklar]).setFontWeight('bold').setBackground('#ece8ff');
    sayfa.setFrozenRows(1);
    if (ayar) ayar(sayfa);
  }
  return sayfa;
}

function grupSayfasi() {
  const gs = sayfaHazirla(SAYFA.GRUP, GRUP_BASLIKLARI, gs => {
    gs.getRange(1, G.TARIH + 1, gs.getMaxRows(), 5).setNumberFormat('@'); // tarih ve saatler düz metin kalsın
    gs.setColumnWidth(G.TAKIM + 1, 170);
    gs.setColumnWidth(G.TARIH + 1, 200);
    gs.setColumnWidth(G.YER + 1, 240);
  });
  // Sonradan eklenen sütunlar eski sayfalara da eklensin
  const son = GRUP_BASLIKLARI.length;
  if (gs.getRange(1, son).getValue() !== GRUP_BASLIKLARI[son - 1]) {
    gs.getRange(1, son).setValue(GRUP_BASLIKLARI[son - 1]).setFontWeight('bold').setBackground('#ece8ff');
    gs.getRange(1, son, gs.getMaxRows(), 1).setNumberFormat('@');
  }
  return gs;
}

function mulakatSayfasi() {
  return sayfaHazirla(SAYFA.MULAKAT, MULAKAT_BASLIKLARI, ms => {
    ms.getRange(1, M.ZAMAN + 1, ms.getMaxRows(), 1).setNumberFormat('dd.mm.yyyy hh:mm');
    ms.setColumnWidth(M.AD + 1, 180);
    ms.setColumnWidth(M.EPOSTA + 1, 220);
    ms.setColumnWidth(M.TAKIM + 1, 170);
  });
}

function yetkiliSayfasi() {
  return sayfaHazirla(SAYFA.YETKILI, YETKILI_BASLIKLARI, ys => {
    ys.getRange(2, 1, 5, 4).setValues([
      [yoneticiMail(), 'Yönetim', ROL.YONETICI, 'Tümü'],
      ['', 'Ad Soyad', ROL.KAPTAN, 'Elektromobil'],
      ['', 'Ad Soyad', ROL.KAPTAN, 'Roket'],
      ['', 'Ad Soyad', ROL.KAPTAN, 'Blokzincir'],
      ['', 'Ad Soyad', ROL.KAPTAN, 'İnsansız Hava Araçları'],
    ]);
    ys.getRange(1, 1).setNote('Kaptanın Google (Gmail) adresi. Panele bu hesapla giriş yapacak.');
    ys.getRange(1, 3).setNote('Yönetici ya da Kaptan. Yönetici bütün takımları görür ve planları onaylar.');
    ys.getRange(1, 4).setNote('Virgülle ayrılmış takım adları. Takım adları: ' + AYAR.TAKIMLAR.map(t => t.ad).join(', '));
    ys.setColumnWidth(1, 260);
    ys.setColumnWidth(2, 180);
    ys.setColumnWidth(4, 260);
  });
}

function mulakatVerisi() {
  const ms = mulakatSayfasi();
  const son = ms.getLastRow();
  return son < 2 ? [] : ms.getRange(2, 1, son - 1, MULAKAT_BASLIKLARI.length).getValues();
}

function grupVerisi() {
  const gs = grupSayfasi();
  const son = gs.getLastRow();
  return son < 2 ? [] : gs.getRange(2, 1, son - 1, GRUP_BASLIKLARI.length).getDisplayValues();
}

function grupBul(no) {
  const veri = grupVerisi();
  const i = veri.findIndex(g => String(g[G.NO]) === String(no));
  return i === -1 ? null : { satir: i + 2, deger: veri[i] };
}

// Yanıt sayfasına durum sütunlarını ekler ve sütun numaralarını (1'den başlayan) döndürür
function sutunlar(sayfa) {
  const basliklar = sayfa.getRange(1, 1, 1, sayfa.getLastColumn()).getValues()[0].map(String);
  const durumlar = Object.values(DURUM_SUTUNLARI);
  durumlar.forEach(b => {
    if (basliklar.indexOf(b) === -1) {
      sayfa.getRange(1, basliklar.length + 1).setValue(b); // görünümü tablo stiline bırakılır
      basliklar.push(b);
    }
  });
  const disarida = durumlar.concat(['Grup No', 'Mülakat Zamanı', 'Mülakat Maili', 'Hatırlatma']);
  const bul = (ayar, desen) => {
    if (ayar) {
      const i = basliklar.indexOf(ayar);
      if (i === -1) throw new Error('"' + ayar + '" başlıklı sütun bulunamadı.');
      return i + 1;
    }
    return basliklar.findIndex(b => desen.test(b.trim()) && disarida.indexOf(b) === -1) + 1; // yoksa 0
  };

  const eposta = bul(AYAR.EPOSTA_SUTUNU, /e-?posta|e-?mail|mail/i);
  if (!eposta) throw new Error('E-posta sütunu bulunamadı. AYAR.EPOSTA_SUTUNU değerini doldurun.');
  const ad = bul(AYAR.AD_SUTUNU, /ad[a-zçğıöşü]*\s*[-\/]?\s*soyad|[iİ]sim|name/i);
  return {
    eposta,
    ad,
    sadeceAd: ad ? 0 : bul('', /^ad(ı|ınız|iniz)?\s*[:?]?$/i),
    soyad: ad ? 0 : bul('', /^soyad(ı|ınız|iniz)?\s*[:?]?$/i),
    tur: bul(AYAR.OGRENIM_SUTUNU, /öğren[iıİI]m|öğret[iıİI]m/i),
    takim: bul(AYAR.TAKIM_SUTUNU, /hangi takım/i),
    bolum: bul('', /bölüm/i),
    sinif: bul('', /sınıf/i),
    telefon: bul('', /telefon/i),
    onay: basliklar.indexOf(DURUM_SUTUNLARI.ONAY) + 1,
    kod: basliklar.indexOf(DURUM_SUTUNLARI.KOD) + 1,
  };
}

function adSoyad(deger, s) {
  const al = sutun => (sutun ? String(deger[sutun - 1]).trim() : '');
  const ad = s.ad ? al(s.ad) : [al(s.sadeceAd), al(s.soyad)].filter(Boolean).join(' ');
  // "ahmet YILMAZ" gibi yazılanları "Ahmet Yılmaz" yapar
  return ad.split(/\s+/).filter(Boolean)
    .map(k => k.charAt(0).toLocaleUpperCase('tr-TR') + k.slice(1).toLocaleLowerCase('tr-TR'))
    .join(' ');
}

// ================================================================ Tarih ve saat

// "15.10.2026", "15/10/2026" veya "2026-10-15" biçimini okur
function tarihOku(metin) {
  const t = String(metin).trim();
  let m = t.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/);
  let y, ay, g;
  if (m) {
    [g, ay, y] = [Number(m[1]), Number(m[2]), Number(m[3])];
  } else if ((m = t.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/))) {
    [y, ay, g] = [Number(m[1]), Number(m[2]), Number(m[3])];
  } else {
    return null;
  }
  const kontrol = new Date(Date.UTC(y, ay - 1, g));
  if (kontrol.getUTCMonth() !== ay - 1 || kontrol.getUTCDate() !== g) return null;
  return { y, m: ay, d: g };
}

// "10:30", "10.30" veya "10" biçimindeki saati gün içindeki dakikaya çevirir
function saatDakika(metin) {
  const m = String(metin).trim().match(/^(\d{1,2})(?:[:.](\d{2}))?$/);
  if (!m) return null;
  const sa = Number(m[1]);
  const dk = Number(m[2] || 0);
  if (sa > 23 || dk > 59) return null;
  return sa * 60 + dk;
}

function ogleOku(metin) {
  const parca = String(metin).split(/\s*[-–]\s*/);
  if (parca.length !== 2) return null;
  const bas = saatDakika(parca[0]);
  const bitis = saatDakika(parca[1]);
  return bas === null || bitis === null || bitis <= bas ? null : { bas, bitis };
}

function dakikaYazi(dakika) {
  const sa = Math.floor(dakika / 60) % 24;
  const dk = dakika % 60;
  return (sa < 10 ? '0' : '') + sa + ':' + (dk < 10 ? '0' : '') + dk;
}

// { y: 2026, m: 10, d: 15 } -> "15 Ekim 2026, Perşembe"
function uzunTarih(t) {
  const gun = (new Date(Date.UTC(t.y, t.m - 1, t.d)).getUTCDay() + 6) % 7; // Pazartesi = 0
  return t.d + ' ' + AYLAR[t.m - 1] + ' ' + t.y + ', ' + GUNLER[gun];
}

function tarihParca(zaman) {
  return {
    y: Number(Utilities.formatDate(zaman, AYAR.SAAT_DILIMI, 'yyyy')),
    m: Number(Utilities.formatDate(zaman, AYAR.SAAT_DILIMI, 'M')),
    d: Number(Utilities.formatDate(zaman, AYAR.SAAT_DILIMI, 'd')),
  };
}

function slotZamani(slot) {
  const iki = n => (n < 10 ? '0' : '') + n;
  const metin = slot.tarih.y + '-' + iki(slot.tarih.m) + '-' + iki(slot.tarih.d) + ' ' + dakikaYazi(slot.dakika);
  return Utilities.parseDate(metin, AYAR.SAAT_DILIMI, 'yyyy-MM-dd HH:mm');
}

function utc(tarih) {
  return Utilities.formatDate(tarih, 'UTC', "yyyyMMdd'T'HHmmss'Z'");
}

// ================================================================ Diğer

// Menüden çalışınca pencere açar, Apps Script düzenleyicisinden çalışınca günlüğe yazar
function bildir(mesaj) {
  try {
    SpreadsheetApp.getUi().alert(mesaj);
  } catch (e) {
    Logger.log(mesaj);
  }
}

function yoneticiMail() {
  return (AYAR.YONETICI_MAIL || Session.getEffectiveUser().getEmail()).toLowerCase();
}

function kotaYok() {
  return MailApp.getRemainingDailyQuota() < 1;
}
