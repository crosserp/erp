// data_rawmaterial.js - Untuk halaman menampilkan daftar data master bahan baku

document.addEventListener('DOMContentLoaded', function() {
    // Pastikan ID ini sesuai dengan ID tbody di HTML Anda
    const tableBody = document.querySelector('#dataRawMaterialTableBody'); 
    
    // Kunci localStorage harus KONSISTEN dengan yang digunakan saat menyimpan data
    const LOCAL_STORAGE_KEY = 'rawMaterialMasterData'; 

    // --- Fungsi untuk Merender (Menampilkan) Data ke Tabel ---
    function renderRawMaterialTable() {
        // Ambil data dari localStorage
        let rawMaterialData = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || [];
        
        // Kosongkan isi tabel sebelum merender ulang
        tableBody.innerHTML = ''; 

        if (rawMaterialData.length === 0) {
            // Jika tidak ada data, tampilkan pesan
            // Sesuaikan 'colspan' dengan jumlah kolom di header tabel Anda (contoh: 4 untuk 4 kolom)
            tableBody.innerHTML = '<tr><td colspan="4" style="text-align: center;">Tidak ada data bahan baku yang ditemukan.</td></tr>'; 
            return;
        }

        // Iterasi setiap item data dan buat baris tabel
        rawMaterialData.forEach((item, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.kodeRawMaterial}</td>
                <td>${item.namaRawMaterial}</td>
                <td>${item.satuanRawMaterial}</td>
                <td>
                    <button class="editBtn" data-index="${index}">Edit</button>
                    <button class="deleteBtn" data-index="${index}">Hapus</button>
                </td>
            `;
            tableBody.appendChild(row); // Tambahkan baris ke tbody
        });
    }

    // --- Event Listeners untuk Tombol Edit dan Hapus ---
    tableBody.addEventListener('click', function(event) {
        if (event.target.classList.contains('editBtn')) {
            const indexToEdit = event.target.dataset.index;
            localStorage.setItem('updateRawMaterialIndex', indexToEdit); // Simpan indeks yang akan diedit
            window.location.href = 'data_rawmaterial2.html'; // Arahkan ke halaman edit form
        } else if (event.target.classList.contains('deleteBtn')) {
            const indexToDelete = event.target.dataset.index;
            if (confirm('Apakah Anda yakin ingin menghapus data bahan baku ini?')) {
                deleteRawMaterial(indexToDelete);
            }
        }
    });

    // --- Fungsi untuk Menghapus Data Bahan Baku ---
    function deleteRawMaterial(index) {
        let rawMaterialData = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || [];
        if (index > -1 && index < rawMaterialData.length) {
            rawMaterialData.splice(index, 1); // Hapus 1 item pada indeks tertentu
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(rawMaterialData)); // Simpan kembali data setelah dihapus
            renderRawMaterialTable(); // Render ulang tabel untuk menampilkan perubahan
            alert('Data bahan baku berhasil dihapus!');
        }
    }

    // Panggil fungsi render saat halaman dimuat
    renderRawMaterialTable();
});