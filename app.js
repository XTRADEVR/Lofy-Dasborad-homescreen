/* ==========================================
   APP.JS - Lofi Cozy Night Dashboard PWA
   ========================================== */

document.addEventListener("DOMContentLoaded", () => {
    // 1. Inisialisasi Jam Real-Time
    initClock();

    // 2. Inisialisasi Pemutar Musik Lo-Fi Sederhana
    initLofiPlayer();

    // 3. Inisialisasi Local Storage (Preferensi & Catatan)
    initLocalStorageFeatures();
});

/* --- 1. Fungsi Jam Real-Time --- */
function initClock() {
    const clockElement = document.getElementById("digital-clock");
    const dateElement = document.getElementById("digital-date");

    if (!clockElement) return;

    function updateTime() {
        const now = new Date();

        // Format Jam (HH:MM:SS)
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        clockElement.textContent = `${hours}:${minutes}:${seconds}`;

        // Format Tanggal (Hari, Tanggal Bulan Tahun)
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        if (dateElement) {
            dateElement.textContent = now.toLocaleDateString('id-ID', options);
        }
    }

    updateTime();
    setInterval(updateTime, 1000);
}

/* --- 2. Fungsi Pemutar Musik Lo-Fi --- */
function initLofiPlayer() {
    const playBtn = document.getElementById("play-music-btn");
    const audioPlayer = document.getElementById("lofi-audio");
    const musicStatus = document.getElementById("music-status");

    if (!playBtn || !audioPlayer) return;

    let isPlaying = false;

    playBtn.addEventListener("click", () => {
        if (isPlaying) {
            audioPlayer.pause();
            playBtn.textContent = "🎧 Play Lofi Beats";
            if (musicStatus) musicStatus.textContent = "Status: Paused";
            isPlaying = false;
        } else {
            // Menggunakan audio stream lo-fi publik gratis
            if (!audioPlayer.src) {
                audioPlayer.src = "https://stream.zeno.fm/f3wvbbqmd88uv"; 
            }
            audioPlayer.play().then(() => {
                playBtn.textContent = "⏸️ Pause Music";
                if (musicStatus) musicStatus.textContent = "Status: Playing Cozy Beats 🎶";
                isPlaying = true;
            }).catch(error => {
                console.error("Gagal memutar audio:", error);
                alert("Gagal memutar musik otomatis. Coba klik sekali lagi.");
            });
        }
    });
}

/* --- 3. Fungsi Memory / Local Storage (Catatan & Preferensi) --- */
function initLocalStorageFeatures() {
    const noteInput = document.getElementById("user-note");
    const saveBtn = document.getElementById("save-note-btn");
    const savedMessage = document.getElementById("save-message");

    if (!noteInput || !saveBtn) return;

    // Muat catatan yang tersimpan di memori HP saat aplikasi dibuka
    const savedNote = localStorage.getItem("cozy_user_note");
    if (savedNote) {
        noteInput.value = savedNote;
    }

    // Simpan catatan ke memori HP ketika tombol diklik
    saveBtn.addEventListener("click", () => {
        const textToSave = noteInput.value;
        localStorage.setItem("cozy_user_note", textToSave);

        if (savedMessage) {
            savedMessage.textContent = "Tersimpan di memori HP! ✅";
            setTimeout(() => {
                savedMessage.textContent = "";
            }, 3000);
        }
    });
            }
