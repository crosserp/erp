// asetperlokasi.js

document.addEventListener('DOMContentLoaded', function() {
    const tableBody = document.querySelector('.table tbody');
    const noDataMessage = document.querySelector('.no-data');

    function displayAsetInTable() {
        // 1. Ambil data aset dari localStorage
        // Menggunakan kunci 'detailAsetTersimpan' yang sama dengan yang digunakan di aset.js
        const detailAsetTersimpan = JSON.parse(localStorage.getItem('detailAsetTersimpan')) || [];

        // 2. Kosongkan tabel body sebelum mengisi ulang
        tableBody.innerHTML = '';

        if (detailAsetTersimpan.length === 0) {
            // Tampilkan pesan "Tidak ada data" jika array kosong
            noDataMessage.style.display = 'block';
            console.log("DEBUG: Tidak ada data aset tersimpan untuk ditampilkan.");
            return; // Hentikan fungsi jika tidak ada data
        } else {
            // Sembunyikan pesan "Tidak ada data" jika ada data
            noDataMessage.style.display = 'none';
        }

        // 3. Tambahkan setiap aset sebagai baris baru di tabel
        detailAsetTersimpan.forEach(aset => {
            const row = tableBody.insertRow(); // Membuat elemen <tr> baru

            // Sel untuk Nama Aset
            const namaAsetCell = row.insertCell();
            namaAsetCell.textContent = aset.namaAset;
            namaAsetCell.classList.add('nama-aset-col'); // Opsional: Tambahkan kelas untuk CSS

            // Sel untuk Lokasi
            const lokasiCell = row.insertCell();
            lokasiCell.textContent = aset.lokasiAset;
            lokasiCell.classList.add('lokasi-col'); // Opsional: Tambahkan kelas untuk CSS

            // Sel untuk Kuantitas
            const kuantitasCell = row.insertCell();
            kuantitasCell.textContent = aset.kuantitas;
            kuantitasCell.classList.add('kuantitas-col'); // Opsional: Tambahkan kelas untuk CSS

            // Sel untuk Keterangan Detail (menggabungkan beberapa properti)
            const keteranganCell = row.insertCell();
            keteranganCell.innerHTML = `
                <strong>Tgl Beli:</strong> ${aset.tanggalBeli}<br>
                <strong>Tgl Pakai:</strong> ${aset.tanggalPakai}<br>
                <strong>Metode:</strong> ${aset.metodePenyusutan}<br>
                <strong>Umur:</strong> ${aset.umurEkonomis} Tahun<br>
                <strong>Akun Aset:</strong> ${aset.akunAset}<br>
                <strong>Akun Penyusutan:</strong> ${aset.akunPenyusutan}<br>
                <strong>Tidak Berwujud:</strong> ${aset.asetTidakBerwujud ? 'Ya' : 'Tidak'}<br>
                <strong>ID:</strong> ${aset.id}
            `;
            keteranganCell.classList.add('keterangan-col'); // Opsional: Tambahkan kelas untuk CSS
        });
        console.log("DEBUG: Data aset berhasil ditampilkan dalam tabel.");
    }

    // Panggil fungsi untuk menampilkan data saat halaman dimuat
    displayAsetInTable();
});