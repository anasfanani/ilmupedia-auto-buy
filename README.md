# ilmupedia-auto-buy

## Penjelasan 

Kode dalam repositori ini digunakan untuk otomatisasi pembelian paket data menggunakan Node.js. Dalam proyek ini, kita menggunakan Node.js dan Puppeteer. Puppeteer adalah browser headless, yang berarti Puppeteer dapat menjalankan proses browser di latar belakang. Kode ini ditujukan untuk individu yang sering membeli paket data harian. Melakukan pembelian ini secara berkelanjutan bisa menjadi membosankan, oleh karena itu saya dengan senang hati membuat proyek ini untuk memudahkan proses pembelian paket data.

## Keterbatasan

Perlu diingat bahwa kode ini tidak dapat digunakan untuk membeli kuota secara gratis. Anda masih memerlukan pulsa untuk melakukan pembelian. Jika Anda berpikir bahwa dengan menggunakan kode ini Anda dapat membeli paket data tanpa biaya, maka pemahaman tersebut tidak benar.

## Persyaratan

Sebelum menggunakan skrip ini, Anda perlu menginstal beberapa paket yang diperlukan.

### Linux 
```
sudo apt update
sudo apt install git nodejs
git clone https://github.com/anasfanani/ilmupedia-auto-buy
cd ilmupedia-auto-buy
npm install
```

### Termux
```
pkg install tur-repo x11-repo
pkg update
pkg install git nodejs-lts chromium
git clone https://github.com/anasfanani/ilmupedia-auto-buy
cd ilmupedia-auto-buy
npm install
```

## Persiapkan Kredensial

Lakukan login ke https://my.telkomsel.com/ dan buka console pada Chrome ( CTRL + SHIFT + I ) atau ( F12 ).
Paste kode di bawah.

### Browser PC 

```
var localStorageData = {};

for (var i = 0; i < localStorage.length; i++) {
    var key = localStorage.key(i);
    var value = localStorage.getItem(key);
    localStorageData[key] = value;
}

console.log(JSON.stringify(localStorageData, null, 2));
```

### Browser Android 

Salin kode dibawah :
```
document.body.innerHTML = `<textarea style="width: 100%;height:400px;">${JSON.stringify(Object.assign(...Array.from({length: localStorage.length}, (_, i) => ({[localStorage.key(i)]: localStorage.getItem(localStorage.key(i))}))), null, 2)}</textarea>`;
```
Tempel kan di URL, Pergi ke karakter pertama dan tambahkan `javascript:` di depan kode tersebut.

Hasilnya :

```
javascript:document.body.innerHTML = `<textarea style="width: 100%;height:400px;">${JSON.stringify(Object.assign(...Array.from({length: localStorage.length}, (_, i) => ({[localStorage.key(i)]: localStorage.getItem(localStorage.key(i))}))), null, 2)}</textarea>`;
```

Lalu tekan Enter, Salin semua kode di textarea.


## Pemasangan kredensial 

Untuk sementara dalam mode pengembangan, kredensial disimpan di `./src/config/localStorage.json`.


## Menjalankan

```
node src/main.js
```

## Video Tutorial 

### Android
Menggunakan Termux.

[![Tonton Video](https://img.youtube.com/vi/tmbPHjlEz50/default.jpg)](https://youtu.be/tmbPHjlEz50)


## Perhatian

Pengembangan telah menguras beberapa saldo, jika di lakukan pengembangan satu hari penuh maka akan menguras banyak saldo, maka dari itu pengembangan akan di lakukan bertahap jika paket data habis.

Jika anda tidak sabar menunggu versi stabil, sebaiknya anda melakukan sedikit donasi agar memudahkan dan mempercepat proses pengembangan.

## Diskusi & Bantuan

Silahkan chat ke telegram secara langsung jika menemukan error ataupun sekedar memberikan feedback.

https://t.me/anasfanani


## Rencana

- [X] Dijalankan di Termux
- [ ] Dijalankan di openwrt
- [ ] Membuat binary statis yang bisa di jalankan di Termux.
- [ ] Mengaplikasikan workflow github.
- [ ] Mengaplikasikan bersama aplikasi otomatisasi di android seperti Tasker, Automate
- [ ] Otomatis membeli jika terdapat SMS paket data telah habis ( berakhir waktu ataupun kuota habis )


## Penyangkalan 

Skrip ini dimaksudkan untuk tujuan edukasi dan sebagai bukti konsep penggunaan Puppeteer dalam mode headless untuk otomatisasi browser. Skrip ini tidak dimaksudkan untuk disalahgunakan atau digunakan dalam aktivitas yang tidak etis.

Jika Anda tertarik dengan otomatisasi dan ingin berkolaborasi, saya sangat senang untuk mendiskusikannya lebih lanjut.

## Lisensi 

Proyek ini dilisensikan di bawah ketentuan [Lisensi MIT](LICENSE).