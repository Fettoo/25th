# Product Requirement Document (PRD)
## Project Name: Sophie Grisella Olivia 25th Journal

---

## 1. Executive Summary
**Yearly Journal & Memories PWA** adalah aplikasi web interaktif (*Progressive Web App*) berbasis browser yang dirancang sebagai kado ulang tahun digital interaktif untuk pasangan. Proyek ini **bukan berupa aplikasi native** (tidak perlu diunduh melalui App Store atau Play Store), melainkan website interaktif yang dapat diakses langsung via link dan di-host secara gratis menggunakan **GitHub Pages**.

Aplikasi web ini merangkum rekap perjalanan kenangan dari tahun ke tahun (dimulai dari tahun 2018 hingga sekarang), menghadirkan beberapa foto tersembunyi berformat *scratch card*, pemutar musik/soundtrack latar dinamis per tahun, pesan & *wish* kontekstual (panjang/pendek), serta *mini-game* interaktif sebagai pembuka babak/tahun berikutnya.

---

## 2. Product Objectives & Target Audience
* **Platform & Delivery:** Website Client-Side / PWA yang diunggah dan di-deploy via **GitHub Pages**.
* **Target Device:** *Mobile-first* (Optimasi utama untuk iOS & Android browser/PWA dengan *responsive auto-adjust*).
* **Key Goals:**
  * Menyajikan rekap kenangan sentimental dari tahun 2018 dalam format visual yang elegan, rapi, dan tidak kaku.
  * Menggabungkan interaksi fisik digital (*scratching*, *tapping*, *gameplay*) dengan audio interaktif.
  * Menjamin aksesibilitas praktis cukup dengan membuka tautan URL GitHub Pages tanpa instalasi rumit.

---

## 3. Visual & Aesthetic Guidelines

### 3.1 Color Palette (Warm Nostalgia)
* **Background Utama:** Cream / Soft Warm White (`#FDFBF7`)
* **Card Container:** Soft Peach / Warm Beige (`#F7EBE1`)
* **Accent / Interactive Buttons:** Dusty Rose / Muted Pink (`#D8A7B1`)
* **Scratch Overlay Texture:** Muted Bronze / Soft Gold (`#C8B29B`)
* **Primary Typography:** Deep Warm Grey / Charcoal (`#2D2926`) — *Menghindari hitam pekat agar tidak kaku.*

### 3.2 Typography
* **Header & Title Tahun:** *Playfair Display* atau *Cormorant Garamond* (Serif anggun & sentimental).
* **Isi Pesan, Navigation & UI:** *Plus Jakarta Sans* atau *Outfit* (Sans-serif modern, bersih, & mudah dibaca).

### 3.3 Design Principles & Constraints
* **Strict Constraint:** **Sama sekali tidak menggunakan emoticon/emoji.**
* **Iconography:** Menggunakan ikon garis tipis eksklusif (*Lucide Icons* / *Phosphor Icons*, `stroke-width: 1.5px`) atau label teks minimalis bergaya editorial (`CHAPTER 01`, `SCRATCH TO UNCOVER`, `TAP TO EXPAND`).
* **Layouting:** *Organic Card & Asymmetric Layering* dengan sudut sangat membulat (`border-radius: 24px`), efek *soft shadow*, serta elemen melayang (*floating UI*).

---

## 4. Feature Specifications & User Flow

### 4.1 Welcome Screen & Audio Permission
* **Behavior:** Halaman pembuka minimalis berisi judul jurnal dan tombol interaktif bertuliskan `MULAI PERJALANAN`.
* **Purpose:** Memicu *user gesture* pertama untuk mengizinkan pemutaran musik otomatis (*bypass autoplay restriction* pada browser mobile).

### 4.2 Floating Audio Player (Soundtrack Per Tahun)
* **Behavior:**
  * Bilah kontrol audio melayang (*floating widget*) di bagian atas layar.
  * Lagu latar otomatis berpindah dan memutar *soundtrack* unik sesuai dengan tahun yang sedang diakses (misal: lagu kenangan 2018 saat memilih tab 2018).
  * Dilengkapi tombol *Play/Pause*, Mute, serta indikator nama file lagu (contoh: `Perfect.mp3`).

### 4.3 Year Navigation System (2018 - Present)
* **Behavior:**
  * Tab navigasi horizontal melayang (*scrollable year picker*) berisi opsi tahun `2018`, `2019`, `2020`, dst.
  * Berpindah tahun akan meng-update *soundtrack*, galeri *scratch card*, pesan kenangan, dan *mini-game* secara bersamaan dengan transisi pudar (*fade animation*).

### 4.4 Multiple Scratch Card Photo Gallery
* **Behavior:**
  * Dalam setiap tahun, terdapat beberapa kartu foto kenangan yang dilapisi tekstur *gold/bronze scratch overlay* berbasis HTML5 Canvas.
  * Mendukung gestur usap layar HP (`touchstart` & `touchmove`).
  * **Auto-Clear Function:** Saat area foto berhasil digosok hingga >50%, sisa lapisan otomatis memudar (*fade-out*) secara mulus memunculkan foto asli.

### 4.5 Flexible Wish & Narrative Card (Panjang & Pendek)
* **Behavior:**
  * Kontainer bacaan dengan gaya *editorial typography*.
  * **Short Wish:** Ditampilkan langsung secara penuh.
  * **Long Wish:** Ditampilkan ringkas di awal dengan tombol interaktif `[ BACA SELENGKAPNYA ]` untuk memperluas teks (*accordion expand*).

### 4.6 Yearly Mini-Game & Chapter Unlock System
* **Behavior:**
  * Di bagian akhir setiap babak tahun, terdapat *mini-game* singkat (misal: *Kuis Ingatan Kenangan*, *Memory Card Matching*, atau *Puzzle* lokasi).
  * Menjawab/menyelesaikan *mini-game* berfungsi sebagai kunci (*unlock trigger*) untuk membuka babak tahun berikutnya.
  * Tahun yang belum terbuka akan menampilkan tombol status terkunci (contoh: `SABAR YA, TAHUN 2019 AKAN SEGERA TERBUKA`).

---

## 5. Technical Stack & Deployment Architecture

* **Architecture Model:** 100% Static Single Page Application (SPA) / Client-Side Web App.
* **Frontend Framework:** SvelteKit (dengan `adapter-static`) atau React via Vite.
* **Styling Engine:** Tailwind CSS.
* **Audio Management:** `Howler.js` (mengelola transisi *fade-in/fade-out* lagu antar-tahun).
* **Canvas Engine:** Native HTML5 Canvas API / `scratchcard-js`.
* **PWA Features:** `vite-plugin-pwa` (Service Worker + Manifest agar dapat opsi *Add to Home Screen* dari browser).
* **Icon Set:** `lucide-react` / `lucide-svelte`.
* **Hosting & Deployment:** **GitHub Pages** (Build static output di-push ke branch `gh-pages` atau via GitHub Actions workflow, gratis & otomatis HTTPS).

---

## 6. Mobile Compatibility & Responsive Rules

1. **Dynamic Viewport Unit:** Menggunakan unit `dvh` (*dynamic viewport height*) untuk mencegah layout terpotong *address bar* browser iOS/Android.
2. **Container Constraints:** Dibatasi maksimal `max-width: 480px` centered agar saat dibuka di laptop/tablet tetap mempertahankan proporsi tampilan smartphone.
3. **Media Asset Optimization:**
   * Seluruh foto dikompresi ke format `.webp` (< 300KB per foto) dan disimpan di folder public repositori.
   * File audio MP3 dipotong secukupnya dan dikompresi pada bitrate 128kbps / 192kbps agar pemuatan (*loading*) cepat saat dibuka lewat tautan web.