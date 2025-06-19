document.addEventListener('DOMContentLoaded', function() {
    const tbody = document.querySelector('.table tbody');

    // Fungsi untuk me-render ulang tabel
    function renderTable() {
        // Ambil data aset dari localStorage
        let assets = JSON.parse(localStorage.getItem('daftarAset')) || [];

        // Pastikan tbody ada sebelum memanipulasinya
        if (!tbody) {
            console.error("Elemen <tbody> tabel tidak ditemukan!");
            return;
        }

        // Kosongkan tbody sebelum mengisi data
        tbody.innerHTML = '';

        if (assets.length === 0) {
            const row = document.createElement('tr');
            // Ubah colspan menjadi 5 karena sekarang ada 5 kolom (Nomor, Nama, Jenis, Keterangan, Aksi)
            row.innerHTML = `<td colspan="5" style="text-align: center;">Belum ada data aset.</td>`;
            tbody.appendChild(row);
        } else {
            // Loop melalui setiap aset dan buat baris tabel
            assets.forEach(asset => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${asset.nomor}</td>
                    <td>${asset.nama}</td>
                    <td>${getJenisAsetLabel(asset.jenis)}</td>
                    <td>
                        <button class="update-button" data-nomor="${asset.nomor}">Update</button>
                        <button class="delete-button" data-nomor="${asset.nomor}">Delete</button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        }
    }

    // Panggil fungsi renderTable saat DOMContentLoaded
    renderTable();

    // Fungsi helper untuk mendapatkan label Jenis Aset yang lebih mudah dibaca
    function getJenisAsetLabel(value) {
        switch (value) {
            case 'Fixed Asset': return 'Aset Tetap';
            case 'Current Asset': return 'Aset Lancar';
            default: return value;
        }
    }

    // --- Event Listener untuk Tombol Update dan Delete ---
    tbody.addEventListener('click', function(event) {
        const target = event.target;
        const assetNomor = target.getAttribute('data-nomor'); // Menggunakan data-nomor sebagai ID unik

        if (target.classList.contains('update-button')) {
            if (assetNomor) {
                handleUpdate(assetNomor);
            } else {
                console.error("Nomor Aset tidak ditemukan untuk update.");
            }
        } else if (target.classList.contains('delete-button')) {
            if (assetNomor) {
                handleDelete(assetNomor);
            } else {
                console.error("Nomor Aset tidak ditemukan untuk delete.");
            }
        }
    });

    // --- Fungsi Handler untuk Update ---
    function handleUpdate(nomor) {
        // Ambil data aset dari localStorage
        let assets = JSON.parse(localStorage.getItem('daftarAset')) || [];
        
        // Temukan aset yang ingin diupdate
        const assetToUpdate = assets.find(asset => asset.nomor === nomor);

        if (assetToUpdate) {
            // Contoh: Prompt untuk mendapatkan data baru
            const newNama = prompt(`Update Nama Aset (${assetToUpdate.nama}):`, assetToUpdate.nama);
            // Untuk jenis aset, akan lebih baik menggunakan dropdown atau form yang lebih kompleks
            // Untuk kesederhanaan contoh ini, kita biarkan saja atau minta input teks
            // const newJenis = prompt(`Update Jenis Aset (${getJenisAsetLabel(assetToUpdate.jenis)}):`, assetToUpdate.jenis);
            const newKeterangan = prompt(`Update Keterangan (${assetToUpdate.keterangan || 'N/A'}):`, assetToUpdate.keterangan);


            // Jika pengguna membatalkan prompt, nilai akan menjadi null
            if (newNama !== null) assetToUpdate.nama = newNama;
            // if (newJenis !== null) assetToUpdate.jenis = newJenis; // uncomment jika ingin update jenis via prompt
            if (newKeterangan !== null) assetToUpdate.keterangan = newKeterangan;

            // Simpan kembali data yang sudah diupdate ke localStorage
            localStorage.setItem('daftarAset', JSON.stringify(assets));
            alert(`Aset dengan Nomor ${nomor} berhasil diupdate.`);
            renderTable(); // Render ulang tabel untuk menampilkan perubahan
        } else {
            alert(`Aset dengan Nomor ${nomor} tidak ditemukan.`);
        }
    }

    // --- Fungsi Handler untuk Delete ---
    function handleDelete(nomor) {
        if (confirm(`Apakah Anda yakin ingin menghapus aset dengan Nomor ${nomor}?`)) {
            let assets = JSON.parse(localStorage.getItem('daftarAset')) || [];
            
            // Filter array, sisakan hanya yang Nomor-nya TIDAK sama dengan Nomor yang akan dihapus
            const updatedAssets = assets.filter(asset => asset.nomor !== nomor);

            if (updatedAssets.length < assets.length) { // Berarti ada yang terhapus
                localStorage.setItem('daftarAset', JSON.stringify(updatedAssets));
                alert(`Aset dengan Nomor ${nomor} berhasil dihapus.`);
                renderTable(); // Render ulang tabel untuk menampilkan perubahan
            } else {
                alert(`Aset dengan Nomor ${nomor} tidak ditemukan.`);
            }
        }
    }
});