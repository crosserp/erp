// File: raw_material.js (Revisi untuk menampilkan ringkasan stok akhir bahan baku)

document.addEventListener('DOMContentLoaded', function() {
    const tabelDataBody = document.getElementById('tabelData'); // Pastikan ada <tbody id="tabelData"> di raw_material.html

    // --- Helper Function untuk Memformat Angka dengan Titik Ribuan ---
    function formatNumber(num) {
        if (typeof num !== 'number' || isNaN(num)) {
            return '-';
        }
        return num.toLocaleString('id-ID');
    }

    // --- Fungsi untuk Memuat dan Menampilkan Data Ringkasan Bahan Baku (Stok Akhir) ---
    function loadRawMaterialSummary() {
        // Ambil semua transaksi bahan baku dari localStorage
        const rawMaterialTransactions = JSON.parse(localStorage.getItem('rawMaterialTransactions')) || [];
        console.log("DEBUG: Semua Transaksi Bahan Baku berhasil dimuat:", rawMaterialTransactions);

        tabelDataBody.innerHTML = ''; // Bersihkan isi tbody sebelum mengisi ulang

        if (rawMaterialTransactions.length === 0) {
            const row = tabelDataBody.insertRow();
            const cell = row.insertCell(0);
            // Sesuaikan colspan dengan jumlah kolom yang baru (Kode, Nama, Satuan, Stok Akhir, Aksi)
            cell.colSpan = 5; // Disesuaikan, misal 5 kolom
            cell.textContent = 'Tidak ada bahan baku yang tercatat.';
            cell.classList.add('empty-message');
            return;
        }

        // --- Proses untuk mendapatkan STOK AKHIR untuk setiap bahan baku unik ---
        // 1. Kelompokkan semua transaksi berdasarkan kodeRawMaterial
        const groupedData = rawMaterialTransactions.reduce((acc, item) => {
            if (!acc[item.kodeRawMaterial]) {
                acc[item.kodeRawMaterial] = [];
            }
            acc[item.kodeRawMaterial].push(item);
            return acc;
        }, {});

        // 2. Hitung stok akhir untuk setiap bahan baku unik
        const rawMaterialSummary = [];
        for (const kode in groupedData) {
            const transactionsForThisRawMaterial = groupedData[kode];
            
            // Urutkan transaksi untuk bahan baku ini berdasarkan timestamp (paling lama ke paling baru)
            transactionsForThisRawMaterial.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

            let currentStock = 0;
            // Iterasi untuk mendapatkan stok terakhir
            transactionsForThisRawMaterial.forEach(item => {
                currentStock = currentStock + (item.barangMasuk || 0) - (item.barangKeluar || 0);
            });
            // Pastikan stok tidak negatif
            currentStock = Math.max(0, currentStock);

            // Ambil detail bahan baku (nama, satuan) dari transaksi terakhir (yang paling up-to-date)
            const lastTransaction = transactionsForThisRawMaterial[transactionsForThisRawMaterial.length - 1];

            rawMaterialSummary.push({
                kodeRawMaterial: lastTransaction.kodeRawMaterial,
                namaRawMaterial: lastTransaction.namaRawMaterial,
                satuanRawMaterial: lastTransaction.satuanRawMaterial,
                totalBarangAkhir: currentStock // Ini adalah stok akhir yang sudah dihitung
            });
        }

        // Urutkan ringkasan berdasarkan nama bahan baku atau kode untuk tampilan yang rapi
        rawMaterialSummary.sort((a, b) => a.namaRawMaterial.localeCompare(b.namaRawMaterial));

        // --- Tampilkan ringkasan bahan baku di tabel ---
        rawMaterialSummary.forEach(data => {
            const row = tabelDataBody.insertRow();

            // Kolom yang ditampilkan: Kode, Nama, Satuan, Stok Akhir, Aksi
            row.insertCell(0).textContent = data.kodeRawMaterial || '';
            row.insertCell(1).textContent = data.namaRawMaterial || '';
            row.insertCell(2).textContent = data.satuanRawMaterial || '';
            row.insertCell(3).textContent = formatNumber(data.totalBarangAkhir); // Stok Akhir

            // --- Kolom Aksi ---
            const actionCell = row.insertCell(4); // Indeks 4 untuk kolom Aksi
            actionCell.classList.add('action-cell');

            // Tombol Hapus (Menghapus SEMUA transaksi untuk kode bahan baku ini)
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Hapus Bahan Baku';
            deleteButton.classList.add('btn-action', 'btn-delete');
            deleteButton.onclick = () => deleteAllTransactionsForRawMaterial(data.kodeRawMaterial);
            actionCell.appendChild(deleteButton);

            // Tombol Detail (Mengarahkan ke halaman detail bahan baku untuk melihat pergerakan)
            const detailButton = document.createElement('button');
            detailButton.textContent = 'Detail Pergerakan';
            detailButton.classList.add('btn-action', 'btn-detail');
            detailButton.onclick = () => viewRawMaterialDetail(data.kodeRawMaterial);
            actionCell.appendChild(detailButton);
        });
        console.log(`DEBUG: ${rawMaterialSummary.length} bahan baku ringkasan ditampilkan.`);
    }

    // --- Fungsi untuk Hapus SELURUH Riwayat Transaksi untuk satu Bahan Baku ---
    function deleteAllTransactionsForRawMaterial(kodeRawMaterial) {
        if (confirm(`Apakah Anda yakin ingin menghapus SELURUH riwayat pergerakan untuk bahan baku "${kodeRawMaterial}"? Tindakan ini tidak dapat dibatalkan.`)) {
            let rawMaterialTransactions = JSON.parse(localStorage.getItem('rawMaterialTransactions')) || [];

            // Hapus semua entri yang memiliki kodeRawMaterial yang sama
            rawMaterialTransactions = rawMaterialTransactions.filter(item => item.kodeRawMaterial !== kodeRawMaterial);

            localStorage.setItem('rawMaterialTransactions', JSON.stringify(rawMaterialTransactions));
            alert(`Riwayat pergerakan bahan baku "${kodeRawMaterial}" berhasil dihapus!`);
            loadRawMaterialSummary(); // Muat ulang tabel untuk memperbarui tampilan
            console.log('DEBUG: Riwayat pergerakan untuk bahan baku:', kodeRawMaterial, 'berhasil dihapus.');
        }
    }

    // --- Fungsi untuk Melihat Detail Pergerakan Bahan Baku (ke halaman detail) ---
    function viewRawMaterialDetail(kodeRawMaterial) {
        console.log('Melihat detail pergerakan untuk Kode Bahan Baku:', kodeRawMaterial);
        localStorage.setItem('viewRawMaterialDetailId', kodeRawMaterial);
        window.location.href = 'raw_material_detail.html';
    }

    // --- (Fungsi calculateAllRawMaterialTotalStock tidak lagi dibutuhkan di sini
    //     karena kita menghitung stok akhir di loadRawMaterialSummary itu sendiri
    //     dan fungsi delete sudah menghapus semua data terkait, bukan memfilter dan menghitung ulang.) ---

    // --- Panggil fungsi utama saat seluruh DOM selesai dimuat ---
    loadRawMaterialSummary();
});