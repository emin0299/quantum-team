# Quantum Team başvuru ve mülakat sistemi

Erciyes Üniversitesi **QUANTUM Yeni Nesil Teknoloji Kulübü (Quantum Team)** için geliştirilen web sitesi, başvuru otomasyonu ve kaptan paneli.
Canlı site: [quantumteam.com.tr](https://quantumteam.com.tr)

Sunucu, veritabanı ya da ücretli servis yok. Her şey ücretsiz Google araçları (Form, E-Tablo, Apps Script, Gmail) ve sade HTML/CSS/JS ile çalışıyor.

## Ne yapıyor?

**Aday için**
- Google Form ile başvuru, en fazla iki takım seçimi
- Başvurunun hemen ardından başvuru kodlu onay maili
- Kodla başvuru durumunu sitede takip etme, mülakat günü için QR kod
- Mülakat maili (takvim dosyası ekli), bir gün önce hatırlatma, sonuç maili
- "Hangi takım sana uygun?" testi ve paylaşılabilir sonuç kartı

**Kaptan ve yönetici için (Google hesabıyla giriş yapılan panel)**
- Takımın başvuruları, aşama ve tercih filtreleri
- Mülakat planı: istenen gün ve saatlere oturumlar, öğle arası, belli adayları seçip yerleştirme, başka takımla saat çakışması uyarısı
- Yönetici onayı olmadan adaylara mail gitmez
- Mülakat günü QR ile giriş, sonuç girme (Kabul / Yedek / Ret) ve onaya gönderme
- Bütün adayların tek tabloda raporu ve Excel'e aktarma
- Kaptan ve yöneticiye günde bir kez bekleyen işlerin özeti

## Nasıl çalışıyor?

```
Google Form ──► E-Tablo ──► Apps Script (Kod.gs)
                               │  onay, mülakat, hatırlatma, sonuç mailleri (Gmail)
                               │  web uygulaması: JSON API
                               ▼
                 Statik site (site/)  ◄── adayın durum sorgusu
                 Kaptan paneli        ◄── Google ile giriş, kimlik sunucuda doğrulanır
```

| Klasör | İçerik |
|---|---|
| `apps-script/` | `Kod.gs`: bütün arka uç (form tetikleyicisi, gruplama, plan, mailler, panel API'si). `KURULUM.md`: adım adım kurulum. |
| `site/` | Web sitesi ve kaptan paneli. Metinlerin hepsi `icerik.js` içinde. Ayrıntılar `site/README.md`'de. |
| `test/` | `Kod.gs`'i sahte Google servisleriyle bilgisayarda çalıştıran test sunucusu ve 33 adımlık API testi. |
| `wordpress/` | Site, WordPress barındırması üzerinde yayınlanıyorsa ana sayfayı ve eski adresleri yeni siteye yönlendiren küçük eklenti. |

## Kurulum

1. Başvuru formunun yanıt tablosunda **Uzantılar > Apps Script**'i açın, `apps-script/Kod.gs` içeriğini yapıştırın ve `kurulum` fonksiyonunu çalıştırın.
2. Panel girişi için Google Cloud'da bir OAuth istemcisi oluşturun, kimliği `Kod.gs` içindeki `GOOGLE_CLIENT_ID` ve `site/icerik.js` içindeki `panel.googleClientId` alanlarına yazın.
3. Apps Script'i web uygulaması olarak yayınlayın ("Ben" olarak çalıştır, erişim "Herkes"), adresini `site/icerik.js` içindeki `api` alanına yazın.
4. `site/` klasörünü herhangi bir statik barındırmaya yükleyin (GitHub Pages, Cloudflare Pages, paylaşımlı hosting).

Her adımın ayrıntısı `apps-script/KURULUM.md` dosyasında.

## Bilgisayarda denemek

Node.js yeterli, ek paket gerekmez:

```
node test/test-sunucusu.js
```

Sonra tarayıcıda `http://localhost:8090` açılır. Panel için `http://localhost:8090/panel.html?test=yonetim@ornek.com` (yönetici) ya da `?test=iha@ornek.com` (kaptan). Gönderilen mailler `http://localhost:8090/posta` sayfasında görünür, hiçbiri gerçekten gönderilmez. Sunucu açıkken ayrı bir terminalde `node test/api-testi.js` bütün akışı test eder.

## Geliştirme

Proje fikri, gereksinimleri ve kararları kulüp adına Muhammed Aktaş'a aittir. Kodun büyük bölümü [Claude](https://claude.com) (Anthropic) ile birlikte, yapay zekâ destekli olarak yazıldı ve her adımda test edildi.

## Lisans

[MIT](LICENSE). Kulüp adı ve logosu Quantum Team'e aittir ve lisansa dahil değildir.

Gizlilik için bu depodaki kişi adları ("Ad Soyad") ve insanların göründüğü fotoğraflar örneklerle değiştirilmiştir. Kendi kurulumunuzda `site/icerik.js` ve `site/img/` klasörünü doldurun.
