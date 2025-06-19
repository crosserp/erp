document.addEventListener('DOMContentLoaded', function() {
    const rekapSupplierDataTableBody = document.getElementById('rekapSupplierDataTableBody');

    // Periksa apakah elemen <tbody> ditemukan
    if (!rekapSupplierDataTableBody) {
        console.error("Elemen dengan ID 'rekapSupplierDataTableBody' tidak ditemukan. Pastikan HTML Anda memiliki <tbody id='rekapSupplierDataTableBody'> di goods_retur.html.");
        return;
    }

    // --- Utility Functions ---
    /**
     * Mengformat nilai numerik menjadi representasi mata uang Rupiah.
     * @param {number|string} value - Nilai yang akan diformat.
     * @returns {string} String format Rupiah.
     */
    function formatRupiah(value) {
        let number = parseFloat(String(value).replace(/[^0-9,-]/g, '').replace(',', '.'));
        if (isNaN(number)) return '';
        let rupiah = new Intl.NumberFormat('id-ID', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(number);
        return 'Rp ' + rupiah;
    }

    // Variabel global untuk menyimpan semua data retur penjualan yang diajukan
    let allSubmittedCustomerReturns = [];

    // --- Load Data dari LocalStorage ---
    /**
     * Memuat data retur pelanggan yang telah diajukan dari LocalStorage.
     * Menginisialisasi properti 'processed' untuk setiap transaksi (bukan per item lagi,
     * melainkan status keseluruhan transaksi).
     */
    function loadSubmittedCustomerReturnsData() {
        try {
            const data = localStorage.getItem('submittedCustomerReturns');
            allSubmittedCustomerReturns = JSON.parse(data) || [];
            
            // Inisialisasi properti 'processed' untuk setiap TRANSAKSI jika belum ada
            // Asumsi: jika ada 'status: "Diajukan"', maka 'processed' adalah false secara default.
            // Jika Anda ingin status 'selesai' dipertahankan antar sesi, Anda perlu menyimpan 'processed' di objek transaksi.
            allSubmittedCustomerReturns = allSubmittedCustomerReturns.map(retur => {
                if (typeof retur.processed === 'undefined') {
                    retur.processed = false; // Status default untuk transaksi: belum diproses
                }
                return retur;
            });

            // Urutkan data berdasarkan ID transaksi dari yang terbaru ke terlama
            allSubmittedCustomerReturns.sort((a, b) => b.id - a.id);

        } catch (e) {
            console.error("Error loading submitted customer returns from localStorage:", e);
            allSubmittedCustomerReturns = [];
        }
    }

    // --- Save Data ke LocalStorage ---
    /**
     * Menyimpan kembali data retur pelanggan yang telah diajukan ke LocalStorage.
     */
    function saveSubmittedCustomerReturnsData() {
        try {
            localStorage.setItem('submittedCustomerReturns', JSON.stringify(allSubmittedCustomerReturns));
        } catch (e) {
            console.error("Error saving submitted customer returns to localStorage:", e);
        }
    }

    // --- Fungsi untuk Me-render Tabel ---
    /**
     * Merender data retur pelanggan ke dalam tabel HTML.
     * Setiap baris mewakili satu transaksi retur lengkap.
     */
    function renderTable() {
        rekapSupplierDataTableBody.innerHTML = ''; // Bersihkan isi tabel sebelumnya

        // Filter hanya transaksi yang belum diproses
        const unprocessedReturns = allSubmittedCustomerReturns.filter(retur => !retur.processed);

        if (unprocessedReturns.length === 0) {
            rekapSupplierDataTableBody.innerHTML = '<tr><td colspan="5" class="text-center">Tidak ada transaksi retur penjualan yang perlu diproses.</td></tr>';
            return;
        }

        // Iterasi melalui setiap transaksi yang belum diproses
        unprocessedReturns.forEach(retur => {
            // Bangun string HTML untuk detail semua item dalam transaksi ini
            let itemsDetailHtml = '';
            if (retur.items && retur.items.length > 0) {
                itemsDetailHtml = retur.items.map(item => `
                    <div style="margin-bottom: 3px; font-size: 0.95em;">
                        - <strong>${item.nama_produk}</strong> (Kode: ${item.kode_produk || '-'})
                        <br>&nbsp;&nbsp;&nbsp; Qty: ${item.qty || 0} ${item.satuan || '-'}, Harga: ${formatRupiah(item.harga || 0)}
                    </div>
                `).join('');
            } else {
                itemsDetailHtml = 'Tidak ada item detail.';
            }

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${retur.tanggal || '-'}</td>
                <td>${retur.nama_customer || '-'}</td>
                <td>${itemsDetailHtml}</td>
                <td>${retur.keterangan || 'Retur penjualan umum'}</td> <td>
                    <button class="btn-aksi-print" data-transaction-id="${retur.id}">Print Transaksi</button>
                    <button class="btn-aksi-selesai" data-transaction-id="${retur.id}">Selesai Transaksi</button>
                </td>
            `;
            rekapSupplierDataTableBody.appendChild(row);
        });

        // Tambahkan kembali event listener setelah tabel dirender ulang
        addActionButtonListeners();
    }

    // --- Fungsi untuk Menambahkan Event Listener ke Tombol Aksi ---
    /**
     * Menambahkan event listener ke tombol 'Print Transaksi' dan 'Selesai Transaksi'
     * menggunakan event delegation pada tbody.
     */
    function addActionButtonListeners() {
        rekapSupplierDataTableBody.removeEventListener('click', handleActionButtonClick); 
        rekapSupplierDataTableBody.addEventListener('click', handleActionButtonClick);
    }

    // --- Handler Event untuk Tombol Aksi ---
    /**
     * Handler untuk event klik pada tombol aksi di dalam tabel.
     * Mengidentifikasi tombol yang diklik dan memanggil fungsi yang sesuai.
     * @param {Event} event - Objek event dari klik.
     */
    function handleActionButtonClick(event) {
        const target = event.target;
        const transactionId = parseInt(target.dataset.transactionId);

        if (isNaN(transactionId)) {
            return; // Abaikan klik jika bukan tombol aksi yang relevan
        }

        if (target.classList.contains('btn-aksi-print')) {
            printFullTransaction(transactionId);
        } else if (target.classList.contains('btn-aksi-selesai')) {
            if (confirm('Apakah Anda yakin ingin menandai SELURUH TRANSAKSI retur ini sebagai selesai?')) {
                markTransactionAsDone(transactionId);
            }
        }
    }

    // --- Fungsi untuk Mencetak Seluruh Transaksi Retur ---
    /**
     * Mencetak detail seluruh transaksi retur penjualan ke jendela baru.
     * @param {number} transactionId - ID transaksi retur yang akan dicetak.
     */
    function printFullTransaction(transactionId) {
        const returToPrint = allSubmittedCustomerReturns.find(r => r.id === transactionId);

        if (!returToPrint) {
            alert('Data transaksi retur tidak ditemukan untuk dicetak.');
            return;
        }

        let printContent = `
            <div style="font-family: Arial, sans-serif; margin: 20px;">
                <h2 style="text-align: center; margin-bottom: 20px;">Detail Retur Penjualan (ID: ${returToPrint.id})</h2>
                <p><strong>Tanggal Retur:</strong> ${returToPrint.tanggal || '-'}</p>
                <p><strong>Nama Pelanggan:</strong> ${returToPrint.nama_customer || '-'}</p>
                <p><strong>Nomor Nota Retur:</strong> ${returToPrint.noNotaRetur || '-'}</p>
                <p><strong>Jenis Retur:</strong> ${returToPrint.jenisRetur || '-'}</p>
                <p><strong>Total Retur:</strong> ${formatRupiah(returToPrint.totalRetur || 0)}</p>
                <p><strong>Status:</strong> ${returToPrint.status || 'Diajukan'}</p>
                <p><strong>Keterangan Umum:</strong> ${returToPrint.keterangan || '-'}</p>
                <hr/>
                <h3 style="margin-top: 20px;">Item-item Retur:</h3>
                <table style="width:100%; border-collapse: collapse; margin-top: 10px;">
                    <thead>
                        <tr>
                            <th style="border: 1px solid #000; padding: 8px; text-align: left;">Kode Produk</th>
                            <th style="border: 1px solid #000; padding: 8px; text-align: left;">Nama Produk</th>
                            <th style="border: 1px solid #000; padding: 8px; text-align: left;">Qty</th>
                            <th style="border: 1px solid #000; padding: 8px; text-align: left;">Satuan</th>
                            <th style="border: 1px solid #000; padding: 8px; text-align: left;">Harga Satuan</th>
                            <th style="border: 1px solid #000; padding: 8px; text-align: left;">Total Item</th>
                            <th style="border: 1px solid #000; padding: 8px; text-align: left;">Keterangan Item</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        returToPrint.items.forEach(item => {
            printContent += `
                <tr>
                    <td style="border: 1px solid #000; padding: 8px;">${item.kode_produk || '-'}</td>
                    <td style="border: 1px solid #000; padding: 8px;">${item.nama_produk || '-'}</td>
                    <td style="border: 1px solid #000; padding: 8px;">${item.qty || 0}</td>
                    <td style="border: 1px solid #000; padding: 8px;">${item.satuan || '-'}</td>
                    <td style="border: 1px solid #000; padding: 8px;">${formatRupiah(item.harga || 0)}</td>
                    <td style="border: 1px solid #000; padding: 8px;">${formatRupiah((item.qty || 0) * (item.harga || 0))}</td>
                    <td style="border: 1px solid #000; padding: 8px;">${item.keterangan || '-'}</td>
                </tr>
            `;
        });

        printContent += `
                    </tbody>
                </table>
                <p style="margin-top: 30px; text-align: center; font-style: italic; font-size: 0.9em;">Dicetak pada: ${new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
            </div>
        `;

        const printWindow = window.open('', '_blank');
        printWindow.document.write('<html><head><title>Cetak Retur Penjualan</title>');
        printWindow.document.write('<style>');
        printWindow.document.write('body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }');
        printWindow.document.write('h1, h2, h3 { text-align: center; margin-bottom: 15px; }');
        printWindow.document.write('p { margin-bottom: 5px; }');
        printWindow.document.write('strong { display: inline-block; width: 120px; }');
        printWindow.document.write('table { width: 100%; border-collapse: collapse; margin-top: 20px; }');
        printWindow.document.write('th, td { border: 1px solid #000; padding: 8px; text-align: left; }');
        printWindow.document.write('th { background-color: #f2f2f2; }');
        printWindow.document.write('@media print { @page { margin: 0.5in; } }');
        printWindow.document.write('</style>');
        printWindow.document.write('</head><body>');
        printWindow.document.write(printContent);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
    }

    // --- Fungsi untuk Menandai Transaksi sebagai Selesai ---
    /**
     * Menandai seluruh transaksi retur sebagai telah diproses.
     * Transaksi yang sudah diproses akan dihapus dari daftar tampilan.
     * @param {number} transactionId - ID transaksi retur yang akan ditandai selesai.
     */
    function markTransactionAsDone(transactionId) {
        const transactionIndex = allSubmittedCustomerReturns.findIndex(r => r.id === transactionId);

        if (transactionIndex === -1) {
            alert('Transaksi retur tidak ditemukan untuk ditandai selesai.');
            return;
        }

        // Tandai transaksi sebagai diproses
        allSubmittedCustomerReturns[transactionIndex].processed = true;
        
        // Filter array untuk menghapus transaksi yang sudah diproses dari tampilan
        allSubmittedCustomerReturns = allSubmittedCustomerReturns.filter(retur => !retur.processed);
        
        saveSubmittedCustomerReturnsData(); // Simpan array yang sudah di-filter

        alert('Transaksi retur berhasil ditandai selesai dan dihapus dari daftar.');
        renderTable(); // Render ulang tabel untuk menampilkan perubahan
    }

    // --- Inisialisasi: Muat data dan Render tabel saat halaman dimuat ---
    loadSubmittedCustomerReturnsData();
    renderTable();

    // --- Fungsi Placeholder Paginasi ---
    // Fungsi-fungsi ini hanya sebagai placeholder.
    window.prevPage = function() {
        alert('Fitur paginasi (Sebelumnya) belum diimplementasikan pada tampilan transaksi.');
    };

    window.nextPage = function() {
        alert('Fitur paginasi (Selanjutnya) belum diimplementasikan pada tampilan transaksi.');
    };
});