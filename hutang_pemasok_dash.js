document.addEventListener('DOMContentLoaded', () => {
    // Mendapatkan elemen tabel yang akan diisi dengan data.
    const tabelBody = document.querySelector("#hutangTable tbody");
    // Mendapatkan data hutang pemasok yang disimpan di local storage.
    let dataHutangArray = JSON.parse(localStorage.getItem('dataHutangPemasok')) || [];

    // Memastikan tabel dalam keadaan kosong sebelum data baru ditambahkan.
    tabelBody.innerHTML = '';

    // Fungsi untuk menampilkan data dalam tabel
    function renderTable() {
        tabelBody.innerHTML = ''; // Bersihkan tabel sebelum render ulang
        dataHutangArray.forEach((hutang, index) => { // Gunakan index untuk mengidentifikasi data
            const row = tabelBody.insertRow();
            const kodeCell = row.insertCell();
            const namaCell = row.insertCell();
            const hutangCell = row.insertCell();
            const keteranganCell = row.insertCell(); // Sel untuk tombol

            // Mengisi setiap sel dengan data yang sesuai.
            kodeCell.textContent = hutang.kodePemasok;
            namaCell.textContent = hutang.namaPemasok;
            hutangCell.textContent = hutang.hutangPemasok;

            // Membuat tombol Delete, Update, dan Transaksi.
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.className = 'delete-btn';
            deleteButton.addEventListener('click', () => {
                // Logika delete di sini
                dataHutangArray.splice(index, 1); // Hapus data dari array
                localStorage.setItem('dataHutangPemasok', JSON.stringify(dataHutangArray)); // Simpan perubahan ke localStorage
                renderTable(); // Render ulang tabel untuk menampilkan perubahan
            });

            const updateButton = document.createElement('button');
            updateButton.textContent = 'Update';
            updateButton.className = 'update-btn';
            updateButton.addEventListener('click', () => {
                // Redirect ke halaman edit dengan membawa data yang akan di edit
                window.location.href = `hutang_pemasok.html?index=${index}`;
            });

            const transaksiButton = document.createElement('button');
            transaksiButton.textContent = 'Transaksi';
            transaksiButton.className = 'transaksi-btn';
            transaksiButton.addEventListener('click', () => {
                // Logika transaksi di sini
                // Redirect ke halaman transaksi dengan membawa data yang akan di edit
                window.location.href = `transaksi_pemasok.html?index=${index}`;
            });
            keteranganCell.appendChild(deleteButton);
            keteranganCell.appendChild(updateButton);
            keteranganCell.appendChild(transaksiButton);
        });
    }
    renderTable();
});