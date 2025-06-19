document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('chartofaccount'); // Form ID
    const linkSimpan = document.getElementById('linkSimpan');
    const nomorAkunInput = document.getElementById('nomor_akun');
    const namaAkunInput = document.getElementById('nama_akun'); // Menggunakan namaAkunInput untuk input nama akun
    const saldoInput = document.getElementById('saldo_akun');
    const tipeAkunSelect = document.getElementById('tipe_akun'); // Menggunakan tipeAkunSelect untuk dropdown tipe akun

    // --- Helper Functions ---

    /**
     * Memformat angka menjadi string dengan pemisah ribuan (tanpa simbol mata uang).
     * Digunakan untuk tampilan input saat diketik.
     * @param {number|string} angka - Nilai angka yang akan diformat.
     * @returns {string} - Angka yang sudah diformat ribuan.
     */
    function formatRupiahInput(angka) {
        if (typeof angka === 'string') {
            // Hapus karakter non-digit kecuali koma, lalu ganti koma dengan titik untuk parsing
            angka = parseFloat(angka.replace(/[^0-9,]/g, '').replace(',', '.'));
        }
        if (isNaN(angka)) {
            angka = 0;
        }
        // Gunakan Intl.NumberFormat untuk format ribuan yang lebih baik (tanpa mata uang)
        return new Intl.NumberFormat('id-ID').format(angka);
    }

    /**
     * Memformat angka menjadi format mata uang Rupiah lengkap (misal: "Rp 10.000").
     * Digunakan untuk penyimpanan data dan tampilan akhir saldo.
     * @param {number|string} angka - Nilai angka yang akan diformat.
     * @returns {string} - Angka yang sudah diformat Rupiah lengkap.
     */
    function formatRupiahForStorage(angka) {
        if (typeof angka === 'string') {
            angka = parseFloat(angka.replace(/[^0-9,]/g, '').replace(',', '.'));
        }
        if (isNaN(angka)) {
            angka = 0;
        }
        const format = new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0 // Tidak menampilkan desimal
        });
        return format.format(angka);
    }

    /**
     * Mengambil nilai numerik bersih dari input yang diformat (menghilangkan format ribuan).
     * @param {HTMLInputElement} inputElement - Elemen input.
     * @returns {number} - Nilai numerik bersih.
     */
    function getCleanNumberFromInput(inputElement) {
        let value = inputElement.value.replace(/[^0-9]/g, ''); // Hapus semua karakter non-angka
        return Number(value) || 0; // Kembalikan sebagai angka atau 0 jika kosong/tidak valid
    }

    // --- Logika Inisialisasi Otomatis Chart of Account ---
    /**
     * Memuat data akun dari localStorage. Jika tidak ada, membuat dan menyimpan akun standar.
     * @returns {Array} - Array objek akun.
     */
    function loadOrCreateStandardAccounts() {
        let dataAkun = localStorage.getItem('dataAkun');
        if (!dataAkun) {
            // Jika tidak ada data akun di localStorage, buat akun standar
            const standarAkun = [
                { nomorAkun: '100', namaAkun: 'Kas', tipeAkun: 'Aset', saldoAkun: formatRupiahForStorage(0) },
                { nomorAkun: '110', namaAkun: 'Bank', tipeAkun: 'Aset', saldoAkun: formatRupiahForStorage(0) },
                { nomorAkun: '120', namaAkun: 'Piutang Dagang', tipeAkun: 'Aset', saldoAkun: formatRupiahForStorage(0) },
                { nomorAkun: '130', namaAkun: 'Persediaan', tipeAkun: 'Aset', saldoAkun: formatRupiahForStorage(0) },
                { nomorAkun: '140', namaAkun: 'Peralatan', tipeAkun: 'Aset', saldoAkun: formatRupiahForStorage(0) },
                { nomorAkun: '200', namaAkun: 'Account Payable', tipeAkun: 'Liabilitas', saldoAkun: formatRupiahForStorage(0) }, // Akun Hutang Dagang
                { nomorAkun: '210', namaAkun: 'Utang Gaji', tipeAkun: 'Liabilitas', saldoAkun: formatRupiahForStorage(0) },
                { nomorAkun: '220', namaAkun: 'Utang Bank', tipeAkun: 'Liabilitas', saldoAkun: formatRupiahForStorage(0) },
                { nomorAkun: '300', namaAkun: 'Modal Disetor', tipeAkun: 'Ekuitas', saldoAkun: formatRupiahForStorage(0) },
                { nomorAkun: '310', namaAkun: 'Laba Ditahan', tipeAkun: 'Ekuitas', saldoAkun: formatRupiahForStorage(0) },
                { nomorAkun: '400', namaAkun: 'Pendapatan Penjualan', tipeAkun: 'Pendapatan', saldoAkun: formatRupiahForStorage(0) },
                { nomorAkun: '410', namaAkun: 'Pendapatan Jasa', tipeAkun: 'Pendapatan', saldoAkun: formatRupiahForStorage(0) },
                { nomorAkun: '500', namaAkun: 'Beban Gaji', tipeAkun: 'Beban', saldoAkun: formatRupiahForStorage(0) },
                { nomorAkun: '510', namaAkun: 'Beban Sewa', tipeAkun: 'Beban', saldoAkun: formatRupiahForStorage(0) },
                { nomorAkun: '520', namaAkun: 'Beban Listrik', tipeAkun: 'Beban', saldoAkun: formatRupiahForStorage(0) },
                { nomorAkun: '530', namaAkun: 'Beban Telepon', tipeAkun: 'Beban', saldoAkun: formatRupiahForStorage(0) },
                { nomorAkun: '540', namaAkun: 'Beban Transportasi', tipeAkun: 'Beban', saldoAkun: formatRupiahForStorage(0) },
            ];
            localStorage.setItem('dataAkun', JSON.stringify(standarAkun));
            console.log("Akun standar berhasil dibuat dan disimpan ke localStorage.");
            return standarAkun;
        } else {
            console.log("Data akun ditemukan di localStorage, memuat data yang ada.");
            return JSON.parse(dataAkun);
        }
    }


    // --- Event Listener untuk memformat input saldo saat diketik ---
    if (saldoInput) {
        saldoInput.addEventListener('input', function() {
            const cleanValue = getCleanNumberFromInput(this);
            this.value = formatRupiahInput(cleanValue); // Menggunakan formatRupiahInput
        });
        saldoInput.addEventListener('blur', function() {
            const cleanValue = getCleanNumberFromInput(this);
            this.value = formatRupiahForStorage(cleanValue); // Menggunakan formatRupiahForStorage untuk tampilan setelah blur
        });
        saldoInput.addEventListener('focus', function() {
            const cleanValue = getCleanNumberFromInput(this);
            this.value = cleanValue === 0 ? '' : cleanValue.toString(); // Hapus format saat fokus
        });
    }

    // --- Event Listener untuk Tombol Simpan ---
    if (linkSimpan) { // Menggunakan linkSimpan karena HTML Anda menggunakan <a> dengan id tersebut
        linkSimpan.addEventListener('click', function(event) {
            event.preventDefault(); // Mencegah link melakukan navigasi default

            const nomorAkun = nomorAkunInput.value.trim();
            const namaAkun = namaAkunInput.value.trim(); // Menggunakan namaAkunInput
            const saldoAkunClean = getCleanNumberFromInput(saldoInput); // Dapatkan nilai numerik bersih
            const saldoAkunUntukSimpan = formatRupiahForStorage(saldoAkunClean); // Format untuk penyimpanan (ex: "Rp 10.000")
            const tipeAkun = tipeAkunSelect.value; // Menggunakan tipeAkunSelect

            // Ambil data akun yang sudah ada dari Local Storage (pastikan terbaru)
            let dataAkun = JSON.parse(localStorage.getItem('dataAkun')) || [];

            // Validasi Input
            if (!nomorAkun || !namaAkun || !tipeAkun || saldoAkunClean === null) {
                alert('Harap lengkapi semua kolom.');
                return;
            }
            if (isNaN(parseInt(nomorAkun))) {
                alert('Nomor Akun harus berupa angka.');
                return;
            }

            // Cek apakah nomor akun sudah ada
            const isNomorAkunExist = dataAkun.some(akun => akun.nomorAkun === nomorAkun);

            if (isNomorAkunExist) {
                alert('Nomor akun ini sudah ada. Silakan masukkan nomor akun yang berbeda.');
                nomorAkunInput.value = ''; // Kosongkan input nomor akun
                nomorAkunInput.focus(); // Fokus kembali ke input nomor akun
                return; // Hentikan proses penyimpanan
            }

            // Simpan data ke Local Storage jika nomor akun belum ada
            const akunBaru = {
                nomorAkun: nomorAkun,
                namaAkun: namaAkun,
                saldoAkun: saldoAkunUntukSimpan, // Simpan dalam format Rupiah string
                tipeAkun: tipeAkun
            };

            dataAkun.push(akunBaru);
            localStorage.setItem('dataAkun', JSON.stringify(dataAkun));

            alert('Akun baru berhasil disimpan!');
            // Redirect ke halaman data_akun.html (daftar CoA)
            window.location.href = 'data_akun.html';
        });
    } else {
        console.warn("Tombol Simpan (#linkSimpan) tidak ditemukan.");
    }


    // --- Event Listener untuk Tombol Batal ---
    const linkBatal = document.getElementById('linkBatal');
    if (linkBatal) {
        linkBatal.addEventListener('click', function(event) {
            event.preventDefault(); // Mencegah perilaku default tombol
            // Redirect ke halaman data_akun.html (daftar CoA) tanpa menyimpan
            window.location.href = 'data_akun.html';
        });
    } else {
        console.warn("Tombol Batal (#linkBatal) tidak ditemukan.");
    }

    // --- Inisialisasi Saat DOM Selesai Dimuat ---
    // Panggil fungsi ini untuk memuat atau membuat akun standar saat halaman dimuat
    loadOrCreateStandardAccounts();
});
