# Petunjuk Media Asset (Audio & Foto)

Sesuai dengan acuan **PRD.md**:

### 1. Audio Soundtrack (Folder: `public/audio/`)
- Letakkan file audio MP3 di folder ini dengan penamaan:
  - `2018.mp3`
  - `2019.mp3`
  - `2020.mp3`
  - `2021.mp3`
  - `2022.mp3`
  - `2023.mp3`
  - `2024.mp3`
  - `2025.mp3`
  - `2026.mp3`
- *Rekomendasi PRD*: Kompresi bitrate 128kbps / 192kbps agar pemuatan cepat pada mobile web.
- *Catatan*: Jika file MP3 belum dimasukkan, sistem otomatis memutar synthesized ambient chords harmonis yang menenangkan menggunakan Web Audio API tanpa terjadi error.

### 2. Foto Kenangan (Folder: `public/photos/`)
- Simpan foto kenangan di folder ini jika ingin menggunakan file lokal.
- Ganti `imageUrl` di `src/data/journalData.ts` menjadi misal `./photos/2018-01.webp`.
- *Rekomendasi PRD*: Kompresi ke format `.webp` (< 300KB per foto).

