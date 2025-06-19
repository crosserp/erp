// retur_barang.js
document.addEventListener('DOMContentLoaded', function() {
    const tbodyDaftarRetur = document.getElementById('tbodyDaftarRetur');

    if (!tbodyDaftarRetur) {
        console.error("Elemen dengan ID 'tbodyDaftarRetur' tidak ditemukan.");
        return;
    }

    // Function to format numbers to Rupiah currency
    function formatRupiah(value) {
        let number = parseFloat(String(value).replace(/[^0-9,-]/g, '').replace(',', '.'));
        if (isNaN(number)) return '';
        let rupiah = new Intl.NumberFormat('id-ID', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(number);
        return 'Rp ' + rupiah;
    }

    function loadDaftarRetur() {
        const daftarRetur = JSON.parse(localStorage.getItem('daftarRetur')) || [];
        tbodyDaftarRetur.innerHTML = ''; // Clear existing rows

        if (daftarRetur.length === 0) {
            tbodyDaftarRetur.innerHTML = '<tr><td colspan="6" class="text-center">Tidak ada data retur.</td></tr>';
            return;
        }

        daftarRetur.forEach((retur) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${retur.id}</td>
                <td>${retur.tanggal}</td>
                <td>${retur.nama_customer}</td>
                <td>${formatRupiah(retur.total_diskon_global)}</td>
                <td>${formatRupiah(retur.grand_total)}</td>
                <td>
                    <button class="btn-print" data-id="${retur.id}">Print</button>
                    <button class="btn-ajukan" data-id="${retur.id}">Ajukan</button>
                    <button class="btn-delete" data-id="${retur.id}">Hapus</button>
                </td>
            `;
            tbodyDaftarRetur.appendChild(row);
        });

        addEventListenersToButtons();
    }

    function addEventListenersToButtons() {
        // Use event delegation for better performance and to handle dynamically added rows
        tbodyDaftarRetur.removeEventListener('click', handleButtonClicks); // Remove previous listener to prevent duplicates
        tbodyDaftarRetur.addEventListener('click', handleButtonClicks);
    }

    function handleButtonClicks(event) {
        const target = event.target;
        const returId = parseInt(target.dataset.id);

        if (isNaN(returId)) return; // Not a button with data-id

        if (target.classList.contains('btn-print')) {
            printRetur(returId);
        } else if (target.classList.contains('btn-ajukan')) {
            if (confirm('Apakah Anda yakin ingin mengajukan retur ini? Data akan dikirimkan ke daftar retur penjualan yang perlu diproses.')) {
                ajukanRetur(returId);
            }
        } else if (target.classList.contains('btn-delete')) {
            if (confirm('Apakah Anda yakin ingin menghapus data retur ini?')) {
                deleteRetur(returId);
            }
        }
    }

    // Function to handle printing (unchanged)
    function printRetur(id) {
        const daftarRetur = JSON.parse(localStorage.getItem('daftarRetur')) || [];
        const returToPrint = daftarRetur.find(retur => retur.id === id);

        if (!returToPrint) {
            alert('Data retur tidak ditemukan untuk dicetak.');
            return;
        }

        let printContent = `
            <div style="font-family: Arial, sans-serif; margin: 20px;">
                <h2 style="text-align: center; margin-bottom: 20px;">Detail Retur Barang</h2>
                <p><strong>ID Retur:</strong> ${returToPrint.id}</p>
                <p><strong>Tanggal:</strong> ${returToPrint.tanggal}</p>
                <p><strong>Nama Pelanggan:</strong> ${returToPrint.nama_customer}</p>
                <p><strong>Total Diskon Global:</strong> ${formatRupiah(returToPrint.total_diskon_global)}</p>
                <p><strong>Grand Total:</strong> ${formatRupiah(returToPrint.grand_total)}</p>

                <h3>Item Retur:</h3>
                <table border="1" style="width:100%; border-collapse: collapse;">
                    <thead>
                        <tr>
                            <th>Kode Produk</th>
                            <th>Nama Produk</th>
                            <th>Qty</th>
                            <th>Satuan</th>
                            <th>Harga</th>
                            <th>Diskon Item</th>
                            <th>Total Harga Item</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        returToPrint.items.forEach(item => {
            printContent += `
                <tr>
                    <td>${item.kode_produk}</td>
                    <td>${item.nama_produk}</td>
                    <td>${item.qty}</td>
                    <td>${item.satuan}</td>
                    <td>${formatRupiah(item.harga)}</td>
                    <td>${formatRupiah(item.disc)}</td>
                    <td>${formatRupiah(item.total_harga_item)}</td>
                </tr>
            `;
        });

        printContent += `
                    </tbody>
                </table>
                <p style="margin-top: 30px; text-align: center; font-style: italic; font-size: 0.9em;">Dicetak pada: ${new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
            </div>
        `;

        const printWindow = window.open('', '', 'height=600,width=800');
        printWindow.document.write('<html><head><title>Cetak Retur Barang</title>');
        printWindow.document.write('<style>');
        printWindow.document.write('body { font-family: Arial, sans-serif; margin: 20px; }');
        printWindow.document.write('h2, h3 { text-align: center; margin-bottom: 15px; }');
        printWindow.document.write('table { width: 100%; border-collapse: collapse; margin-top: 20px; }');
        printWindow.document.write('th, td { border: 1px solid #000; padding: 8px; text-align: left; }');
        printWindow.document.write('th { background-color: #f2f2f2; }');
        printWindow.document.write('</style>');
        printWindow.document.write('</head><body>');
        printWindow.document.write(printContent);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.print();
    }

    // --- MODIFIED: Fungsi untuk mengajukan retur (data tetap ada di daftarRetur) ---
    function ajukanRetur(id) {
        let daftarRetur = JSON.parse(localStorage.getItem('daftarRetur')) || [];
        const returToSubmit = daftarRetur.find(retur => retur.id === id);

        if (returToSubmit) {
            // 1. Ambil data retur penjualan yang sudah diajukan (existing)
            let submittedCustomerReturns = JSON.parse(localStorage.getItem('submittedCustomerReturns')) || [];

            // 2. Siapkan data baru untuk diajukan
            const newSubmittedReturn = {
                id: returToSubmit.id, // Gunakan ID yang sama untuk pelacakan
                tanggal: returToSubmit.tanggal,
                nama_customer: returToSubmit.nama_customer, 
                noNotaRetur: `PJ-${Date.now().toString().slice(-6)}`, // Contoh auto-generate nota
                jenisRetur: "Penjualan",
                items: returToSubmit.items.map(item => ({
                    kode_produk: item.kode_produk,
                    nama_produk: item.nama_produk,
                    qty: item.qty,
                    satuan: item.satuan,
                    harga: item.harga || 0,
                    keterangan: item.keterangan || "Retur barang",
                    processed: false // Penting: tandai sebagai belum diproses
                })),
                totalRetur: returToSubmit.items.reduce((sum, item) => sum + (item.qty * (item.harga || 0)), 0),
                status: "Diajukan"
            };

            // 3. Tambahkan retur baru ke daftar retur yang sudah diajukan
            submittedCustomerReturns.push(newSubmittedReturn);

            // 4. Simpan kembali array yang diperbarui ke localStorage
            localStorage.setItem('submittedCustomerReturns', JSON.stringify(submittedCustomerReturns));

            // --- PENTING: BAGIAN INI DIHAPUS/DIKOMENTARI AGAR DATA TIDAK DIHAPUS DARI daftarRetur ---
            // const returToSubmitIndex = daftarRetur.findIndex(retur => retur.id === id);
            // if (returToSubmitIndex !== -1) {
            //     daftarRetur.splice(returToSubmitIndex, 1);
            //     localStorage.setItem('daftarRetur', JSON.stringify(daftarRetur));
            // }
            // --- Akhir bagian yang dihapus/dikomentari ---

            alert('Retur berhasil diajukan dan data telah dikirimkan ke daftar Retur Penjualan!');

            // 5. Tidak perlu memuat ulang daftarRetur jika tidak ada yang dihapus
            // loadDaftarRetur(); 

            // 6. Arahkan ke halaman Rekap Retur Penjualan setelah berhasil diajukan
            // window.location.href = 'goods_retur.html'; 

        } else {
            alert('Data retur tidak ditemukan untuk diajukan.');
        }
    }

    function deleteRetur(id) {
        let daftarRetur = JSON.parse(localStorage.getItem('daftarRetur')) || [];
        daftarRetur = daftarRetur.filter(retur => retur.id !== id);
        localStorage.setItem('daftarRetur', JSON.stringify(daftarRetur));
        loadDaftarRetur();
        alert('Data retur berhasil dihapus!');
    }

    // Initial load when the page is ready
    loadDaftarRetur();
});