// data_customer_detail_input.js

document.addEventListener('DOMContentLoaded', function() {
    const customerNameDisplay = document.getElementById('customerNameDisplay');
    const transactionDateInput = document.getElementById('transactionDate');
    const receivableAmountInput = document.getElementById('receivableAmount'); // Ubah dari debtAmount
    const descriptionInput = document.getElementById('description');
    const newReceivableTransactionForm = document.getElementById('newReceivableTransactionForm'); // Ubah dari newDebtTransactionForm
    const cancelTransactionBtn = document.getElementById('cancelTransactionBtn');

    let currentCustomerId = null; // Ubah dari currentSupplierId
    let allCustomersData = [];    // Ubah dari allSuppliersData
    let allAccountsData = [];

    // --- Helper Functions (sama seperti sebelumnya, hanya diganti namanya agar konsisten) ---
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
     * Memperbarui saldo akun 'Piutang Dagang' di dataAkun.
     * Saldo aset bertambah saat piutang baru ditambahkan.
     * @param {number} amount - Jumlah yang akan ditambahkan ke saldo Piutang Dagang.
     */
    function updateAccountReceivableSaldo(amount) {
        // PENTING: Pastikan nama akun di sini konsisten dengan yang ada di data_akun.js
        const accountReceivableIndex = allAccountsData.findIndex(
            akun => akun.namaAkun === 'Piutang Dagang' && akun.tipeAkun === 'Aset'
        );

        if (accountReceivableIndex !== -1) {
            let currentSaldo = parseFloat(allAccountsData[accountReceivableIndex].saldoAkun.replace(/[^0-9,]/g, '').replace(',', '.'));
            let newSaldo = currentSaldo + amount;

            if (newSaldo < 0) { // Piutang seharusnya tidak negatif jika ini penambahan
                newSaldo = 0;
            }

            allAccountsData[accountReceivableIndex].saldoAkun = formatRupiahDisplay(newSaldo);
            localStorage.setItem('dataAkun', JSON.stringify(allAccountsData));
            console.log(`Saldo Piutang Dagang diperbarui: ${formatRupiahDisplay(currentSaldo)} + ${formatRupiahDisplay(amount)} = ${formatRupiahDisplay(newSaldo)}`);
        } else {
            console.warn("Akun 'Piutang Dagang' dengan tipe 'Aset' tidak ditemukan di dataAkun. Saldo tidak diperbarui.");
            alert("Peringatan: Akun 'Piutang Dagang' tidak ditemukan di pengaturan akun Anda. Saldo tidak diperbarui.");
        }
    }

    // --- Inisialisasi Form ---
    function initializeForm() {
        allCustomersData = JSON.parse(localStorage.getItem('customerData')) || []; // Ambil data customer
        allAccountsData = JSON.parse(localStorage.getItem('dataAkun')) || [];

        // Dapatkan ID customer yang akan dicatat transaksinya
        // Kita akan menggunakan localStorage key yang berbeda untuk detail customer.
        currentCustomerId = localStorage.getItem('recordNewReceivableCustomerId'); // Ubah key localStorage

        if (!currentCustomerId) {
            alert('ID Customer tidak ditemukan. Kembali ke halaman detail customer.');
            window.location.href = 'data_customer_detail.html'; // Kembali ke detail customer jika ID tidak ada
            return;
        }

        const customer = allCustomersData.find(c => c.id === parseInt(currentCustomerId)); // Cari customer
        if (customer) {
            customerNameDisplay.textContent = customer.namaCustomer; // Tampilkan nama customer
            // Set tanggal hari ini secara otomatis
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            transactionDateInput.value = `${year}-${month}-${day}`;
        } else {
            alert('Data customer tidak ditemukan.');
            window.location.href = 'data_customer_detail.html'; // Kembali jika customer tidak ada
        }
    }

    // --- Event Listeners ---
    receivableAmountInput.addEventListener('input', function() { // Ubah dari debtAmountInput
        this.value = formatNumberInput(this.value);
    });

    newReceivableTransactionForm.addEventListener('submit', function(event) { // Ubah dari newDebtTransactionForm
        event.preventDefault();

        const tanggal = transactionDateInput.value;
        const jumlahPiutangBaru = getCleanNumber(receivableAmountInput.value); // Ubah dari jumlahHutangBaru
        const keterangan = descriptionInput.value.trim();

        if (!tanggal || jumlahPiutangBaru <= 0 || !currentCustomerId) {
            alert('Harap lengkapi semua kolom dan pastikan jumlah piutang baru lebih dari 0.');
            return;
        }

        // 1. Perbarui piutang customer
        const customerIndex = allCustomersData.findIndex(c => c.id === parseInt(currentCustomerId));
        if (customerIndex !== -1) {
            allCustomersData[customerIndex].piutangCustomer += jumlahPiutangBaru; // Tambahkan piutang
            localStorage.setItem('customerData', JSON.stringify(allCustomersData));
            console.log(`Piutang customer ${allCustomersData[customerIndex].namaCustomer} diperbarui. Piutang baru: ${formatRupiahDisplay(allCustomersData[customerIndex].piutangCustomer)}`);
        } else {
            alert('Terjadi kesalahan: Customer tidak ditemukan.');
            return;
        }

        // 2. Perbarui saldo Piutang Dagang (Aset)
        updateAccountReceivableSaldo(jumlahPiutangBaru); // Jumlah piutang baru akan menambah saldo Piutang Dagang

        // 3. Simpan catatan transaksi piutang baru (untuk riwayat lengkap)
        let customerTransactions = JSON.parse(localStorage.getItem('customerTransactions')) || []; // Simpan di key terpisah
        const newTransaction = {
            id: Date.now(),
            customerId: parseInt(currentCustomerId),
            tanggal: tanggal,
            jumlah: jumlahPiutangBaru,
            keterangan: keterangan,
            tipe: 'Penambahan Piutang' // Tipe transaksi
        };
        customerTransactions.push(newTransaction);
        localStorage.setItem('customerTransactions', JSON.stringify(customerTransactions));
        console.log("Transaksi piutang baru disimpan:", newTransaction);

        alert('Transaksi piutang baru berhasil dicatat!');
        localStorage.removeItem('recordNewReceivableCustomerId'); // Hapus ID setelah selesai
        window.location.href = 'data_customer_detail.html?id=' + currentCustomerId; // Kembali ke halaman detail customer
    });

    cancelTransactionBtn.addEventListener('click', function() {
        localStorage.removeItem('recordNewReceivableCustomerId'); // Hapus ID jika dibatalkan
        window.history.back(); // Kembali ke halaman sebelumnya (detail customer)
    });

    // Panggil inisialisasi saat DOM selesai dimuat
    initializeForm();
});