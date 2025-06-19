document.addEventListener('DOMContentLoaded', function() {
    let currentPage = 1;
    const itemsPerPage = 8;
    let salesOrders = [];

    const salesDataTableBody = document.getElementById('salesData');
    const pageNumbersSpan = document.querySelector('.page-numbers');
    const prevButton = document.querySelector('.pagination .prev');
    const nextButton = document.querySelector('.pagination .next');
    const tambahPesananButton = document.getElementById('tambahPesananBtn'); // Dapatkan tombol "Tambah Pesanan"

    // Fungsi untuk memformat angka menjadi string dengan pemisah ribuan
    function formatNumberWithDots(number) {
        if (number === null || isNaN(number) || number === '') {
            return '';
        }
        return parseFloat(number).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }

    // Fungsi untuk format rupiah
    function formatRupiah(angka) {
        return `Rp ${formatNumberWithDots(angka)}`;
    }

    // Fungsi untuk menampilkan sales order pada tabel
    function displaySalesOrder() {
        salesDataTableBody.innerHTML = ''; // Kosongkan tabel sebelum mengisi ulang

        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const currentPageOrders = salesOrders.slice(startIndex, endIndex);

        if (currentPageOrders.length === 0 && salesOrders.length > 0) {
            // Jika halaman saat ini kosong tapi ada data, kembali ke halaman sebelumnya
            currentPage = Math.max(1, currentPage - 1);
            displaySalesOrder(); // Panggil ulang untuk halaman yang benar
            return;
        }

        if (currentPageOrders.length === 0) {
            salesDataTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Tidak ada data penjualan.</td></tr>';
            updatePagination();
            return;
        }

        currentPageOrders.forEach(order => {
            const row = document.createElement('tr');
            // Data utama penjualan
            row.innerHTML = `
                <td>${order.tanggal}</td>
                <td>${order.noNota}</td>
                <td>${order.namaPelanggan}</td>
                <td>${order.jenisPenjualan}</td>
                <td class="total-pembayaran-cell">${formatRupiah(order.totalPembayaran)}</td>
                <td>
                    <button class="update-button" data-id="${order.id}">Update</button>
                    <button class="delete-button" data-id="${order.id}">Delete</button>
                    <button class="kirim-button" data-id="${order.id}">Pengiriman</button>
                </td>
            `;
            salesDataTableBody.appendChild(row); // Hanya tambahkan baris utama
        });

        updatePagination();
        attachEventListeners(); // Panggil fungsi untuk melampirkan event listener
    }

    // Fungsi untuk memperbarui tampilan pagination
    function updatePagination() {
        const totalPages = Math.ceil(salesOrders.length / itemsPerPage);
        pageNumbersSpan.textContent = `Halaman ${currentPage} dari ${totalPages || 1}`;

        prevButton.disabled = currentPage === 1;
        nextButton.disabled = currentPage === totalPages || totalPages === 0;
    }

    // Fungsi untuk memuat data sales order dari localStorage
    function loadSalesOrders() {
        const storedTransactions = JSON.parse(localStorage.getItem('allSalesTransactions')) || [];
        salesOrders = storedTransactions;
        // Urutkan berdasarkan tanggal terbaru ke terlama
        salesOrders.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
    }

    // Fungsi untuk melampirkan event listener ke tombol-tombol
    function attachEventListeners() {
        // Event listener untuk tombol Update
        document.querySelectorAll('.update-button').forEach(button => {
            button.onclick = function() {
                const id = this.getAttribute('data-id');
                // Simpan ID transaksi yang akan diedit di localStorage
                localStorage.setItem('editSalesOrderId', id);
                // Arahkan ke halaman transaksi_penjualan.html
                window.location.href = 'transaksi_penjualan.html';
            };
        });

        // Event listener untuk tombol Delete
        document.querySelectorAll('.delete-button').forEach(button => {
            button.onclick = function() {
                const id = this.getAttribute('data-id');
                if (confirm('Apakah Anda yakin ingin menghapus pesanan penjualan ini?')) {
                    deleteSalesOrder(id);
                }
            };
        });

        // Event listener untuk tombol Kirim (Pengiriman)
        document.querySelectorAll('.kirim-button').forEach(button => {
            button.onclick = function() {
                const id = this.getAttribute('data-id');
                kirimKePermintaan(id);
            };
        });

        // Event listener untuk tombol pagination
        prevButton.onclick = function() {
            if (currentPage > 1) {
                currentPage--;
                displaySalesOrder();
            }
        };

        nextButton.onclick = function() {
            if (currentPage < Math.ceil(salesOrders.length / itemsPerPage)) {
                currentPage++;
                displaySalesOrder();
            }
        };

        // Event listener untuk tombol "Tambah Pesanan"
        if (tambahPesananButton) { // Pastikan tombol ada sebelum menambahkan listener
            tambahPesananButton.addEventListener('click', function() {
                localStorage.removeItem('editSalesOrderId'); // Hapus ID edit jika ada, untuk memulai transaksi baru
                window.location.href = 'transaksi_penjualan.html'; // Navigasi ke halaman form
            });
        }
    }

    // Fungsi untuk menghapus sales order dari localStorage
    function deleteSalesOrder(id) {
        let allTransactions = JSON.parse(localStorage.getItem('allSalesTransactions')) || [];
        allTransactions = allTransactions.filter(order => order.id !== parseInt(id));
        localStorage.setItem('allSalesTransactions', JSON.stringify(allTransactions));
        loadSalesOrders(); // Muat ulang data setelah penghapusan
        displaySalesOrder(); // Tampilkan ulang tabel
    }

 // Fungsi untuk mengirim data ke halaman permintaan (Delivery Order)
function kirimKePermintaan(salesOrderId) {
    const salesOrderData = salesOrders.find(order => order.id === parseInt(salesOrderId));
    if (salesOrderData) {
        // Pastikan nama properti di sini sesuai dengan yang dibaca di permintaan_barang.js
        // Misalnya, jika Anda ingin mengirimkan 'noNota' sebagai 'nota', pastikan itu konsisten.
        localStorage.setItem('prosesPermintaanData', JSON.stringify(salesOrderData));
        alert(`Data pesanan dengan No. Nota: ${salesOrderData.noNota} siap diproses untuk pengiriman.`);
        // Arahkan ke halaman permintaan_barang.html setelah menyimpan data
        // window.location.href = 'permintaan_barang.html'; // <--- PASTIKAN NAVIGASI INI ADA
    } else {
        alert('Data pesanan tidak ditemukan.');
    }
}

    // Inisialisasi: muat data dan tampilkan saat DOM selesai dimuat
    loadSalesOrders();
    displaySalesOrder();
});