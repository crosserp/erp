document.addEventListener('DOMContentLoaded', function() {
    // --- Elemen DOM untuk Menampilkan Detail Supplier ---
    const detailIdSupplier = document.getElementById('detail-idSupplier');
    const detailNamaSupplier = document.getElementById('detail-namaSupplier');
    const detailNoSupplier = document.getElementById('detail-noSupplier');
    const detailEmailSupplier = document.getElementById('detail-emailSupplier');
    const detailHutangSupplier = document.getElementById('detail-hutangSupplier');
    const detailRekeningSupplier = document.getElementById('detail-rekeningSupplier');
    const detailAlamatSupplier = document.getElementById('detail-alamatSupplier');
    const tambahTransaksiBtn = document.getElementById('tambahTransaksiBtn');
    const catatTransaksiBtn = document.getElementById('catattransaksi');


    // --- Elemen DOM untuk Tabel Transaksi Hutang ---
    const debtTransactionsTableBody = document.getElementById('debt-transactions-table-body');

    let currentSupplier = null; // Menyimpan objek supplier yang sedang ditampilkan

    // --- Helper Function ---
    /**
     * Memformat angka menjadi string dengan pemisah ribuan (Rp X.XXX).
     * @param {number|string} angka - Angka yang akan diformat.
     * @returns {string} - Angka yang sudah diformat Rupiah.
     */
    function formatRupiahDisplay(angka) {
        if (typeof angka === 'string') {
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

    // --- Logika Utama ---
    function loadSupplierDetails() {
        const supplierIdToDisplay = localStorage.getItem('viewSupplierId');
        
        if (!supplierIdToDisplay) {
            alert('Tidak ada ID supplier yang ditemukan. Kembali ke daftar supplier.');
            window.location.href = 'data_supplier.html';
            return;
        }

        const supplierData = JSON.parse(localStorage.getItem('supplierData')) || [];
        const supplier = supplierData.find(s => s.id === parseInt(supplierIdToDisplay));

        if (supplier) {
            currentSupplier = supplier; // Simpan supplier yang ditemukan
            detailIdSupplier.textContent = supplier.idSupplier || '-';
            detailNamaSupplier.textContent = supplier.namaSupplier || '-';
            detailNoSupplier.textContent = supplier.noSupplier || '-';
            detailEmailSupplier.textContent = supplier.emailSupplier || '-';
            // Pastikan hutang supplier yang ditampilkan adalah yang paling baru
            detailHutangSupplier.textContent = formatRupiahDisplay(supplier.hutangSupplier) || '-'; 
            detailRekeningSupplier.textContent = supplier.rekeningSupplier || '-';
            detailAlamatSupplier.textContent = supplier.alamatSupplier || '-';

            console.log("Detail supplier berhasil dimuat:", supplier);

            // Setelah detail supplier dimuat, panggil fungsi untuk menampilkan riwayat transaksi
            renderDebtTransactionsTable(currentSupplier.id);

        } else {
            alert('Data supplier tidak ditemukan.');
            window.location.href = 'data_supplier.html';
        }
    }

    /**
     * Menampilkan riwayat transaksi pembayaran dan penambahan hutang untuk supplier tertentu.
     * Fungsi ini mengambil data dari 'paymentTransactions' dan 'newDebtTransactions' di localStorage.
     * @param {number} supplierId - ID unik dari supplier yang sedang dilihat.
     */
    function renderDebtTransactionsTable(supplierId) {
        debtTransactionsTableBody.innerHTML = ''; // Kosongkan tabel sebelumnya

        const allPaymentTransactions = JSON.parse(localStorage.getItem('paymentTransactions')) || [];
        const allNewDebtTransactions = JSON.parse(localStorage.getItem('newDebtTransactions')) || []; // Ambil data penambahan hutang

        // Filter dan format transaksi pembayaran
        const paymentTransactionsForSupplier = allPaymentTransactions
            .filter(transaction => transaction.supplierId === supplierId)
            .map(transaction => ({
                tanggal: transaction.tanggal,
                jumlah: transaction.jumlahDibayarkan,
                keterangan: `Pembayaran Transaksi: ${transaction.nomorTransaksi || ''} (${transaction.akunPembayaranNama || ''}) - ${transaction.keterangan || ''}`,
                tipe: 'payment' // Menandai sebagai pembayaran
            }));

        // Filter dan format transaksi penambahan hutang
        const newDebtTransactionsForSupplier = allNewDebtTransactions
            .filter(transaction => transaction.supplierId === supplierId)
            .map(transaction => ({
                tanggal: transaction.tanggal,
                jumlah: transaction.jumlah,
                keterangan: `Penambahan Hutang: ${transaction.keterangan || ''}`,
                tipe: 'new_debt' // Menandai sebagai penambahan hutang
            }));

        // Gabungkan kedua jenis transaksi
        const combinedTransactions = [...paymentTransactionsForSupplier, ...newDebtTransactionsForSupplier];

        if (combinedTransactions.length === 0) {
            const row = debtTransactionsTableBody.insertRow();
            const cell = row.insertCell();
            cell.colSpan = 3; // Sesuaikan dengan jumlah kolom di tabel (Tanggal, Hutang, Keterangan)
            cell.textContent = 'Tidak ada riwayat transaksi hutang untuk supplier ini.';
            cell.style.textAlign = 'center';
            return;
        }

        // Urutkan transaksi berdasarkan tanggal terbaru
        combinedTransactions.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));

        combinedTransactions.forEach(transaction => {
            const row = debtTransactionsTableBody.insertRow();
            let amountDisplay = '';
            let amountColor = '';

            if (transaction.tipe === 'payment') {
                amountDisplay = `- ${formatRupiahDisplay(transaction.jumlah)}`;
                amountColor = 'red'; // Warna merah untuk pembayaran (mengurangi hutang)
            } else if (transaction.tipe === 'new_debt') {
                amountDisplay = `+ ${formatRupiahDisplay(transaction.jumlah)}`;
                amountColor = 'green'; // Warna hijau untuk penambahan hutang
            }

            row.innerHTML = `
                <td>${transaction.tanggal || '-'}</td>
                <td style="color: ${amountColor}; font-weight: bold;">${amountDisplay}</td>
                <td>${transaction.keterangan || '-'}</td>
            `;
        });
        console.log(`Riwayat transaksi hutang untuk supplier ID ${supplierId} dimuat.`);
    }


    // --- Event Listener untuk Tombol "Tambah Transaksi Pembayaran" ---
    if (tambahTransaksiBtn) {
        tambahTransaksiBtn.addEventListener('click', function() {
            if (currentSupplier) {
                // Simpan data yang akan di-prefill ke localStorage untuk hutang-hutang.js
                localStorage.setItem('prefillSupplierId', currentSupplier.id);
                localStorage.setItem('prefillHutangAmount', currentSupplier.hutangSupplier);
                
                // Set tanggal hari ini (opsional, bisa dihilangkan jika tidak perlu pre-fill tanggal)
                const today = new Date();
                const year = today.getFullYear();
                const month = String(today.getMonth() + 1).padStart(2, '0'); // Months start at 0!
                const day = String(today.getDate()).padStart(2, '0');
                localStorage.setItem('prefillTanggal', `${year}-${month}-${day}`);

                // Arahkan ke halaman pembayaran hutang
                window.location.href = 'hutang-hutang.html';
            } else {
                alert('Tidak ada data supplier untuk menambah transaksi.');
            }
        });
    }

    // --- Event Listener untuk Tombol "Catat Transaksi" (Penambahan Hutang Baru) ---
    if (catatTransaksiBtn) {
        catatTransaksiBtn.addEventListener('click', function() {
            if (currentSupplier) {
                // Simpan ID supplier untuk halaman input transaksi hutang baru
                localStorage.setItem('recordNewDebtSupplierId', currentSupplier.id);
                // Arahkan ke halaman input transaksi hutang baru
                window.location.href = 'data_supplier_detail_input.html';
            } else {
                alert('Tidak ada data supplier untuk mencatat transaksi.');
            }
        });
    }

    // --- Inisialisasi ---
    loadSupplierDetails();
});
