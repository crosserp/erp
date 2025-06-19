document.addEventListener('DOMContentLoaded', function() {
    const tableBody = document.getElementById('tabel-body');
    const pageNumbersSpan = document.querySelector('.page-numbers');
    const prevButton = document.querySelector('.prev');
    const nextButton = document.querySelector('.next');
    const printAllButton = document.getElementById('printAllButton');

    const ITEMS_PER_PAGE = 5; // Number of items per page
    let currentPage = 1;
    let allTransferData = []; // Stores all loaded transfer data

    // --- Helper Functions ---

    /**
     * Memformat angka menjadi format mata uang Rupiah.
     * @param {number|string} amount - The value to format.
     * @returns {string} - The amount formatted as Rupiah.
     */
    function formatRupiah(amount) {
        if (typeof amount === 'string') {
            amount = parseFloat(amount.replace(/[^0-9,]/g, '').replace(',', '.'));
        }
        if (isNaN(amount)) {
            amount = 0;
        }
        const format = new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        });
        return format.format(amount);
    }

    // --- Main Functions for Displaying Data ---

    /**
     * Loads transfer data from localStorage.
     */
    function loadTransferData() {
        let dataTransfer = localStorage.getItem('dataTransfer');
        allTransferData = dataTransfer ? JSON.parse(dataTransfer) : [];
        // Sort data by ID (timestamp) from newest to oldest
        allTransferData.sort((a, b) => b.id - a.id);
        console.log("Data Transfer loaded from localStorage:", allTransferData);
    }

    /**
     * Displays transfer data in the table for the current page.
     * @param {number} page - The page number to display.
     */
    function displayTransfers(page) {
        // Load data from localStorage every time it's displayed (to ensure the latest data)
        loadTransferData();

        const startIndex = (page - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        const transfersToDisplay = allTransferData.slice(startIndex, endIndex);

        tableBody.innerHTML = ''; // Clear the table before repopulating

        if (transfersToDisplay.length === 0) {
            const row = tableBody.insertRow();
            const cell = row.insertCell(0);
            // Adjusted colspan to 10 (9 data columns + 1 action column)
            cell.colSpan = 10; 
            cell.textContent = 'Tidak ada data transfer.';
            cell.style.textAlign = 'center';
            return;
        }

        transfersToDisplay.forEach(transfer => {
            const row = tableBody.insertRow();

            // Format date (bulan is 'YYYY-MM-DD')
            const date = new Date(transfer.bulan);
            const formattedDate = date.toLocaleDateString('id-ID', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            // Populate cells with new data structure
            row.insertCell(0).textContent = transfer.id; // Transaction ID
            row.insertCell(1).textContent = transfer.tipePembayaran;
            row.insertCell(2).textContent = transfer.namaAkunSumber; // Updated from namaAkun
            row.insertCell(3).textContent = transfer.nomorAkunSumber; // New
            row.insertCell(4).textContent = transfer.namaAkunTujuan; // New, from anggaran
            row.insertCell(5).textContent = transfer.nomorAkunTujuan; // New
            row.insertCell(6).textContent = formattedDate; // Transaction Month
            row.insertCell(7).textContent = transfer.nomorRekeningTujuan;
            row.insertCell(8).textContent = formatRupiah(transfer.jumlah); // Format amount

            // Add Actions Cell
            const actionsCell = row.insertCell(9); // Adjusted index for new columns
            actionsCell.className = 'actions-cell';

            // Delete Button
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Hapus';
            deleteButton.classList.add('delete-btn');
            deleteButton.onclick = () => handleDelete(transfer.id);
            actionsCell.appendChild(deleteButton);

            // Print Button
            const printButton = document.createElement('button');
            printButton.textContent = 'Cetak';
            printButton.classList.add('print-btn');
            printButton.onclick = () => handlePrintRow(transfer);
            actionsCell.appendChild(printButton);
        });

        updatePaginationControls();
    }

    /**
     * Updates pagination controls (page numbers and button states).
     */
    function updatePaginationControls() {
        const totalPages = Math.ceil(allTransferData.length / ITEMS_PER_PAGE);
        pageNumbersSpan.textContent = `Halaman ${currentPage} dari ${totalPages || 1}`;

        prevButton.disabled = currentPage === 1;
        nextButton.disabled = currentPage === totalPages || allTransferData.length === 0;
    }

    // --- Pagination Functions (accessible from onclick in HTML) ---
    window.prevPage = function() {
        if (currentPage > 1) {
            currentPage--;
            displayTransfers(currentPage);
        }
    };

    window.nextPage = function() {
        const totalPages = Math.ceil(allTransferData.length / ITEMS_PER_PAGE);
        if (currentPage < totalPages) {
            currentPage++;
            displayTransfers(currentPage);
        }
    };

    // --- Action Button Handlers ---

    /**
     * Handles the deletion of a transfer record.
     * @param {number} idToDelete - The ID of the transfer record to delete.
     */
    function handleDelete(idToDelete) {
        // Mengganti alert dengan modal kustom atau konfirmasi yang lebih user-friendly
        // Untuk contoh ini, kita tetap pakai confirm() sesuai kode asli, tapi di aplikasi riil, gunakan modal.
        if (confirm('Anda yakin ingin menghapus transaksi ini?')) {
            // Filter out the deleted item
            allTransferData = allTransferData.filter(transfer => transfer.id !== idToDelete);
            localStorage.setItem('dataTransfer', JSON.stringify(allTransferData)); // Save updated data

            // Adjust currentPage if the last item on the current page was deleted
            const totalPagesAfterDelete = Math.ceil(allTransferData.length / ITEMS_PER_PAGE);
            if (currentPage > totalPagesAfterDelete && currentPage > 1) {
                currentPage = totalPagesAfterDelete;
            } else if (totalPagesAfterDelete === 0) { // If no data left
                currentPage = 1;
            }
            displayTransfers(currentPage); // Re-display the table
            alert('Transaksi berhasil dihapus.');
        }
    }

    /**
     * Handles printing a single transfer row.
     * @param {object} transferData - The data of the specific transfer to print.
     */
    function handlePrintRow(transferData) {
        let printContent = `
            <h2>Detail Transfer</h2>
            <p><strong>ID Transaksi:</strong> ${transferData.id}</p>
            <p><strong>Tipe Pembayaran:</strong> ${transferData.tipePembayaran}</p>
            <p><strong>Nama Akun Asal:</strong> ${transferData.namaAkunSumber}</p>
            <p><strong>Nomor Akun Asal:</strong> ${transferData.nomorAkunSumber}</p>
            <p><strong>Nama Akun Tujuan:</strong> ${transferData.namaAkunTujuan}</p>
            <p><strong>Nomor Akun Tujuan:</strong> ${transferData.nomorAkunTujuan}</p>
            <p><strong>Bulan Transaksi:</strong> ${new Date(transferData.bulan).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p><strong>Nomor Rekening Tujuan:</strong> ${transferData.nomorRekeningTujuan}</p>
            <p><strong>Jumlah Transfer:</strong> ${formatRupiah(transferData.jumlah)}</p>
        `;

        const printWindow = window.open('', '_blank');
        printWindow.document.write('<html><head><title>Cetak Detail Transfer</title>');
        printWindow.document.write('<style>');
        printWindow.document.write('body { font-family: Arial, sans-serif; margin: 20px; }');
        printWindow.document.write('h2 { color: #333; }');
        printWindow.document.write('p { margin-bottom: 5px; }');
        printWindow.document.write('</style>');
        printWindow.document.write('</head><body>');
        printWindow.document.write(printContent);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.print();
    }

    /**
     * Handles printing all transfer data.
     */
    function handlePrintAll() {
        if (allTransferData.length === 0) {
            alert('Tidak ada data untuk dicetak.');
            return;
        }

        let printContent = '<h2>Laporan Semua Data Transfer</h2>';
        printContent += '<table border="1" style="width:100%; border-collapse: collapse;">';
        printContent += '<thead><tr>';
        // Updated headers to match new data structure
        printContent += '<th>ID Transaksi</th><th>Tipe Pembayaran</th><th>Nama Akun Asal</th><th>No. Akun Asal</th>';
        printContent += '<th>Nama Akun Tujuan</th><th>No. Akun Tujuan</th><th>Bulan Transaksi</th><th>No. Rek Tujuan</th><th>Jumlah Transfer</th>';
        printContent += '</tr></thead><tbody>';

        allTransferData.forEach(transfer => {
            const formattedDate = new Date(transfer.bulan).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
            printContent += `
                <tr>
                    <td>${transfer.id}</td>
                    <td>${transfer.tipePembayaran}</td>
                    <td>${transfer.namaAkunSumber}</td>
                    <td>${transfer.nomorAkunSumber}</td>
                    <td>${transfer.namaAkunTujuan}</td>
                    <td>${transfer.nomorAkunTujuan}</td>
                    <td>${formattedDate}</td>
                    <td>${transfer.nomorRekeningTujuan}</td>
                    <td>${formatRupiah(transfer.jumlah)}</td>
                </tr>
            `;
        });
        printContent += '</tbody></table>';

        const printWindow = window.open('', '_blank');
        printWindow.document.write('<html><head><title>Cetak Semua Data Transfer</title>');
        printWindow.document.write('<style>');
        printWindow.document.write('body { font-family: Arial, sans-serif; margin: 20px; }');
        printWindow.document.write('h2 { text-align: center; margin-bottom: 20px; }');
        printWindow.document.write('table { width: 100%; border-collapse: collapse; margin-top: 20px; }');
        printWindow.document.write('th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }');
        printWindow.document.write('th { background-color: #f2f2f2; }');
        printWindow.document.write('</style>');
        printWindow.document.write('</head><body>');
        printWindow.document.write(printContent);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.print();
    }

    // --- Initialize Event Listeners ---

    // Event listener for "Cetak Semua Data" button
    if (printAllButton) {
        printAllButton.addEventListener('click', handlePrintAll);
    } else {
        console.warn("Tombol 'Cetak Semua Data' tidak ditemukan.");
    }

    // Initial display of transfers when the DOM is loaded
    displayTransfers(currentPage);
});
