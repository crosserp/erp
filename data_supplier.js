document.addEventListener('DOMContentLoaded', function() {
    const tableBody = document.querySelector('.table tbody');

    // Fungsi untuk memformat angka menjadi string dengan pemisah ribuan
    function formatNumberWithDots(number) {
        if (number === null || isNaN(number)) {
            return '';
        }
        const num = parseFloat(number);
        if (isNaN(num)) {
            return '';
        }
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }

    // Mengambil data supplier dari localStorage
    let supplierData = JSON.parse(localStorage.getItem('supplierData')) || [];

    function renderTable() {
        tableBody.innerHTML = ''; // Kosongkan tbody dulu

        if (supplierData.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `<td colspan="9" style="text-align: center;">Tidak ada data supplier.</td>`;
            tableBody.appendChild(row);
            return;
        }

        supplierData.forEach(supplier => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${supplier.idSupplier || ''}</td>
                <td>${supplier.namaSupplier || ''}</td>
                <td>${supplier.noSupplier || ''}</td>
                <td>${supplier.emailSupplier || ''}</td>
                <td>${formatNumberWithDots(supplier.hutangSupplier) || ''}</td>
                <td>${supplier.rekeningSupplier || ''}</td>
                <td>${supplier.alamatSupplier || ''}</td>
                <td>
                    <button class="detail-button" data-id="${supplier.id}">Detail</button>
                    <button class="edit-button" data-id="${supplier.id}">Edit</button>
                    <button class="delete-button" data-id="${supplier.id}">Hapus</button>
                </td>
            `;
            tableBody.appendChild(row);
        });

        addEventListenersToButtons();
    }

    function addEventListenersToButtons() {
        // Event listener untuk tombol Detail
        document.querySelectorAll('.detail-button').forEach(button => {
            button.addEventListener('click', function() {
                const supplierId = parseInt(this.dataset.id);
                // Simpan ID supplier ke localStorage agar bisa diambil di halaman detail
                localStorage.setItem('viewSupplierId', supplierId);
                // Arahkan ke halaman detail supplier
                window.location.href = 'data_supplier_detail.html';
            });
        });

        // Event listener untuk tombol Edit
        document.querySelectorAll('.edit-button').forEach(button => {
            button.addEventListener('click', function() {
                const supplierId = parseInt(this.dataset.id);
                localStorage.setItem('editSupplierId', supplierId);
                window.location.href = 'data_supplier2.html';
            });
        });

        // Event listener untuk tombol Hapus
        document.querySelectorAll('.delete-button').forEach(button => {
            button.addEventListener('click', function() {
                const supplierId = parseInt(this.dataset.id);
                handleDelete(supplierId);
            });
        });
    }

    // Fungsi handleDetail lama yang membuat pop-up dihilangkan
    // dan diganti dengan logika redirect di event listener tombol Detail di atas.

    // Fungsi untuk menghapus data supplier
    function handleDelete(id) {
        if (confirm('Apakah Anda yakin ingin menghapus data supplier ini?')) {
            supplierData = supplierData.filter(supplier => supplier.id !== id);
            localStorage.setItem('supplierData', JSON.stringify(supplierData));

            alert('Data supplier berhasil dihapus!');
            renderTable(); // Render ulang tabel setelah penghapusan
        }
    }

    renderTable();
});
