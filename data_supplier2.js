document.addEventListener('DOMContentLoaded', function() {
    const formSupplier = document.getElementById('datasupplier');
    const idSupplierInput = document.getElementById('id_supplier');
    const namaSupplierInput = document.getElementById('nama_supplier');
    const noSupplierInput = document.getElementById('no_supplier');
    const emailSupplierInput = document.getElementById('email_supplier');
    const hutangSupplierInput = document.getElementById('hutang_supplier');
    const rekeningSupplierInput = document.getElementById('rekening_supplier');
    const alamatSupplierInput = document.getElementById('alamat_supplier');

    const simpanButton = document.querySelector('button.simpan');
    const batalButton = document.querySelector('button.batal');

    // Mengambil data supplier yang sudah ada dari localStorage
    let supplierData = JSON.parse(localStorage.getItem('supplierData')) || [];
    // Mengambil data akun yang sudah ada dari localStorage
    let allAccountsData = JSON.parse(localStorage.getItem('dataAkun')) || [];

    // Cek apakah ada ID supplier yang dikirimkan untuk mode edit
    const editSupplierId = localStorage.getItem('editSupplierId');
    let originalHutangSupplier = 0; // Untuk menyimpan nilai hutang asli saat mode edit

    // --- Fungsi untuk format angka ribuan ---
    /**
     * Memformat angka menjadi string dengan pemisah ribuan.
     * @param {number|string} number - Angka yang akan diformat.
     * @returns {string} - Angka yang sudah diformat.
     */
    function formatNumberWithDots(number) {
        // Handle null, undefined, atau NaN
        if (number === null || typeof number === 'undefined' || isNaN(parseFloat(number))) {
            return '';
        }
        // Pastikan input adalah number, lalu konversi ke string dan format
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
     * Fungsi ini ditambahkan agar dapat diakses di file ini.
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
    // --- Akhir Fungsi format angka ribuan ---

    // Tambahkan event listener untuk hutang_supplier input
    if (hutangSupplierInput) {
        hutangSupplierInput.addEventListener('input', function() {
            // Hapus semua non-digit
            const rawValue = this.value.replace(/\D/g, ''); 
            this.value = formatNumberWithDots(rawValue);
        });

        hutangSupplierInput.addEventListener('blur', function() {
            const parsedValue = parseFormattedNumber(this.value);
            this.value = formatNumberWithDots(parsedValue); // Format kembali saat blur
        });

        hutangSupplierInput.addEventListener('focus', function() {
            // Saat fokus, tampilkan nilai bersih tanpa format agar mudah diedit
            const cleanValue = parseFormattedNumber(this.value);
            this.value = cleanValue === 0 ? '' : cleanValue.toString();
        });
    }

    // Fungsi untuk memuat data supplier ke dalam formulir jika dalam mode edit
    function loadSupplierForEdit() {
        if (editSupplierId) {
            const supplierToEdit = supplierData.find(s => s.id === parseInt(editSupplierId));
            if (supplierToEdit) {
                // Mengisi formulir dengan data supplier
                idSupplierInput.value = supplierToEdit.idSupplier;
                namaSupplierInput.value = supplierToEdit.namaSupplier;
                noSupplierInput.value = supplierToEdit.noSupplier;
                emailSupplierInput.value = supplierToEdit.emailSupplier;
                hutangSupplierInput.value = formatNumberWithDots(supplierToEdit.hutangSupplier);
                rekeningSupplierInput.value = supplierToEdit.rekeningSupplier;
                alamatSupplierInput.value = supplierToEdit.alamatSupplier;

                // Simpan hutang asli saat ini untuk perbandingan saat mode edit
                originalHutangSupplier = supplierToEdit.hutangSupplier;

                // Nonaktifkan input ID supplier jika dalam mode edit agar tidak diubah
                idSupplierInput.readOnly = true;
                idSupplierInput.style.backgroundColor = '#e0e0e0';
            } else {
                alert('Data supplier yang akan diedit tidak ditemukan.');
                localStorage.removeItem('editSupplierId'); // Hapus ID edit yang tidak valid
            }
        }
    }

    // Panggil fungsi load saat DOM selesai dimuat
    loadSupplierForEdit();

    // --- Logika Pembaruan Saldo Akun Otomatis ---
    /**
     * Memperbarui saldo akun 'Account Payable' di dataAkun.
     * Saldo liabilitas bertambah saat ada hutang baru, berkurang saat hutang dilunasi.
     * @param {number} amount - Jumlah yang akan ditambahkan atau dikurangi dari saldo Account Payable.
     */
    function updateAccountPayableSaldo(amount) {
        // Asumsi: Nama akun 'Account Payable' dan tipe 'Liabilitas' sudah standar
        const accountPayableIndex = allAccountsData.findIndex(
            akun => akun.namaAkun === 'Account Payable' && akun.tipeAkun === 'Liabilitas'
        );

        if (accountPayableIndex !== -1) {
            // Konversi saldo dari string Rupiah ke numerik bersih
            let currentSaldo = parseFloat(allAccountsData[accountPayableIndex].saldoAkun.replace(/[^0-9,]/g, '').replace(',', '.'));
            
            // Perbarui saldo
            let newSaldo = currentSaldo + amount;

            // Pastikan saldo tidak negatif (jika hutang dilunasi berlebihan)
            if (newSaldo < 0) {
                newSaldo = 0;
            }

            // Simpan kembali saldo dalam format Rupiah menggunakan formatRupiahDisplay
            allAccountsData[accountPayableIndex].saldoAkun = formatRupiahDisplay(newSaldo);
            localStorage.setItem('dataAkun', JSON.stringify(allAccountsData));
            console.log(`Saldo Account Payable diperbarui: ${formatRupiahDisplay(currentSaldo)} ${amount >= 0 ? '+' : ''} ${formatRupiahDisplay(amount)} = ${formatRupiahDisplay(newSaldo)}`);
        } else {
            console.warn("Akun 'Account Payable' dengan tipe 'Liabilitas' tidak ditemukan di dataAkun. Saldo tidak diperbarui.");
            alert("Peringatan: Akun 'Account Payable' tidak ditemukan di pengaturan akun Anda. Saldo tidak diperbarui.");
        }
    }

    // --- Event listener untuk tombol Simpan ---
    simpanButton.addEventListener('click', function(event) {
        event.preventDefault(); // Mencegah form submit default

        const idSupplier = idSupplierInput.value.trim();
        const namaSupplier = namaSupplierInput.value.trim();
        const noSupplier = noSupplierInput.value.trim();
        const emailSupplier = emailSupplierInput.value.trim();
        const hutangSupplier = parseFormattedNumber(hutangSupplierInput.value); // Sudah di-parse ke number
        const rekeningSupplier = rekeningSupplierInput.value.trim();
        const alamatSupplier = alamatSupplierInput.value.trim();

        // Validasi input
        if (!idSupplier || !namaSupplier || !noSupplier || !emailSupplier || hutangSupplier === null || !rekeningSupplier || !alamatSupplier) {
            alert('Semua kolom harus diisi!');
            return;
        }

        // Validasi format angka untuk ID, Telepon, Rekening
        if (isNaN(parseInt(idSupplier)) || parseInt(idSupplier) <= 0) {
            alert('ID Supplier harus berupa angka positif.');
            return;
        }
        if (isNaN(parseInt(noSupplier)) || parseInt(noSupplier) < 0) { 
            alert('Nomor Telepon harus berupa angka positif atau nol.');
            return;
        }
        if (isNaN(parseInt(rekeningSupplier)) || parseInt(rekeningSupplier) < 0) { 
            alert('Nomor Rekening harus berupa angka positif atau nol.');
            return;
        }
        if (hutangSupplier < 0) {
            alert('Hutang tidak boleh negatif.');
            return;
        }

        // --- Logika Simpan Data Supplier & Pembaruan Saldo Akun ---
        if (editSupplierId) {
            // Mode Edit: Perbarui data supplier yang sudah ada
            const indexToUpdate = supplierData.findIndex(s => s.id === parseInt(editSupplierId));
            if (indexToUpdate > -1) {
                // Hitung selisih hutang baru dikurangi hutang lama
                const debtDifference = hutangSupplier - originalHutangSupplier;

                // Perbarui data supplier
                supplierData[indexToUpdate].idSupplier = idSupplier;
                supplierData[indexToUpdate].namaSupplier = namaSupplier;
                supplierData[indexToUpdate].noSupplier = parseInt(noSupplier);
                supplierData[indexToUpdate].emailSupplier = emailSupplier;
                supplierData[indexToUpdate].hutangSupplier = hutangSupplier;
                supplierData[indexToUpdate].rekeningSupplier = parseInt(rekeningSupplier);
                supplierData[indexToUpdate].alamatSupplier = alamatSupplier;

                // Update saldo Account Payable jika ada perubahan hutang
                if (debtDifference !== 0) {
                    updateAccountPayableSaldo(debtDifference);
                }
                alert('Data supplier berhasil diperbarui!');
            }
            localStorage.removeItem('editSupplierId'); // Hapus ID edit setelah selesai
        } else {
            // Mode Tambah: Buat objek supplier baru
            // Cek duplikasi ID supplier (hanya jika dalam mode tambah)
            const isDuplicateId = supplierData.some(s => s.idSupplier === idSupplier);
            if (isDuplicateId) {
                alert('ID Supplier sudah ada. Mohon gunakan ID lain.');
                return;
            }

            const newSupplier = {
                id: Date.now(), // ID unik internal berdasarkan timestamp
                idSupplier: idSupplier, // ID supplier dari input user
                namaSupplier: namaSupplier,
                noSupplier: parseInt(noSupplier),
                emailSupplier: emailSupplier,
                hutangSupplier: hutangSupplier,
                rekeningSupplier: parseInt(rekeningSupplier),
                alamatSupplier: alamatSupplier
            };
            supplierData.push(newSupplier);

            // Tambahkan nilai hutang ke saldo Account Payable untuk supplier baru
            if (hutangSupplier > 0) {
                updateAccountPayableSaldo(hutangSupplier);
            }
            alert('Data supplier berhasil disimpan!');
        }

        // Simpan data supplier yang diperbarui ke localStorage
        localStorage.setItem('supplierData', JSON.stringify(supplierData));

        // Arahkan kembali ke halaman daftar supplier
        window.location.href = 'data_supplier.html';
    });

    // --- Event listener untuk tombol Batal ---
    batalButton.addEventListener('click', function(event) {
        event.preventDefault(); // Mencegah perilaku default tombol
        localStorage.removeItem('editSupplierId'); // Hapus ID edit jika ada
        window.location.href = 'data_supplier.html'; // Kembali ke halaman daftar supplier
    });
});
