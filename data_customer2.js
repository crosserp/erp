// data_customer2.js

document.addEventListener('DOMContentLoaded', function() {
    const formCustomer = document.getElementById('datacustomer');
    const idCustomerInput = document.getElementById('id_customer');
    const namaCustomerInput = document.getElementById('nama_customer');
    const noCustomerInput = document.getElementById('no_customer');
    const emailCustomerInput = document.getElementById('email_customer');
    const piutangCustomerInput = document.getElementById('piutang_customer');
    const rekeningCustomerInput = document.getElementById('rekening_customer');
    const alamatCustomerInput = document.getElementById('alamat_customer');

    const simpanButton = document.querySelector('button.simpan');
    const batalButton = document.querySelector('button.batal');

    // Mengambil data customer yang sudah ada dari localStorage
    let customerData = JSON.parse(localStorage.getItem('customerData')) || [];
    // Mengambil data akun yang sudah ada dari localStorage
    let allAccountsData = JSON.parse(localStorage.getItem('dataAkun')) || [];

    // Cek apakah ada ID customer yang dikirimkan untuk mode edit
    const editCustomerId = localStorage.getItem('editCustomerId');
    let originalPiutangCustomer = 0; // Untuk menyimpan nilai piutang asli saat mode edit

    // --- Helper Functions untuk Formatting Angka ---

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
            return 0; // Mengembalikan 0 jika kosong
        }
        const cleanedNumber = formattedNumber.replace(/\./g, ''); // Hapus semua titik
        const parsed = parseInt(cleanedNumber, 10);
        return isNaN(parsed) ? 0 : parsed; // Mengembalikan 0 jika hasil parse NaN
    }

    /**
     * Memformat angka menjadi format mata uang Rupiah lengkap (misal: "Rp 10.000").
     * Digunakan untuk menyimpan saldo akun di localStorage.
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
    // --- Akhir Helper Functions ---

    // Tambahkan event listener untuk piutang_customer input agar otomatis format
    if (piutangCustomerInput) {
        piutangCustomerInput.addEventListener('input', function() {
            const rawValue = this.value.replace(/\D/g, ''); // Hapus semua non-digit
            this.value = formatNumberWithDots(rawValue);
        });

        piutangCustomerInput.addEventListener('blur', function() {
            const parsedValue = parseFormattedNumber(this.value);
            this.value = formatNumberWithDots(parsedValue); // Format kembali saat blur
        });

        piutangCustomerInput.addEventListener('focus', function() {
            // Saat fokus, tampilkan nilai bersih tanpa format agar mudah diedit
            const cleanValue = parseFormattedNumber(this.value);
            this.value = cleanValue === 0 ? '' : cleanValue.toString();
        });
    }

    // Fungsi untuk memuat data customer ke dalam formulir jika dalam mode edit
    function loadCustomerForEdit() {
        if (editCustomerId) {
            const customerToEdit = customerData.find(c => c.id === parseInt(editCustomerId));
            if (customerToEdit) {
                // Mengisi formulir dengan data customer
                idCustomerInput.value = customerToEdit.idCustomer;
                namaCustomerInput.value = customerToEdit.namaCustomer;
                noCustomerInput.value = customerToEdit.noCustomer;
                emailCustomerInput.value = customerToEdit.emailCustomer;
                // Format piutang saat dimuat
                piutangCustomerInput.value = formatNumberWithDots(customerToEdit.piutangCustomer);
                rekeningCustomerInput.value = customerToEdit.rekeningCustomer;
                alamatCustomerInput.value = customerToEdit.alamatCustomer;

                // Simpan piutang asli saat ini untuk perbandingan saat mode edit
                originalPiutangCustomer = customerToEdit.piutangCustomer;

                // Nonaktifkan input ID customer jika dalam mode edit agar tidak diubah
                idCustomerInput.readOnly = true;
                idCustomerInput.style.backgroundColor = '#e0e0e0';
            } else {
                alert('Data customer yang akan diedit tidak ditemukan.');
                // Hapus ID edit yang tidak valid
                localStorage.removeItem('editCustomerId');
            }
        }
    }

    // Panggil fungsi load saat DOM selesai dimuat
    loadCustomerForEdit();

    // --- Logika Pembaruan Saldo Akun Otomatis ---
    /**
     * Memperbarui saldo akun 'Piutang Dagang' di dataAkun.
     * Saldo aset bertambah saat piutang baru ditambahkan, berkurang saat piutang dilunasi.
     * @param {number} amount - Jumlah yang akan ditambahkan atau dikurangi dari saldo Piutang Dagang.
     */
    function updateAccountReceivableSaldo(amount) {
        // PENTING: Pastikan nama akun di sini konsisten dengan yang ada di data_akun.js
        const accountReceivableIndex = allAccountsData.findIndex(
            akun => akun.namaAkun === 'Piutang Dagang' && akun.tipeAkun === 'Aset'
        );

        if (accountReceivableIndex !== -1) {
            // Konversi saldo dari string Rupiah ke numerik bersih
            let currentSaldo = parseFloat(allAccountsData[accountReceivableIndex].saldoAkun.replace(/[^0-9,]/g, '').replace(',', '.'));

            // Perbarui saldo
            let newSaldo = currentSaldo + amount;

            // Pastikan saldo tidak negatif (jika piutang dilunasi berlebihan)
            if (newSaldo < 0) {
                newSaldo = 0;
            }

            // Simpan kembali saldo dalam format Rupiah menggunakan formatRupiahDisplay
            allAccountsData[accountReceivableIndex].saldoAkun = formatRupiahDisplay(newSaldo);
            localStorage.setItem('dataAkun', JSON.stringify(allAccountsData));
            console.log(`Saldo Piutang Dagang diperbarui: ${formatRupiahDisplay(currentSaldo)} ${amount >= 0 ? '+' : ''} ${formatRupiahDisplay(amount)} = ${formatRupiahDisplay(newSaldo)}`);
        } else {
            console.warn("Akun 'Piutang Dagang' dengan tipe 'Aset' tidak ditemukan di dataAkun. Saldo tidak diperbarui.");
            alert("Peringatan: Akun 'Piutang Dagang' tidak ditemukan di pengaturan akun Anda. Saldo tidak diperbarui. Mohon tambahkan akun ini secara manual jika belum ada.");
        }
    }

    // --- Event listener untuk tombol Simpan ---
    simpanButton.addEventListener('click', function(event) {
        event.preventDefault(); // Mencegah form submit default

        const idCustomer = idCustomerInput.value.trim();
        const namaCustomer = namaCustomerInput.value.trim();
        const noCustomer = noCustomerInput.value.trim();
        const emailCustomer = emailCustomerInput.value.trim();
        const piutangCustomer = parseFormattedNumber(piutangCustomerInput.value); // Sudah di-parse ke number
        const rekeningCustomer = rekeningCustomerInput.value.trim();
        const alamatCustomer = alamatCustomerInput.value.trim();

        // Validasi input
        if (!idCustomer || !namaCustomer || !noCustomer || !emailCustomer || piutangCustomer === null || !rekeningCustomer || !alamatCustomer) {
            alert('Semua kolom harus diisi!');
            return;
        }

        // Validasi format angka untuk ID, Telepon, Rekening
        if (isNaN(parseInt(idCustomer)) || parseInt(idCustomer) <= 0) {
            alert('ID Customer harus berupa angka positif.');
            return;
        }
        if (isNaN(parseInt(noCustomer)) || parseInt(noCustomer) < 0) {
            alert('Nomor Telepon harus berupa angka positif atau nol.');
            return;
        }
        if (isNaN(parseInt(rekeningCustomer)) || parseInt(rekeningCustomer) < 0) {
            alert('Nomor Rekening harus berupa angka positif atau nol.');
            return;
        }
        if (piutangCustomer < 0) { // Piutang bisa 0, tapi tidak negatif
            alert('Piutang tidak boleh negatif.');
            return;
        }

        // Cek duplikasi ID customer (hanya jika bukan dalam mode edit atau jika ID customer berubah)
        if (!editCustomerId || (editCustomerId && customerData.find(c => c.id === parseInt(editCustomerId)).idCustomer !== idCustomer)) {
            const isDuplicateId = customerData.some(c => c.idCustomer === idCustomer);
            if (isDuplicateId) {
                alert('ID Customer sudah ada. Mohon gunakan ID lain.');
                return;
            }
        }

        // --- Logika Simpan Data Customer & Pembaruan Saldo Akun ---
        if (editCustomerId) {
            // Mode Edit: Perbarui data customer yang sudah ada
            const indexToUpdate = customerData.findIndex(c => c.id === parseInt(editCustomerId));
            if (indexToUpdate > -1) {
                // Hitung selisih piutang baru dikurangi piutang lama
                const debtDifference = piutangCustomer - originalPiutangCustomer;

                // Perbarui data customer
                customerData[indexToUpdate].idCustomer = idCustomer; // idCustomer (string)
                customerData[indexToUpdate].namaCustomer = namaCustomer;
                customerData[indexToUpdate].noCustomer = parseInt(noCustomer); // Konversi ke number
                customerData[indexToUpdate].emailCustomer = emailCustomer;
                customerData[indexToUpdate].piutangCustomer = piutangCustomer; // Sudah di-parse ke number
                customerData[indexToUpdate].rekeningCustomer = parseInt(rekeningCustomer); // Konversi ke number
                customerData[indexToUpdate].alamatCustomer = alamatCustomer;

                // Update saldo Piutang Dagang jika ada perubahan piutang
                if (debtDifference !== 0) {
                    updateAccountReceivableSaldo(debtDifference);
                }
                alert('Data customer berhasil diperbarui!');
            }
            localStorage.removeItem('editCustomerId'); // Hapus ID edit setelah selesai
        } else {
            // Mode Tambah: Buat objek customer baru
            const newCustomer = {
                id: Date.now(), // ID unik internal berdasarkan timestamp
                idCustomer: idCustomer, // ID customer dari input user
                namaCustomer: namaCustomer,
                noCustomer: parseInt(noCustomer),
                emailCustomer: emailCustomer,
                piutangCustomer: piutangCustomer,
                rekeningCustomer: parseInt(rekeningCustomer),
                alamatCustomer: alamatCustomer
            };
            customerData.push(newCustomer);

            // Tambahkan nilai piutang ke saldo Piutang Dagang untuk customer baru
            if (piutangCustomer > 0) {
                updateAccountReceivableSaldo(piutangCustomer);
            }
            alert('Data customer berhasil disimpan!');
        }

        // Simpan data customer yang diperbarui ke localStorage
        localStorage.setItem('customerData', JSON.stringify(customerData));

        // Arahkan kembali ke halaman daftar customer
        window.location.href = 'data_customer.html';
    });

    // --- Event listener untuk tombol Batal ---
    batalButton.addEventListener('click', function(event) {
        event.preventDefault(); // Mencegah perilaku default tombol
        localStorage.removeItem('editCustomerId'); // Hapus ID edit jika ada
        window.location.href = 'data_customer.html'; // Kembali ke halaman daftar customer
    });
});