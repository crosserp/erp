document.addEventListener('DOMContentLoaded', function() {
    // --- Referensi Elemen HTML ---
    const submittedRekapDataTableBody = document.getElementById('submittedRekapDataTableBody');
    const prevPageBtn = document.getElementById('prevPageBtn');
    const nextPageBtn = document.getElementById('nextPageBtn');
    const pageNumbersSpan = document.getElementById('pageNumbers');
    
    // Elemen modal print tidak lagi digunakan secara langsung untuk memicu print,
    // tetapi bisa tetap ada di HTML jika ada kebutuhan lain di masa depan.
    // const printReturnModal = document.getElementById('printReturnModal');
    // const closeButton = document.querySelector('.close-button');
    // const printArea = document.getElementById('printArea');
    // const doPrintButton = document.getElementById('doPrintButton');

    const itemsPerPage = 5;
    let currentPage = 1;
    let submittedSupplierReturns = [];

    // --- Fungsi Pembantu untuk Format Angka dan Rupiah ---
    function formatNumberWithDots(number) {
        if (number === null || number === undefined || number === '' || isNaN(Number(number))) {
            return '';
        }
        return new Intl.NumberFormat('id-ID').format(Number(number));
    }

    function formatRupiah(angka) {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(angka);
    }

    // --- Fungsi Utama untuk Menampilkan Data ---
    function loadSubmittedReturns() {
        try {
            const data = localStorage.getItem('submittedSupplierReturns');
            submittedSupplierReturns = JSON.parse(data) || [];
            submittedSupplierReturns.sort((a, b) => b.id - a.id); 
        } catch (e) {
            console.error("Error loading submitted supplier returns from localStorage:", e);
            submittedSupplierReturns = [];
        }
    }

    function saveSubmittedReturns() {
        try {
            localStorage.setItem('submittedSupplierReturns', JSON.stringify(submittedSupplierReturns));
        } catch (e) {
            console.error("Error saving submitted supplier returns to localStorage:", e);
        }
    }

    function displaySubmittedReturns() {
        submittedRekapDataTableBody.innerHTML = '';
        const totalPages = Math.ceil(submittedSupplierReturns.length / itemsPerPage);

        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const currentSubmittedReturns = submittedSupplierReturns.slice(startIndex, endIndex);

        if (currentSubmittedReturns.length === 0) {
            submittedRekapDataTableBody.innerHTML = `<tr><td colspan="9" style="text-align: center;">Tidak ada retur supplier yang diajukan.</td></tr>`;
        } else {
            currentSubmittedReturns.forEach(retur => {
                const row = document.createElement('tr');
                let itemsDetail = '';
                let quantitiesDetail = '';
                let keteranganDetail = '';

                if (retur.items && retur.items.length > 0) {
                    retur.items.forEach((item, index) => {
                        itemsDetail += `${item.namaRawMaterial || item.kodeRawMaterial || 'N/A'}`;
                        quantitiesDetail += `${formatNumberWithDots(item.kuantitas || 0)} ${item.satuanRawMaterial || 'N/A'}`;
                        keteranganDetail += `${item.keteranganRetur || '-'}`;

                        if (index < retur.items.length - 1) {
                            itemsDetail += '<br>';
                            quantitiesDetail += '<br>';
                            keteranganDetail += '<br>';
                        }
                    });
                } else {
                    itemsDetail = 'Tidak ada item raw material';
                    quantitiesDetail = '-';
                    keteranganDetail = '-';
                }

                // Tombol aksi: Cetak dan Hapus
                const actionButtons = `
                    <button class="btn btn-primary btn-sm print-btn" data-id="${retur.id}">Cetak</button>
                    <button class="btn btn-danger btn-sm delete-btn" data-id="${retur.id}">Hapus</button>
                `;

                row.innerHTML = `
                    <td>${retur.tanggalRetur || '-'}</td>
                    <td>${retur.namaSupplier || '-'}</td>
                    <td>${retur.noNotaRetur || '-'}</td>
                    <td>${itemsDetail}</td>
                    <td>${quantitiesDetail}</td>
                    <td>${formatRupiah(retur.totalRetur || 0)}</td>
                    <td>${keteranganDetail}</td>
                    <td><span class="status-retur">${retur.status}</span></td>
                    <td>${actionButtons}</td>
                `;
                submittedRekapDataTableBody.appendChild(row);
            });
        }
        updatePaginationControls();
    }

    function updatePaginationControls() {
        const totalPages = Math.ceil(submittedSupplierReturns.length / itemsPerPage);
        pageNumbersSpan.textContent = `Halaman ${currentPage} dari ${totalPages || 1}`;

        prevPageBtn.disabled = (currentPage === 1);
        nextPageBtn.disabled = (currentPage === totalPages || submittedSupplierReturns.length === 0);
    }

    // --- Fungsi Aksi Tambahan ---

    /**
     * Menghapus retur dari data yang sudah diajukan.
     * @param {number} id ID retur yang akan dihapus.
     */
    function deleteSubmittedReturn(id) {
        if (confirm('Apakah Anda yakin ingin menghapus data retur yang diajukan ini?')) {
            submittedSupplierReturns = submittedSupplierReturns.filter(retur => retur.id !== id);
            saveSubmittedReturns();
            
            const totalPagesAfterDelete = Math.ceil(submittedSupplierReturns.length / itemsPerPage);
            if (currentPage > totalPagesAfterDelete && currentPage > 1) {
                currentPage = totalPagesAfterDelete;
            }
            
            displaySubmittedReturns();
            alert('Data retur diajukan berhasil dihapus!');
        }
    }

    /**
     * Menyiapkan konten retur dan memicu dialog cetak browser.
     * @param {number} id ID retur yang akan dicetak.
     */
    function printReturn(id) {
        const returDetail = submittedSupplierReturns.find(retur => retur.id === id);
        if (!returDetail) {
            alert('Data retur tidak ditemukan.');
            return;
        }

        let itemsHtml = '<table style="width:100%; border-collapse: collapse; margin-top: 10px;">';
        itemsHtml += '<thead><tr><th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Nama Barang</th><th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Kuantitas</th><th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Harga Satuan</th><th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Subtotal</th><th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Keterangan Item</th></tr></thead><tbody>';
        
        if (returDetail.items && returDetail.items.length > 0) {
            returDetail.items.forEach(item => {
                itemsHtml += `
                    <tr>
                        <td style="border: 1px solid #ddd; padding: 8px;">${item.namaRawMaterial || item.kodeRawMaterial || 'N/A'}</td>
                        <td style="border: 1px solid #ddd; padding: 8px;">${formatNumberWithDots(item.kuantitas || 0)} ${item.satuanRawMaterial || 'N/A'}</td>
                        <td style="border: 1px solid #ddd; padding: 8px;">${formatRupiah(item.harga || 0)}</td>
                        <td style="border: 1px solid #ddd; padding: 8px;">${formatRupiah(item.kuantitas * item.harga || 0)}</td>
                        <td style="border: 1px solid #ddd; padding: 8px;">${item.keteranganRetur || '-'}</td>
                    </tr>
                `;
            });
        } else {
            itemsHtml += `<tr><td colspan="5" style="border: 1px solid #ddd; padding: 8px; text-align: center;">Tidak ada item raw material.</td></tr>`;
        }
        itemsHtml += '</tbody></table>';

        const printContent = `
            <div style="font-family: sans-serif; padding: 20px;">
                <h2 style="text-align: center; margin-bottom: 20px;">Nota Retur Pembelian</h2>
                <div style="margin-bottom: 10px;">
                    <p><strong>Tanggal Retur:</strong> ${returDetail.tanggalRetur || '-'}</p>
                    <p><strong>Nama Supplier:</strong> ${returDetail.namaSupplier || '-'}</p>
                    <p><strong>No. Nota Retur:</strong> ${returDetail.noNotaRetur || '-'}</p>
                    <p><strong>Keterangan Umum:</strong> ${returDetail.keteranganReturUmum || '-'}</p>
                </div>
                <h4 style="margin-top: 20px;">Detail Barang Retur:</h4>
                ${itemsHtml}
                <p style="margin-top: 20px; text-align: right; font-size: 1.2em;"><strong>Total Retur:</strong> ${formatRupiah(returDetail.totalRetur || 0)}</p>
                <p style="margin-top: 30px; text-align: center; font-style: italic; font-size: 0.9em;">Dokumen ini dihasilkan secara otomatis pada: ${new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
            </div>
        `;

        // Membuat iframe sementara untuk mencetak
        let printWindow = window.open('', '_blank');
        printWindow.document.write('<html><head><title>Cetak Retur Pembelian</title>');
        // Anda bisa menyertakan CSS dasar di sini agar tampilan cetak rapi
        printWindow.document.write(`
            <style>
                body { font-family: sans-serif; margin: 0; padding: 20px; }
                h2, h4 { text-align: center; margin-bottom: 15px; }
                p { margin-bottom: 5px; }
                table { width: 100%; border-collapse: collapse; margin-top: 15px; }
                table th, table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                table thead th { background-color: #f2f2f2; }
                @media print {
                    /* Sembunyikan header/footer browser default */
                    @page { margin: 0.5in; }
                }
            </style>
        `);
        printWindow.document.write('</head><body>');
        printWindow.document.write(printContent);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        // Tidak perlu window.location.reload() karena tidak memanipulasi body utama
        // printWindow.close(); // Bisa ditambahkan jika ingin jendela cetak otomatis tertutup setelah print
    }

    // --- Event Listeners ---

    // Paginasi
    prevPageBtn.addEventListener('click', function() {
        if (currentPage > 1) {
            currentPage--;
            displaySubmittedReturns();
        }
    });

    nextPageBtn.addEventListener('click', function() {
        const totalPages = Math.ceil(submittedSupplierReturns.length / itemsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            displaySubmittedReturns();
        }
    });

    // Event Delegation untuk Tombol Aksi di halaman rekap_retur.html
    submittedRekapDataTableBody.addEventListener('click', function(event) {
        const target = event.target;
        const id = parseInt(target.dataset.id);

        if (target.classList.contains('print-btn')) {
            printReturn(id);
        } else if (target.classList.contains('delete-btn')) {
            deleteSubmittedReturn(id);
        }
    });

    // --- Inisialisasi Awal Halaman ---
    loadSubmittedReturns();
    displaySubmittedReturns();
});