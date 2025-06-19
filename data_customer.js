// data_customer.js

document.addEventListener('DOMContentLoaded', function() {
    const tableBody = document.querySelector('.table tbody');

    // Fungsi untuk memformat angka menjadi string dengan pemisah ribuan
    function formatNumberWithDots(number) {
        if (number === null || isNaN(number)) {
            return '';
        }
        return Number(number).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }

    // Mengambil data customer dari localStorage
    let customerData = JSON.parse(localStorage.getItem('customerData')) || [];

    /**
     * Merender ulang tabel dengan data customer yang terbaru.
     */
    function renderTable() {
        tableBody.innerHTML = ''; // Kosongkan tbody dulu

        if (customerData.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `<td colspan="8" style="text-align: center;">Tidak ada data customer.</td>`;
            tableBody.appendChild(row);
            return;
        }

        customerData.forEach(customer => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${customer.idCustomer || ''}</td>
                <td>${customer.namaCustomer || ''}</td>
                <td>${customer.noCustomer || ''}</td>
                <td>${customer.emailCustomer || ''}</td>
                <td>${formatNumberWithDots(customer.piutangCustomer) || ''}</td>
                <td>${customer.rekeningCustomer || ''}</td>
                <td>${customer.alamatCustomer || ''}</td>
                <td>
                    <button class="edit-button btn btn-sm btn-info" data-id="${customer.id}">Edit</button>
                    <button class="delete-button btn btn-sm btn-danger" data-id="${customer.id}">Hapus</button>
                    <button class="detail-button btn btn-sm btn-secondary" data-id="${customer.id}">Detail</button>
                </td>
            `;
            tableBody.appendChild(row);
        });

        addEventListenersToButtons(); // Panggil ini setelah semua tombol dibuat
    }

    /**
     * Menambahkan event listeners ke semua tombol (Edit, Hapus, Detail).
     */
    function addEventListenersToButtons() {
        // Event listener untuk tombol Edit
        document.querySelectorAll('.edit-button').forEach(button => {
            button.addEventListener('click', function() {
                const customerId = parseInt(this.dataset.id);
                // Simpan ID customer yang akan diedit di localStorage
                localStorage.setItem('editCustomerId', customerId);
                // Arahkan ke data_customer2.html untuk mengedit
                window.location.href = 'data_customer2.html';
            });
        });

        // Event listener untuk tombol Hapus
        document.querySelectorAll('.delete-button').forEach(button => {
            button.addEventListener('click', function() {
                const customerId = parseInt(this.dataset.id);
                handleDelete(customerId);
            });
        });

        // Event listener untuk tombol Detail
        document.querySelectorAll('.detail-button').forEach(button => {
            button.addEventListener('click', function() {
                const customerId = parseInt(this.dataset.id);
                // Arahkan ke data_customer_detail.html dengan ID sebagai parameter URL
                window.location.href = `data_customer_detail.html?id=${customerId}`;
            });
        });
    }

    /**
     * Menangani penghapusan data customer.
     * @param {number} id - ID internal customer yang akan dihapus.
     */
    function handleDelete(id) {
        if (confirm('Apakah Anda yakin ingin menghapus data customer ini?')) {
            customerData = customerData.filter(customer => customer.id !== id);
            localStorage.setItem('customerData', JSON.stringify(customerData));

            alert('Data customer berhasil dihapus!');
            renderTable(); // Render ulang tabel setelah penghapusan
        }
    }

    // Panggil renderTable saat DOM selesai dimuat untuk menampilkan data awal
    renderTable();
});