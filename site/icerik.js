/*
 * SİTENİN BÜTÜN METİNLERİ BU DOSYADA
 *
 * Siteyi güncellemek için çoğu zaman sadece bu dosyayı değiştirmeniz yeterli.
 * - Tırnak işaretlerinin ( ' ) arasındaki yazıları değiştirin.
 * - Satır sonlarındaki virgülleri silmeyin.
 * - Yeni fotoğrafları "img" klasörüne koyup dosya adını buraya yazın.
 * - Boş bırakılan listelerin ( [] ) bölümleri sitede görünmez.
 * Ayrıntılar için README.md dosyasına bakın.
 */

window.ICERIK = {
  kulup: {
    kisaAd: 'Quantum Team',
    tamAd: 'QUANTUM Yeni Nesil Teknoloji Kulübü',
    universite: 'Erciyes Üniversitesi',
    kurulus: 2015,
    eposta: 'erciyesquantumteam@gmail.com',
    adres: 'Erciyes Üniversitesi Mühendislik Fakültesi, Kayseri',
    haritaLinki: 'https://www.google.com/maps/search/?api=1&query=Erciyes+%C3%9Cniversitesi+M%C3%BChendislik+Fak%C3%BCltesi',
    instagram: 'https://www.instagram.com/eruquantumteam/',
    linkedin: 'https://tr.linkedin.com/company/eruquantumteam',
  },

  // Başvuru dönemi. "acik: false" yapılırsa sitedeki başvuru butonları "Başvurular kapalı" olur.
  basvuru: {
    acik: true,
    formLinki: 'https://forms.gle/283Z3wJMggMb7ind9',
    // Son başvuru zamanı. Örnek: '2026-10-10T23:59'. Doluysa sitede geri sayım görünür,
    // süre dolunca butonlar kendiliğinden "Başvurular kapalı" olur. Boş bırakılırsa geri sayım görünmez.
    sonTarih: '',
    not: 'Hazırlık ve 1. sınıf öğrencileri de başvurabilir. Tecrübe şartı yok.',
    // Formda en fazla kaç takım seçilebildiği (Kod.gs içindeki EN_FAZLA_TAKIM ile aynı olmalı)
    enFazlaTakim: 2,
  },

  // Başvuru sorgulama ve kaptan paneli için Apps Script web uygulamasının adresi.
  // Boşken "Başvurumu sorgula" sayfası "yakında" yazısı gösterir.
  api: '',

  // Kaptan paneli: Google Cloud'da oluşturulan OAuth istemci kimliği (Kod.gs içindeki GOOGLE_CLIENT_ID ile aynı)
  panel: {
    googleClientId: '',
  },

  // Cloudflare Web Analytics anahtarı (çerez kullanmaz). Boşsa istatistik tutulmaz.
  analitik: '',

  // Rakamlar şeridi (ana sayfa)
  rakamlar: [
    { deger: '2015', etiket: 'Kuruluş yılı' },
    { deger: '6', etiket: 'Yarışma alanı' },
    { deger: '2', etiket: 'Son iki yılda birincilik' },
    { deger: '4', etiket: 'Çalışma birimi' },
  ],

  hakkimizda: [
    'Quantum Team, 2015 yılında Erciyes Üniversitesi Mühendislik Fakültesi Endüstriyel Tasarım Mühendisliği ' +
      'bölümünde kuruldu. Türkiye\'nin en eski Teknofest takımlarından biriyiz.',
    'Gönüllülük esasıyla çalışıyoruz. Kâr amacı gütmeden akran eğitimleri ve bilgilendirme etkinlikleri ' +
      'düzenliyor, ulusal ve uluslararası proje yarışmalarına katılıyoruz.',
    'Amacımız üyelerimizin ilgi alanlarına uygun projelerle deneyim kazanmasını ve bu birikimi ' +
      'sonraki dönemlere aktarmasını sağlamak.',
  ],

  // Takımlar
  // - "kod": takım sayfasının adresi (takim.html?t=kod). Türkçe karakter ve boşluk kullanmayın.
  // - "gorsel" boş bırakılırsa kartta ikon gösterilir. İkonlar: araba, roket, iha, blokzincir, jet, sualti
  // - "ozellikler": takım sayfasındaki teknik bilgiler. Örnek: { ad: 'Menzil', deger: '80 km' }
  // - "galeri": takım sayfasındaki fotoğraflar
  takimlar: [
    {
      kod: 'elektromobil',
      ad: 'Elektromobil',
      ikon: 'araba',
      gorsel: 'img/takim-elektromobil.jpg',
      aciklama: 'Kendi elektrikli aracımızı tasarlıyor, üretiyor ve Uluslararası Elektrikli Araç Yarışları\'nda yarıştırıyoruz.',
      kategoriler: ['Uluslararası Elektrikli Araç Yarışları'],
      ozellikler: [],
      galeri: ['img/takim-elektromobil.jpg', 'img/basari-elektrikli-arac-2026.jpg'],
    },
    {
      kod: 'roket',
      ad: 'Roket',
      ikon: 'roket',
      gorsel: 'img/takim-roket.jpg',
      aciklama: 'Özgün hibrit yakıt motorlu roketler geliştiriyor, orta ve yüksek irtifa kategorilerinde yarışıyoruz.',
      kategoriler: ['Orta İrtifa', 'Yüksek İrtifa', 'IREC'],
      ozellikler: [],
      galeri: ['img/takim-roket.jpg'],
    },
    {
      kod: 'iha',
      ad: 'İnsansız Hava Araçları',
      ikon: 'iha',
      gorsel: 'img/takim-iha.jpg',
      aciklama: 'Sabit kanatlı ve dikey kalkışlı insansız hava araçları tasarlayıp uçuruyoruz.',
      kategoriler: ['Uluslararası İHA', 'Savaşan İHA', 'SUAS'],
      ozellikler: [],
      galeri: ['img/takim-iha.jpg', 'img/takim-iha-2025.jpg'],
    },
    {
      kod: 'blokzincir',
      ad: 'Blokzincir',
      ikon: 'blokzincir',
      gorsel: 'img/takim-blokzincir.jpg',
      aciklama: 'Blokzincir teknolojileriyle yazılım projeleri geliştiriyoruz. 2025\'te Teknofest birincisi olduk.',
      kategoriler: ['Teknofest Blokzincir Yarışması'],
      ozellikler: [],
      galeri: ['img/basari-blokzincir-2025.jpg'],
    },
    {
      kod: 'jet-motoru',
      ad: 'Jet Motoru Tasarımı',
      ikon: 'jet',
      gorsel: '',
      aciklama: 'Jet motoru tasarımı üzerine çalışıyor, tasarım yarışmalarına hazırlanıyoruz.',
      kategoriler: ['Jet Motoru Tasarım Yarışması'],
      ozellikler: [],
      galeri: [],
    },
    {
      kod: 'su-alti-roketi',
      ad: 'Su Altı Roketi',
      ikon: 'sualti',
      gorsel: '',
      aciklama: 'Su altında hareket eden roket sistemleri geliştiriyoruz.',
      kategoriler: ['Su Altı Roket Yarışması'],
      ozellikler: [],
      galeri: [],
    },
  ],

  // "takim" alanı yukarıdaki takım adlarından biri olmalı
  basarilar: [
    {
      yil: 2026,
      derece: 'Birincilik',
      baslik: 'Uluslararası Elektrikli Araç Yarışları',
      takim: 'Elektromobil',
      gorsel: 'img/basari-elektrikli-arac-2026.jpg',
    },
    {
      yil: 2025,
      derece: 'Birincilik',
      baslik: 'Teknofest Blokzincir Yarışması',
      takim: 'Blokzincir',
      gorsel: 'img/basari-blokzincir-2025.jpg',
    },
  ],

  // Takımlarda çalışılan birimler (başvuru formundaki seçeneklerle aynı)
  birimler: [
    { kod: 'mekanik', ad: 'Mekanik ve Tasarım', ikon: 'mekanik', aciklama: 'Gövde, şasi ve parça tasarımı, 3B modelleme, üretim' },
    { kod: 'elektronik', ad: 'Elektrik - Elektronik (Aviyonik)', ikon: 'elektronik', aciklama: 'Devre tasarımı, batarya, motor sürücü, uçuş elektroniği' },
    { kod: 'yazilim', ad: 'Yazılım', ikon: 'yazilim', aciklama: 'Gömülü yazılım, otonom sistemler, blokzincir ve web' },
    { kod: 'medya', ad: 'Medya ve İletişim', ikon: 'medya', aciklama: 'Sosyal medya, tasarım, fotoğraf ve sponsorluk iletişimi' },
  ],

  // "odak" fotoğrafın hangi kısmının görüneceğini belirler: 'yatay% dikey%'
  // "takim" alanı takım sayfasında kaptanı göstermek için kullanılır
  // Kulüp danışmanı. Ekip bölümünde kaptanların üstünde gösterilir. Boş bırakılırsa ("danisman: null") görünmez.
  danisman: { ad: 'Doç. Dr. Ad Soyad', gorev: 'Kulüp Danışmanı', gorsel: 'img/kisi-ornek.jpg', odak: '50% 25%' },

  kaptanlar: [
    { ad: 'Ad Soyad', gorev: 'Elektromobil Kaptanı', takim: 'Elektromobil', gorsel: 'img/kisi-ornek.jpg', odak: '50% 40%' },
    { ad: 'Ad Soyad', gorev: 'Roket Kaptanı', takim: 'Roket', gorsel: 'img/kisi-ornek.jpg', odak: '50% 30%' },
    { ad: 'Ad Soyad', gorev: 'Blokzincir Kaptanı', takim: 'Blokzincir', gorsel: 'img/kisi-ornek.jpg', odak: '55% 62%' },
    { ad: 'Ad Soyad', gorev: 'İHA Kaptanı', takim: 'İnsansız Hava Araçları', gorsel: 'img/kisi-ornek.jpg', odak: '50% 28%' },
  ],

  // Sayfanın köşesinde çıkan duyuru kartı. Ziyaretçi kapatınca bir daha görmez.
  // Yeni bir duyuru için "kimlik" değerini değiştirin (herkese yeniden görünür). Kaldırmak için: duyuru: null
  duyuru: {
    kimlik: 'site-yenilendi-2026-09',
    baslik: 'Web sitemiz yenilendi!',
    metin: 'Artık mülakat bilgileriniz ve mülakat yeriniz e-posta adresinize gönderiliyor. Durumunuzu size verdiğimiz kodla buradan takip edebilirsiniz.',
    link: 'durum.html',
    linkYazi: 'Başvurumu sorgula',
  },

  // Haberler ve duyurular. En yeni tarih en üstte gösterilir. "gorsel" ve "link" isteğe bağlı.
  // Tarih biçimi: 'YYYY-AA-GG'
  haberler: [
    {
      tarih: '2026-09-25',
      baslik: 'Quantum Team web sitesi yenilendi',
      ozet: 'İsmimize yakışır şekilde teknoloji odaklı ilerliyoruz. Artık mülakat bilgileriniz ve mülakat yeriniz e-posta adresinize gönderiliyor. ' +
        'Mülakat durumunuzu, size verdiğimiz başvuru koduyla web sitemiz üzerinden takip edebilirsiniz.',
      gorsel: 'img/paylasim.jpg',
      link: 'durum.html',
    },
    {
      tarih: '2026-09-24',
      baslik: '2026-2027 dönemi başvuruları açıldı',
      ozet: 'Yeni dönem üye alımımız başladı. Hazırlık ve 1. sınıf öğrencileri dahil herkesi bekliyoruz.',
      gorsel: 'img/takim-roket.jpg',
      link: 'basvuru.html',
    },
  ],
  // İsteğe bağlı: Haberleri bir Google E-Tablo'dan çekmek için tablonun "Web'de yayınla > CSV" linki.
  // Tablonun sütunları: tarih, baslik, ozet, gorsel, link. Doluysa yukarıdaki listeye eklenir.
  haberTablosu: '',

  // Eski üyelerimiz. Liste boşsa bölüm görünmez.
  // Örnek: { ad: 'Ad Soyad', donem: '2019-2023', takim: 'Roket', simdi: 'Makine Mühendisi, Firma Adı', linkedin: '' },
  mezunlar: [],

  // Sponsor logolarını "img" klasörüne koyup buraya ekleyin. Liste boşsa bölüm görünmez.
  // Örnek: { ad: 'Firma Adı', logo: 'img/sponsor-firma.png', link: 'https://firma.com' },
  sponsorlar: [],

  sponsorluk: {
    // Sponsorluk dosyası (PDF). "img" klasörüne değil, site klasörüne koyun. Örnek: 'quantum-sponsorluk.pdf'
    dosya: '',
    neden: [
      { baslik: 'Markanız yarışma alanında', aciklama: 'Logonuz Teknofest ve uluslararası yarışmalarda araçlarımızın, roketlerimizin ve İHA\'larımızın üzerinde yer alır.' },
      { baslik: 'Genç mühendislerle erken tanışma', aciklama: 'Proje üreten, takım çalışmasına alışkın öğrencilerle staj ve işe alım öncesinde tanışırsınız.' },
      { baslik: 'Sosyal sorumluluk', aciklama: 'Gönüllülükle yürüyen, kâr amacı gütmeyen bir öğrenci topluluğunun gelişimine katkı sağlarsınız.' },
      { baslik: 'Görünürlük', aciklama: 'Sosyal medya paylaşımlarımızda, web sitemizde ve etkinliklerimizde desteğinizden bahsederiz.' },
    ],
    gorunurluk: ['Araç, roket ve İHA gövdeleri', 'Takım kıyafetleri', 'Sosyal medya paylaşımları', 'Web sitesi sponsorlar bölümü', 'Yarışma sunumları ve raporlar', 'Kulüp etkinlikleri'],
    destekTurleri: [
      { baslik: 'Nakdi destek', aciklama: 'Malzeme, üretim ve yarışma giderleri için' },
      { baslik: 'Ürün ve malzeme', aciklama: 'Elektronik parça, batarya, kompozit, metal, yazılım lisansı gibi' },
      { baslik: 'Üretim imkânı', aciklama: 'CNC, lazer kesim, 3B baskı ya da atölye kullanımı' },
      { baslik: 'Eğitim ve mentorluk', aciklama: 'Mühendislerinizden teknik destek ve eğitim' },
    ],
  },

  // "Hangi takım sana uygun?" testi
  // Her cevap takımlara ve birimlere puan verir.
  // Takım puanları: araba, roket, iha, blokzincir, jet, sualti. Birim puanları: mekanik, elektronik, yazilim, medya
  test: {
    sorular: [
      {
        soru: 'Teknofest\'e 3 gün kaldı ve aracın motoru çalışmıyor. İlk ne yaparsın?',
        cevaplar: [
          { emoji: '🔧', yazi: 'Tornavidayı kapar, motoru söküp içine bakarım', puan: { mekanik: 3, araba: 1, jet: 1 } },
          { emoji: '⚡', yazi: 'Multimetreyi alır, kabloları tek tek ölçerim', puan: { elektronik: 3, araba: 1, iha: 1 } },
          { emoji: '💻', yazi: 'Motor sürücünün koduna bakarım, kesin bir bug var', puan: { yazilim: 3, blokzincir: 1 } },
          { emoji: '📸', yazi: 'Ekibe kahve söyler, bu anı hikâyede paylaşırım', puan: { medya: 3 } },
        ],
      },
      {
        soru: 'Bir süper gücün olsaydı hangisini seçerdin?',
        cevaplar: [
          { emoji: '🏎️', yazi: 'Işık hızında koşmak', puan: { araba: 3 } },
          { emoji: '🚀', yazi: 'Bir anda uzaya fırlamak', puan: { roket: 3 } },
          { emoji: '🦅', yazi: 'Kuş gibi süzülmek', puan: { iha: 3 } },
          { emoji: '🌊', yazi: 'Denizin dibinde nefes alabilmek', puan: { sualti: 3 } },
        ],
      },
      {
        soru: 'Hangi ses tüylerini diken diken eder?',
        cevaplar: [
          { emoji: '✈️', yazi: 'Kalkıştaki jet motorunun uğultusu', puan: { jet: 3, mekanik: 1 } },
          { emoji: '⏱️', yazi: 'Geri sayımın son saniyeleri: 3, 2, 1…', puan: { roket: 3 } },
          { emoji: '🔋', yazi: 'Elektrikli motorun o sessiz vınlaması', puan: { araba: 3, elektronik: 1 } },
          { emoji: '⌨️', yazi: 'Gece 3\'te klavye tıkırtısı', puan: { blokzincir: 2, yazilim: 2 } },
        ],
      },
      {
        soru: 'Instagram\'da kaydırırken seni ne durdurur?',
        cevaplar: [
          { emoji: '🛰️', yazi: 'Drone\'la çekilmiş manzara videoları', puan: { iha: 2, medya: 1 } },
          { emoji: '🪙', yazi: 'Kripto, yapay zekâ ve yeni teknolojiler', puan: { blokzincir: 3 } },
          { emoji: '🐋', yazi: 'Okyanus derinliklerinden görüntüler', puan: { sualti: 3 } },
          { emoji: '⚙️', yazi: '"Bu nasıl çalışıyor?" animasyonları', puan: { jet: 2, mekanik: 2 } },
        ],
      },
      {
        soru: 'Takıma yeni katıldın. İlk hafta hangi görevi kaparsın?',
        cevaplar: [
          { emoji: '📐', yazi: 'CAD\'de ilk parçamı çizmek', puan: { mekanik: 3 } },
          { emoji: '🔌', yazi: 'Lehim yapmayı öğrenmek', puan: { elektronik: 3 } },
          { emoji: '🐙', yazi: 'Takımın GitHub\'ına ilk commit\'imi atmak', puan: { yazilim: 3 } },
          { emoji: '🎬', yazi: 'Sponsorlar için tanıtım videosu kurgulamak', puan: { medya: 3 } },
        ],
      },
      {
        soru: 'Yarışma günü seni nerede buluruz?',
        cevaplar: [
          { emoji: '🏁', yazi: 'Pitte, tulumu giymiş, lastik basıncını kontrol ederken', puan: { araba: 3 } },
          { emoji: '🎯', yazi: 'Atış rampasında, rüzgârı ölçerken', puan: { roket: 3 } },
          { emoji: '🖥️', yazi: 'Yer istasyonunda, uçuşu ekrandan izlerken', puan: { iha: 3, yazilim: 1 } },
          { emoji: '🏊', yazi: 'Havuz başında, su geçirmezlik testinde', puan: { sualti: 3 } },
        ],
      },
      {
        soru: 'Arkadaşların seni en çok hangi cümleyle anlatır?',
        cevaplar: [
          { emoji: '🧩', yazi: '"Eline ne verirsen söker, sonra daha iyisini yapar"', puan: { mekanik: 2, jet: 2 } },
          { emoji: '🔐', yazi: '"Her sistemin açığını bulur"', puan: { blokzincir: 3, yazilim: 1 } },
          { emoji: '☁️', yazi: '"Aklı hep havada, gökyüzünde"', puan: { iha: 2, roket: 2 } },
          { emoji: '🎤', yazi: '"Herkesle konuşur, herkesi ikna eder"', puan: { medya: 3 } },
        ],
      },
    ],
    // Sonuç ekranındaki takım "kişilikleri"
    takimlar: {
      araba: { ad: 'Elektromobil', unvan: 'Pist Canavarı', aciklama: 'Hız, verim ve mühendislik bir arada. Kendi yaptığın aracı pistte görmek seni motive ediyor.' },
      roket: { ad: 'Roket', unvan: 'Geri Sayım Ustası', aciklama: 'Hesap, cesaret ve biraz da adrenalin. Geri sayım başladığında en heyecanlı sen olursun.' },
      iha: { ad: 'İnsansız Hava Araçları', unvan: 'Gökyüzü Pilotu', aciklama: 'Uçuşu kurgulamak, havada kalmayı hesaplamak ve otonom sistemler senin alanın.' },
      blokzincir: { ad: 'Blokzincir', unvan: 'Kod Mimarı', aciklama: 'Güvenli, şeffaf ve akıllı sistemler kurmayı seviyorsun. Terminal senin ikinci evin.' },
      jet: { ad: 'Jet Motoru Tasarımı', unvan: 'Türbin Fısıldayan', aciklama: 'Akışkanlar, termodinamik ve devasa itki. Bir motorun içinde neler olduğunu merak ediyorsun.' },
      sualti: { ad: 'Su Altı Roketi', unvan: 'Derinlik Kâşifi', aciklama: 'Suyun altında çalışan sistemler seni heyecanlandırıyor. Herkesin gitmediği yere gitmeyi seviyorsun.' },
    },
    birimler: {
      mekanik: 'Tasarlayan ve üreten eller',
      elektronik: 'Sistemin sinir ağı',
      yazilim: 'Sistemin beyni',
      medya: 'Takımın sesi',
    },
  },

  // Başvuru sayfasındaki sık sorulan sorular
  sss: [
    {
      soru: 'Hazırlık veya 1. sınıf öğrencisiyim. Başvurabilir miyim?',
      cevap: 'Evet. Başvuranların çoğu hazırlık ve 1. sınıf öğrencisi. Formda GANO sorusunu boş bırakabilirsin.',
    },
    {
      soru: 'Daha önce hiç proje yapmadım. Yine de başvurabilir miyim?',
      cevap: 'Evet. Tecrübe ve yetkinlik soruları "varsa" diye soruluyor. Takıma katılanlar çalışmaları sırasında öğreniyor. ' +
        'Mülakatta asıl merak ettiğimiz şey ilgin ve öğrenme isteğin.',
    },
    {
      soru: 'Mülakat ne zaman ve nerede olacak?',
      cevap: 'Başvurundan sonra önce başvuru kodunun yazdığı bir onay maili gelir. Her takımın mülakatı ayrı planlanır. ' +
        'Tarih, saat ve yer belli olunca her takım için sana ayrı bir e-posta gelir. Mülakattan bir gün önce de hatırlatma maili gönderilir.',
    },
    {
      soru: 'Başvurumun durumunu nasıl öğrenirim?',
      cevap: 'Onay mailinde sana özel bir başvuru kodu var. Bu kodla "Başvurumu sorgula" sayfasından başvurunun ' +
        'durumunu ve mülakat bilgilerini görebilirsin.',
    },
    {
      soru: 'Mülakat saati derslerimle çakışır mı?',
      cevap: 'Örgün öğretim öğrencilerinin mülakatları akşam saatlerinde, ikinci öğretim öğrencilerininki gündüz yapılır. ' +
        'Bu yüzden formda öğretim türünü doğru seç. Verilen saatte gelemeyeceksen gelen maili yanıtlayarak bize haber ver.',
    },
    {
      soru: 'Birden fazla takıma başvurabilir miyim?',
      cevap: 'Formda en fazla iki takım seçebilirsin. Her takımın mülakatı ayrı yapılır, yani iki takım seçersen iki ayrı ' +
        'mülakat daveti alırsın. Hangi takımın sana uygun olduğundan emin değilsen kısa testi çözebilirsin.',
    },
    {
      soru: 'Formu doldururken neden Google hesabıyla giriş yapmam gerekiyor?',
      cevap: 'Formda CV yükleme alanı var. Google, dosya yüklenen formlarda giriş yapılmasını zorunlu tutuyor. ' +
        'CV yüklemek isteğe bağlı.',
    },
    {
      soru: 'Referansım yok. Sorun olur mu?',
      cevap: 'Hayır. Referans alanını boş bırakabilirsin, olumsuz bir izlenim oluşturmaz.',
    },
    {
      soru: 'Onay maili gelmedi. Ne yapmalıyım?',
      cevap: 'Önce spam ve "Promosyonlar" klasörüne bak. Yine bulamazsan {eposta} adresine yaz.',
    },
  ],
};
