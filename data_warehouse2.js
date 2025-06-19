document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('datawarehouse');
    const simpanButton = document.querySelector('.simpan'); // Menggunakan class karena tombol ada di dalam <a>

    simpanButton.addEventListener('click', function(event) {
        event.preventDefault(); // Mencegah default action dari link <a> dan button
        
        // Ambil nilai dari input
        const id_warehouse = document.getElementById('id_warehouse').value;
        const nama_warehouse = document.getElementById('nama_warehouse').value;
        const alamat_warehouse = document.getElementById('alamat_warehouse').value;
        const tipe_warehouse = document.getElementById('tipe_warehouse').value;
        
        // Validasi sederhana (opsional, tapi disarankan)
        if (!id_warehouse || !nama_warehouse || !alamat_warehouse || !tipe_warehouse) {
            alert('Semua kolom harus diisi!');
            return;
        }

        // Ambil data gudang yang sudah ada dari localStorage
        // Jika belum ada, inisialisasi dengan array kosong
        let warehouses = JSON.parse(localStorage.getItem('daftarWarehouses')) || [];

        // Buat objek data gudang baru
        const newWarehouse = {
            id: id_warehouse,
            nama: nama_warehouse,
            alamat: alamat_warehouse,
            tipe: tipe_warehouse,
            // Tambahkan kolom 'keterangan' yang kosong atau default jika ada di tabel target
            keterangan: 'Tidak ada' // Anda bisa mengisi ini dari input jika ada, atau biarkan default
        };

        // Cek apakah ID sudah ada (opsional, untuk mencegah duplikasi ID)
        const existingWarehouseIndex = warehouses.findIndex(wh => wh.id === newWarehouse.id);
        if (existingWarehouseIndex !== -1) {
            alert('ID Warehouse sudah ada! Gunakan ID lain.');
            return;
        }

        // Tambahkan gudang baru ke array
        warehouses.push(newWarehouse);

        // Simpan kembali array ke localStorage
        localStorage.setItem('daftarWarehouses', JSON.stringify(warehouses));

        alert('Data gudang berhasil disimpan!');
        
        // Arahkan ke halaman data_warehouse.html
        window.location.href = 'data_warehouse.html';
    });

    // Tambahkan event listener untuk tombol Batal
    const batalButton = document.querySelector('.batal');
    batalButton.addEventListener('click', function() {
        // Langsung arahkan ke halaman data_warehouse.html tanpa menyimpan
        window.location.href = 'data_warehouse.html';
    });
});