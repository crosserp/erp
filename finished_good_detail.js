// finished_good_detail.js

document.addEventListener('DOMContentLoaded', function() {
    // --- Referensi Elemen HTML ---
    const detailKodeProduk = document.getElementById('detailKodeProduk');
    const detailNamaBarang = document.getElementById('detailNamaBarang');
    const detailSatuan = document.getElementById('detailSatuan');
    const detailTotalStokTerkini = document.getElementById('detailTotalStokTerkini');

    const tanggalTransaksiInput = document.getElementById('tanggalTransaksi');
    const inputBarangMasuk = document.getElementById('inputBarangMasuk');
    const inputBarangKeluar = document.getElementById('inputBarangKeluar');
    const simpanTransaksiButton = document.getElementById('simpanTransaksiButton');
    const errorMessageDiv = document.getElementById('errorMessage');
    const riwayatTransaksiBody = document.getElementById('riwayatTransaksiBody');

    // ID produk yang sedang dilihat (kode produk, diambil dari localStorage)
    const productId = localStorage.getItem('viewFinishedGoodId'); 
    let currentProductData = null; // Data produk dasar (nama, satuan, dll)
    let initialProductStockForTransaction = 0; // Stok terakhir produk ini sebelum transaksi baru

    // --- Helper Function untuk Memformat Angka dengan Titik Ribuan ---
    function formatNumber(num) {
        if (typeof num !== 'number' || isNaN(num)) {
            return '-';
        }
        return num.toLocaleString('id-ID');
    }

    // --- Fungsi Utama untuk Memuat Detail Produk dan Riwayat ---
    function loadProductDetailsAndHistory() {
        if (!productId) {
            errorMessageDiv.textContent = "Kode Produk tidak ditemukan. Kembali ke daftar.";
            setTimeout(() => { window.location.href = 'finished_good.html'; }, 2000);
            return;
        }

        const allFinishedGoodsData = JSON.parse(localStorage.getItem('finishedGoodsData')) || [];
        
        // Ambil semua transaksi yang terkait dengan kodeProduk ini
        const allTransactionsForThisProduct = allFinishedGoodsData.filter(item => item.kodeProduk === productId);

        // Sortir transaksi berdasarkan timestamp (paling lama ke paling baru)
        allTransactionsForThisProduct.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

        // Dapatkan informasi dasar produk dari transaksi pertama (atau dari produkData jika tidak ada transaksi)
        if (allTransactionsForThisProduct.length > 0) {
            currentProductData = allTransactionsForThisProduct[0];
        } else {
            // Jika belum ada transaksi untuk produk ini, coba ambil dari daftar produk utama
            const produkData = JSON.parse(localStorage.getItem('produkData')) || [];
            currentProductData = produkData.find(p => p.kodeProduk === productId);
        }

        if (!currentProductData) {
            errorMessageDiv.textContent = "Detail produk tidak ditemukan.";
            setTimeout(() => { window.location.href = 'finished_good.html'; }, 2000);
            return;
        }

        // Tampilkan detail barang
        detailKodeProduk.textContent = currentProductData.kodeProduk || '-';
        detailNamaBarang.textContent = currentProductData.namaProduk || '-';
        detailSatuan.textContent = currentProductData.satuan || currentProductData.satuanProduk || '-'; // Ambil dari data produk jika ada

        // Hitung stok terkini untuk ditampilkan
        let currentTotalStock = 0;
        if (allTransactionsForThisProduct.length > 0) {
            currentTotalStock = allTransactionsForThisProduct[allTransactionsForThisProduct.length - 1].totalBarangAkhir;
        }
        detailTotalStokTerkini.textContent = formatNumber(currentTotalStock);
        initialProductStockForTransaction = currentTotalStock; // Set stok awal untuk input transaksi baru

        // Tampilkan riwayat transaksi
        renderTransactionHistory(allTransactionsForThisProduct);

        // Set tanggal default untuk input transaksi baru
        tanggalTransaksiInput.value = new Date().toISOString().split('T')[0];
    }

    // --- Fungsi untuk Merender Riwayat Transaksi di Tabel ---
    function renderTransactionHistory(transactions) {
        riwayatTransaksiBody.innerHTML = '';
        if (transactions.length === 0) {
            const row = riwayatTransaksiBody.insertRow();
            const cell = row.insertCell(0);
            cell.colSpan = 5;
            cell.textContent = 'Belum ada riwayat transaksi untuk produk ini.';
            cell.classList.add('text-center');
            return;
        }

        transactions.forEach(trans => {
            const row = riwayatTransaksiBody.insertRow();
            row.insertCell(0).textContent = trans.tanggal || '-';
            row.insertCell(1).textContent = formatNumber(trans.barangMasuk || 0);
            row.insertCell(2).textContent = formatNumber(trans.barangKeluar || 0);
            row.insertCell(3).textContent = formatNumber(trans.totalBarangAkhir || 0);
            // Format timestamp agar lebih mudah dibaca
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

        const tanggal = tanggalTransaksiInput.value;
        const barangMasuk = parseFloat(inputBarangMasuk.value) || 0;
        const barangKeluar = parseFloat(inputBarangKeluar.value) || 0;

        if (!tanggal) {
            errorMessageDiv.textContent = "Tanggal transaksi harus diisi.";
            return;
        }
        if (barangMasuk === 0 && barangKeluar === 0) {
            errorMessageDiv.textContent = "Masukkan jumlah Barang Masuk atau Barang Keluar.";
            return;
        }

        const currentStockAvailable = initialProductStockForTransaction + barangMasuk;
        if (barangKeluar > currentStockAvailable) {
             errorMessageDiv.textContent = `Jumlah Barang Keluar (${formatNumber(barangKeluar)}) tidak boleh melebihi Total Barang yang tersedia (${formatNumber(currentStockAvailable)}).`;
             return;
        }

        let allFinishedGoodsData = JSON.parse(localStorage.getItem('finishedGoodsData')) || [];

        const newEntry = {
            id: Date.now(), // ID unik untuk transaksi ini
            tanggal: tanggal,
            kodeProduk: currentProductData.kodeProduk, // Ambil dari detail produk yang sedang dilihat
            namaProduk: currentProductData.namaProduk,
            satuan: currentProductData.satuan || currentProductData.satuanProduk,
            barangMasuk: barangMasuk,
            barangKeluar: barangKeluar,
            timestamp: new Date().toISOString()
        };

        allFinishedGoodsData.push(newEntry);

        // --- Hitung Ulang Semua totalBarangAkhir setelah perubahan ---
        const updatedFinishedGoodsData = calculateAllTotalBarangAkhir(allFinishedGoodsData);
        localStorage.setItem('finishedGoodsData', JSON.stringify(updatedFinishedGoodsData));

        alert('Transaksi berhasil disimpan!');
        
        // Reset form input
        tanggalTransaksiInput.value = new Date().toISOString().split('T')[0];
        inputBarangMasuk.value = '0';
        inputBarangKeluar.value = '0';
        errorMessageDiv.textContent = '';

        // Muat ulang detail produk dan riwayat untuk memperbarui tampilan
        loadProductDetailsAndHistory();

        // Tidak ada pengalihan halaman, tetap di halaman ini.
    }

    // --- Fungsi untuk Menghitung Ulang totalBarangAkhir untuk Semua Entri ---
    // (Fungsi yang sama persis dari finished_good2.js dan finished_good.js)
    function calculateAllTotalBarangAkhir(data) {
        const groupedData = data.reduce((acc, item) => {
            if (!acc[item.kodeProduk]) {
                acc[item.kodeProduk] = [];
            }
            acc[item.kodeProduk].push(item);
            return acc;
        }, {});

        for (const kodeProduk in groupedData) {
            groupedData[kodeProduk].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

            let currentStock = 0;
            groupedData[kodeProduk].forEach(item => {
                currentStock = currentStock + (item.barangMasuk || 0) - (item.barangKeluar || 0);
                item.totalBarangAkhir = Math.max(0, currentStock); 
            });
        }
        return Object.values(groupedData).flat();
    }

    // --- Event Listeners ---
    simpanTransaksiButton.addEventListener('click', simpanTransaksiBaru);

    // Initial load
    loadProductDetailsAndHistory();
    
    // Set tanggal default di input transaksi saat pertama kali halaman dimuat
    tanggalTransaksiInput.value = new Date().toISOString().split('T')[0];
});