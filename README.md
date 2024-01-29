# ilmupedia-auto-buy



## Kredensial

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

Lalu tekan Enter.


## Pemasangan kredensial 

Untuk sementara dalam mode pengembangan, kredensial disimpan di tempat yang tidak aman, `./src/config/localStorage.json`.

Pengembangan selanjutnya akan menggunakan environment variable pada workflows.