// data_mesin.js

document.addEventListener('DOMContentLoaded', function() {
    const mesinTableBody = document.getElementById('mesinTableBody');
    const addMesinButton = document.getElementById('addMesinButton');

    // Kunci untuk menyimpan data mesin di localStorage (harus sama dengan data_mesin2.js)
    const MESIN_DATA_KEY = 'mesinData';

    // Fungsi untuk memuat dan menampilkan data mesin dari localStorage
    function loadMesinData() {
        // Selalu ambil data terbaru dari localStorage saat fungsi ini dipanggil
        const mesinData = JSON.parse(localStorage.getItem(MESIN_DATA_KEY)) || [];
        mesinTableBody.innerHTML = ''; // Kosongkan tabel sebelum mengisi

        if (mesinData.length === 0) {
            mesinTableBody.innerHTML = `<tr><td colspan="5" class="text-center">Belum ada data mesin.</td></tr>`;
            return;
        }

        mesinData.forEach(mesin => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${mesin.id}</td>
                <td>${mesin.nama}</td>
                <td>${mesin.kuantitas}</td>
                <td class="text-center">
                    <button type="button" class="btn btn-warning btn-sm edit-btn" data-id="${mesin.id}">Edit</button>
                    <button type="button" class="btn btn-danger btn-sm delete-btn" data-id="${mesin.id}">Hapus</button>
                </td>
            `;
            mesinTableBody.appendChild(row);
        });

        // Setelah data dimuat, tambahkan event listener untuk tombol edit dan hapus
        addEventListenersToButtons();
    }

    // Fungsi untuk menambahkan event listener pada tombol Edit dan Hapus
    function addEventListenersToButtons() {
        // Event listener untuk tombol Edit
        document.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', function() {
                const mesinId = this.dataset.id; // Ambil ID dari data-id attribute
                localStorage.setItem('editMesinId', mesinId); // Simpan ID mesin yang akan diedit ke localStorage
                window.location.href = 'data_mesin2.html'; // Arahkan ke halaman form edit
            });
        });

        // Event listener untuk tombol Hapus
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', function() {
                const mesinId = parseInt(this.dataset.id); // Ambil ID dan konversi ke integer
                // Untuk konfirmasi, ambil nama mesin dari data yang ada di localStorage
                let currentMesinData = JSON.parse(localStorage.getItem(MESIN_DATA_KEY)) || [];
                const mesinNama = currentMesinData.find(m => m.id === mesinId)?.nama || '';

                if (confirm(`Anda yakin ingin menghapus mesin dengan ID ${mesinId} (${mesinNama})?`)) {
                    // Filter data, buang yang memiliki ID yang cocok
                    currentMesinData = currentMesinData.filter(mesin => mesin.id !== mesinId);
                    
                    // Simpan kembali array yang sudah diperbarui ke localStorage
                    localStorage.setItem(MESIN_DATA_KEY, JSON.stringify(currentMesinData));
                    
                    // Muat ulang data setelah penghapusan
                    loadMesinData(); 
                    alert('Data mesin berhasil dihapus!');
                }
            });
        });
    }

    // Event listener untuk tombol "Tambah Mesin Baru"
    if (addMesinButton) {
        addMesinButton.addEventListener('click', function() {
            localStorage.removeItem('editMesinId'); // Pastikan tidak ada ID edit yang tersisa saat menambah baru
            window.location.href = 'data_mesin2.html'; // Arahkan ke form input mesin
        });
    }

    // Panggil fungsi untuk memuat data saat halaman dimuat
    loadMesinData();
});