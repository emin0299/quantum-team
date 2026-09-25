/* Sitenin telefona uygulama olarak kurulabilmesi ve internet yokken de açılabilmesi için.
 * Önce internetten en güncel hali alınır, bağlantı yoksa kayıtlı kopya gösterilir.
 * Bu yüzden siteyi güncellediğinizde bu dosyada bir şey değiştirmeniz gerekmez. */

const ONBELLEK = 'quantum-v11';
const TEMEL = ['./', 'index.html', 'basvuru.html', 'test.html', 'durum.html', 'takim.html', 'haberler.html',
  'sponsorluk.html', 'panel.html', 'css/stil.css', 'js/site.js', 'js/panel.js', 'icerik.js',
  'img/logo-64.png', 'img/logo-192.png', 'img/kapak.jpg'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(ONBELLEK).then(c => c.addAll(TEMEL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(adlar => Promise.all(adlar.filter(a => a !== ONBELLEK).map(a => caches.delete(a))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const istek = e.request;
  const adres = new URL(istek.url);
  // Başka sitelere ve WordPress yönetimine (wp-admin, wp-login) karışılmaz
  if (istek.method !== 'GET' || adres.origin !== location.origin || adres.pathname.startsWith('/wp-')) return;
  // Tarayıcı önbelleğindeki eski dosya yerine her seferinde sunucuya "değişti mi?" diye sorulur.
  // Sayfalar da dahil: sunucu sayfaları 31 gün önbellekte tut diyor, güncellemeler hemen görünsün.
  e.respondWith(
    (istek.mode === 'navigate' ? fetch(istek.url, { cache: 'no-cache', redirect: 'manual' }) : fetch(istek, { cache: 'no-cache' }))
      .then(yanit => {
        // Yönlendirmeyi (ör. eski WordPress adresleri) tarayıcı kendisi izlesin, #bölüm kısmı da korunsun
        if (yanit.type === 'opaqueredirect' || yanit.redirected) return yanit;
        const kopya = yanit.clone();
        caches.open(ONBELLEK).then(c => c.put(istek, kopya));
        return yanit;
      })
      .catch(() => caches.match(istek).then(k => k || caches.match('index.html')))
  );
});
