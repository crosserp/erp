document.addEventListener('DOMContentLoaded', function() {
    const tbody = document.querySelector('.table tbody');

    // Fungsi untuk me-render ulang tabel
    function renderTable() {
        // Ambil data pabrik dari localStorage
        let factories = JSON.parse(localStorage.getItem('daftarPabrik')) || [];

        // Pastikan tbody ada sebelum memanipulasinya
        if (!tbody) {
            console.error("Elemen <tbody> tabel tidak ditemukan!");
            return;
        }

        // Kosongkan tbody sebelum mengisi data (penting jika ada render ulang)
        tbody.innerHTML = '';

        if (factories.length === 0) {
            const row = document.createElement('tr');
            // Ubah colspan menjadi 5 karena sekarang ada 5 kolom (ID, Nama, Alamat, Keterangan, Aksi)
            row.innerHTML = `<td colspan="5" style="text-align: center;">Belum ada data pabrik.</td>`;
            tbody.appendChild(row);
        } else {
            // Loop melalui setiap pabrik dan buat baris tabel
            factories.forEach(factory => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${factory.id}</td>
                    <td>${factory.nama}</td>
                    <td>${factory.alamat}</td>
                    <td>
                        <button class="update-button" data-id="${factory.id}">Update</button>
                        <button class="delete-button" data-id="${factory.id}">Delete</button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        }
    }

    // Panggil fungsi renderTable saat DOMContentLoaded
    renderTable();

    // --- Event Listener untuk Tombol Update dan Delete ---
    tbody.addEventListener('click', function(event) {
        const target = event.target;
        const factoryId = target.getAttribute('data-id');

        if (target.classList.contains('update-button')) {
            if (factoryId) {
                handleUpdate(factoryId);
            } else {
                console.error("ID Pabrik tidak ditemukan untuk update.");
            }
        } else if (target.classList.contains('delete-button')) {
            if (factoryId) {
                handleDelete(factoryId);
            } else {
                console.error("ID Pabrik tidak ditemukan untuk delete.");
            }
        }
    });

    // --- Fungsi Handler untuk Update ---
    function handleUpdate(id) {
        // Ambil data pabrik dari localStorage
        let factories = JSON.parse(localStorage.getItem('daftarPabrik')) || [];
        
        // Temukan pabrik yang ingin diupdate
        const factoryToUpdate = factories.find(fab => fab.id === id);

        if (factoryToUpdate) {
            // Contoh: Prompt untuk mendapatkan data baru
            // Dalam aplikasi nyata, Anda mungkin akan mengarahkan ke form editing
            const newNama = prompt(`Update Nama Pabrik (${factoryToUpdate.nama}):`, factoryToUpdate.nama);
            const newAlamat = prompt(`Update Alamat Pabrik (${factoryToUpdate.alamat}):`, factoryToUpdate.alamat);
            const newKeterangan = prompt(`Update Keterangan (${factoryToUpdate.keterangan || 'N/A'}):`, factoryToUpdate.keterangan);

            // Jika pengguna membatalkan prompt, nilai akan menjadi null
            if (newNama !== null) factoryToUpdate.nama = newNama;
            if (newAlamat !== null) factoryToUpdate.alamat = newAlamat;
            if (newKeterangan !== null) factoryToUpdate.keterangan = newKeterangan;

            // Simpan kembali data yang sudah diupdate ke localStorage
            localStorage.setItem('daftarPabrik', JSON.stringify(factories));
            alert(`Pabrik dengan ID ${id} berhasil diupdate.`);
            renderTable(); // Render ulang tabel untuk menampilkan perubahan
        } else {
            alert(`Pabrik dengan ID ${id} tidak ditemukan.`);
        }
    }

    // --- Fungsi Handler untuk Delete ---
    function handleDelete(id) {
        if (confirm(`Apakah Anda yakin ingin menghapus pabrik dengan ID ${id}?`)) {
            let factories = JSON.parse(localStorage.getItem('daftarPabrik')) || [];
            
            // Filter array, sisakan hanya yang ID-nya TIDAK sama dengan ID yang akan dihapus
            const updatedFactories = factories.filter(fab => fab.id !== id);

            if (updatedFactories.length < factories.length) { // Berarti ada yang terhapus
                localStorage.setItem('daftarPabrik', JSON.stringify(updatedFactories));
                alert(`Pabrik dengan ID ${id} berhasil dihapus.`);
                renderTable(); // Render ulang tabel untuk menampilkan perubahan
            } else {
                alert(`Pabrik dengan ID ${id} tidak ditemukan.`);
            }
        }
    }
});