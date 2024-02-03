# ilmupedia-auto-buy

## Penjelasan 

Kode di dalam repositori ini gunanya untuk melakukan pembelian paket data dengan node js, dalam proyek ini menggunakan nodeJs dan pupeterr, pupeter adalah headless browser yang bermaksud pupeter dapat menjalankan proses browser seperti pada umumnya namun di jalankan di latar belakang, penggunaan kode di repositori ini menargetkan kepada orang orang yang selalu membeli paket data dengan kuota waktu harian, jika di lakukan terus menerus akan membosankan, maka dengan senang hati saya membuat proyek yang bertujuan memudahkan dalam membeli kuota.

## Keterbatasan

Tidak dapat membeli kuota dengan gratis, anda tetap memakai pulsa, jika anda fikir dengan kode maka dapat membeli paket data secara gratis, maka anda termasuk orang orang dengan cara berfikir yang salah.

## Persiapan

Persiapan sebelum menggunakan script ini adalah menginstall beberapa paket yang diperlukan 

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
pkg install tur-repo
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

## Perhatian

Pengembangan telah menguras beberapa saldo, jika di lakukan pengembangan satu hari penuh maka akan menguras banyak saldo, maka dari itu pengembangan akan di lakukan bertahap jika paket data habis.

Jika anda tidak sabar menunggu versi stabil, sebaiknya anda melakukan sedikit donasi agar memudahkan dan mempercepat proses pengembangan.

## Rencana

- Membuat binary statis yang bisa di jalankan di Termux.
- Mengaplikasikan workflow github.
- Mengaplikasikan bersama aplikasi otomatisasi di android seperti Tasker, Automate
- Otomatis membeli jika terdapat SMS paket data telah habis ( berakhir waktu ataupun kuota habis )