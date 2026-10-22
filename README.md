# Slerp! — Website Pemesanan Makanan

Website pemesanan mie & minuman untuk **satu usaha, satu outlet**, dibuat dari dokumen
*Rancangan Aplikasi Web Pemesanan Makanan*.

| Bagian | Teknologi |
|---|---|
| Backend (API) | **Laravel 12** (PHP 8.2 dari XAMPP) |
| Frontend (tampilan) | **React 19** + Vite, animasi dengan Framer Motion + Lenis (smooth scroll) |
| Database | **MySQL / MariaDB dari XAMPP**, nama database `db_pemesanan_makanan` |

---

## 1. Cara menjalankan

### 1.1 Program yang perlu dipasang dulu

| Program | Versi | Unduh |
|---|---|---|
| **XAMPP** | yang berisi **PHP 8.2 atau lebih baru** | https://www.apachefriends.org |
| **Node.js** | **20 LTS** atau lebih baru | https://nodejs.org |
| Git *(opsional, untuk `git clone`)* | terbaru | https://git-scm.com |

Composer **tidak perlu** dipasang: sudah disertakan di `tools/composer.phar`.
Cek versi Node.js dengan membuka Command Prompt lalu ketik `node -v`.

### 1.2 Mengunduh proyek dari GitHub

Pilih salah satu:

- **Dengan Git:**
  ```bash
  git clone https://github.com/<nama-akun>/<nama-repo>.git
  ```
- **Tanpa Git:** buka halaman repository → tombol hijau **Code** → **Download ZIP** → ekstrak.
  > Jika file ZIP diunduh, klik kanan ZIP → **Properties** → centang **Unblock** sebelum diekstrak,
  > supaya Windows tidak memblokir file `.bat`.

Folder `vendor/`, `node_modules/`, dan file `backend/.env` **memang tidak ada** di GitHub.
Semuanya akan dibuat otomatis oleh `1-setup.bat`.

### 1.3 Menjalankan pertama kali (Windows)

1. Buka **XAMPP Control Panel** → klik **Start** pada **MySQL** (Apache tidak perlu).
2. *(Hanya jika perlu)* buka `pengaturan.bat` dengan Notepad bila:
   - XAMPP **tidak** terpasang di `C:\xampp` → ubah `set "XAMPP=C:\xampp"`.
   - MySQL `root` memakai password → isi `DB_PASS`, lalu salin `backend\.env.example` menjadi
     `backend\.env` dan isi `DB_PASSWORD` dengan password yang sama.
3. Klik dua kali **`1-setup.bat`**. Butuh internet dan sekitar **3–10 menit**.
   Skrip ini memeriksa persyaratan, memasang library, membuat database `db_pemesanan_makanan`,
   tabel, dan data contoh. Tunggu sampai muncul tulisan **SETUP SELESAI**.
4. Klik dua kali **`2-jalankan-backend.bat`** → biarkan jendelanya terbuka (Laravel di port 8000).
5. Klik dua kali **`3-jalankan-frontend.bat`** → biarkan jendelanya terbuka (React di port 5173).
6. Buka **http://localhost:5173** di browser.

> Jika Windows menampilkan **"Windows protected your PC"** saat membuka `.bat`,
> klik **More info → Run anyway**.

**Akun admin percobaan** (dari `backend/database/seeders/DatabaseSeeder.php`):
`admin@slerp.test` / `admin123` → buka **http://localhost:5173/admin/login**.
Ganti sandi ini sebelum website dipakai sungguhan.

**Menghentikan website:** tutup kedua jendela (atau tekan `Ctrl+C` di dalamnya).

### 1.4 Menjalankan berikutnya

Setup cukup **sekali**. Selanjutnya cukup:
**Start MySQL** di XAMPP → `2-jalankan-backend.bat` → `3-jalankan-frontend.bat` → buka http://localhost:5173.

> `1-setup.bat` aman dijalankan ulang: jika database sudah berisi data, skrip akan **bertanya dulu**
> sebelum menghapus dan mengisi ulang data contoh.

*(Opsional)* `4-jalankan-scheduler.bat` membatalkan otomatis pesanan yang lewat 30 menit tanpa bukti
bayar, dicek setiap menit. Tanpa ini pun pembatalan tetap terjadi saat halaman pesanan dibuka.

### 1.5 Menjalankan lewat Visual Studio Code

Buka folder proyek di VS Code (**File → Open Folder**), lalu buka dua terminal (**Terminal → New Terminal**):

```powershell
.\2-jalankan-backend.bat
```
```powershell
.\3-jalankan-frontend.bat
```

### 1.6 Cara manual (tanpa file .bat, juga untuk macOS / Linux)

Pastikan perintah `php -v` menunjukkan **PHP 8.2+** dan MySQL sudah berjalan, lalu buat database
kosong bernama `db_pemesanan_makanan` (misalnya lewat phpMyAdmin di http://localhost/phpmyadmin).

Terminal 1, backend:
```bash
cd backend
php ../tools/composer.phar install
cp .env.example .env            # Windows Command Prompt: copy .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan storage:link
php artisan serve
```

Terminal 2, frontend:
```bash
cd frontend
npm install
npm run dev
```

---

## 2. Pola MVC — di mana letak apa?

MVC = **Model – View – Controller**. Tujuannya memisahkan tugas supaya kode mudah dirawat.

```
 Browser ──► VIEW (React)  ──request /api/...──►  ROUTE  ──►  CONTROLLER  ──►  MODEL  ──►  MySQL
            menampilkan                           routes/     menerima &       1 class =
            data & form   ◄────── JSON ─────────  api.php     memeriksa data   1 tabel
```

| Lapisan | Tugas | Lokasi |
|---|---|---|
| **Model** | Mewakili tabel database + aturan bisnis kecil (mis. urutan status pesanan) | `backend/app/Models/` |
| **Controller** | Menerima request, memvalidasi input, memanggil Model, mengembalikan JSON | `backend/app/Http/Controllers/` |
| **View** | Semua yang dilihat pengguna (halaman, tombol, animasi) | `frontend/src/pages/` dan `frontend/src/components/` |
| Route | Peta URL → Controller | `backend/routes/api.php` |
| Service | Logika yang dipakai >1 controller (hitung harga keranjang) | `backend/app/Services/KeranjangService.php` |
| Migration | "Cetak biru" tabel database | `backend/database/migrations/` |

### Struktur folder

```
ALP demo/
├── backend/                      ← Laravel
│   ├── app/
│   │   ├── Models/               ← MODEL (Pesanan, Produk, Pembayaran, ...)
│   │   ├── Http/Controllers/
│   │   │   ├── Api/              ← CONTROLLER sisi pelanggan (katalog, checkout, lacak, bayar)
│   │   │   └── Admin/            ← CONTROLLER sisi admin (login, produk, zona, pesanan)
│   │   ├── Http/Middleware/      ← pemeriksa akses admin
│   │   └── Services/             ← KeranjangService (hitung harga)
│   ├── config/toko.php           ← nama usaha, rekening, alamat (isi lewat .env)
│   ├── database/migrations/      ← struktur 9 tabel sesuai dokumen
│   ├── database/seeders/         ← data contoh
│   ├── public/images/menu/       ← foto menu (JPG)
│   └── routes/api.php            ← daftar semua URL API
│
├── frontend/                     ← React (VIEW)
│   └── src/
│       ├── pages/                ← satu file = satu halaman
│       │   ├── Home.jsx          ← beranda: hero, cerita, cara pesan, katalog, ambil/antar
│       │   ├── CartPage.jsx      ← keranjang
│       │   ├── CheckoutPage.jsx  ← checkout
│       │   ├── OrderPage.jsx     ← pembayaran + status pesanan
│       │   ├── TrackPage.jsx     ← form lacak (kode + token)
│       │   └── admin/            ← login, pesanan, produk, zona
│       ├── components/           ← potongan UI yang dipakai ulang (Navbar, Footer, animasi)
│       ├── api/                  ← fungsi pemanggil API Laravel
│       ├── context/CartContext.jsx ← keranjang (disimpan di browser)
│       └── styles/               ← CSS (warna tema ada di styles/global.css bagian :root)
│
├── tools/composer.phar           ← Composer (pemasang library PHP), tidak perlu instal terpisah
├── pengaturan.bat                ← lokasi XAMPP & akun MySQL untuk semua file .bat
└── 1-setup.bat … 4-jalankan-scheduler.bat
```

---

## 3. Fitur sesuai dokumen rancangan

**Pelanggan** (tanpa registrasi)
- Katalog dengan pencarian & filter kategori; menu nonaktif tampil sebagai "Habis".
- Detail menu: varian, level pedas, topping (hanya muncul jika ada), jumlah 1–99, total langsung terhitung.
  Tombol tambah aktif setelah pilihan wajib terisi.
- Keranjang di browser; kombinasi opsi berbeda = item terpisah.
- Checkout: ambil sendiri (ongkir Rp0) atau antar (zona + alamat & patokan).
  Server **menghitung ulang** harga; jika harga berubah, pelanggan diminta menyetujui total baru.
  `checkout_key` mencegah pesanan ganda.
- Setelah checkout: kode pesanan + **tautan privat berisi token**. Kode saja tidak bisa membuka pesanan.
- Unggah bukti transfer (JPG/PNG/PDF, maks. 5 MB) dalam 30 menit. Bukti ditolak → bisa unggah ulang;
  bukti lama tetap tersimpan.
- Halaman status: status pembayaran & pesanan terpisah, jalur sesuai metode, riwayat waktu.

**Admin**
- Login (dibatasi 5 percobaan/menit), token Sanctum diperiksa di setiap tindakan.
- Pesanan: filter, detail, lihat bukti privat, terima/tolak (alasan wajib), maju status satu langkah
  (tidak bisa dilompati), batal sebelum diproses (alasan wajib), catat refund.
- Produk: tambah/edit + foto, kategori (tambah, ganti nama, nonaktifkan), opsi produk.
  Opsi yang pernah dipesan tidak bisa dihapus, hanya dinonaktifkan.
- Zona antar: tambah/edit/nonaktifkan.

**Aturan otomatis**
- Pesanan tanpa bukti lewat 30 menit → dibatalkan otomatis (perintah `php artisan pesanan:batal-otomatis`).
- Nama, harga, opsi, zona, dan ongkir **disalin** ke pesanan agar riwayat tidak berubah saat katalog diedit.
- Token pelacakan & sandi admin disimpan sebagai **hash**.

Contoh hitungan dengan menu sekarang (sudah diuji): 2 Mie Ayam level 3 = 2 × (Rp9.500 + Rp1.000) = Rp21.000,
\+ Es Teh Rp4.000 = **Rp25.000**, \+ ongkir Zona Dekat Rp5.000 = **Rp30.000**.

---

## 4. Mengganti data usaha

Edit `backend/.env` bagian paling bawah, lalu restart backend:

```
TOKO_NAMA="Slerp!"
TOKO_ALAMAT="Jl. Contoh Raya No. 12, Surabaya"
TOKO_JAM_MULAI="10:00"     # jam buka (format 24 jam)
TOKO_JAM_TUTUP="21:00"     # jam tutup; di luar jam ini hero menampilkan "Tutup" + titik merah
TOKO_BANK_NAMA="Bank Contoh"
TOKO_BANK_NOMOR="123 456 7890"
TOKO_BANK_ATAS_NAMA="Pemilik Usaha"
```

Warna tema: ubah variabel di `frontend/src/styles/global.css` (`--chili`, `--green`, `--mustard`, ...).

---

## 5. Daftar API

| Metode | URL | Keterangan |
|---|---|---|
| GET | `/api/produk?cari=&kategori_id=` | Katalog |
| GET | `/api/produk/{id}` | Detail + opsi |
| GET | `/api/kategori`, `/api/zona`, `/api/info` | Data pendukung |
| POST | `/api/keranjang/hitung` | Hitung ulang keranjang di server |
| POST | `/api/pesanan` | Checkout |
| GET | `/api/pesanan/{kode}?token=` | Lacak pesanan |
| POST | `/api/pesanan/{kode}/pembayaran` | Unggah bukti |
| POST | `/api/admin/login` | Login admin |
| GET/POST | `/api/admin/pesanan…`, `/api/admin/produk…`, `/api/admin/zona…` | Panel admin (butuh token) |

Daftar lengkap: `php artisan route:list --path=api` (jalankan di folder backend).

---

## 6. Masalah umum

Baca pesan di jendela hitam (Command Prompt), lalu cocokkan dengan tabel berikut.

| Pesan / gejala | Penyebab | Solusi |
|---|---|---|
| `[GAGAL] PHP tidak ditemukan` | XAMPP belum terpasang atau tidak di `C:\xampp` | Pasang XAMPP, atau ubah `XAMPP` di `pengaturan.bat` |
| `[GAGAL] Versi PHP di XAMPP terlalu lama` | XAMPP lama (PHP 8.1 ke bawah) | Pasang XAMPP terbaru (PHP 8.2+) |
| `[GAGAL] Node.js belum terpasang` / `'npm' is not recognized` | Node.js belum dipasang atau jendela dibuka sebelum memasang | Pasang Node.js LTS, lalu **tutup dan buka ulang** jendela / VS Code |
| `[GAGAL] Tidak bisa terhubung ke MySQL` / `SQLSTATE[HY000] [2002]` | MySQL belum di-Start | Klik **Start** pada MySQL di XAMPP Control Panel |
| MySQL tidak mau Start di XAMPP | Port 3306 dipakai MySQL lain | Matikan MySQL lain (Services Windows), atau ubah port di XAMPP & `DB_PORT` di `backend\.env` |
| `Access denied for user 'root'` | MySQL root memakai password | Isi `DB_PASS` di `pengaturan.bat` dan `DB_PASSWORD` di `backend\.env` |
| `could not find driver` / `Call to undefined function mb_...` | Perintah dijalankan memakai PHP lain, bukan PHP XAMPP | Jalankan lewat file `.bat`, atau ketik dulu `set PHPRC=C:\xampp\php` dan pakai `C:\xampp\php\php.exe` |
| `composer install` gagal / berhenti | Internet terputus, atau ekstensi zip PHP tidak ada | Pastikan internet tersambung lalu jalankan ulang `1-setup.bat` |
| `[GAGAL] Proyek belum di-setup` | `1-setup.bat` belum dijalankan sampai selesai | Jalankan `1-setup.bat` dan tunggu tulisan **SETUP SELESAI** |
| Website tampil tetapi tulisan *"Menu belum bisa dimuat"* | Backend belum berjalan | Jalankan `2-jalankan-backend.bat` dan biarkan jendelanya terbuka |
| `Failed to listen on 127.0.0.1:8000` / port 5173 sudah dipakai | Server lama masih berjalan | Tutup jendela server lama, atau restart komputer |
| PowerShell: `running scripts is disabled on this system` | Kebijakan keamanan PowerShell | Pakai file `.bat`, atau ketik `npm.cmd run dev` |
| Windows: `Windows protected your PC` | File `.bat` hasil unduhan | Klik **More info → Run anyway** |
| Login admin: `Terlalu banyak percobaan` | Salah sandi lebih dari 5 kali | Tunggu 1 menit |
| Foto produk unggahan admin tidak tampil | Folder foto belum terhubung | Di folder `backend`: `C:\xampp\php\php.exe artisan storage:link` |

**Mengembalikan data seperti awal** (menghapus semua pesanan & perubahan):
jalankan `1-setup.bat` lalu jawab **Y** saat ditanya, atau di folder `backend`:
`C:\xampp\php\php.exe artisan migrate:fresh --seed`.

---

## 7. Untuk pemilik proyek: mengunggah ke GitHub

File `.gitignore` sudah mengatur agar folder besar dan rahasia (`vendor/`, `node_modules/`,
`backend/.env`, foto & bukti bayar unggahan) **tidak ikut** terunggah. Dari folder proyek:

```bash
git init
git add .
git commit -m "Website pemesanan makanan Slerp"
git branch -M main
git remote add origin https://github.com/<nama-akun>/<nama-repo>.git
git push -u origin main
```

> Jangan pernah mengunggah `backend/.env`: file itu berisi kunci aplikasi dan password database.
