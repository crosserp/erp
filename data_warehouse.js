document.addEventListener('DOMContentLoaded', function() {
    const tbody = document.querySelector('.table tbody');

    // Fungsi untuk me-render ulang tabel
    function renderTable() {
        // Ambil data gudang dari localStorage
        let warehouses = JSON.parse(localStorage.getItem('daftarWarehouses')) || [];

        // Kosongkan tbody sebelum mengisi data (penting jika ada render ulang)
        tbody.innerHTML = '';

        if (warehouses.length === 0) {
            const row = document.createElement('tr');
            // Ubah colspan menjadi 6 karena sekarang ada 6 kolom
            row.innerHTML = `<td colspan="6" style="text-align: center;">Belum ada data warehouse.</td>`;
            tbody.appendChild(row);
        } else {
            // Loop melalui setiap gudang dan buat baris tabel
            warehouses.forEach(warehouse => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${warehouse.id}</td>
                    <td>${warehouse.nama}</td>
                    <td>${warehouse.alamat}</td>
                    <td>${getTipeWarehouseLabel(warehouse.tipe)}</td>
                   
                    <td>
                        <button class="update-button" data-id="${warehouse.id}">Update</button>
                        <button class="delete-button" data-id="${warehouse.id}">Delete</button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        }
    }

    // Panggil fungsi renderTable saat DOMContentLoaded
    renderTable();

    // Fungsi helper untuk mendapatkan label tipe warehouse yang lebih mudah dibaca
    function getTipeWarehouseLabel(value) {
        switch (value) {
            case 'gbahanbaku': return 'Gudang Bahan Baku (Raw Material Warehouse)';
            case 'gbarangstgh': return 'Gudang Barang Setengah Jadi (Work-In-Progress)';
            case 'gbarangjadi': return 'Gudang Barang Jadi (Finished Goods Warehouse)';
            case 'gperalatan': return 'Gudang Peralatan & Perlengkapan (Tools and Equipment Warehouse)';
            case 'gpemeliharaan': return 'Gudang Pemeliharaan (Maintenance, Repair & Operations (MRO))';
            case 'gpengemasan': return 'Gudang Pengemasan (Packaging Warehouse)';
            case 'gtambahan': return 'Gudang Barang Tambahan (Auxiliary Materials Warehouse)';
            default: return value;
        }
    }

    // --- Event Listener untuk Tombol Update dan Delete ---
    tbody.addEventListener('click', function(event) {
        const target = event.target;
        const warehouseId = target.getAttribute('data-id');

        if (target.classList.contains('update-button')) {
            if (warehouseId) {
                handleUpdate(warehouseId);
            } else {
                console.error("ID Warehouse tidak ditemukan untuk update.");
            }
        } else if (target.classList.contains('delete-button')) {
            if (warehouseId) {
                handleDelete(warehouseId);
            } else {
                console.error("ID Warehouse tidak ditemukan untuk delete.");
            }
        }
    });

    // --- Fungsi Handler untuk Update ---
    function handleUpdate(id) {
        // Ambil data gudang dari localStorage
        let warehouses = JSON.parse(localStorage.getItem('daftarWarehouses')) || [];
        
        // Temukan gudang yang ingin diupdate
        const warehouseToUpdate = warehouses.find(wh => wh.id === id);

        if (warehouseToUpdate) {
            // Contoh: Prompt untuk mendapatkan data baru
            // Dalam aplikasi nyata, Anda mungkin akan mengarahkan ke form editing
            const newNama = prompt(`Update Nama Warehouse (${warehouseToUpdate.nama}):`, warehouseToUpdate.nama);
            const newAlamat = prompt(`Update Alamat Warehouse (${warehouseToUpdate.alamat}):`, warehouseToUpdate.alamat);
            // Untuk tipe warehouse, akan lebih baik menggunakan dropdown atau form yang lebih kompleks
            // Untuk kesederhanaan contoh ini, kita biarkan saja atau minta input teks
            // const newTipe = prompt(`Update Tipe Warehouse (${getTipeWarehouseLabel(warehouseToUpdate.tipe)}):`, warehouseToUpdate.tipe);
            const newKeterangan = prompt(`Update Keterangan (${warehouseToUpdate.keterangan || 'N/A'}):`, warehouseToUpdate.keterangan);


            // Jika pengguna membatalkan prompt, nilai akan menjadi null
            if (newNama !== null) warehouseToUpdate.nama = newNama;
            if (newAlamat !== null) warehouseToUpdate.alamat = newAlamat;
            // if (newTipe !== null) warehouseToUpdate.tipe = newTipe; // uncomment jika ingin update tipe via prompt
            if (newKeterangan !== null) warehouseToUpdate.keterangan = newKeterangan;

            // Simpan kembali data yang sudah diupdate ke localStorage
            localStorage.setItem('daftarWarehouses', JSON.stringify(warehouses));
            alert(`Warehouse dengan ID ${id} berhasil diupdate.`);
            renderTable(); // Render ulang tabel untuk menampilkan perubahan
        } else {
            alert(`Warehouse dengan ID ${id} tidak ditemukan.`);
        }
    }

    // --- Fungsi Handler untuk Delete ---
    function handleDelete(id) {
        if (confirm(`Apakah Anda yakin ingin menghapus warehouse dengan ID ${id}?`)) {
            let warehouses = JSON.parse(localStorage.getItem('daftarWarehouses')) || [];
            
            // Filter array, sisakan hanya yang ID-nya TIDAK sama dengan ID yang akan dihapus
            const updatedWarehouses = warehouses.filter(wh => wh.id !== id);

            if (updatedWarehouses.length < warehouses.length) { // Berarti ada yang terhapus
                localStorage.setItem('daftarWarehouses', JSON.stringify(updatedWarehouses));
                alert(`Warehouse dengan ID ${id} berhasil dihapus.`);
                renderTable(); // Render ulang tabel untuk menampilkan perubahan
            } else {
                alert(`Warehouse dengan ID ${id} tidak ditemukan.`);
            }
        }
    }
});