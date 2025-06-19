document.addEventListener('DOMContentLoaded', function() {
    const supplierNameDisplay = document.getElementById('supplierNameDisplay');
    const transactionDateInput = document.getElementById('transactionDate');
    const debtAmountInput = document.getElementById('debtAmount');
    const descriptionInput = document.getElementById('description');
    const newDebtTransactionForm = document.getElementById('newDebtTransactionForm');
    const cancelTransactionBtn = document.getElementById('cancelTransactionBtn');

    let currentSupplierId = null;
    let allSuppliersData = [];
    let allAccountsData = [];

    // --- Helper Functions ---
    /**
     * Memformat angka menjadi string dengan pemisah ribuan (misal: 100.000).
     * Digunakan untuk tampilan input saat diketik.
     * @param {string} rawValue - String angka mentah (hanya digit).
     * @returns {string} - Angka yang sudah diformat ribuan.
     */
    function formatNumberInput(rawValue) {
        let cleanValue = rawValue.replace(/\D/g, ''); // Hapus semua non-digit
        return new Intl.NumberFormat('id-ID').format(parseInt(cleanValue, 10) || 0);
    }

    /**
     * Mengambil nilai numerik bersih dari input yang diformat (misal: dari "100.000" menjadi 100000).
     * @param {string} formattedValue - String angka yang diformat.
     * @returns {number} - Nilai numerik bersih.
     */
    function getCleanNumber(formattedValue) {
        const cleaned = formattedValue.replace(/\./g, ''); // Hapus titik pemisah ribuan
        return parseFloat(cleaned) || 0;
    }

    /**
     * Memformat angka menjadi format mata uang Rupiah lengkap (misal: "Rp 10.000").
     * @param {number|string} angka - Nilai angka yang akan diformat.
     * @returns {string} - Angka yang sudah diformat Rupiah lengkap.
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

    /**
     * Memperbarui saldo akun 'Account Payable' di dataAkun.
     * Saldo liabilitas bertambah saat ada hutang baru, berkurang saat hutang dilunasi.
     * @param {number} amount - Jumlah yang akan ditambahkan atau dikurangi dari saldo Account Payable.
     */
    function updateAccountPayableSaldo(amount) {
        const accountPayableIndex = allAccountsData.findIndex(
            akun => akun.namaAkun === 'Account Payable' && akun.tipeAkun === 'Liabilitas'
        );

        if (accountPayableIndex !== -1) {
            let currentSaldo = parseFloat(allAccountsData[accountPayableIndex].saldoAkun.replace(/[^0-9,]/g, '').replace(',', '.'));
            let newSaldo = currentSaldo + amount;

            if (newSaldo < 0) { // Pastikan saldo tidak negatif
                newSaldo = 0;
            }

            allAccountsData[accountPayableIndex].saldoAkun = formatRupiahDisplay(newSaldo);
            localStorage.setItem('dataAkun', JSON.stringify(allAccountsData));
            console.log(`Saldo Account Payable diperbarui: ${formatRupiahDisplay(currentSaldo)} ${amount >= 0 ? '+' : ''} ${formatRupiahDisplay(amount)} = ${formatRupiahDisplay(newSaldo)}`);
        } else {
            console.warn("Akun 'Account Payable' dengan tipe 'Liabilitas' tidak ditemukan di dataAkun. Saldo tidak diperbarui.");
            alert("Peringatan: Akun 'Account Payable' tidak ditemukan di pengaturan akun Anda. Saldo tidak diperbarui.");
        }
    }

    // --- Inisialisasi Form ---
    function initializeForm() {
        allSuppliersData = JSON.parse(localStorage.getItem('supplierData')) || [];
        allAccountsData = JSON.parse(localStorage.getItem('dataAkun')) || [];

        currentSupplierId = localStorage.getItem('recordNewDebtSupplierId');
        if (!currentSupplierId) {
            alert('ID Supplier tidak ditemukan. Kembali ke halaman detail supplier.');
            window.location.href = 'data_supplier_detail.html';
            return;
        }

        const supplier = allSuppliersData.find(s => s.id === parseInt(currentSupplierId));
        if (supplier) {
            supplierNameDisplay.textContent = supplier.namaSupplier;
            // Set tanggal hari ini secara otomatis
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            transactionDateInput.value = `${year}-${month}-${day}`;
        } else {
            alert('Data supplier tidak ditemukan.');
            window.location.href = 'data_supplier_detail.html';
        }
    }

    // --- Event Listeners ---
    debtAmountInput.addEventListener('input', function() {
        this.value = formatNumberInput(this.value);
    });

    newDebtTransactionForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const tanggal = transactionDateInput.value;
        const jumlahHutangBaru = getCleanNumber(debtAmountInput.value);
        const keterangan = descriptionInput.value.trim();

        if (!tanggal || jumlahHutangBaru <= 0 || !currentSupplierId) {
            alert('Harap lengkapi semua kolom dan pastikan jumlah hutang baru lebih dari 0.');
            return;
        }

        // 1. Perbarui hutang supplier
        const supplierIndex = allSuppliersData.findIndex(s => s.id === parseInt(currentSupplierId));
        if (supplierIndex !== -1) {
            allSuppliersData[supplierIndex].hutangSupplier += jumlahHutangBaru;
            localStorage.setItem('supplierData', JSON.stringify(allSuppliersData));
            console.log(`Hutang supplier ${allSuppliersData[supplierIndex].namaSupplier} diperbarui. Hutang baru: ${formatRupiahDisplay(allSuppliersData[supplierIndex].hutangSupplier)}`);
        } else {
            alert('Terjadi kesalahan: Supplier tidak ditemukan.');
            return;
        }

        // 2. Perbarui saldo Account Payable
        updateAccountPayableSaldo(jumlahHutangBaru);

        // 3. Simpan catatan transaksi hutang baru (opsional, untuk riwayat lengkap)
        let newDebtTransactions = JSON.parse(localStorage.getItem('newDebtTransactions')) || [];
        const newTransaction = {
            id: Date.now(),
            supplierId: parseInt(currentSupplierId),
            tanggal: tanggal,
            jumlah: jumlahHutangBaru,
            keterangan: keterangan,
            tipe: 'Penambahan Hutang' // Tipe transaksi
        };
        newDebtTransactions.push(newTransaction);
        localStorage.setItem('newDebtTransactions', JSON.stringify(newDebtTransactions));
        console.log("Transaksi hutang baru disimpan:", newTransaction);


        alert('Transaksi hutang baru berhasil dicatat!');
        localStorage.removeItem('recordNewDebtSupplierId'); // Hapus ID setelah selesai
        window.location.href = 'data_supplier_detail.html?id=' + currentSupplierId; // Kembali ke halaman detail supplier
    });

    cancelTransactionBtn.addEventListener('click', function() {
        localStorage.removeItem('recordNewDebtSupplierId'); // Hapus ID jika dibatalkan
        window.history.back(); // Kembali ke halaman sebelumnya (detail supplier)
    });

    // Panggil inisialisasi saat DOM selesai dimuat
    initializeForm();
});
