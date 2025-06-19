document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('datapabrik');
    const simpanButton = document.querySelector('.simpan'); // Menggunakan class karena tombol ada di dalam <a>

    simpanButton.addEventListener('click', function(event) {
        event.preventDefault(); // Mencegah default action dari link <a> dan button
        
        // Ambil nilai dari input
        const id_pabrik = document.getElementById('id_pabrik').value;
        const nama_pabrik = document.getElementById('nama_pabrik').value;
        const alamat_pabrik = document.getElementById('alamat_pabrik').value;
        
        // Validasi sederhana
        if (!id_pabrik || !nama_pabrik || !alamat_pabrik) {
            alert('Semua kolom harus diisi!');
            return;
        }

        // Ambil data pabrik yang sudah ada dari localStorage
        // Jika belum ada, inisialisasi dengan array kosong
        let factories = JSON.parse(localStorage.getItem('daftarPabrik')) || [];

        // Buat objek data pabrik baru
        const newFactory = {
            id: id_pabrik,
            nama: nama_pabrik,
            alamat: alamat_pabrik,
            // Tambahkan kolom 'keterangan' yang kosong atau default jika ada di tabel target
            keterangan: 'Tidak ada' // Anda bisa mengisi ini dari input jika ada, atau biarkan default
        };

        // Cek apakah ID sudah ada (opsional, untuk mencegah duplikasi ID)
        const existingFactoryIndex = factories.findIndex(fab => fab.id === newFactory.id);
        if (existingFactoryIndex !== -1) {
            alert('ID Pabrik sudah ada! Gunakan ID lain.');
            return;
        }

        // Tambahkan pabrik baru ke array
        factories.push(newFactory);

        // Simpan kembali array ke localStorage
        localStorage.setItem('daftarPabrik', JSON.stringify(factories));

        alert('Data pabrik berhasil disimpan!');
        
        // Arahkan ke halaman data_pabrik.html
        window.location.href = 'data_pabrik.html';
    });

    // Tambahkan event listener untuk tombol Batal
    const batalButton = document.querySelector('.batal');
    batalButton.addEventListener('click', function() {
        // Langsung arahkan ke halaman data_pabrik.html tanpa menyimpan
        window.location.href = 'data_pabrik.html';
    });
});