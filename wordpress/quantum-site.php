<?php
/**
 * Plugin Name: Quantum Team yeni site
 * Description: Ana adreste (/) WordPress yerine ana klasördeki yeni statik siteyi (index.html) gösterir,
 *              eski WordPress sayfalarını yeni sitedeki karşılıklarına kalıcı olarak yönlendirir.
 *              wp-admin, giriş sayfası ve REST API etkilenmez. Eski siteye dönmek için bu dosyayı silin.
 */

if (defined('WP_CLI') || is_admin() || (defined('DOING_AJAX') && DOING_AJAX) || (defined('DOING_CRON') && DOING_CRON)) {
	return;
}

// Sadece ziyaretçi sayfaları (index.php üzerinden gelenler). wp-login.php, wp-cron.php, xmlrpc.php dokunulmaz.
if (basename(isset($_SERVER['SCRIPT_NAME']) ? $_SERVER['SCRIPT_NAME'] : '') !== 'index.php') {
	return;
}

// Site tek adresle çalışsın: www.quantumteam.com.tr → quantumteam.com.tr
$quantum_sunucu = isset($_SERVER['HTTP_HOST']) ? strtolower($_SERVER['HTTP_HOST']) : '';
if (strpos($quantum_sunucu, 'www.') === 0) {
	header('Location: https://' . substr($quantum_sunucu, 4) . (isset($_SERVER['REQUEST_URI']) ? $_SERVER['REQUEST_URI'] : '/'), true, 301);
	exit;
}

$quantum_yol = parse_url(isset($_SERVER['REQUEST_URI']) ? $_SERVER['REQUEST_URI'] : '/', PHP_URL_PATH);
$quantum_yol = '/' . trim(strtolower((string) $quantum_yol), '/');

// WordPress'in kendi uç noktaları
if (strpos($quantum_yol, '/wp-json') === 0 || isset($_GET['rest_route']) || in_array($quantum_yol, array('/robots.txt', '/favicon.ico'), true)) {
	return;
}

// Ana sayfa: yeni site
if ($quantum_yol === '/' || $quantum_yol === '/index.php') {
	$quantum_dosya = ABSPATH . 'index.html';
	if (is_readable($quantum_dosya)) {
		header('Content-Type: text/html; charset=utf-8');
		header('Cache-Control: no-cache');
		readfile($quantum_dosya);
		exit;
	}
	return;
}

// Eski sayfalar: yeni sitedeki karşılığına, bilinmeyenler ana sayfaya
$quantum_yonlendirme = array(
	'/hakkimizda'   => '/#hakkimizda',
	'/projelerimiz' => '/#takimlar',
	'/takimlar'     => '/#takimlar',
	'/iletisim'     => '/#iletisim',
	'/form'         => '/basvuru.html',
	'/basvuru'      => '/basvuru.html',
);
$quantum_hedef = isset($quantum_yonlendirme[$quantum_yol]) ? $quantum_yonlendirme[$quantum_yol] : '/';
header('Cache-Control: public, max-age=3600');
header('Location: ' . $quantum_hedef, true, 301);
exit;
