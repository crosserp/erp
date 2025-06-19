// data_mesin2.js

document.addEventListener('DOMContentLoaded', function() {
    // Dapatkan referensi ke elemen form dan input
    const formMesin = document.getElementById('datamesin'); // ID form diubah menjadi 'datamesin'
    const idMesinInput = document.getElementById('id_mesin');
    const namaMesinInput = document.getElementById('nama_mesin');
    const kuantitasInput = document.getElementById('kuantitas');

    // Kunci untuk menyimpan data mesin di localStorage
    const MESIN_DATA_KEY = 'mesinData';

    // Ambil data mesin yang sudah ada dari localStorage, atau array kosong jika belum ada
    let mesinData = JSON.parse(localStorage.getItem(MESIN_DATA_KEY)) || [];

    // --- Fungsi Bantuan ---

    /**
     * Memuat data mesin ke dalam formulir jika dalam mode edit.
     * Menggunakan 'editMesinId' dari localStorage untuk menentukan mode edit.
     */
    function loadMesinForEdit() {
        const editMesinId = localStorage.getItem('editMesinId'); // Ambil ID mesin yang akan diedit

        if (editMesinId) {
            // Cari data mesin berdasarkan ID yang disimpan
            const mesinToEdit = mesinData.find(mesin => mesin.id === parseInt(editMesinId));

            if (mesinToEdit) {
                // Isi input form dengan data mesin yang akan diedit
                idMesinInput.value = mesinToEdit.id;
                namaMesinInput.value = mesinToEdit.nama;
                kuantitasInput.value = mesinToEdit.kuantitas;

                // Nonaktifkan input ID Mesin agar tidak bisa diubah saat edit
                idMesinInput.readOnly = true;
                idMesinInput.style.backgroundColor = '#e9ecef';
            } else {
                alert('Data mesin yang akan diedit tidak ditemukan.');
                // Hapus ID edit yang tidak valid agar form kembali ke mode tambah baru
                localStorage.removeItem('editMesinId');
            }
        } else {
            // Jika tidak ada editMesinId, pastikan input ID Mesin aktif
            idMesinInput.readOnly = false;
            idMesinInput.style.backgroundColor = '';
        }
    }

    // --- Event Listeners ---

    // Event listener untuk submit form
    formMesin.addEventListener('submit', function(event) {
        event.preventDefault(); // Mencegah form dari submit secara default (memuat ulang halaman)

        // Ambil nilai dari input
        const idMesin = parseInt(idMesinInput.value); // Pastikan ini angka
        const namaMesin = namaMesinInput.value.trim();
        const kuantitas = parseInt(kuantitasInput.value); // Pastikan ini angka

        // Validasi input
        if (isNaN(idMesin) || idMesin <= 0) {
            alert('ID Mesin harus berupa angka positif.');
            return;
        }
        if (!namaMesin) {
            alert('Nama Mesin tidak boleh kosong.');
            return;
        }
        if (isNaN(kuantitas) || kuantitas < 0) {
            alert('Kuantitas Mesin harus berupa angka positif atau nol.');
            return;
        }

        const editMesinId = localStorage.getItem('editMesinId');

        if (editMesinId) {
            // Mode Edit: Perbarui data mesin yang sudah ada
            const indexToUpdate = mesinData.findIndex(mesin => mesin.id === parseInt(editMesinId));

            if (indexToUpdate > -1) {
                mesinData[indexToUpdate] = {
                    id: idMesin, // ID tidak berubah dalam mode edit
                    nama: namaMesin,
                    kuantitas: kuantitas
                    // Tambahkan properti lain jika ada, misal: keterangan: "..."
                };
                alert('Data mesin berhasil diperbarui!');
            } else {
                alert('Terjadi kesalahan: Data mesin yang akan diperbarui tidak ditemukan.');
            }
            localStorage.removeItem('editMesinId'); // Hapus ID edit setelah selesai
        } else {
            // Mode Tambah Baru: Cek duplikasi ID
            const isDuplicateId = mesinData.some(mesin => mesin.id === idMesin);
            if (isDuplicateId) {
                alert('ID Mesin sudah ada. Mohon gunakan ID lain.');
                return;
            }

            // Buat objek data mesin baru
            const newMesin = {
                id: idMesin,
                nama: namaMesin,
                kuantitas: kuantitas
                // Tambahkan properti lain jika ada, misal: keterangan: "..."
            };

            // Tambahkan data mesin baru ke array
            mesinData.push(newMesin);
            alert('Data mesin berhasil disimpan!');
        }

        // Simpan array yang sudah diperbarui ke localStorage
        localStorage.setItem(MESIN_DATA_KEY, JSON.stringify(mesinData));

        // Alihkan ke halaman data_mesin.html
        window.location.href = 'data_mesin.html';
    });

    // --- Inisialisasi ---
    loadMesinForEdit(); // Panggil saat halaman dimuat untuk mengecek mode edit
});