// purchasing_list.js

document.addEventListener('DOMContentLoaded', function() {
    // Inisialisasi data dari localStorage atau array kosong jika belum ada
    let dataArray = JSON.parse(localStorage.getItem('purchasingData')) || [];
    const tableBody = document.getElementById('purchasingTableBody');
    const pageNumbersSpan = document.querySelector('.page-numbers'); // Ganti nama agar tidak konflik dengan fungsi
    const itemsPerPage = 4;
    let currentPage = 1;

    // --- FUNGSI FORMATTING DAN PARSING ANGKA ---

    /**
     * Memformat angka menjadi string Rupiah (misal: "Rp 1.234.567").
     * @param {number|string} number - Angka yang akan diformat.
     * @returns {string} - String angka yang sudah diformat Rupiah.
     */
    function formatRupiah(number) {
        if (typeof number === 'string' && number.startsWith('Rp')) {
            number = parseRupiahToNumber(number);
        }
        if (typeof number !== 'number' || isNaN(number)) {
            number = 0;
        }
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(number);
    }

    /**
     * Mengurai string Rupiah menjadi angka (number).
     * @param {string} rupiahString - String Rupiah yang akan diurai.
     * @returns {number} - Nilai angka.
     */
    function parseRupiahToNumber(rupiahString) {
        if (typeof rupiahString !== 'string') {
            return 0;
        }
        // Hapus "Rp", spasi, pemisah ribuan (titik), dan ganti koma desimal menjadi titik
        const cleaned = rupiahString.replace(/Rp\s?/g, '').replace(/\./g, '').replace(/,/g, '.');
        return parseFloat(cleaned) || 0;
    }

    /**
     * Mengurai string angka dengan pemisah ribuan menjadi angka (number).
     * @param {string} formattedString - String angka yang akan diurai (misal "1.000" menjadi 1000).
     * @returns {number} - Nilai angka.
     */
    function parseFormattedNumber(formattedString) {
        if (typeof formattedString !== 'string') {
            return 0;
        }
        // Hapus pemisah ribuan (titik) dan ganti koma desimal menjadi titik
        const cleaned = formattedString.replace(/\./g, '').replace(/,/g, '.');
        return parseFloat(cleaned) || 0;
    }

    /**
     * Memformat angka dengan pemisah ribuan (misal: "1.234.567").
     * Berguna untuk kuantitas atau angka non-mata uang.
     * @param {number|string} number - Angka yang akan diformat.
     * @returns {string} - String angka yang sudah diformat dengan pemisah ribuan.
     */
    function formatNumber(number) {
        if (typeof number === 'string') {
            number = parseFormattedNumber(number);
        }
        if (typeof number !== 'number' || isNaN(number)) {
            number = 0;
        }
        return new Intl.NumberFormat('id-ID').format(number);
    }

    // --- FUNGSI DASAR DATA MANAGEMENT ---

    /**
     * Menyimpan data pembelian ke localStorage.
     */
    function saveData() {
        localStorage.setItem('purchasingData', JSON.stringify(dataArray));
    }

    /**
     * Menampilkan data pembelian per halaman di tabel.
     * @param {number} page - Nomor halaman yang ingin ditampilkan.
     */
    function displayData(page) {
        if (!tableBody) {
            console.error("Elemen dengan ID 'purchasingTableBody' tidak ditemukan.");
            return;
        }
        tableBody.innerHTML = ''; // Kosongkan tabel sebelum mengisi data
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const pageData = dataArray.slice(startIndex, endIndex);

        if (pageData.length > 0) {
            pageData.forEach((data, index) => {
                // Gunakan globalIndex untuk operasi Update/Delete agar sesuai dengan dataArray asli
                const globalIndex = startIndex + index;

                // Baris Header untuk Tanggal dan Pemasok
                const headerRow = document.createElement('tr');
                headerRow.innerHTML = `
                    <td style="font-weight: bold;">${data.tanggal}</td>
                    <td style="font-weight: bold;">${data.namaPemasok}</td>
                    <td colspan="7"></td>
                `; // colspan 7 agar total 9 kolom
                tableBody.appendChild(headerRow);

                // Baris Item-item Pembelian
                data.items.forEach(item => {
                    const itemRow = document.createElement('tr');
                    itemRow.innerHTML = `
                        <td></td>
                        <td></td>
                        <td>${item.namaBarang || '-'}</td>
                        <td>${formatNumber(item.q)}</td> <td>${item.satuan || '-'}</td>
                        <td>${formatRupiah(item.harga)}</td>
                        <td>${formatRupiah(item.disc)}</td>
                        <td>${formatRupiah(item.totalHarga)}</td>
                        <td></td>
                    `;
                    tableBody.appendChild(itemRow);
                });

                // Baris Total Keseluruhan
                const totalRowValues = document.createElement('tr');
                const totalDiscFormatted = formatRupiah(data.totalDisc);
                const totalHargaFormatted = formatRupiah(data.totalHarga);

                totalRowValues.innerHTML = `
                    <td colspan="6" style="text-align: right; font-weight: bold;">Total Keseluruhan:</td>
                    <td class="total-value" style="font-weight: bold;">${totalDiscFormatted}</td>
                    <td class="total-value" style="font-weight: bold;">${totalHargaFormatted}</td>
                    <td>
                        <button class="updateButton btn btn-warning btn-sm" data-index="${globalIndex}">Update</button>
                        <button class="deleteButton btn btn-danger btn-sm" data-index="${globalIndex}">Delete</button>
                        <button class="ajukanButton btn btn-info btn-sm ${data.isDiajukan ? 'diajukan' : ''}" data-index="${globalIndex}" ${data.isDiajukan ? 'disabled' : ''}>
                            ${data.isDiajukan ? 'Diajukan' : 'Ajukan'}
                        </button>
                    </td>
                `;
                tableBody.appendChild(totalRowValues);

                // Baris Pemisah antar entri pembelian
                const separatorRow = document.createElement('tr');
                separatorRow.innerHTML = `<td colspan="9"><hr style="border-top: 2px solid #ccc;"></td>`;
                tableBody.appendChild(separatorRow);
            });
        } else {
            // Tampilkan pesan jika tidak ada data
            tableBody.innerHTML = '<tr><td colspan="9">Data tidak ditemukan.</td></tr>';
        }
    }

    /**
     * Menampilkan nomor halaman saat ini dan total halaman.
     */
    function displayPageNumbers() {
        if (!pageNumbersSpan) {
            console.warn("Elemen dengan kelas 'page-numbers' tidak ditemukan.");
            return;
        }
        const totalPages = Math.ceil(dataArray.length / itemsPerPage);
        // Pastikan menampilkan "1 dari 1" meskipun dataArray kosong
        pageNumbersSpan.innerHTML = `${currentPage} dari ${totalPages || 1}`;
    }

    // --- FUNGSI NAVIGASI HALAMAN (GLOBAL) ---
    // Dipasang di window agar bisa diakses dari atribut onclick di HTML
    window.goToPage = function(page) {
        if (page < 1 || page > Math.ceil(dataArray.length / itemsPerPage)) {
            return; // Hindari pergi ke halaman yang tidak valid
        }
        currentPage = page;
        displayData(currentPage);
        displayPageNumbers();
    };

    window.prevPage = function() {
        if (currentPage > 1) {
            currentPage--;
            displayData(currentPage);
            displayPageNumbers();
        }
    };

    window.nextPage = function() {
        const totalPages = Math.ceil(dataArray.length / itemsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            displayData(currentPage);
            displayPageNumbers();
        }
    };

    // --- INISIALISASI SAAT DOM LOADS ---
    // Pastikan setiap data memiliki properti isDiajukan saat dimuat pertama kali
    // Ini penting jika Anda memiliki data lama tanpa properti ini
    dataArray = dataArray.map(item => ({ ...item, isDiajukan: item.isDiajukan || false }));
    saveData(); // Simpan perubahan jika ada data baru tanpa properti isDiajukan

    // Tampilkan data dan nomor halaman pertama kali
    displayData(currentPage);
    displayPageNumbers();

    // --- EVENT LISTENERS ---

    // Event Listener untuk Tombol "Tambah Pembelian Baru"
    const tambahPembelianBaruButton = document.getElementById('tambahPembelianBaru');
    if (tambahPembelianBaruButton) {
        tambahPembelianBaruButton.addEventListener('click', function() {
            // Hapus data/index yang mungkin tersimpan dari sesi update sebelumnya
            localStorage.removeItem('updateData');
            localStorage.removeItem('updateIndex');
            // Arahkan ke halaman form pembelian (purchasing_list2.html)
            window.location.href = 'purchasing_list2.html';
        });
    }

    // Event Listener Delegasi untuk Tombol Update, Delete, dan Ajukan
    // Menggunakan event delegation pada document untuk menangani klik pada tombol dinamis
    document.addEventListener('click', function(event) {
        // Tombol Update
        if (event.target.classList.contains('updateButton')) {
            const indexToEdit = parseInt(event.target.dataset.index); // Pastikan index adalah integer
            localStorage.setItem('updateIndex', indexToEdit); // Simpan index untuk update
            // Arahkan ke halaman form dengan flag edit
            window.location.href = 'purchasing_list2.html?edit=true';
        }

        // Tombol Delete
        else if (event.target.classList.contains('deleteButton')) {
            const indexToDelete = parseInt(event.target.dataset.index); // Pastikan index adalah integer
            if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
                // Hapus data dari array berdasarkan indeks
                dataArray.splice(indexToDelete, 1);
                saveData(); // Simpan perubahan ke localStorage

                // Sesuaikan current page jika item terakhir di halaman saat ini dihapus
                const totalPagesAfterDelete = Math.ceil(dataArray.length / itemsPerPage);
                if (currentPage > totalPagesAfterDelete && currentPage > 1) {
                    currentPage = totalPagesAfterDelete;
                } else if (totalPagesAfterDelete === 0) { // Jika tidak ada data tersisa
                    currentPage = 1;
                }

                displayData(currentPage); // Perbarui tampilan tabel
                displayPageNumbers(); // Perbarui nomor halaman
                alert('Data berhasil dihapus!');
            }
        }

        // Tombol Ajukan
        else if (event.target.classList.contains('ajukanButton') && !event.target.disabled) {
            const button = event.target;
            const index = parseInt(button.dataset.index);
            const dataToAjukan = dataArray[index];

            if (confirm(`Anda yakin ingin mengajukan pembelian ini?`)) {
                let existingPengajuan = JSON.parse(localStorage.getItem('dataUntukDiajukan')) || [];

                // --- LOGIKA UTAMA: Selalu tambahkan pengajuan sebagai entri baru yang terpisah ---
                // Tidak ada lagi pengecekan tanggal & nama pemasok untuk penggabungan
                existingPengajuan.push({ ...dataToAjukan, isDiajukan: false }); // isDiajukan: false untuk status awal di halaman pengajuan

                // Simpan data yang diajukan ke localStorage untuk halaman pengajuan
                localStorage.setItem('dataUntukDiajukan', JSON.stringify(existingPengajuan));
                alert(`Data pembelian telah diajukan.`);

                // Tandai data pembelian sebagai sudah diajukan di dataArray utama
                dataArray[index].isDiajukan = true;
                saveData(); // Simpan perubahan status ke localStorage

                // Perbarui tampilan tombol "Ajukan" di halaman saat ini
                button.classList.add('diajukan');
                button.innerText = 'Diajukan';
                button.disabled = true;

                // Re-render data untuk memperbarui tampilan tombol lain di halaman saat ini (jika ada)
                displayData(currentPage);
            }
        }
    });

    // Event Listener untuk Tombol "Lanjutkan Pengajuan" (ke pengajuan_pengadaan.html)
    const lanjutkanPengajuanButton = document.getElementById('lanjutkanPengajuan');
    if (lanjutkanPengajuanButton) {
        lanjutkanPengajuanButton.addEventListener('click', function() {
            const dataToSend = localStorage.getItem('dataUntukDiajukan');
            // Cek apakah ada data yang berhasil diajukan sebelum mengarahkan
            if (dataToSend && JSON.parse(dataToSend).length > 0) {
                window.location.href = 'pengajuan_pengadaan.html';
            } else {
                alert('Tidak ada data yang dipilih untuk diajukan.');
            }
        });
    }
});