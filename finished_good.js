// finished_good.js

document.addEventListener('DOMContentLoaded', function() {
    const tabelDataBody = document.getElementById('tabelData');

    // --- Helper Function untuk Memformat Angka dengan Titik Ribuan ---
    function formatNumber(num) {
        if (typeof num !== 'number' || isNaN(num)) {
            return '0'; // Default ke '0' untuk stok jika tidak ada
        }
        return num.toLocaleString('id-ID');
    }

    // --- Fungsi untuk Menghitung Ulang totalBarangAkhir untuk Semua Entri ---
    // (Penting untuk mendapatkan stok akhir yang akurat)
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
                item.totalBarangAkhir = Math.max(0, currentStock); // Pastikan tidak negatif
            });
        }
        return Object.values(groupedData).flat();
    }

    // --- Fungsi untuk Memuat dan Menampilkan Data Finished Goods (REVISI BESAR) ---
    function loadFinishedGoodsData() {
        // Ambil semua data transaksi, lalu hitung ulang totalBarangAkhir untuk konsistensi
        let finishedGoodsData = JSON.parse(localStorage.getItem('finishedGoodsData')) || [];
        finishedGoodsData = calculateAllTotalBarangAkhir(finishedGoodsData); // Pastikan data paling mutakhir

        // Juga muat data produk master untuk mendapatkan semua produk yang mungkin
        const produkData = JSON.parse(localStorage.getItem('produkData')) || [];

        tabelDataBody.innerHTML = ''; // Bersihkan isi tbody

        if (produkData.length === 0 && finishedGoodsData.length === 0) {
            const row = tabelDataBody.insertRow();
            const cell = row.insertCell(0);
            cell.colSpan = 5; // Sekarang ada 5 kolom
            cell.textContent = 'Tidak ada data produk atau transaksi yang tersedia.';
            cell.classList.add('empty-message');
            return;
        }

        // Map untuk menyimpan stok akhir terkini untuk setiap kode produk
        const latestStockPerProduct = new Map();
        
        // Iterasi dari transaksi yang sudah diurutkan (finishedGoodsData) untuk mendapatkan stok terakhir
        // Karena sudah diurutkan berdasarkan timestamp, entri terakhir untuk setiap produk adalah stok terkininya
        finishedGoodsData.forEach(data => {
            latestStockPerProduct.set(data.kodeProduk, {
                namaProduk: data.namaProduk,
                satuan: data.satuan,
                totalBarangAkhir: data.totalBarangAkhir
            });
        });

        // Loop melalui data produk master untuk memastikan semua produk ditampilkan,
        // bahkan jika belum ada transaksi untuk mereka (stoknya 0)
        produkData.forEach(produk => {
            const kodeProduk = produk.kodeProduk;
            const namaProduk = produk.namaProduk;
            const satuanProduk = produk.satuanProduk; // Pastikan ini sesuai dengan struktur produkData

            let stokTerkini = 0;
            if (latestStockPerProduct.has(kodeProduk)) {
                stokTerkini = latestStockPerProduct.get(kodeProduk).totalBarangAkhir;
            }

            const row = tabelDataBody.insertRow();
            row.insertCell(0).textContent = kodeProduk;
            row.insertCell(1).textContent = namaProduk;
            row.insertCell(2).textContent = satuanProduk;
            row.insertCell(3).textContent = formatNumber(stokTerkini); // Kolom "Stok Saat Ini"
            
            // --- Kolom Aksi ---
            const actionCell = row.insertCell(4);
            actionCell.classList.add('action-cell');

            // Tombol Detail (akan mengarah ke finished_good_detail.html)
            const detailButton = document.createElement('button');
            detailButton.textContent = 'Detail';
            detailButton.classList.add('btn-action', 'btn-detail'); 
            detailButton.onclick = () => showDetails(kodeProduk); // Kirim kode produk
            actionCell.appendChild(detailButton);

            // Tombol "Edit" atau "Input Transaksi" di sini kurang relevan karena ini adalah daftar produk.
            // Input transaksi bisa dilakukan di halaman detail.
            // Jika Anda ingin tombol edit di sini mengarah ke edit detail produk (bukan transaksi),
            // itu akan memerlukan halaman terpisah lagi (misal, `finished_good_edit_product_master.html`).
            // Untuk saat ini, kita akan fokus pada DETAIL dan HAPUS PRODUK MASTER (jika ada).
            
            // Tombol Edit Product Master (Opsional, jika Anda punya halaman edit produk master)
            // const editProductButton = document.createElement('button');
            // editProductButton.textContent = 'Edit Produk';
            // editProductButton.classList.add('btn-action', 'btn-edit');
            // editProductButton.onclick = () => editProductMaster(kodeProduk); // Fungsi baru
            // actionCell.appendChild(editProductButton);

            // Tombol Hapus Produk Master (Jika ingin menghapus produk beserta semua transaksinya)
            const deleteProductButton = document.createElement('button');
            deleteProductButton.textContent = 'Hapus Produk';
            deleteProductButton.classList.add('btn-action', 'btn-delete');
            deleteProductButton.onclick = () => deleteProductMaster(kodeProduk);
            actionCell.appendChild(deleteProductButton);
        });

        console.log(`DEBUG: ${produkData.length} produk ditampilkan di tabel ringkasan.`);
    }

    // --- Fungsi untuk Mengarahkan ke Halaman Detail Produk ---
    function showDetails(kodeProduk) { 
        localStorage.setItem('viewFinishedGoodId', kodeProduk); 
        window.location.href = 'finished_good_detail.html';
        console.log("DEBUG: Mengarahkan ke detail untuk Kode Produk:", kodeProduk);
    }

    // --- Fungsi untuk Menghapus Seluruh Produk dan Semua Transaksinya (BARU) ---
    function deleteProductMaster(kodeProduk) {
        if (confirm(`Apakah Anda yakin ingin menghapus produk '${kodeProduk}' beserta semua riwayat transaksinya? Tindakan ini tidak bisa dibatalkan!`)) {
            let produkData = JSON.parse(localStorage.getItem('produkData')) || [];
            let finishedGoodsData = JSON.parse(localStorage.getItem('finishedGoodsData')) || [];

            // Hapus produk dari master data produk
            produkData = produkData.filter(p => p.kodeProduk !== kodeProduk);
            localStorage.setItem('produkData', JSON.stringify(produkData));

            // Hapus semua transaksi yang terkait dengan produk ini
            finishedGoodsData = finishedGoodsData.filter(item => item.kodeProduk !== kodeProduk);
            
            // Hitung ulang totalBarangAkhir untuk data yang tersisa
            const updatedFinishedGoodsData = calculateAllTotalBarangAkhir(finishedGoodsData);
            localStorage.setItem('finishedGoodsData', JSON.stringify(updatedFinishedGoodsData));

            alert(`Produk '${kodeProduk}' dan semua transaksinya berhasil dihapus!`);
            loadFinishedGoodsData(); // Muat ulang tabel
            console.log(`DEBUG: Produk '${kodeProduk}' dan transaksinya berhasil dihapus.`);
        }
    }

    // --- Panggil fungsi utama saat seluruh DOM selesai dimuat ---
    loadFinishedGoodsData();
});