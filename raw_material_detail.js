// File: raw_material_detail.js

document.addEventListener('DOMContentLoaded', function() {
    // --- Referensi Elemen HTML ---
    const detailKodeBahanBaku = document.getElementById('detailKodeBahanBaku');
    const detailNamaBahanBaku = document.getElementById('detailNamaBahanBaku');
    const detailSatuan = document.getElementById('detailSatuan');
    const detailTotalStokTerkini = document.getElementById('detailTotalStokTerkini');

    const tanggalTransaksiInput = document.getElementById('tanggalTransaksi');
    const inputBarangMasuk = document.getElementById('inputBarangMasuk');
    const inputBarangKeluar = document.getElementById('inputBarangKeluar');
    const simpanTransaksiButton = document.getElementById('simpanTransaksiButton');
    const errorMessageDiv = document.getElementById('errorMessage');
    const riwayatTransaksiBody = document.getElementById('riwayatTransaksiBody');

    // Tambahkan referensi untuk tombol "Kembali"
    const kembaliButton = document.getElementById('kembaliButton'); 

    const rawMaterialCode = localStorage.getItem('viewRawMaterialDetailId');
    let currentRawMaterialData = null;
    let initialRawMaterialStockForTransaction = 0;

    // --- Helper Function untuk Memformat Angka dengan Titik Ribuan ---
    function formatNumber(num) {
        if (typeof num !== 'number' || isNaN(num)) {
            return '-';
        }
        return num.toLocaleString('id-ID');
    }

    // --- Fungsi Utama untuk Memuat Detail Bahan Baku dan Riwayat ---
    function loadRawMaterialDetailsAndHistory() {
        if (!rawMaterialCode) {
            errorMessageDiv.textContent = "Kode Bahan Baku tidak ditemukan. Mengarahkan kembali ke daftar bahan baku...";
            setTimeout(() => { window.location.href = 'raw_material.html'; }, 2000);
            return;
        }

        const allRawMaterialTransactions = JSON.parse(localStorage.getItem('rawMaterialTransactions')) || [];
        const allTransactionsForThisRawMaterial = allRawMaterialTransactions.filter(item => item.kodeRawMaterial === rawMaterialCode);
        allTransactionsForThisRawMaterial.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

        if (allTransactionsForThisRawMaterial.length > 0) {
            currentRawMaterialData = {
                kodeRawMaterial: allTransactionsForThisRawMaterial[0].kodeRawMaterial,
                namaRawMaterial: allTransactionsForThisRawMaterial[0].namaRawMaterial,
                satuanRawMaterial: allTransactionsForThisRawMaterial[0].satuanRawMaterial || allTransactionsForThisRawMaterial[0].satuan
            };
        } else {
            errorMessageDiv.textContent = "Detail bahan baku tidak ditemukan dalam riwayat transaksi. Pastikan kode bahan baku ini pernah dicatat.";
            setTimeout(() => { window.location.href = 'raw_material.html'; }, 3000);
            return;
        }

        if (!currentRawMaterialData) {
            errorMessageDiv.textContent = "Data dasar bahan baku tidak ditemukan. Mengarahkan kembali...";
            setTimeout(() => { window.location.href = 'raw_material.html'; }, 2000);
            return;
        }

        detailKodeBahanBaku.textContent = currentRawMaterialData.kodeRawMaterial || '-';
        detailNamaBahanBaku.textContent = currentRawMaterialData.namaRawMaterial || '-';
        detailSatuan.textContent = currentRawMaterialData.satuanRawMaterial || '-';

        let currentTotalStock = 0;
        if (allTransactionsForThisRawMaterial.length > 0) {
            currentTotalStock = allTransactionsForThisRawMaterial[allTransactionsForThisRawMaterial.length - 1].totalBarangAkhir;
        }
        detailTotalStokTerkini.textContent = formatNumber(currentTotalStock);
        initialRawMaterialStockForTransaction = currentTotalStock;

        renderTransactionHistory(allTransactionsForThisRawMaterial);
        tanggalTransaksiInput.value = new Date().toISOString().split('T')[0];
    }

    // --- Fungsi untuk Merender Riwayat Transaksi di Tabel ---
    function renderTransactionHistory(transactions) {
        riwayatTransaksiBody.innerHTML = '';
        if (transactions.length === 0) {
            const row = riwayatTransaksiBody.insertRow();
            const cell = row.insertCell(0);
            cell.colSpan = 5;
            cell.textContent = 'Belum ada riwayat transaksi untuk bahan baku ini.';
            cell.classList.add('text-center');
            return;
        }

        transactions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        transactions.forEach(trans => {
            const row = riwayatTransaksiBody.insertRow();
            row.insertCell(0).textContent = trans.tanggal || '-';
            row.insertCell(1).textContent = formatNumber(trans.barangMasuk || 0);
            row.insertCell(2).textContent = formatNumber(trans.barangKeluar || 0);
            row.insertCell(3).textContent = formatNumber(trans.totalBarangAkhir || 0);
            const timestampDate = new Date(trans.timestamp);
            row.insertCell(4).textContent = timestampDate.toLocaleString('id-ID', {
                year: 'numeric', month: 'long', day: 'numeric',
                hour: '2-digit', minute: '2-digit'
            }) || '-';
        });
    }

    // --- Fungsi untuk Menangani Simpan Transaksi Baru ---
    function simpanTransaksiBaru() {
        errorMessageDiv.textContent = '';
        errorMessageDiv.style.color = '';

        const tanggal = tanggalTransaksiInput.value;
        const barangMasuk = parseFloat(inputBarangMasuk.value) || 0;
        const barangKeluar = parseFloat(inputBarangKeluar.value) || 0;

        if (!tanggal) {
            errorMessageDiv.textContent = "Tanggal transaksi harus diisi.";
            errorMessageDiv.style.color = 'red';
            return;
        }
        if (barangMasuk === 0 && barangKeluar === 0) {
            errorMessageDiv.textContent = "Masukkan jumlah Barang Masuk atau Barang Keluar.";
            errorMessageDiv.style.color = 'red';
            return;
        }

        const currentStockAvailable = initialRawMaterialStockForTransaction + barangMasuk;
        if (barangKeluar > currentStockAvailable) {
            errorMessageDiv.textContent = `Jumlah Barang Keluar (${formatNumber(barangKeluar)}) tidak boleh melebihi Total Stok Tersedia (${formatNumber(currentStockAvailable)}).`;
            errorMessageDiv.style.color = 'red';
            return;
        }

        let allRawMaterialTransactions = JSON.parse(localStorage.getItem('rawMaterialTransactions')) || [];

        const newEntry = {
            id: Date.now(),
            tanggal: tanggal,
            kodeRawMaterial: currentRawMaterialData.kodeRawMaterial,
            namaRawMaterial: currentRawMaterialData.namaRawMaterial,
            satuanRawMaterial: currentRawMaterialData.satuanRawMaterial,
            barangMasuk: barangMasuk,
            barangKeluar: barangKeluar,
            timestamp: new Date().toISOString()
        };

        allRawMaterialTransactions.push(newEntry);

        const updatedRawMaterialTransactions = calculateAllRawMaterialTotalStock(allRawMaterialTransactions);
        localStorage.setItem('rawMaterialTransactions', JSON.stringify(updatedRawMaterialTransactions));

        errorMessageDiv.textContent = 'Transaksi bahan baku berhasil disimpan!';
        errorMessageDiv.style.color = 'green';
        setTimeout(() => {
            errorMessageDiv.textContent = '';
            errorMessageDiv.style.color = '';
        }, 3000);

        tanggalTransaksiInput.value = new Date().toISOString().split('T')[0];
        inputBarangMasuk.value = '0';
        inputBarangKeluar.value = '0';

        loadRawMaterialDetailsAndHistory();
    }

    // --- Fungsi untuk Menghitung Ulang totalBarangAkhir untuk Semua Entri Bahan Baku ---
    function calculateAllRawMaterialTotalStock(data) {
        const groupedData = data.reduce((acc, item) => {
            if (!acc[item.kodeRawMaterial]) {
                acc[item.kodeRawMaterial] = [];
            }
            acc[item.kodeRawMaterial].push(item);
            return acc;
        }, {});

        for (const kodeRawMaterial in groupedData) {
            groupedData[kodeRawMaterial].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

            let currentStock = 0;
            groupedData[kodeRawMaterial].forEach(item => {
                currentStock = currentStock + (item.barangMasuk || 0) - (item.barangKeluar || 0);
                item.totalBarangAkhir = Math.max(0, currentStock);
            });
        }
        return Object.values(groupedData).flat();
    }

    // --- Event Listeners ---
    simpanTransaksiButton.addEventListener('click', simpanTransaksiBaru);

    // Event listener untuk tombol "Kembali"
    if (kembaliButton) {
        kembaliButton.addEventListener('click', function() {
            window.location.href = 'raw_material.html'; // Mengarahkan ke halaman daftar bahan baku
        });
    }

    // Event listener untuk tombol "Batal" (jika fungsinya juga untuk kembali)
    const batalButton = document.getElementById('batalButton');
    if (batalButton) {
        batalButton.addEventListener('click', function() {
            window.location.href = 'raw_material.html'; // Kembali ke halaman daftar bahan baku
        });
    }

    // --- Panggil fungsi utama saat seluruh DOM selesai dimuat ---
    loadRawMaterialDetailsAndHistory();

    tanggalTransaksiInput.value = new Date().toISOString().split('T')[0];
});