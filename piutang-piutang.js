// piutang-piutang.js

document.addEventListener('DOMContentLoaded', function() {
    // --- Elemen HTML ---
    const nomorTransaksiInput = document.getElementById('nomor_transaksi');
    const tanggalInput = document.getElementById('tanggal');
    const namaAkunSelect = document.getElementById('nama_akun');
    const namaCustomerSelect = document.getElementById('nama_customer');
    const sisaPiutangSpan = document.getElementById('sisaPiutang'); // Piutang customer saat ini
    const dibayarkanInput = document.getElementById('dibayarkan');
    const keteranganInput = document.getElementById('keterangan'); // Keterangan transaksi pembayaran
    const sisaPiutangSetelahBayarSpan = document.getElementById('sP'); // Sisa piutang di tabel bawah
    const totalDibayarSpan = document.getElementById('tD'); // Total dibayarkan di tabel bawah
    const simpanButton = document.querySelector('.simpan');
    const batalButton = document.querySelector('.batal');

    // --- Data dari LocalStorage ---
    let customerData = JSON.parse(localStorage.getItem('customerData')) || [];
    let allAccountsData = JSON.parse(localStorage.getItem('dataAkun')) || [];
    let paymentTransactions = JSON.parse(localStorage.getItem('paymentTransactions')) || []; // Untuk menyimpan riwayat pembayaran piutang

    // --- Variabel State ---
    let selectedCustomerId = null;
    let selectedCustomerCurrentPiutang = 0; // Piutang customer saat dipilih
    let selectedAccountId = null; // ID akun kas/bank yang dipilih

    // --- Helper Functions ---

    /**
     * Memformat angka menjadi string dengan pemisah ribuan.
     * @param {number|string} number - Angka yang akan diformat.
     * @returns {string} - Angka yang sudah diformat.
     */
    function formatNumberWithDots(number) {
        if (number === null || typeof number === 'undefined' || isNaN(parseFloat(number))) {
            return '';
        }
        return parseFloat(number).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }

    /**
     * Mengurai string yang diformat ribuan menjadi angka integer bersih.
     * @param {string} formattedNumber - String angka yang diformat.
     * @returns {number} - Angka integer bersih atau 0 jika tidak valid.
     */
    function parseFormattedNumber(formattedNumber) {
        if (!formattedNumber) {
            return 0;
        }
        const cleanedNumber = formattedNumber.replace(/\./g, '');
        const parsed = parseInt(cleanedNumber, 10);
        return isNaN(parsed) ? 0 : parsed;
    }

    /**
     * Memformat angka menjadi format mata uang Rupiah lengkap (misal: "Rp 10.000").
     * Digunakan untuk tampilan saldo dan jumlah.
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
     * Saldo aset berkurang saat piutang dilunasi.
     * @param {number} amount - Jumlah yang akan dikurangi dari saldo Piutang Dagang.
     */
    function updateAccountReceivableSaldo(amount) {
        const accountReceivableIndex = allAccountsData.findIndex(
            akun => akun.namaAkun === 'Piutang Dagang' && akun.tipeAkun === 'Aset'
        );

        if (accountReceivableIndex !== -1) {
            let currentSaldo = parseFormattedNumber(allAccountsData[accountReceivableIndex].saldoAkun);
            let newSaldo = currentSaldo - amount; // Piutang berkurang saat dibayar

            if (newSaldo < 0) {
                newSaldo = 0;
            }

            allAccountsData[accountReceivableIndex].saldoAkun = formatRupiahDisplay(newSaldo);
            localStorage.setItem('dataAkun', JSON.stringify(allAccountsData));
            console.log(`Saldo Piutang Dagang diperbarui: ${formatRupiahDisplay(currentSaldo)} - ${formatRupiahDisplay(amount)} = ${formatRupiahDisplay(newSaldo)}`);
        } else {
            console.warn("Akun 'Piutang Dagang' dengan tipe 'Aset' tidak ditemukan di dataAkun. Saldo tidak diperbarui.");
            alert("Peringatan: Akun 'Piutang Dagang' tidak ditemukan di pengaturan akun Anda. Saldo tidak diperbarui. Mohon tambahkan akun ini secara manual jika belum ada.");
        }
    }

    /**
     * Memperbarui saldo akun Kas/Bank yang dipilih.
     * Saldo aset bertambah saat menerima pembayaran.
     * @param {string} accountName - Nama akun Kas/Bank yang akan diperbarui.
     * @param {number} amount - Jumlah yang akan ditambahkan ke saldo akun Kas/Bank.
     */
    function updateCashBankSaldo(accountName, amount) {
        const accountIndex = allAccountsData.findIndex(
            akun => (akun.namaAkun === 'Kas' || akun.namaAkun === 'Bank') && akun.namaAkun === accountName
        );

        if (accountIndex !== -1) {
            let currentSaldo = parseFormattedNumber(allAccountsData[accountIndex].saldoAkun);
            let newSaldo = currentSaldo + amount; // Saldo Kas/Bank bertambah

            allAccountsData[accountIndex].saldoAkun = formatRupiahDisplay(newSaldo);
            localStorage.setItem('dataAkun', JSON.stringify(allAccountsData));
            console.log(`Saldo akun ${accountName} diperbarui: ${formatRupiahDisplay(currentSaldo)} + ${formatRupiahDisplay(amount)} = ${formatRupiahDisplay(newSaldo)}`);
        } else {
            console.warn(`Akun '${accountName}' tidak ditemukan di dataAkun. Saldo tidak diperbarui.`);
            alert(`Peringatan: Akun '${accountName}' tidak ditemukan di pengaturan akun Anda. Saldo tidak diperbarui. Mohon tambahkan akun ini secara manual jika belum ada.`);
        }
    }

    // Fungsi untuk mendapatkan parameter dari URL
    function getUrlParameter(name) {
        name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
        var results = regex.exec(location.search);
        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    }

    // Ambil ID customer dari parameter URL (jika ada)
    const customerIdFromUrl = parseInt(getUrlParameter('customerId'));

    // --- Inisialisasi Form ---

    /**
     * Mengisi dropdown pelanggan dari localStorage.
     * Jika customerIdFromUrl tersedia, otomatis pilih customer tersebut.
     */
    function populateCustomers() {
        namaCustomerSelect.innerHTML = '<option value="">-- Pilih Pelanggan --</option>';
        customerData.forEach(customer => {
            const option = document.createElement('option');
            option.value = customer.id;
            option.textContent = customer.namaCustomer;
            namaCustomerSelect.appendChild(option);
        });

        // Jika ada ID customer dari URL, otomatis pilih di dropdown
        if (!isNaN(customerIdFromUrl)) {
            namaCustomerSelect.value = customerIdFromUrl;
            // Panggil event 'change' secara manual untuk memicu update data pelanggan
            namaCustomerSelect.dispatchEvent(new Event('change'));
        }
    }

    /**
     * Mengisi dropdown akun Kas/Bank dari localStorage.
     */
    function populateAccounts() {
        namaAkunSelect.innerHTML = '<option value="">-- Pilih Akun Penerima --</option>';
        allAccountsData.forEach(akun => {
            // Hanya tampilkan akun Kas dan Bank untuk pembayaran
            if (akun.namaAkun === 'Kas' || akun.namaAkun === 'Bank') {
                const option = document.createElement('option');
                option.value = akun.nomorAkun; // Gunakan nomorAkun sebagai value
                option.textContent = `${akun.namaAkun} (${akun.nomorAkun})`;
                namaAkunSelect.appendChild(option);
            }
        });
    }

    /**
     * Mengisi nilai default dan data awal.
     */
    function initializePage() {
        populateCustomers();
        populateAccounts();

        // Set tanggal hari ini secara otomatis
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        tanggalInput.value = `${year}-${month}-${day}`;

        // Reset tampilan total
        sisaPiutangSetelahBayarSpan.textContent = formatRupiahDisplay(0);
        totalDibayarSpan.textContent = formatRupiahDisplay(0);
    }

    // --- Event Listeners ---

    // Event listener untuk perubahan pilihan pelanggan
    namaCustomerSelect.addEventListener('change', function() {
        selectedCustomerId = parseInt(this.value);
        if (selectedCustomerId) {
            const customer = customerData.find(c => c.id === selectedCustomerId);
            if (customer) {
                selectedCustomerCurrentPiutang = customer.piutangCustomer;
                sisaPiutangSpan.textContent = formatRupiahDisplay(selectedCustomerCurrentPiutang);
            } else {
                sisaPiutangSpan.textContent = formatRupiahDisplay(0);
                selectedCustomerCurrentPiutang = 0;
            }
        } else {
            sisaPiutangSpan.textContent = formatRupiahDisplay(0);
            selectedCustomerCurrentPiutang = 0;
        }
        // Hitung ulang sisa piutang dan total dibayarkan
        updateSummary();
    });

    // Event listener untuk perubahan pilihan akun
    namaAkunSelect.addEventListener('change', function() {
        selectedAccountId = this.value; // Nomor akun
    });

    // Event listener untuk input jumlah dibayarkan
    dibayarkanInput.addEventListener('input', function() {
        // Hapus semua non-digit kecuali koma (jika ada) dan ganti koma dengan titik
        let value = this.value.replace(/[^0-9,]/g, '');
        value = value.replace(',', '.');

        // Jika ada lebih dari satu titik, hapus semua kecuali yang pertama
        const parts = value.split('.');
        if (parts.length > 2) {
            value = parts[0] + '.' + parts.slice(1).join('');
        }

        const numericValue = parseFloat(value);
        if (!isNaN(numericValue)) {
            // Format sebagai mata uang tanpa symbol untuk input
            this.value = formatNumberWithDots(numericValue);
        } else {
            this.value = '';
        }
        updateSummary();
    });

    dibayarkanInput.addEventListener('blur', function() {
        // Saat fokus hilang, format ulang ke Rupiah lengkap jika ada nilai
        const parsedValue = parseFormattedNumber(this.value);
        this.value = parsedValue > 0 ? formatNumberWithDots(parsedValue) : '';
    });

    dibayarkanInput.addEventListener('focus', function() {
        // Saat fokus, tampilkan nilai bersih tanpa format untuk kemudahan edit
        const cleanValue = parseFormattedNumber(this.value);
        this.value = cleanValue === 0 ? '' : cleanValue.toString();
    });

    /**
     * Memperbarui Sisa Piutang dan Total Dibayarkan di tabel bawah.
     */
    function updateSummary() {
        const jumlahDibayarkan = parseFormattedNumber(dibayarkanInput.value);
        const sisaPiutangSetelahPembayaran = selectedCustomerCurrentPiutang - jumlahDibayarkan;

        sisaPiutangSetelahBayarSpan.textContent = formatRupiahDisplay(sisaPiutangSetelahPembayaran);
        totalDibayarSpan.textContent = formatRupiahDisplay(jumlahDibayarkan);

        // Perbarui warna berdasarkan nilai
        if (sisaPiutangSetelahPembayaran < 0) {
            sisaPiutangSetelahBayarSpan.classList.add('text-danger'); // Merah jika overpaid
        } else {
            sisaPiutangSetelahBayarSpan.classList.remove('text-danger');
        }
    }

    // Event listener untuk tombol Simpan
    simpanButton.addEventListener('click', function() {
        const nomorTransaksi = nomorTransaksiInput.value.trim();
        const tanggal = tanggalInput.value;
        const jumlahDibayarkan = parseFormattedNumber(dibayarkanInput.value);
        const keterangan = keteranganInput.value.trim();

        if (!nomorTransaksi || !tanggal || !selectedCustomerId || !selectedAccountId || jumlahDibayarkan <= 0) {
            alert('Harap lengkapi semua data transaksi: Nomor Transaksi, Tanggal, Pelanggan, Akun Pembayaran, dan Jumlah Dibayarkan harus lebih dari 0.');
            return;
        }

        if (jumlahDibayarkan > selectedCustomerCurrentPiutang) {
            if (!confirm('Jumlah pembayaran melebihi sisa piutang. Lanjutkan? Sisa piutang akan menjadi 0.')) {
                return;
            }
        }

        // 1. Perbarui piutang di data customer
        const customerIndex = customerData.findIndex(c => c.id === selectedCustomerId);
        if (customerIndex !== -1) {
            customerData[customerIndex].piutangCustomer -= jumlahDibayarkan;
            if (customerData[customerIndex].piutangCustomer < 0) {
                customerData[customerIndex].piutangCustomer = 0; // Pastikan tidak negatif
            }
            localStorage.setItem('customerData', JSON.stringify(customerData));
            console.log(`Piutang customer ${customerData[customerIndex].namaCustomer} diperbarui. Piutang baru: ${formatRupiahDisplay(customerData[customerIndex].piutangCustomer)}`);
        } else {
            alert('Terjadi kesalahan: Data pelanggan tidak ditemukan.');
            return;
        }

        // 2. Perbarui saldo Piutang Dagang di dataAkun
        updateAccountReceivableSaldo(jumlahDibayarkan);

        // 3. Perbarui saldo akun Kas/Bank yang dipilih
        const selectedAccount = allAccountsData.find(akun => akun.nomorAkun === selectedAccountId);
        if (selectedAccount) {
            updateCashBankSaldo(selectedAccount.namaAkun, jumlahDibayarkan);
        } else {
            alert('Terjadi kesalahan: Akun penerima tidak ditemukan.');
            return;
        }

        // 4. Simpan catatan transaksi pembayaran piutang (opsional, untuk riwayat lengkap)
        const newPaymentTransaction = {
            id: Date.now(),
            nomorTransaksi: nomorTransaksi,
            tanggal: tanggal,
            customerId: selectedCustomerId,
            customerName: customerData[customerIndex].namaCustomer,
            jumlahDibayarkan: jumlahDibayarkan,
            akunPenerima: selectedAccount.namaAkun,
            keterangan: keterangan,
            tipe: 'Pembayaran Piutang'
        };
        paymentTransactions.push(newPaymentTransaction);
        localStorage.setItem('paymentTransactions', JSON.stringify(paymentTransactions));
        console.log("Transaksi pembayaran piutang disimpan:", newPaymentTransaction);

        alert('Pembayaran piutang berhasil dicatat!');
        // Opsional: Kembali ke halaman daftar piutang atau detail customer
        window.location.href = `data_customer_detail.html?id=${selectedCustomerId}`; // Kembali ke detail customer yang sama
    });

    // Event listener untuk tombol Batal
    batalButton.addEventListener('click', function() {
        if (confirm('Apakah Anda yakin ingin membatalkan transaksi ini?')) {
            // Jika ada customerId di URL, kembali ke detail customer tersebut
            if (!isNaN(customerIdFromUrl)) {
                window.location.href = `data_customer_detail.html?id=${customerIdFromUrl}`;
            } else {
                window.location.href = 'data_customer.html'; // Kembali ke halaman daftar customer
            }
        }
    });

    // Panggil inisialisasi saat DOM selesai dimuat
    initializePage();
});