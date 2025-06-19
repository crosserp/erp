document.addEventListener('DOMContentLoaded', function() {
    // Ambil elemen-elemen form
    const organisasiForm = document.getElementById('organisasi');
    const nomorAnggotaInput = document.getElementById('nomor_anggota');
    const namaAnggotaInput = document.getElementById('nama_anggota');
    const jenisJabatanSelect = document.getElementById('jenis_jabatan');
    const simpanButton = document.querySelector('.simpan'); // Menggunakan class karena sudah tidak ada ID spesifik di button

    // --- Inisialisasi Form (Cek Mode Edit atau Tambah Baru) ---
    // Cek apakah ada ID anggota yang ingin diedit di localStorage
    const editAnggotaId = localStorage.getItem('editAnggotaId');
    let currentAnggotaToEdit = null;

    if (editAnggotaId) {
        let daftarAnggota = JSON.parse(localStorage.getItem('daftarAnggota')) || [];
        currentAnggotaToEdit = daftarAnggota.find(anggota => anggota.id === parseInt(editAnggotaId)); // Konversi ke int

        if (currentAnggotaToEdit) {
            // Isi form dengan data yang akan diedit
            nomorAnggotaInput.value = currentAnggotaToEdit.nomor_anggota;
            namaAnggotaInput.value = currentAnggotaToEdit.nama_anggota;
            jenisJabatanSelect.value = currentAnggotaToEdit.jenis_jabatan;

            // Nonaktifkan input ID Anggota agar tidak diubah saat update
            nomorAnggotaInput.readOnly = true;

            // Ubah teks tombol simpan menjadi "Update"
            simpanButton.textContent = 'Update';

            alert('Mode Edit: Memuat data anggota.');
        } else {
            // Jika ID yang dicari tidak ditemukan (mungkin sudah dihapus),
            // reset ke mode tambah baru
            alert('Data anggota untuk diedit tidak ditemukan. Memulai form baru.');
            localStorage.removeItem('editAnggotaId'); // Hapus ID yang salah
        }
    }

    // --- Event Listener untuk Tombol Simpan ---
    simpanButton.addEventListener('click', function(event) {
        event.preventDefault(); // Mencegah form submit secara default (yang akan me-reload halaman)

        // Validasi form
        if (!organisasiForm.checkValidity()) {
            organisasiForm.reportValidity(); // Menampilkan pesan validasi HTML5
            return;
        }

        // Ambil nilai dari input
        const nomorAnggota = parseInt(nomorAnggotaInput.value); // Pastikan ini adalah angka
        const namaAnggota = namaAnggotaInput.value;
        const jenisJabatan = jenisJabatanSelect.value;

        // Buat objek anggota baru
        const newAnggota = {
            // Gunakan ID unik untuk setiap anggota, bahkan jika nomor_anggota sama.
            // Ini penting untuk fungsi edit/hapus yang tepat.
            id: currentAnggotaToEdit ? currentAnggotaToEdit.id : new Date().getTime(),
            nomor_anggota: nomorAnggota,
            nama_anggota: namaAnggota,
            jenis_jabatan: jenisJabatan
        };

        // Ambil data anggota yang sudah ada dari localStorage
        let daftarAnggota = JSON.parse(localStorage.getItem('daftarAnggota')) || [];

        if (editAnggotaId && currentAnggotaToEdit) {
            // Mode Update: Cari dan ganti objek yang sudah ada
            const index = daftarAnggota.findIndex(anggota => anggota.id === currentAnggotaToEdit.id);
            if (index !== -1) {
                daftarAnggota[index] = newAnggota;
                alert('Data anggota berhasil diperbarui!');
            } else {
                alert('Kesalahan: Data anggota yang akan diperbarui tidak ditemukan.');
                return;
            }
            localStorage.removeItem('editAnggotaId'); // Hapus ID edit setelah selesai
        } else {
            // Mode Tambah Baru: Cek duplikasi nomor anggota sebelum menyimpan
            const isNomorAnggotaExist = daftarAnggota.some(anggota => anggota.nomor_anggota === nomorAnggota);
            if (isNomorAnggotaExist) {
                alert('ID Anggota ini sudah ada. Harap gunakan ID Anggota lain.');
                return;
            }
            daftarAnggota.push(newAnggota);
            alert('Data anggota berhasil disimpan!');
        }

        // Simpan kembali daftar anggota yang diperbarui ke localStorage
        localStorage.setItem('daftarAnggota', JSON.stringify(daftarAnggota));

        // Alihkan ke halaman organisasi.html untuk menampilkan data
        window.location.href = 'organisasi.html';
    });

    // --- Event Listener untuk Tombol Batal ---
    const batalButton = document.querySelector('.batal');
    batalButton.addEventListener('click', function() {
        // Hapus ID edit jika ada, lalu kembali ke halaman daftar
        localStorage.removeItem('editAnggotaId');
        window.location.href = 'organisasi.html';
    });
});