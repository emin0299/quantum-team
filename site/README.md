# Quantum Team Web Sitesi

Sade HTML, CSS ve JavaScript ile yapıldı. Sunucu, veritabanı ya da eklenti yok.

## Sayfalar

| Sayfa | İçerik |
|---|---|
| `index.html` | Ana sayfa: takımlar, başarılar, birimler, kaptanlar, haberler, mezunlar, sponsorlar |
| `basvuru.html` | Başvuru adımları, hazırlık listesi, sık sorulan sorular, geri sayım |
| `test.html` | "Hangi takım sana uygun?" testi. Sonuç linki (`test.html?sonuc=...`) paylaşılabilir. |
| `durum.html` | Başvuru kodu ile her takım için durum sorgulama ve giriş QR kodu |
| `takim.html?t=roket` | Takım sayfaları. `t=` değeri `icerik.js` içindeki takımın `kod` alanıdır. |
| `haberler.html` | Tüm haberler |
| `sponsorluk.html` | Sponsorluk teklifi |
| `panel.html` | Kaptan paneli: Google ile giriş, başvurular, mülakat planı, QR giriş, sonuçlar (arama motorlarında görünmez) |
| `en/index.html` | İngilizce ana sayfa |

## Dosyalar

| Dosya | Ne işe yarar |
|---|---|
| `icerik.js` | **Sitedeki bütün metinler.** Güncelleme için çoğu zaman sadece bunu değiştirin. |
| `icerik-en.js` | İngilizce sayfanın metinleri |
| `css/stil.css` | Tasarım. Renkler en üstteki `:root` bölümünde. |
| `js/site.js` | Sayfaları `icerik.js` ile dolduran kod, ortak menü ve alt bilgi, ikonlar, test |
| `js/panel.js` | Kaptan paneli arayüzü. Yetki kontrolleri sunucuda (Apps Script) yapılır. |
| `img/` | Web için küçültülmüş görseller |
| `manifest.webmanifest`, `sw.js` | Sitenin telefona uygulama gibi kurulabilmesi için |

Menü ve alt bilgi her sayfada `js/site.js` içindeki `sablon()` fonksiyonundan gelir. Menüye link eklemek için orayı düzenleyin.

## Sık yapılan güncellemeler (`icerik.js`)

- **Başvuru dönemini kapatmak:** `basvuru.acik` değerini `false` yapın.
- **Geri sayım:** `basvuru.sonTarih` alanına `'2026-10-10T23:59'` gibi bir tarih yazın. Süre dolunca butonlar kendiliğinden kapanır.
- **Haber eklemek:** `haberler` listesine yeni bir blok ekleyin. En yeni tarih en üstte görünür.
- **Haberleri Google E-Tablo'dan yönetmek:** `tarih, baslik, ozet, gorsel, link` sütunlu bir tablo oluşturun,
  **Dosya > Paylaş > Web'de yayınla > CSV** ile linkini alıp `haberTablosu` alanına yazın. Böylece haber eklemek için koda dokunmak gerekmez.
- **Yeni başarı:** `basarilar` listesinin en üstüne ekleyin. `takim` alanı takım adıyla aynı olursa takım sayfasında da görünür.
- **Takım sayfası:** Her takımın `ozellikler` (teknik bilgiler) ve `galeri` (fotoğraflar) alanları var. Boş olanlar görünmez.
- **Kaptan değişikliği:** `kaptanlar` listesini düzenleyin. Yüz görünmüyorsa `odak` değerini değiştirin (`'50% 20%'` üst kısmı gösterir).
- **Mezun eklemek:** `mezunlar` listesine ekleyin. Liste boşken bölüm görünmez.
- **Sponsor eklemek:** Logoyu `img/` klasörüne koyun ve `sponsorlar` listesine ekleyin. Liste boşken bölüm görünmez.
- **Sponsorluk dosyası:** PDF'i site klasörüne koyun, adını `sponsorluk.dosya` alanına yazın. İndirme butonu kendiliğinden çıkar.
- **Test soruları:** `test.sorular` listesinde. Her cevap takımlara (`araba, roket, iha, blokzincir, jet, sualti`) ve birimlere puan verir.
  Sonuç ekranındaki takım "kişilikleri" `test.takimlar` içinde.
- **İngilizce metinler:** `icerik-en.js` dosyasında. Listelerin sırası `icerik.js` ile aynı olmalı.

Yazım kuralı: metinler tek tırnak `' '` içinde. Metnin içinde kesme işareti varsa önüne `\` koyun: `'Türkiye\'nin'`.

## Başvuru sorgulama ve kaptan paneli

`durum.html` ve `panel.html` sayfaları, başvuru tablosundaki Apps Script web uygulamasıyla konuşur.
Panelin Google ile giriş yapabilmesi için `panel.googleClientId` alanı da doldurulmalı.
Web uygulamasının adresini `icerik.js` içindeki `api` alanına yazın. Nasıl yayınlanacağı `Mülakat Otomasyonu/KURULUM.md` dosyasında anlatılıyor.
`api` boşken sorgulama sayfası "çok yakında" yazısı gösterir.

## Ziyaretçi istatistikleri

[Cloudflare Web Analytics](https://www.cloudflare.com/web-analytics/) ücretsizdir ve çerez kullanmaz, bu yüzden çerez uyarısı gerekmez.
Siteyi ekledikten sonra verilen `token` değerini `icerik.js` içindeki `analitik` alanına yazın.

## Görsel eklerken

Telefon fotoğrafları 5-10 MB olabilir, siteyi yavaşlatır. Yüklemeden önce en fazla 1600 piksel genişliğe küçültün.
[squoosh.app](https://squoosh.app) ücretsiz ve kolay bir araçtır. Kaptan fotoğrafları için dikey (4:5) kırpılmış bir fotoğraf en iyi sonucu verir.

## Bilgisayarda deneme

Klasörde bir terminal açıp şunu çalıştırın, sonra tarayıcıda `http://localhost:8080` adresine gidin:

```
python -m http.server 8080
```

Değişiklik görünmüyorsa tarayıcıda `Ctrl + Shift + R` ile sayfayı yenileyin.

## Yayındaki siteyi güncellemek (GoDaddy)

Site, GoDaddy'deki Yönetilebilir WordPress paketinin ana klasöründe duruyor.

1. GoDaddy > Hosting'im > quantumteam.com.tr > Ayarlar > Araçlar > **Dosya Tarayıcısı**.
2. Değişen dosyanın bulunduğu klasöre girin. Dosya yöneticisi var olan dosyanın üzerine yazmaz: eski dosyayı seçip **Yeniden Adlandır** ile adının sonuna `.eski` ekleyin, sonra **Yükle** ile yenisini yükleyin (tek seferde bir dosya).
3. Ayarlar > **Önbelleği Boşalt > Şimdi Temizle**. Yapmazsanız eski hali bir süre görünmeye devam edebilir.
4. `js`, `css` ya da `icerik.js` değiştiyse `sw.js` içindeki `ONBELLEK` adını da artırın (ör. `quantum-v9` → `quantum-v10`) ve onu da yükleyin.

Ana adreste (/) yeni sitenin görünmesini `wp-content/mu-plugins/quantum-site.php` sağlar. Bu dosya silinirse ana sayfada eski WordPress sitesi açılır.
