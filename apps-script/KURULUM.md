# Quantum Team Başvuru ve Mülakat Sistemi (Sürüm 2) – Kurulum ve Kullanım

Sistem Google Form, Google E-Tablo, Apps Script ve sitedeki kaptan panelinden oluşur. Hepsi ücretsizdir.

## Ne yapar?

1. Aday formda **en fazla 2 takım** seçer. Form gönderilince adaya **başvuru kodlu** (ör. `QT-7KD2MX`) onay maili gider.
2. Seçtiği her takım için **"Mülakatlar"** sayfasına ayrı bir satır açılır. **Her takımın mülakatı ayrıdır.**
3. Bir takımın aynı öğretim türündeki bekleyen adayı **50 kişi** olunca grup açılır. Takım kaptanına ve yönetime mail gider.
4. Kaptan **panelden** mülakat günü, saati ve yerini girer, önizler ve **onaya gönderir**.
5. **Ana hesap (erciyesquantumteam)** panelden onaylayınca her adaya kendi saatiyle mülakat maili gider.
   İkinci öğretim grupları 10:00, örgün öğretim grupları 17:00 başlangıçla hazır gelir. Saatler 10'ar dakika arayla dağıtılır.
6. Mülakattan yaklaşık **24 saat önce** hatırlatma gider.
7. Mülakat günü kaptan panelin **QR giriş** bölümünden adayın QR kodunu okutur. Aday "Geldi" olarak işaretlenir.
8. Kaptan sonuçları (**Kabul / Yedek / Ret**) girip onaya gönderir. Ana hesap onaylayınca sonuç mailleri gider.
9. Aday sitedeki **"Başvurumu sorgula"** sayfasından her takım için durumunu görür.

**Onay kuralı:** Mülakat ve sonuç mailleri, ana hesap onaylamadan hiçbir adaya gitmez.

## E-Tablo'daki sayfalar

| Sayfa | İçerik |
|---|---|
| Form Yanıtları 1 | Formun cevapları. Sona "Onay Maili" ve "Başvuru Kodu" sütunları eklenir. |
| Mülakatlar | Her aday-takım çifti için bir satır: grup, mülakat zamanı, geldi, sonuç |
| Gruplar | Mülakat grupları ve planları (tarih, saat, yer, durum, hazırlayan, onaylayan) |
| Yetkililer | Panele girebilecek kişiler. **Kaptanların Gmail adreslerini buraya yazın.** |

Sürüm 1'den kalan "Grup No, Mülakat Zamanı, Mülakat Maili, Hatırlatma" sütunları artık kullanılmıyor. İsterseniz silebilirsiniz.
**"Onay Maili" ve "Başvuru Kodu" sütunlarını silmeyin.**

## Kurulum

> Bütün adımları **kulübün Google hesabıyla** yapın. Mailler bu hesaptan gider.

### 1. Kodu yükleyin ve kurulumu çalıştırın
1. Yanıt tablosunda **Uzantılar > Apps Script**. `Kod.gs` içindeki her şeyi silip bu klasördeki `Kod.gs` dosyasını yapıştırın, **Kaydet**.
2. Fonksiyon listesinden **kurulum** seçip **Çalıştır**. Google yeni izinler isteyecek (formu düzenleme, dış bağlantı). **İzin ver** deyin.

### 2. Formu güncelleyin (bir kez)
E-Tablo'da **Mülakat > Formu güncelle (tek takım sorusu)**. Bu işlem:
- "Hangi takımlarda yer almak istersiniz?" sorusunu ekler (en fazla 2 seçim, zorunlu),
- eski "Hangi yarışma grubunda…" sorusunu ve iki yarışma bölümünü kaldırır.

### 3. Yetkilileri ekleyin
**Yetkililer** sayfasında kaptanların satırları hazır. Her kaptanın **Gmail adresini** ilk sütuna yazın.
- **Rol:** `Kaptan` sadece kendi takımını görür. `Yönetici` bütün takımları görür ve onay verir.
- **Takımlar:** virgülle birden fazla takım yazılabilir. Ör. `Jet Motoru Tasarımı, Su Altı Roketi`
- Kulüp hesabı (erciyesquantumteam) listede olmasa da her zaman yöneticidir.

### 4. Google ile giriş için istemci kimliği (bir kez, ücretsiz)
1. [console.cloud.google.com](https://console.cloud.google.com) adresine kulüp hesabıyla girin, yeni bir proje oluşturun (ör. "Quantum Panel").
2. **API'ler ve Hizmetler > OAuth izin ekranı**: Kullanıcı türü **Harici**, uygulama adı "Quantum Team Panel", destek e-postası kulüp maili. Kaydedin.
3. **Kimlik bilgileri > Kimlik bilgisi oluştur > OAuth istemci kimliği**: Uygulama türü **Web uygulaması**.
   **Yetkili JavaScript kaynakları**: sitenin adresi (ör. `https://quantumteam.com.tr`). Geçici adres kullanıyorsanız onu da ekleyin.
4. Oluşan **İstemci kimliğini** (`....apps.googleusercontent.com`) iki yere yazın:
   - `Kod.gs` içinde `AYAR.GOOGLE_CLIENT_ID`
   - sitedeki `icerik.js` içinde `panel.googleClientId`

### 5. Web uygulamasını yayınlayın
1. Apps Script'te **Dağıt > Yeni dağıtım > Web uygulaması**. **Çalıştıran: Ben**, **Erişimi olanlar: Herkes**. **Dağıt**.
2. Çıkan adresi sitedeki `icerik.js` içinde `api` alanına yazın.
3. Site yayına girince `Kod.gs` içinde `AYAR.DURUM_SAYFASI` ve `AYAR.PANEL_SAYFASI` alanlarını doldurun.

**Kodu değiştirdikten sonra** değişikliğin siteye yansıması için: **Dağıt > Dağıtımları yönet > Düzenle > Sürüm: Yeni sürüm > Dağıt**. Adres değişmez.

## Güvenlik

- Panel her istekte Google'ın verdiği kimlik anahtarını doğrular ve kişinin **Yetkililer** listesinde olup olmadığına bakar.
  Şifre tutulmaz. Listede olmayan kişi hiçbir veriyi göremez.
- Kaptan sadece kendi takımına başvuranları görür. Başvuru detayında formun bütün cevapları (telefon, LinkedIn vb.) görünür.
  Bu yüzden listeye sadece güvendiğiniz kişileri ekleyin.
- "Başvurumu sorgula" sayfası sadece doğru kodu bilen kişiye o kişinin adını ve mülakat bilgilerini gösterir.

## Panel kurulmadan önce

Panel (4. ve 5. adım) hazır olana kadar yönetici E-Tablo'dan da çalışabilir:
1. **Gruplar** sayfasında grubun satırına Tarih(ler), Başlangıç, Bitiş, Aralık ve Yer yazın.
2. **Mülakat > Mülakat planını onayla (panel yokken)** ile grup numarasını girin. Onay penceresinden sonra mailler gider.

## Bilinmesi gerekenler

- **Günlük mail sınırı:** Normal Gmail hesabı günde yaklaşık **100** mail gönderebilir. İki takım seçen aday iki mülakat maili alır.
  Sınır dolarsa onay mailleri ve hatırlatmalar saatlik kontrolde kendiliğinden gönderilir.
  Mülakat ve sonuç maillerinde yarım kalan grup için ertesi gün tekrar **Onayla** deyin. Mail almış adaylara tekrar gitmez.
- Giden mail geri alınamaz. Onaydan önce tarih ve yeri kontrol edin. Panel onaydan önce ilk ve son adayın saatini gösterir.
- Bir adaya onay maili gitmesini istemiyorsanız "Onay Maili" hücresine herhangi bir şey yazın (ör. `Beklemede`).

## Geliştirecek kişi için

- Ayarlar ve mail metinleri `Kod.gs` başındaki `AYAR` ve `METIN` bölümlerinde. Takım listesi `AYAR.TAKIMLAR`.
  Formdaki seçenek yazısı `secenek` alanıyla birebir aynı olmalı.
- Tetikleyiciler: `formGonderildi` (her form gönderiminde) ve `saatlikKontrol` (saatte bir).
- Web uygulaması: `doGet` herkese açık sorgulama, `doPost` panel. Panel arayüzü sitedeki `js/panel.js` dosyasında.
- `kurulum` tekrar çalıştırılırsa tetikleyiciler yeniden kurulur, veriler etkilenmez.
