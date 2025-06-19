// data_akun.js

document.addEventListener('DOMContentLoaded', function() {
    // --- PENTING: BARIS INI HANYA UNTUK DEBUGGING SEMENTARA ---
    // Baris ini akan MENGHAPUS SEMUA DATA di localStorage browser Anda setiap kali halaman dimuat.
    // Pastikan untuk MENGHAPUS BARIS INI setelah Anda melihat daftar akun muncul!
    // localStorage.clear(); // <--- HAPUS ATAU BIARKAN DIKOMENTARI
    // --- AKHIR DEBUGGING SEMENTARA ---


    const tableBody = document.querySelector('.table tbody');
    const pageNumbersSpan = document.querySelector('.page-numbers');
    const prevButton = document.querySelector('.prev');
    const nextButton = document.querySelector('.next');

    let akunArray = []; // Variabel untuk menyimpan data akun yang akan ditampilkan

    let editingIndex = -1; // Menyimpan indeks baris yang sedang diedit

    const ITEMS_PER_PAGE = 15; // Jumlah maksimal data per halaman
    let currentPage = 1; // Halaman saat ini

    // --- Helper Functions ---

    /**
     * Memformat angka menjadi format mata uang Rupiah tanpa desimal untuk tampilan.
     * @param {number|string} angka - Nilai angka yang akan diformat.
     * @returns {string} - Angka yang sudah diformat Rupiah.
     */
    function formatRupiahDisplay(angka) {
        if (typeof angka === 'string') {
            // Hapus karakter non-digit kecuali koma, lalu ganti koma dengan titik untuk parsing
            angka = parseFloat(angka.replace(/[^0-9,]/g, '').replace(',', '.'));
        }
        if (isNaN(angka)) {
            angka = 0;
        }
        const format = new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        });
        return format.format(angka);
    }

    /**
     * Mengambil nilai numerik bersih dari input yang diformat (menghilangkan format ribuan dan simbol mata uang).
     * @param {string} formattedString - String angka yang diformat.
     * @returns {number} - Nilai numerik bersih.
     */
    function getCleanNumber(formattedString) {
        // Hapus semua karakter non-digit kecuali koma, lalu ganti koma dengan titik untuk parsing
        const cleaned = formattedString.replace(/[^0-9,-]+/g, "").replace(",", ".");
        return parseFloat(cleaned) || 0; // Mengembalikan angka atau 0 jika parsing gagal
    }

    /**
     * Memformat angka menjadi string dengan pemisah ribuan (digunakan saat input).
     * Mirip formatNumberWithDots di customer/supplier, tapi di sini untuk input langsung.
     * @param {string} rawValue - Nilai string yang hanya berisi digit.
     * @returns {string} - Nilai yang sudah diformat dengan titik.
     */
    function formatRupiahInput(rawValue) {
        if (!rawValue) return '';
        const number = parseInt(rawValue, 10);
        return number.toLocaleString('id-ID'); // Menggunakan toLocaleString untuk format ribuan
    }


    // --- Logika Utama: Memuat/Membuat Akun Standar & Mengisi Tabel ---

    /**
     * Memuat data akun dari localStorage. Jika tidak ada, membuat dan menyimpan akun standar.
     * @returns {Array} - Array objek akun.
     */
    function loadOrCreateStandardAccounts() {
        console.log("DEBUG: Memulai loadOrCreateStandardAccounts()...");
        let dataAkunRaw = localStorage.getItem('dataAkun');
        console.log("DEBUG: dataAkunRaw dari localStorage:", dataAkunRaw);

        let parsedData = [];
        try {
            parsedData = dataAkunRaw ? JSON.parse(dataAkunRaw) : [];
            console.log("DEBUG: parsedData setelah JSON.parse():", parsedData);
        } catch (e) {
            console.error("DEBUG: Error parsing dataAkun from localStorage, resetting data:", e);
            parsedData = []; // Jika ada error parsing, anggap data kosong
        }

        // Jika dataAkunRaw tidak ada (null/undefined) ATAU data yang diparsing kosong,
        // maka buat akun standar
        if (!dataAkunRaw || parsedData.length === 0) {
            console.log("DEBUG: dataAkun tidak ada atau kosong. Membuat akun standar...");
            const standarAkun = [
                { nomorAkun: '100', namaAkun: 'Kas', tipeAkun: 'Aset', saldoAkun: formatRupiahDisplay(0) },
                { nomorAkun: '110', namaAkun: 'Bank', tipeAkun: 'Aset', saldoAkun: formatRupiahDisplay(0) },
                { nomorAkun: '120', namaAkun: 'Piutang Dagang', tipeAkun: 'Aset', saldoAkun: formatRupiahDisplay(0) }, // Akun ini akan diperbarui
                { nomorAkun: '130', namaAkun: 'Persediaan', tipeAkun: 'Aset', saldoAkun: formatRupiahDisplay(0) },
                { nomorAkun: '140', namaAkun: 'Peralatan', tipeAkun: 'Aset', saldoAkun: formatRupiahDisplay(0) },
                { nomorAkun: '200', namaAkun: 'Account Payable', tipeAkun: 'Liabilitas', saldoAkun: formatRupiahDisplay(0) }, // Akun Hutang Dagang
                { nomorAkun: '210', namaAkun: 'Utang Gaji', tipeAkun: 'Liabilitas', saldoAkun: formatRupiahDisplay(0) },
                { nomorAkun: '220', namaAkun: 'Utang Bank', tipeAkun: 'Liabilitas', saldoAkun: formatRupiahDisplay(0) },
                { nomorAkun: '300', namaAkun: 'Modal Disetor', tipeAkun: 'Ekuitas', saldoAkun: formatRupiahDisplay(0) },
                { nomorAkun: '310', namaAkun: 'Laba Ditahan', tipeAkun: 'Ekuitas', saldoAkun: formatRupiahDisplay(0) },
                { nomorAkun: '400', namaAkun: 'Pendapatan Penjualan', tipeAkun: 'Pendapatan', saldoAkun: formatRupiahDisplay(0) },
                { nomorAkun: '410', namaAkun: 'Pendapatan Jasa', tipeAkun: 'Pendapatan', saldoAkun: formatRupiahDisplay(0) },
                { nomorAkun: '500', namaAkun: 'Beban Gaji', tipeAkun: 'Beban', saldoAkun: formatRupiahDisplay(0) },
                { nomorAkun: '510', namaAkun: 'Beban Sewa', tipeAkun: 'Beban', saldoAkun: formatRupiahDisplay(0) },
                { nomorAkun: '520', namaAkun: 'Beban Listrik', tipeAkun: 'Beban', saldoAkun: formatRupiahDisplay(0) },
                { nomorAkun: '530', namaAkun: 'Beban Telepon', tipeAkun: 'Beban', saldoAkun: formatRupiahDisplay(0) },
                { nomorAkun: '540', namaAkun: 'Beban Transportasi', tipeAkun: 'Beban', saldoAkun: formatRupiahDisplay(0) },
            ];
            localStorage.setItem('dataAkun', JSON.stringify(standarAkun));
            console.log("DEBUG: Akun standar berhasil dibuat dan disimpan ke localStorage.");
            return standarAkun;
        } else {
            console.log("DEBUG: Data akun ditemukan di localStorage, memuat data yang ada.");
            return parsedData;
        }
    }


    /**
     * Mengisi tabel Chart of Accounts dengan data untuk halaman saat ini.
     * @param {number} page - Nomor halaman yang akan ditampilkan.
     */
    function populateTable(page) {
        console.log("DEBUG: Memulai populateTable() untuk halaman:", page);
        console.log("DEBUG: akunArray lengkap saat populateTable dipanggil:", akunArray);

        const startIndex = (page - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        const accountsToDisplay = akunArray.slice(startIndex, endIndex);

        tableBody.innerHTML = ''; // Kosongkan isi tabel terlebih dahulu

        if (accountsToDisplay.length === 0) {
            const row = tableBody.insertRow();
            const cell = row.insertCell(0);
            cell.colSpan = 5; // Sesuaikan colspan dengan jumlah kolom tabel Anda
            cell.textContent = 'Tidak ada data akun pada halaman ini.';
            cell.style.textAlign = 'center';
            console.log("DEBUG: accountsToDisplay kosong, menampilkan pesan 'Tidak ada data akun pada halaman ini'.");
        } else {
            accountsToDisplay.forEach((akun, index) => {
                const row = tableBody.insertRow();
                // Gunakan indeks dari akunArray asli untuk data-index agar edit/delete bekerja dengan benar
                // Offset dengan startIndex untuk mendapatkan indeks relatif terhadap akunArray lengkap
                row.dataset.index = akunArray.indexOf(akun); 

                const nomorAkunCell = row.insertCell();
                const namaAkunCell = row.insertCell();
                const saldoCell = row.insertCell();
                const tipeAkunCell = row.insertCell();
                const actionCell = row.insertCell(); // Sel untuk tombol aksi

                nomorAkunCell.textContent = akun.nomorAkun;
                namaAkunCell.textContent = akun.namaAkun;
                saldoCell.textContent = formatRupiahDisplay(akun.saldoAkun);
                tipeAkunCell.textContent = akun.tipeAkun;

                // Membuat tombol Update
                const updateButton = document.createElement('button');
                updateButton.textContent = 'Update';
                updateButton.classList.add('update-btn', 'btn', 'btn-primary', 'mr-2');
                updateButton.style.marginRight = '5px'; // Styling sederhana

                // Membuat tombol Delete
                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Delete';
                deleteButton.classList.add('delete-btn', 'btn', 'btn-danger');

                actionCell.appendChild(updateButton);
                actionCell.appendChild(deleteButton);
            });
            console.log("DEBUG: Tabel berhasil diisi dengan data untuk halaman", page);
        }
        updatePaginationControls(); // Perbarui kontrol paginasi setelah tabel diisi
    }

    /**
     * Memperbarui tampilan kontrol paginasi (nomor halaman dan status tombol).
     */
    function updatePaginationControls() {
        const totalPages = Math.ceil(akunArray.length / ITEMS_PER_PAGE);
        pageNumbersSpan.textContent = `Halaman ${currentPage} dari ${totalPages || 1}`;

        prevButton.disabled = currentPage === 1;
        nextButton.disabled = currentPage === totalPages || akunArray.length === 0;
        console.log(`DEBUG: Paginasi: Halaman ${currentPage} dari ${totalPages || 1}. Prev Disabled: ${prevButton.disabled}, Next Disabled: ${nextButton.disabled}`);
    }


    // --- Logika Edit/Simpan/Batal dari Tabel ---

    /**
     * Mengaktifkan mode edit untuk baris tabel tertentu.
     * @param {number} index - Indeks baris yang akan diedit (ini adalah indeks di akunArray lengkap).
     */
    function switchToEditMode(index) {
        if (editingIndex !== -1) {
            alert('Silakan simpan atau batalkan pengeditan baris sebelumnya terlebih dahulu.');
            return;
        }

        // Temukan baris HTML berdasarkan indeks akun yang sedang diedit
        const rowToEdit = tableBody.querySelector(`tr[data-index="${index}"]`);
        if (!rowToEdit) {
            console.error("DEBUG: Baris HTML tidak ditemukan untuk indeks:", index);
            return;
        }

        const akun = akunArray[index]; // Ambil data akun dari array lengkap

        // Ganti teks dengan input field
        rowToEdit.cells[0].innerHTML = `<input type="text" class="form-control edit-nomor-akun" value="${akun.nomorAkun}" required>`;
        rowToEdit.cells[1].innerHTML = `<input type="text" class="form-control edit-nama-akun" value="${akun.namaAkun}" required>`;
        // Gunakan getCleanNumber untuk menampilkan nilai numerik murni di input edit saldo
        rowToEdit.cells[2].innerHTML = `<input type="text" class="form-control edit-saldo-akun" value="${getCleanNumber(akun.saldoAkun)}" required>`;

        // Buat dropdown untuk tipe akun
        rowToEdit.cells[3].innerHTML = `<select class="form-control edit-tipe-akun">
                                            <option value="Aset" ${akun.tipeAkun === 'Aset' ? 'selected' : ''}>Aset</option>
                                            <option value="Liabilitas" ${akun.tipeAkun === 'Liabilitas' ? 'selected' : ''}>Liabilitas</option>
                                            <option value="Ekuitas" ${akun.tipeAkun === 'Ekuitas' ? 'selected' : ''}>Ekuitas</option>
                                            <option value="Pendapatan" ${akun.tipeAkun === 'Pendapatan' ? 'selected' : ''}>Pendapatan</option>
                                            <option value="Beban" ${akun.tipeAkun === 'Beban' ? 'selected' : ''}>Beban</option>
                                        </select>`;

        // Ganti tombol Update/Delete dengan Simpan/Batal
        rowToEdit.cells[4].innerHTML = `<button class="save-edit-btn btn btn-success mr-2" data-index="${index}">Simpan</button> <button class="cancel-edit-btn btn btn-secondary" data-index="${index}">Batal</button>`;
        editingIndex = index;

        // Tambahkan event listener untuk formatting saldo saat di edit
        const editSaldoInput = rowToEdit.cells[2].querySelector('.edit-saldo-akun');
        if(editSaldoInput) {
            editSaldoInput.addEventListener('input', function() {
                const rawValue = this.value.replace(/[^0-9]/g, '');
                this.value = formatRupiahInput(rawValue);
            });
            editSaldoInput.addEventListener('blur', function() {
                const parsedValue = getCleanNumber(this.value);
                this.value = formatRupiahDisplay(parsedValue);
            });
            editSaldoInput.addEventListener('focus', function() {
                const cleanValue = getCleanNumber(this.value);
                this.value = cleanValue === 0 ? '' : cleanValue.toString();
            });
        }
        console.log("DEBUG: Masuk mode edit untuk indeks:", index);
    }

    /**
     * Menyimpan perubahan dari baris yang sedang diedit.
     * @param {number} index - Indeks baris yang diedit (ini adalah indeks di akunArray lengkap).
     */
    function saveEditedRow(index) {
        const row = tableBody.querySelector(`tr[data-index="${index}"]`);
        if (!row) {
            console.error("DEBUG: Baris HTML tidak ditemukan untuk indeks:", index);
            alert('Terjadi kesalahan saat menyimpan: Baris tidak ditemukan.');
            return;
        }

        const nomorAkunBaru = row.querySelector('.edit-nomor-akun').value.trim();
        const namaAkunBaru = row.querySelector('.edit-nama-akun').value.trim();
        const saldoAkunFormatted = row.querySelector('.edit-saldo-akun').value.trim();
        const tipeAkunBaru = row.querySelector('.edit-tipe-akun').value;

        // Validasi input kosong
        if (!nomorAkunBaru || !namaAkunBaru || !saldoAkunFormatted || !tipeAkunBaru) {
            alert('Semua kolom harus diisi.');
            return;
        }

        // Validasi nomor akun tidak boleh sama (kecuali dengan yang sedang diedit)
        const isNomorAkunExist = akunArray.some((akun, i) => akun.nomorAkun === nomorAkunBaru && i !== index);
        if (isNomorAkunExist) {
            alert('Nomor akun ini sudah ada. Silakan masukkan nomor akun yang berbeda.');
            return;
        }

        // Konversi saldo kembali ke format numerik bersih, lalu simpan dalam format Rupiah string
        const saldoNumerikBersih = getCleanNumber(saldoAkunFormatted);
        const saldoAkunUntukSimpan = formatRupiahDisplay(saldoNumerikBersih);

        akunArray[index] = {
            nomorAkun: nomorAkunBaru,
            namaAkun: namaAkunBaru,
            saldoAkun: saldoAkunUntukSimpan,
            tipeAkun: tipeAkunBaru
        };
        localStorage.setItem('dataAkun', JSON.stringify(akunArray));
        editingIndex = -1; // Reset status editing
        alert('Akun berhasil diperbarui!');
        populateTable(currentPage); // Muat ulang tabel untuk halaman saat ini
        console.log("DEBUG: Akun berhasil disimpan untuk indeks:", index);
    }

    /**
     * Membatalkan pengeditan baris.
     * @param {number} index - Indeks baris yang dibatalkan (ini adalah indeks di akunArray lengkap).
     */
    function cancelEdit(index) {
        editingIndex = -1; // Reset status editing
        populateTable(currentPage); // Muat ulang tabel untuk mengembalikan tampilan asli di halaman saat ini
        console.log("DEBUG: Pengeditan dibatalkan untuk indeks:", index);
    }

    // --- Event Listener untuk Aksi pada Tabel (Update/Delete/Save/Cancel) ---
    tableBody.addEventListener('click', function(event) {
        const clickedElement = event.target;
        const row = clickedElement.closest('tr');
        if (!row) return;

        // Ambil indeks dari dataset baris (ini adalah indeks dari akunArray lengkap)
        const index = parseInt(row.dataset.index);

        if (clickedElement.classList.contains('delete-btn')) {
            if (editingIndex !== -1) { // Jika ada baris lain sedang diedit
                alert('Silakan simpan atau batalkan pengeditan baris lain terlebih dahulu.');
                return;
            }
            if (confirm('Apakah Anda yakin ingin menghapus akun ini?')) {
                akunArray.splice(index, 1); // Hapus akun dari array
                localStorage.setItem('dataAkun', JSON.stringify(akunArray)); // Simpan ke localStorage
                alert('Akun berhasil dihapus!');

                // Sesuaikan currentPage jika item terakhir di halaman saat ini dihapus
                const totalPagesAfterDelete = Math.ceil(akunArray.length / ITEMS_PER_PAGE);
                if (currentPage > totalPagesAfterDelete && currentPage > 1) {
                    currentPage = totalPagesAfterDelete;
                } else if (totalPagesAfterDelete === 0) { // Jika tidak ada data tersisa
                    currentPage = 1;
                }

                editingIndex = -1; // Reset editing status
                populateTable(currentPage); // Muat ulang tabel untuk halaman saat ini
                console.log("DEBUG: Akun berhasil dihapus untuk indeks:", index);
            }
        } else if (clickedElement.classList.contains('update-btn')) {
            switchToEditMode(index);
        } else if (clickedElement.classList.contains('save-edit-btn')) {
            saveEditedRow(index);
        } else if (clickedElement.classList.contains('cancel-edit-btn')) {
            cancelEdit(index);
        }
    });

    // --- Fungsi Paginasi Global ---
    // Diperlukan agar tombol onclick di HTML bisa memanggil fungsi ini
    window.prevPage = function() {
        if (currentPage > 1) {
            currentPage--;
            populateTable(currentPage);
        }
    };

    window.nextPage = function() {
        const totalPages = Math.ceil(akunArray.length / ITEMS_PER_PAGE);
        if (currentPage < totalPages) {
            currentPage++;
            populateTable(currentPage);
        }
    };


    // --- Inisialisasi Saat DOM Selesai Dimuat ---
    // Muat atau buat akun standar saat halaman dimuat
    akunArray = loadOrCreateStandardAccounts();
    // Tampilkan tabel dengan data akun yang sudah ada atau yang baru dibuat pada halaman pertama
    populateTable(currentPage);
});