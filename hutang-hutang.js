document.addEventListener('DOMContentLoaded', function() {
    // --- Elemen DOM ---
    const nomorTransaksiInput = document.getElementById('tipe'); // ID 'tipe' digunakan untuk Nomor Transaksi di HTML
    const tanggalInput = document.getElementById('tanggal');
    const namaAkunSelect = document.getElementById('nama_akun'); // Ini adalah AKUN SUMBER DANA (misal: Bank BCA, Kas)
    const namaSupplierSelect = document.getElementById('nama_supplier');
    const keteranganInput = document.getElementById('keterangan');
    const sisaHutangSpan = document.getElementById('sisaHutang'); // Untuk menampilkan hutang supplier saat ini
    const dibayarkanInput = document.getElementById('dibayarkan'); // Input nominal yang dibayarkan
    const sisaHutangTotalSpan = document.getElementById('sHu'); // Untuk menampilkan sisa hutang setelah pembayaran
    const dibayarkanTotalSpan = document.getElementById('diBaya'); // Untuk menampilkan total dibayarkan
    const simpanButton = document.querySelector('.simpan');
    const batalButton = document.querySelector('.batal');

    // --- Variabel Global ---
    let allAccountsData = []; // Data dari data_akun2.js
    let allSuppliersData = []; // Data dari data_supplier2.js
    let selectedSupplierCurrentDebt = 0; // Hutang supplier yang sedang dipilih
    let selectedSupplierId = null; // ID internal supplier yang sedang dipilih

    // --- Helper Functions ---

    /**
     * Memformat angka menjadi format mata uang Rupiah tanpa desimal.
     * Digunakan untuk tampilan saldo dan jumlah.
     * @param {number|string} angka - Nilai angka yang akan diformat.
     * @returns {string} - Angka yang sudah diformat Rupiah.
     */
    function formatRupiah(angka) {
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
     * Mendapatkan nilai numerik bersih dari input (tanpa format ribuan atau mata uang).
     * @param {string} inputId - ID dari elemen input.
     * @returns {number} - Nilai numerik bersih.
     */
    function getCleanNumber(inputId) {
        const inputElement = document.getElementById(inputId);
        if (inputElement) {
            let value = inputElement.value.replace(/[^0-9]/g, ''); // Hapus semua karakter non-angka
            return Number(value) || 0; // Kembalikan sebagai angka atau 0 jika kosong/tidak valid
        }
        return 0;
    }

    /**
     * Memformat input numerik dengan pemisah ribuan saat diketik.
     * @param {HTMLInputElement} inputElement - Elemen input yang akan diformat.
     */
    function formatNumberInput(inputElement) {
        let value = inputElement.value.replace(/[^0-9]/g, '');
        let formattedValue = new Intl.NumberFormat('id-ID').format(parseInt(value, 10) || 0);
        inputElement.value = formattedValue;
    }

    // --- Load Data dari LocalStorage ---

    function loadAccountsData() {
        const dataAkunString = localStorage.getItem('dataAkun');
        allAccountsData = dataAkunString ? JSON.parse(dataAkunString) : [];
        console.log("Data Akun dimuat:", allAccountsData);
    }

    function loadSuppliersData() {
        const supplierDataString = localStorage.getItem('supplierData');
        allSuppliersData = supplierDataString ? JSON.parse(supplierDataString) : [];
        console.log("Data Supplier dimuat:", allSuppliersData);
    }

    // --- Populate Dropdowns ---

    /**
     * Mengisi dropdown akun sumber dana (Kas/Bank).
     */
    function populateNamaAkunSelect() {
        // Filter hanya akun tipe ASET (Kas/Bank) sebagai sumber dana
        const cashBankAccounts = allAccountsData.filter(akun => akun.tipeAkun === 'Aset' && (akun.namaAkun.toLowerCase().includes('kas') || akun.namaAkun.toLowerCase().includes('bank')));

        namaAkunSelect.innerHTML = '<option value="">-- Pilih Akun Pembayaran --</option>';
        if (cashBankAccounts.length > 0) {
            cashBankAccounts.forEach(akun => {
                const option = document.createElement('option');
                option.value = akun.nomorAkun;
                option.textContent = `${akun.namaAkun} (${akun.nomorAkun}) - Saldo: ${formatRupiah(parseFloat(akun.saldoAkun.replace(/[^0-9,-]+/g, "").replace(",", ".")))}`;
                namaAkunSelect.appendChild(option);
            });
            console.log("Dropdown Akun Pembayaran berhasil diisi.");
        } else {
            console.warn("Tidak ada akun kas/bank ditemukan di dataAkun.");
        }
    }

    /**
     * Mengisi dropdown supplier.
     */
    function populateNamaSupplierSelect() {
        namaSupplierSelect.innerHTML = '<option value="">-- Pilih Supplier --</option>';
        if (allSuppliersData.length > 0) {
            allSuppliersData.forEach(supplier => {
                const option = document.createElement('option');
                // Gunakan ID internal supplier untuk value, untuk memudahkan pencarian objek supplier
                option.value = supplier.id;
                option.textContent = supplier.namaSupplier;
                namaSupplierSelect.appendChild(option);
            });
            console.log("Dropdown Supplier berhasil diisi.");
        } else {
            console.warn("Tidak ada data supplier ditemukan.");
        }
    }

    // --- Event Listeners ---

    // Event listener saat supplier dipilih
    if (namaSupplierSelect) {
        namaSupplierSelect.addEventListener('change', function() {
            const selectedId = parseInt(this.value);
            const selectedSupplier = allSuppliersData.find(s => s.id === selectedId);

            if (selectedSupplier) {
                selectedSupplierCurrentDebt = selectedSupplier.hutangSupplier || 0;
                selectedSupplierId = selectedId; // Simpan ID internal supplier
                sisaHutangSpan.textContent = formatRupiah(selectedSupplierCurrentDebt);
                console.log(`Supplier dipilih: ${selectedSupplier.namaSupplier}, Hutang saat ini: ${formatRupiah(selectedSupplierCurrentDebt)}`);
                // Resetkan input dibayarkan dan kalkulasi
                dibayarkanInput.value = '';
                updateCalculations();
            } else {
                selectedSupplierCurrentDebt = 0;
                selectedSupplierId = null;
                sisaHutangSpan.textContent = formatRupiah(0);
                dibayarkanInput.value = '';
                updateCalculations();
                console.log('Tidak ada supplier yang dipilih atau supplier tidak ditemukan.');
            }
        });
    }

    // Event listener untuk input "Yang dibayarkan"
    if (dibayarkanInput) {
        dibayarkanInput.addEventListener('input', function() {
            formatNumberInput(this); // Format angka saat diketik
            updateCalculations();
        });

        dibayarkanInput.addEventListener('blur', function() {
            const cleanValue = getCleanNumber(this.id);
            this.value = formatRupiah(cleanValue); // Format ke Rupiah saat kehilangan fokus
            updateCalculations();
        });

        dibayarkanInput.addEventListener('focus', function() {
            const cleanValue = getCleanNumber(this.id);
            this.value = cleanValue === 0 ? '' : cleanValue.toString(); // Menghapus format Rupiah saat fokus
        });
    }

    // Fungsi untuk memperbarui sisa hutang dan jumlah dibayarkan di bagian bawah
    function updateCalculations() {
        const amountPaid = getCleanNumber('dibayarkan');
        const remainingDebt = selectedSupplierCurrentDebt - amountPaid;

        sisaHutangTotalSpan.textContent = formatRupiah(remainingDebt);
        dibayarkanTotalSpan.textContent = formatRupiah(amountPaid);

        // Validasi sederhana: jangan bayar lebih dari hutang
        if (amountPaid > selectedSupplierCurrentDebt) {
            dibayarkanInput.style.borderColor = 'red';
            alert('Jumlah yang dibayarkan tidak boleh melebihi sisa hutang!');
        } else {
            dibayarkanInput.style.borderColor = ''; // Reset border
        }
    }


    // Event listener untuk tombol Simpan
    if (simpanButton) {
        simpanButton.addEventListener('click', function(event) {
            event.preventDefault();

            // --- Ambil Nilai Form ---
            const nomorTransaksi = nomorTransaksiInput.value.trim();
            const tanggalTransaksi = tanggalInput.value; // Format YYYY-MM-DD
            const selectedNomorAkunPembayaran = namaAkunSelect.value; // Nomor akun kas/bank
            const selectedNamaAkunPembayaranText = namaAkunSelect.options[namaAkunSelect.selectedIndex].textContent;
            const selectedNamaSupplierText = namaSupplierSelect.options[namaSupplierSelect.selectedIndex].textContent;
            const keterangan = keteranganInput.value.trim();
            const jumlahDibayarkan = getCleanNumber('dibayarkan'); // Nominal bersih yang dibayarkan

            // --- Validasi Input ---
            if (!nomorTransaksi || !tanggalTransaksi || !selectedNomorAkunPembayaran || !selectedSupplierId || !keterangan || jumlahDibayarkan <= 0) {
                alert('Harap lengkapi semua kolom dan pastikan jumlah yang dibayarkan lebih dari 0.');
                return;
            }

            // Validasi: Jangan bayar lebih dari hutang aktual supplier
            if (jumlahDibayarkan > selectedSupplierCurrentDebt) {
                alert('Jumlah yang dibayarkan tidak boleh melebihi sisa hutang supplier!');
                return;
            }
            
            // Validasi Saldo Akun Pembayaran (Kas/Bank)
            const selectedAccountPembayaran = allAccountsData.find(akun => akun.nomorAkun === selectedNomorAkunPembayaran);
            if (!selectedAccountPembayaran) {
                alert('Akun pembayaran tidak ditemukan. Silakan pilih kembali.');
                return;
            }
            let saldoAkunPembayaranNumeric = parseFloat(selectedAccountPembayaran.saldoAkun.replace(/[^0-9,-]+/g, "").replace(",", "."));
            if (saldoAkunPembayaranNumeric < jumlahDibayarkan) {
                alert(`Saldo akun pembayaran (${selectedNamaAkunPembayaranText}) tidak cukup (${formatRupiah(saldoAkunPembayaranNumeric)}) untuk melakukan pembayaran ${formatRupiah(jumlahDibayarkan)}.`);
                return;
            }

            // --- Logika Pembaruan Saldo & Data ---

            // 1. Kurangi Hutang Supplier
            const supplierIndex = allSuppliersData.findIndex(s => s.id === selectedSupplierId);
            if (supplierIndex !== -1) {
                allSuppliersData[supplierIndex].hutangSupplier -= jumlahDibayarkan;
                // Pastikan hutang tidak menjadi negatif
                if (allSuppliersData[supplierIndex].hutangSupplier < 0) {
                    allSuppliersData[supplierIndex].hutangSupplier = 0;
                }
                localStorage.setItem('supplierData', JSON.stringify(allSuppliersData));
                console.log(`Hutang supplier ${selectedNamaSupplierText} diperbarui. Sisa hutang: ${formatRupiah(allSuppliersData[supplierIndex].hutangSupplier)}`);
            } else {
                alert('Terjadi kesalahan: Supplier tidak ditemukan.');
                return;
            }

            // 2. Kurangi Saldo Akun Pembayaran (Kas/Bank)
            const accountIndex = allAccountsData.findIndex(akun => akun.nomorAkun === selectedNomorAkunPembayaran);
            if (accountIndex !== -1) {
                allAccountsData[accountIndex].saldoAkun = formatRupiah(saldoAkunPembayaranNumeric - jumlahDibayarkan);
                localStorage.setItem('dataAkun', JSON.stringify(allAccountsData));
                console.log(`Saldo akun pembayaran ${selectedNamaAkunPembayaranText} diperbarui.`);
            } else {
                alert('Terjadi kesalahan: Akun pembayaran tidak ditemukan.');
                return;
            }

            // 3. Simpan Transaksi Pembayaran Hutang
            let paymentTransactions = JSON.parse(localStorage.getItem('paymentTransactions')) || [];
            const newPayment = {
                id: Date.now(), // ID unik transaksi
                nomorTransaksi: nomorTransaksi,
                tanggal: tanggalTransaksi,
                akunPembayaranNomor: selectedNomorAkunPembayaran,
                akunPembayaranNama: selectedNamaAkunPembayaranText,
                supplierId: selectedSupplierId, // ID internal supplier
                supplierNama: selectedNamaSupplierText,
                keterangan: keterangan,
                jumlahDibayarkan: jumlahDibayarkan,
                sisaHutangSetelahBayar: allSuppliersData[supplierIndex].hutangSupplier // Ambil nilai hutang terbaru
            };
            paymentTransactions.push(newPayment);
            localStorage.setItem('paymentTransactions', JSON.stringify(paymentTransactions));
            console.log("Transaksi pembayaran hutang disimpan:", newPayment);

            alert('Pembayaran hutang berhasil disimpan!');

            // --- Reset Form dan Tampilan ---
            nomorTransaksiInput.value = '';
            tanggalInput.value = '';
            namaAkunSelect.value = ''; // Reset dropdown akun
            namaSupplierSelect.value = ''; // Reset dropdown supplier
            keteranganInput.value = '';
            dibayarkanInput.value = '';
            sisaHutangSpan.textContent = formatRupiah(0); // Reset tampilan hutang supplier
            sisaHutangTotalSpan.textContent = formatRupiah(0); // Reset tampilan sisa hutang total
            dibayarkanTotalSpan.textContent = formatRupiah(0); // Reset tampilan dibayarkan total

            selectedSupplierCurrentDebt = 0;
            selectedSupplierId = null;

            // Muat ulang data dropdown akun untuk menampilkan saldo terbaru jika ada
            loadAccountsData();
            populateNamaAkunSelect();
        });
    }

    // Event listener untuk tombol Batal
    if (batalButton) {
        batalButton.addEventListener('click', function() {
            if (confirm('Apakah Anda yakin ingin membatalkan? Perubahan tidak akan disimpan.')) {
                // Reset form
                nomorTransaksiInput.value = '';
                tanggalInput.value = '';
                namaAkunSelect.value = '';
                namaSupplierSelect.value = '';
                keteranganInput.value = '';
                dibayarkanInput.value = '';
                sisaHutangSpan.textContent = formatRupiah(0);
                sisaHutangTotalSpan.textContent = formatRupiah(0);
                dibayarkanTotalSpan.textContent = formatRupiah(0);

                selectedSupplierCurrentDebt = 0;
                selectedSupplierId = null;

                // Opsional: Redirect ke halaman lain
                // window.location.href = 'some_other_page.html';
            }
        });
    }

    // --- Inisialisasi: Muat Data dan Isi Dropdown saat Halaman Dimuat ---
    loadAccountsData();
    loadSuppliersData();
    populateNamaAkunSelect(); // Isi dropdown akun pembayaran
    populateNamaSupplierSelect(); // Isi dropdown supplier
});
