// Kod.gs'i sahte Google servisleriyle çalıştıran test sunucusu.
// http://localhost:8090 -> site, /api -> doGet/doPost, /mails -> gönderilen mailler, /sayfa?ad= -> tablo dökümü
const fs = require('fs'), vm = require('vm'), http = require('http'), path = require('path'), crypto = require('crypto');
const SITE = path.join(__dirname, '..', 'site');
const KOD = path.join(__dirname, '..', 'apps-script', 'Kod.gs');
const YONETICI = 'yonetim@ornek.com';

const mails = [];
let quota = 1000;
class Sheet {
  constructor(n, form) { this.n = n; this.d = []; this.form = form; }
  getName() { return this.n } getFormUrl() { return this.form ? 'x' : null }
  getLastRow() { return this.d.length }
  getLastColumn() { return Math.max(1, ...this.d.map(r => r.length)) }
  getMaxRows() { return 1000 }
  cell(r, c) { while (this.d.length < r) this.d.push([]); const row = this.d[r - 1]; while (row.length < c) row.push(''); return row }
  getRange(r, c, nr = 1, nc = 1) { if (typeof r === 'string') return new Rng(this, 1, 1, 1, 1); return new Rng(this, r, c, nr, nc) }
  getDataRange() { return new Rng(this, 1, 1, this.getLastRow(), this.getLastColumn()) }
  appendRow(v) { this.d.push(v.slice()) } setFrozenRows() {} setColumnWidth() {}
}
const goster = v => v instanceof Date ? v.toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' }).slice(0, 16) : String(v);
class Rng {
  constructor(s, r, c, nr, nc) { Object.assign(this, { s, r, c, nr, nc }) }
  getValues() { const o = []; for (let i = 0; i < this.nr; i++) { const row = this.s.d[this.r - 1 + i] || []; o.push([...Array(this.nc)].map((_, j) => row[this.c - 1 + j] === undefined ? '' : row[this.c - 1 + j])) } return o }
  getDisplayValues() { return this.getValues().map(r => r.map(v => v === '' ? '' : goster(v))) }
  getValue() { return this.getValues()[0][0] }
  setValue(v) { this.s.cell(this.r, this.c)[this.c - 1] = v; return this }
  setValues(vs) { vs.forEach((row, i) => row.forEach((v, j) => this.s.cell(this.r + i, this.c + j)[this.c + j - 1] = v)); return this }
  setNumberFormat() { return this } setFontWeight() { return this } setBackground() { return this } setNote() { return this } insertCheckboxes() { return this }
}
const sheets = [];
const ss = { getSheets: () => sheets, getSheetByName: n => sheets.find(s => s.n === n) || null, insertSheet: n => { const s = new Sheet(n); sheets.push(s); return s }, deleteSheet: s => sheets.splice(sheets.indexOf(s), 1), getUrl: () => 'https://docs.google.com/spreadsheets/d/TEST', getFormUrl: () => 'x', setSpreadsheetTimeZone() {} };
const yanit = new Sheet('Form Yanıtları 1', true);
yanit.d.push(['Zaman damgası', 'E-posta Adresi', 'Adınız soyadınız:', 'Telefon numaranız:', 'LinkedIn hesap linkiniz:', 'Okuduğunuz üniversite:', 'Bölümünüz:', 'Sınıfınız:', 'Hangi yarışma grubunda yer almak istersiniz?', 'Öğretim türünüz:', 'Kaldığınız yer:', 'Varsa yetkinlikleriniz(Yetkinlik seviyesi belirtiniz):', 'Çalışmak istediğiniz birim:', 'Bu ekibin size ne katmasını istersiniz? Beklentileriniz nelerdir?', 'Hangi takımlarda yer almak istersiniz?']);
sheets.push(yanit);

const TZ = 3 * 3600e3;
const fmt = (d, tz, f) => {
  const x = new Date(d.getTime() + (tz === 'UTC' ? 0 : TZ)); const p = n => String(n).padStart(2, '0');
  return f.replace("'T'", '§').replace("'Z'", '¤').replace('yyyy', x.getUTCFullYear()).replace('MM', p(x.getUTCMonth() + 1)).replace('dd', p(x.getUTCDate())).replace('HH', p(x.getUTCHours())).replace('mm', p(x.getUTCMinutes())).replace('ss', p(x.getUTCSeconds())).replace(/^M$/, x.getUTCMonth() + 1).replace(/^d$/, x.getUTCDate()).replace('§', 'T').replace('¤', 'Z');
};
const onbellek = new Map(), ozellik = {};
const ctx = {
  console,
  SpreadsheetApp: { getActive: () => ss, getUi: () => { throw new Error('ui yok') } },
  MailApp: { sendEmail: o => { quota--; mails.push({ ...o, zaman: new Date().toISOString(), attachments: undefined }) }, getRemainingDailyQuota: () => quota },
  Utilities: {
    formatDate: fmt, getUuid: () => crypto.randomUUID(), newBlob: (t, m, n) => ({ t, m, n }),
    parseDate: s => { const m = s.match(/(\d+)-(\d+)-(\d+) (\d+):(\d+)/); return new ctx.Date(Date.UTC(+m[1], m[2] - 1, +m[3], +m[4], +m[5]) - TZ) },
    computeDigest: (a, t) => [...crypto.createHash('sha256').update(t).digest()], base64EncodeWebSafe: b => Buffer.from(b).toString('base64url'), DigestAlgorithm: { SHA_256: 1 },
  },
  UrlFetchApp: { fetch: url => {
    const t = decodeURIComponent(url.split('id_token=')[1] || '');
    const ok = t.startsWith('test:');
    return { getResponseCode: () => ok ? 200 : 400, getContentText: () => JSON.stringify({ aud: 'test-client', email: t.slice(5), email_verified: 'true', iss: 'https://accounts.google.com', exp: String(Math.floor(Date.now() / 1000) + 3600) }) };
  } },
  CacheService: { getScriptCache: () => ({ get: k => onbellek.get(k) || null, put: (k, v) => onbellek.set(k, v) }) },
  PropertiesService: { getScriptProperties: () => ({ getProperty: k => ozellik[k] || null, setProperty: (k, v) => { ozellik[k] = v } }) },
  ContentService: { createTextOutput: t => ({ t, setMimeType() { return this } }), MimeType: { JSON: 'json' } },
  Session: { getEffectiveUser: () => ({ getEmail: () => YONETICI }) },
  LockService: { getScriptLock: () => ({ waitLock() {}, releaseLock() {} }) },
  ScriptApp: { getProjectTriggers: () => [], newTrigger: () => ({ forSpreadsheet() { return this }, onFormSubmit() { return this }, timeBased() { return this }, everyHours() { return this }, create() {} }) },
  Logger: { log: m => console.log('[log]', m) },
};
ctx.Date = Date;
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(KOD, 'utf8'), ctx);
vm.runInContext("AYAR.GOOGLE_CLIENT_ID = 'test-client'; AYAR.BILDIRIM = 'aninda'; AYAR.PANEL_SAYFASI = 'http://localhost:8090/panel.html'; AYAR.DURUM_SAYFASI = 'http://localhost:8090/durum.html'", ctx);

// ---- Örnek veri
ctx.kurulum();
const ys = ss.getSheetByName('Yetkililer');
// Canlıdaki kaptan listesiyle aynı. Test girişi: panel.html?test=<eposta>
[['elektromobil@ornek.com', 'Elektromobil Kaptanı', 'Kaptan', 'Elektromobil'],
 ['roket@ornek.com', 'Roket Kaptanı', 'Kaptan', 'Roket, Jet Motoru Tasarımı'],
 ['blokzincir@ornek.com', 'Blokzincir Kaptanı', 'Kaptan', 'Blokzincir'],
 ['iha@ornek.com', 'İHA Kaptanı', 'Kaptan', 'İnsansız Hava Araçları, Su Altı Roketi']].forEach((r, i) => { ys.d[i + 2] = r });
const adlar = ['Ahmet Yılmaz', 'Zeynep Kaya', 'Mehmet Demir', 'Elif Şahin', 'Can Öztürk', 'Ayşe Arslan', 'Emre Doğan', 'Selin Koç', 'Burak Aydın', 'Deniz Çelik', 'Ece Kurt', 'Mert Özdemir', 'İrem Yıldız', 'Oğuz Aksoy', 'Buse Polat'];
const bolumler = ['Makine Mühendisliği', 'Elektrik Elektronik Mühendisliği', 'Bilgisayar Mühendisliği', 'Endüstriyel Tasarım Mühendisliği', 'Uçak Mühendisliği'];
const secenekler = ['Elektromobil (Elektrikli Araç)', 'Roket', 'İnsansız Hava Araçları (İHA)', 'Blokzincir', 'Jet Motoru Tasarımı', 'Su Altı Roketi'];
let tohum = 7; const rnd = n => { tohum = (tohum * 16807) % 2147483647; return tohum % n };
function basvur(i) {
  // 1-55: Elektromobil ikinci öğretim, 56-110: İHA örgün öğretim (ikisinde de 50 kişilik grup oluşur), sonrası karışık
  const t1 = secenekler[i <= 55 ? 0 : i <= 110 ? 2 : rnd(6)];
  let t2 = secenekler[i > 55 && i <= 110 && rnd(3) === 0 ? 5 : rnd(6)]; const takim = rnd(3) && t2 !== t1 ? t1 + ', ' + t2 : t1;
  const tur = i <= 55 ? 'İkinci Öğretim' : i <= 110 ? 'Örgün Öğretim' : (rnd(2) ? 'Örgün Öğretim' : 'İkinci Öğretim');
  yanit.d.push([new Date(Date.now() - (140 - i) * 3600e3), 'aday' + i + '@ogr.erciyes.edu.tr', adlar[i % adlar.length].toLocaleLowerCase('tr-TR'), '0530000' + String(i).padStart(4, '0'), 'https://linkedin.com/in/aday' + i, 'Erciyes Üniversitesi', bolumler[rnd(5)], ['Hazırlık', '1. Sınıf', '2. Sınıf'][rnd(3)], '', tur, 'Yurt', 'SolidWorks (orta), Python (başlangıç)', ['Mekanik ve Tasarım Birimi', 'Yazılım Birimi', 'Medya ve İletişim'][rnd(3)], 'Takım çalışmasını ve yarışma tecrübesini öğrenmek istiyorum.', takim]);
  ctx.formGonderildi({ range: { getSheet: () => yanit, getRow: () => yanit.d.length } });
}
for (let i = 1; i <= 130; i++) basvur(i);
console.log('Örnek veri hazır:', yanit.d.length - 1, 'başvuru,', ss.getSheetByName('Mülakatlar').d.length - 1, 'mülakat satırı,', ss.getSheetByName('Gruplar').d.length - 1, 'grup,', mails.length, 'mail');

// ---- Sunucu
const turler = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.json': 'application/json', '.webmanifest': 'application/manifest+json' };
http.createServer((req, res) => {
  const u = new URL(req.url, 'http://x');
  const json = (o) => { res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*' }); res.end(JSON.stringify(o)) };
  if (u.pathname === '/api') {
    if (req.method === 'GET') return json(JSON.parse(ctx.doGet({ parameter: Object.fromEntries(u.searchParams) }).t));
    let govde = ''; req.on('data', c => govde += c); req.on('end', () => json(JSON.parse(ctx.doPost({ postData: { contents: govde } }).t)));
    return;
  }
  if (u.pathname === '/posta') {   // giden mailleri okunur halde gösterir (en yeni en üstte)
    const k = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
    const liste = mails.map((m, i) => '<details><summary><b>' + (i + 1) + '.</b> ' + k(m.to) + ' | ' + k(m.subject) + '</summary><iframe srcdoc="' + k(m.htmlBody || m.body) + '"></iframe></details>').reverse().join('');
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end('<!doctype html><meta charset="utf-8"><title>Giden mailler (test)</title><style>body{font:15px system-ui;margin:24px;max-width:900px}summary{cursor:pointer;padding:8px;border-bottom:1px solid #ddd}iframe{width:100%;height:560px;border:1px solid #ddd}</style>' +
      '<h1>Giden mailler (test, ' + mails.length + ')</h1><p>Bu mailler gerçekte gönderilmedi. Yeni mailler için sayfayı yenileyin.</p>' + liste);
  }
  if (u.pathname === '/ozet') { const once = mails.length; ctx.gunlukOzet(true); return json(mails.slice(once).map(m => ({ to: m.to, subject: m.subject, body: m.body }))) }
  if (u.pathname === '/mails') return json(mails.map(m => ({ to: m.to, subject: m.subject, body: m.body })));
  if (u.pathname === '/sayfa') return json((ss.getSheetByName(u.searchParams.get('ad')) || { d: [] }).d.map(r => r.map(goster)));
  if (u.pathname === '/basvur') { basvur(yanit.d.length + 100); return json({ tamam: true }) }
  let dosya = path.join(SITE, decodeURIComponent(u.pathname));
  if (dosya.endsWith(path.sep) || u.pathname === '/') dosya = path.join(dosya, 'index.html');
  fs.readFile(dosya, (h, veri) => {
    if (h) { res.writeHead(404); return res.end('yok') }
    res.writeHead(200, { 'Content-Type': turler[path.extname(dosya)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    if (dosya.endsWith('icerik.js')) veri = Buffer.concat([veri, Buffer.from("\nwindow.ICERIK.api = '/api'; window.ICERIK.panel.googleClientId = 'test-client';\n")]);
    res.end(veri);
  });
}).listen(8090, () => console.log('http://localhost:8090 hazır'));
