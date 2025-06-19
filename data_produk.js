// data_produk.js (file JS untuk halaman data_produk.html)

document.addEventListener('DOMContentLoaded', function() {
    const tableBody = document.querySelector('.table tbody');
    let produkData = JSON.parse(localStorage.getItem('produkData')) || [];

    function renderTable() {
        tableBody.innerHTML = '';

        if (produkData.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `<td colspan="5" style="text-align: center;">Tidak ada data produk.</td>`; // Sesuaikan colspan jika perlu
            tableBody.appendChild(row);
            return;
        }

        produkData.forEach(produk => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${produk.kodeProduk || ''}</td>
                <td>${produk.namaProduk || ''}</td>
                <td>${produk.satuanProduk || ''}</td>
                <td>
                    <button class="edit-button" data-id="${produk.id}">Edit</button>
                    <button class="delete-button" data-id="${produk.id}">Hapus</button>
                    <button class="detail-button" data-id="${produk.id}">Detail</button> </td>
            `;
            tableBody.appendChild(row);
        });

        addEventListenersToButtons();
    }

    function addEventListenersToButtons() {
        // Event listener untuk tombol Edit
        document.querySelectorAll('.edit-button').forEach(button => {
            button.addEventListener('click', function() {
                const produkId = parseInt(this.dataset.id);
                localStorage.setItem('editProdukId', produkId);
                window.location.href = 'data_produk2.html'; // Halaman form edit
            });
        });

        // Event listener untuk tombol Hapus
        document.querySelectorAll('.delete-button').forEach(button => {
            button.addEventListener('click', function() {
                const produkId = parseInt(this.dataset.id);
                handleDelete(produkId);
            });
        });

        // --- Event listener untuk tombol Detail (BARU) ---
        document.querySelectorAll('.detail-button').forEach(button => {
            button.addEventListener('click', function() {
                const produkId = parseInt(this.dataset.id);
                localStorage.setItem('detailProdukId', produkId); // Simpan ID untuk halaman detail
                window.location.href = 'detail_produk.html'; // Arahkan ke halaman detail
            });
        });
        // --- Akhir Event listener tombol Detail ---
    }

    function handleDelete(id) {
        if (confirm('Apakah Anda yakin ingin menghapus data produk ini?')) {
            produkData = produkData.filter(produk => produk.id !== id);
            localStorage.setItem('produkData', JSON.stringify(produkData));

            alert('Data produk berhasil dihapus!');
            renderTable();
        }
    }

    renderTable();
});