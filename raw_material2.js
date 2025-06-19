document.addEventListener('DOMContentLoaded', function() {
    // --- Referensi Elemen HTML ---
    const tanggalTransaksiInput = document.getElementById('tanggalTransaksi');
    const kodeRawMaterialSelect = document.getElementById('kode_rawmaterial'); 
    const namaRawMaterialInput = document.getElementById('nama_rawmaterial');
    const satuanRawMaterialInput = document.getElementById('satuan_rawmaterial');
    const inputBarangMasuk = document.getElementById('inputBarangMasuk');
    const inputBarangKeluar = document.getElementById('inputBarangKeluar');
    const totalStokDisplay = document.getElementById('totalStokDisplay'); // Pastikan ini adalah <input type="text" readonly>
    const simpanTransaksiButton = document.getElementById('simpanTransaksiButton');
    const batalButton = document.getElementById('batalButton');
    const errorMessageDiv = document.getElementById('errorMessage');

    // --- Sumber Data Master Bahan Baku (PENTING: Pastikan kunci ini cocok dengan file master) ---
    const rawMaterialMasterData = JSON.parse(localStorage.getItem('rawMaterialMasterData')) || []; // Disesuaikan untuk konsistensi
    console.log("DEBUG: rawMaterialMasterData dari localStorage:", rawMaterialMasterData);

    // --- Variabel untuk Mode Edit ---
    let editingTransactionId = null; 
    let initialStockBeforeTransaction = 0; // Stok sebelum transaksi yang diedit/ditambah

    // --- Fungsi Pembantu untuk Memformat Angka dengan Titik Ribuan ---
    function formatNumber(num) {
        if (typeof num !== 'number' || isNaN(num)) {
            return '0';
        }
        // Menggunakan toFixed(2) jika perlu dua desimal, atau biarkan tanpa jika hanya integer
        // Misalnya: return num.toFixed(2).toLocaleString('id-ID'); // Jika mendukung desimal
        return num.toLocaleString('id-ID', { maximumFractionDigits: 0 }); // Untuk bilangan bulat
    }

    // --- Fungsi untuk Mengisi Dropdown Kode Bahan Baku ---
    function populateKodeRawMaterialSelect() {
        kodeRawMaterialSelect.innerHTML = ''; // Membersihkan opsi sebelumnya
        errorMessageDiv.textContent = ''; // Hapus pesan error sebelumnya

        if (rawMaterialMasterData.length === 0) {
            errorMessageDiv.textContent = "Tidak ada data master bahan baku. Harap tambahkan data master bahan baku terlebih dahulu.";
            const noDataOption = document.createElement('option');
            noDataOption.value = "";
            noDataOption.textContent = "-- Tidak ada bahan baku --";
            kodeRawMaterialSelect.appendChild(noDataOption);
            simpanTransaksiButton.disabled = true; // Nonaktifkan tombol simpan jika tidak ada data master
            console.log("DEBUG: Tidak ada data master bahan baku ditemukan.");
            return;
        }

        const defaultOption = document.createElement('option');
        defaultOption.value = "";
        defaultOption.textContent = "-- Pilih Kode Bahan Baku --";
        kodeRawMaterialSelect.appendChild(defaultOption);

        rawMaterialMasterData.forEach(item => {
            const option = document.createElement('option');
            option.value = item.kodeRawMaterial;
            option.textContent = `${item.kodeRawMaterial} - ${item.namaRawMaterial}`;
            kodeRawMaterialSelect.appendChild(option);
        });
        simpanTransaksiButton.disabled = false; // Aktifkan kembali tombol simpan
        console.log(`DEBUG: ${rawMaterialMasterData.length} item master bahan baku dimuat ke dropdown.`);
    }

    // --- Fungsi untuk Memperbarui Detail Bahan Baku & Stok Otomatis ---
    function updateRawMaterialDetailsAndStock() {
        const selectedKode = kodeRawMaterialSelect.value;
        const selectedItem = rawMaterialMasterData.find(item => item.kodeRawMaterial === selectedKode);

        if (selectedItem) {
            namaRawMaterialInput.value = selectedItem.namaRawMaterial || '';
            satuanRawMaterialInput.value = selectedItem.satuanRawMaterial || '';
            loadCurrentStockForSelectedRawMaterial(selectedKode, editingTransactionId);
            console.log(`DEBUG: Detail untuk ${selectedKode} dimuat.`);
        } else {
            // Reset jika tidak ada bahan baku yang dipilih atau item tidak ditemukan
            namaRawMaterialInput.value = '';
            satuanRawMaterialInput.value = '';
            totalStokDisplay.value = '0';
            initialStockBeforeTransaction = 0;
            console.log("DEBUG: Pilihan bahan baku direset.");
        }
        updateTotalStokDisplayed(); // Perbarui tampilan total setelah detail di-load
    }

    // --- Fungsi untuk Memuat Stok Terakhir dari Bahan Baku Terpilih ---
    function loadCurrentStockForSelectedRawMaterial(kodeRawMaterial, currentEditingId = null) {
        let rawMaterialTransactions = JSON.parse(localStorage.getItem('rawMaterialTransactions')) || [];
        
        // Filter transaksi yang relevan untuk bahan baku ini
        let relevantTransactions = rawMaterialTransactions.filter(trans => trans.kodeRawMaterial === kodeRawMaterial);

        // Jika sedang mode edit, kecualikan transaksi yang sedang diedit dari perhitungan stok awal
        if (currentEditingId) {
            relevantTransactions = relevantTransactions.filter(trans => trans.id !== currentEditingId);
        }

        // Urutkan transaksi berdasarkan timestamp (paling lama ke paling baru) untuk memastikan perhitungan yang benar
        relevantTransactions.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

        // Hitung stok kumulatif hingga transaksi terakhir yang relevan
        let calculatedStock = 0;
        relevantTransactions.forEach(trans => {
            calculatedStock += (trans.barangMasuk || 0) - (trans.barangKeluar || 0);
        });
        
        initialStockBeforeTransaction = Math.max(0, calculatedStock); // Pastikan stok awal tidak negatif
        totalStokDisplay.value = formatNumber(initialStockBeforeTransaction);
        console.log(`DEBUG: Stok awal '${kodeRawMaterial}' (tanpa transaksi ID ${currentEditingId}): ${initialStockBeforeTransaction}`);
    }

    // --- Fungsi untuk Memperbarui Tampilan Total Stok Berdasarkan Input Masuk/Keluar ---
    function updateTotalStokDisplayed() {
        const barangMasuk = parseFloat(inputBarangMasuk.value) || 0;
        const barangKeluar = parseFloat(inputBarangKeluar.value) || 0;

        // Pastikan nilai tidak negatif di input (tampilan)
        inputBarangMasuk.value = Math.max(0, barangMasuk);
        inputBarangKeluar.value = Math.max(0, barangKeluar);

        const calculatedTotal = initialStockBeforeTransaction + barangMasuk - barangKeluar;
        totalStokDisplay.value = formatNumber(Math.max(0, calculatedTotal));
        console.log(`DEBUG: Stok prediksi: ${calculatedTotal}`);
    }

    // --- Fungsi untuk Menghitung Ulang totalBarangAkhir untuk Semua Transaksi Bahan Baku ---
    function calculateAllRawMaterialTotalStock(data) {
        // Buat salinan data agar tidak memodifikasi array asli secara langsung saat iterasi
        const dataCopy = [...data]; 
        const groupedData = dataCopy.reduce((acc, item) => {
            if (!acc[item.kodeRawMaterial]) {
                acc[item.kodeRawMaterial] = [];
            }
            acc[item.kodeRawMaterial].push(item);
            return acc;
        }, {});

        for (const kodeRawMaterial in groupedData) {
            // Urutkan entri berdasarkan timestamp (paling lama ke paling baru)
            groupedData[kodeRawMaterial].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

            let currentStock = 0;
            groupedData[kodeRawMaterial].forEach(item => {
                currentStock = currentStock + (item.barangMasuk || 0) - (item.barangKeluar || 0);
                item.totalBarangAkhir = Math.max(0, currentStock); // Pastikan tidak negatif
            });
        }
        // Gabungkan kembali semua data yang sudah dihitung ulang
        return Object.values(groupedData).flat().sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)); // Urutkan kembali berdasarkan timestamp keseluruhan
    }

    // --- Fungsi untuk Menangani Proses Simpan Transaksi (Tambah Baru atau Edit) ---
    function simpanTransaksi() {
        errorMessageDiv.textContent = ''; 

        const tanggal = tanggalTransaksiInput.value;
        const kodeRawMaterial = kodeRawMaterialSelect.value;
        const namaRawMaterial = namaRawMaterialInput.value; 
        const satuanRawMaterial = satuanRawMaterialInput.value; 
        const barangMasuk = parseFloat(inputBarangMasuk.value) || 0;
        const barangKeluar = parseFloat(inputBarangKeluar.value) || 0;

        // --- Validasi Input ---
        if (!tanggal) {
            errorMessageDiv.textContent = "Tanggal transaksi harus diisi.";
            tanggalTransaksiInput.focus();
            return;
        }
        if (!kodeRawMaterial) {
            errorMessageDiv.textContent = "Kode Bahan Baku harus dipilih.";
            kodeRawMaterialSelect.focus();
            return;
        }
        
        // Jika mode tambah baru, atau jika ada perubahan nilai masuk/keluar di mode edit
        if (barangMasuk === 0 && barangKeluar === 0 && !editingTransactionId) {
            errorMessageDiv.textContent = "Masukkan jumlah Barang Masuk atau Barang Keluar.";
            inputBarangMasuk.focus();
            return;
        }
        
        // Validasi stok akhir tidak boleh negatif
        const predictedFinalStock = initialStockBeforeTransaction + barangMasuk - barangKeluar;
        if (predictedFinalStock < 0) {
            errorMessageDiv.textContent = `Stok akhir tidak boleh negatif. Barang Keluar (${formatNumber(barangKeluar)}) melebihi stok yang tersedia (${formatNumber(initialStockBeforeTransaction + barangMasuk)}).`;
            inputBarangKeluar.focus();
            return;
        }
        
        let rawMaterialTransactions = JSON.parse(localStorage.getItem('rawMaterialTransactions')) || [];
        let newOrUpdatedEntry;

        if (editingTransactionId) {
            // --- Mode Edit Transaksi ---
            const indexToEdit = rawMaterialTransactions.findIndex(trans => trans.id === editingTransactionId);
            if (indexToEdit !== -1) {
                // Simpan kodeRawMaterial asli jika tidak diubah (untuk menjaga integritas data)
                const originalKodeRawMaterial = rawMaterialTransactions[indexToEdit].kodeRawMaterial;

                newOrUpdatedEntry = {
                    ...rawMaterialTransactions[indexToEdit], 
                    tanggal: tanggal,
                    kodeRawMaterial: originalKodeRawMaterial, // Pertahankan kode asli saat edit
                    namaRawMaterial: namaRawMaterial, // Pastikan ini diambil dari master jika kode tdk berubah
                    satuanRawMaterial: satuanRawMaterial, // Pastikan ini diambil dari master
                    barangMasuk: barangMasuk,
                    barangKeluar: barangKeluar,
                    timestamp: new Date().toISOString() 
                };
                rawMaterialTransactions[indexToEdit] = newOrUpdatedEntry;

                alert('Transaksi bahan baku berhasil diperbarui!');
                console.log("DEBUG: Transaksi bahan baku berhasil diperbarui:", newOrUpdatedEntry);
            } else {
                errorMessageDiv.textContent = "Transaksi yang akan diedit tidak ditemukan.";
                console.error("ERROR: Transaksi dengan ID", editingTransactionId, "tidak ditemukan untuk diedit.");
                return;
            }
        } else {
            // --- Mode Tambah Baru ---
            newOrUpdatedEntry = {
                id: Date.now(), // ID unik untuk transaksi
                tanggal: tanggal,
                kodeRawMaterial: kodeRawMaterial,
                namaRawMaterial: namaRawMaterial,
                satuanRawMaterial: satuanRawMaterial,
                barangMasuk: barangMasuk,
                barangKeluar: barangKeluar,
                timestamp: new Date().toISOString() 
            };
            rawMaterialTransactions.push(newOrUpdatedEntry);

            alert('Transaksi bahan baku berhasil disimpan!');
            console.log("DEBUG: Transaksi bahan baku berhasil disimpan (baru):", newOrUpdatedEntry);
        }

        // Hitung ulang semua totalBarangAkhir setelah perubahan/penambahan
        const updatedTransactions = calculateAllRawMaterialTotalStock(rawMaterialTransactions);
        localStorage.setItem('rawMaterialTransactions', JSON.stringify(updatedTransactions));
        
        // Bersihkan ID edit dari Local Storage
        localStorage.removeItem('editRawMaterialTransactionId');
        
        // Arahkan kembali ke halaman daftar transaksi bahan baku
        window.location.href = 'raw_material.html'; 
    }

    // --- Fungsi untuk Memuat Data untuk Mode Edit Transaksi ---
    function loadDataForEdit() {
        const idToEdit = localStorage.getItem('editRawMaterialTransactionId');
        if (idToEdit) {
            editingTransactionId = parseFloat(idToEdit); 
            let rawMaterialTransactions = JSON.parse(localStorage.getItem('rawMaterialTransactions')) || [];
            const dataToEdit = rawMaterialTransactions.find(trans => trans.id === editingTransactionId);

            if (dataToEdit) {
                // Pastikan dropdown diisi dulu sebelum memilih valuenya
                populateKodeRawMaterialSelect(); 
                
                tanggalTransaksiInput.value = dataToEdit.tanggal;
                kodeRawMaterialSelect.value = dataToEdit.kodeRawMaterial;
                kodeRawMaterialSelect.disabled = true; // Nonaktifkan kode produk saat edit
                
                // Panggil ini untuk mengisi nama/satuan dan menghitung initialStockBeforeTransaction
                // Ini akan memuat stok sebelum transaksi yang sedang diedit
                loadCurrentStockForSelectedRawMaterial(dataToEdit.kodeRawMaterial, editingTransactionId); 

                namaRawMaterialInput.value = dataToEdit.namaRawMaterial;
                satuanRawMaterialInput.value = dataToEdit.satuanRawMaterial;

                inputBarangMasuk.value = dataToEdit.barangMasuk || '0';
                inputBarangKeluar.value = dataToEdit.barangKeluar || '0';
                
                updateTotalStokDisplayed(); // Update tampilan stok akhir setelah semua input terisi
                
                console.log("DEBUG: Data transaksi untuk diedit berhasil dimuat:", dataToEdit);
            } else {
                console.error("ERROR: Transaksi dengan ID", idToEdit, "tidak ditemukan di Local Storage untuk diedit.");
                localStorage.removeItem('editRawMaterialTransactionId'); // Hapus ID edit yang tidak valid
            }
        }
    }

    // --- Event Listeners ---
    populateKodeRawMaterialSelect(); // Panggil fungsi ini saat DOM dimuat
    kodeRawMaterialSelect.addEventListener('change', updateRawMaterialDetailsAndStock);
    inputBarangMasuk.addEventListener('input', updateTotalStokDisplayed);
    inputBarangKeluar.addEventListener('input', updateTotalStokDisplayed);
    simpanTransaksiButton.addEventListener('click', simpanTransaksi);
    
    batalButton.addEventListener('click', function() {
        if (confirm('Apakah Anda yakin ingin membatalkan? Perubahan tidak akan disimpan.')) {
            localStorage.removeItem('editRawMaterialTransactionId'); 
            window.location.href = 'raw_material.html'; // Kembali ke halaman daftar
        }
    });

    // --- Pengaturan Awal Saat Halaman Dimuat ---
    tanggalTransaksiInput.value = new Date().toISOString().split('T')[0];
    inputBarangMasuk.value = '0';
    inputBarangKeluar.value = '0';
    totalStokDisplay.value = '0';

    // Muat data jika dalam mode edit (harus dipanggil setelah populateKodeRawMaterialSelect)
    loadDataForEdit();
});