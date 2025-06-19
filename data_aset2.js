document.addEventListener('DOMContentLoaded', function() {
    // === PERUBAHAN DI SINI: ID form sekarang adalah 'dataaset' ===
    const form = document.getElementById('dataaset'); 
    // =========================================================

    const simpanButton = document.querySelector('.simpan'); 

    simpanButton.addEventListener('click', function(event) {
        event.preventDefault(); // Mencegah aksi default dari link <a> dan button
        
        // Ambil nilai dari input
        const nomor_aset = document.getElementById('nomor_aset').value;
        const nama_aset = document.getElementById('nama_aset').value;
        const jenis_aset = document.getElementById('jenis_aset').value; // Ambil nilai dari select

        // Validasi sederhana
        if (!nomor_aset || !nama_aset || !jenis_aset) {
            alert('Semua kolom harus diisi!');
            return;
        }

        // Ambil data aset yang sudah ada dari localStorage
        let assets = JSON.parse(localStorage.getItem('daftarAset')) || [];

        // Buat objek data aset baru
        const newAsset = {
            nomor: nomor_aset,
            nama: nama_aset,
            jenis: jenis_aset,
            keterangan: 'Tidak ada' // Default untuk kolom keterangan
        };

        // Cek apakah Nomor Aset sudah ada (opsional, untuk mencegah duplikasi)
        const existingAssetIndex = assets.findIndex(asset => asset.nomor === newAsset.nomor);
        if (existingAssetIndex !== -1) {
            alert('Nomor Aset sudah ada! Gunakan Nomor Aset lain.');
            return;
        }

        // Tambahkan aset baru ke array
        assets.push(newAsset);

        // Simpan kembali array ke localStorage
        localStorage.setItem('daftarAset', JSON.stringify(assets));

        alert('Data aset berhasil disimpan!');
        
        // Arahkan ke halaman data_aset.html
        window.location.href = 'data_aset.html';
    });

    // Tambahkan event listener untuk tombol Batal
    const batalButton = document.querySelector('.batal');
    batalButton.addEventListener('click', function() {
        // Langsung arahkan ke halaman data_aset.html tanpa menyimpan
        window.location.href = 'data_aset.html';
    });
});