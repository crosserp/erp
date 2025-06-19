// pengajuan_pengadaan.js

document.addEventListener('DOMContentLoaded', function() {
    const tableBody = document.querySelector('#daftarPengajuan');
    // Ambil data pengajuan yang perlu diproses dari localStorage
    let dataUntukDiprosesArray = JSON.parse(localStorage.getItem('dataUntukDiajukan')) || [];
    // Ambil data supplier dari localStorage (untuk fungsi print)
    let supplierData = JSON.parse(localStorage.getItem('supplierData')) || [];

    // --- FUNGSI FORMATTING DAN PARSING ANGKA (Konsisten dengan purchasing_list.js) ---

    /**
     * Memformat angka menjadi string Rupiah (misal: "Rp 1.234.567").
     * @param {number|string} number - Angka yang akan diformat.
     * @returns {string} - String angka yang sudah diformat Rupiah.
     */
    function formatRupiah(number) {
        if (typeof number === 'string' && number.startsWith('Rp')) {
            number = parseRupiahToNumber(number);
        }
        if (typeof number !== 'number' || isNaN(number)) {
            number = 0;
        }
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(number);
    }

    /**
     * Mengurai string Rupiah menjadi angka (number).
     * @param {string} rupiahString - String Rupiah yang akan diurai.
     * @returns {number} - Nilai angka.
     */
    function parseRupiahToNumber(rupiahString) {
        if (typeof rupiahString !== 'string') {
            return 0;
        }
        const cleaned = rupiahString.replace(/Rp\s?/g, '').replace(/\./g, '').replace(/,/g, '.');
        return parseFloat(cleaned) || 0;
    }

    /**
     * Mengurai angka dari string yang diformat (misal "1.000" menjadi 1000) untuk kuantitas.
     * @param {string} formattedString - String angka yang akan diurai.
     * @returns {number} - Nilai angka.
     */
    function parseFormattedNumber(formattedString) {
        if (typeof formattedString !== 'string') {
            return 0;
        }
        const cleaned = formattedString.replace(/\./g, '').replace(/,/g, '.');
        return parseFloat(cleaned) || 0;
    }

    /**
     * Memformat angka dengan pemisah ribuan (misal: "1.234.567").
     * @param {number|string} number - Angka yang akan diformat.
     * @returns {string} - String angka yang sudah diformat dengan pemisah ribuan.
     */
    function formatNumber(number) {
        if (typeof number === 'string') {
            number = parseFormattedNumber(number);
        }
        if (typeof number !== 'number' || isNaN(number)) {
            number = 0;
        }
        return new Intl.NumberFormat('id-ID').format(number);
    }

    // --- FUNGSI RENDER TABEL ---

    /**
     * Merender data pengajuan ke dalam tabel.
     */
    function renderTable() {
        if (!tableBody) {
            console.error("Elemen dengan ID 'daftarPengajuan' tidak ditemukan.");
            return;
        }
        tableBody.innerHTML = ''; // Kosongkan tabel sebelum mengisi data

        if (dataUntukDiprosesArray.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="8">Data tidak ditemukan.</td></tr>'; // Sesuaikan colspan
            return;
        }

        dataUntukDiprosesArray.forEach((pengajuan, index) => {
            const row = document.createElement('tr');
            // Menentukan apakah tombol Setuju harus dinonaktifkan
            const isDisabled = pengajuan.status === 'Disetujui' ? 'disabled' : '';
            const statusText = pengajuan.status === 'Disetujui' ? '<span style="color: green; font-weight: bold;">Disetujui</span>' : 'Menunggu Persetujuan';

            // Memformat daftar item agar tampil rapi di satu kolom
            const namaBarangList = pengajuan.items.map(item => item.namaBarang).join('<br>');
            const qList = pengajuan.items.map(item => formatNumber(item.q)).join('<br>'); // Gunakan formatNumber
            const satuanList = pengajuan.items.map(item => item.satuan).join('<br>');
            const hargaList = pengajuan.items.map(item => formatRupiah(item.harga)).join('<br>');
            const discList = pengajuan.items.map(item => formatRupiah(item.disc)).join('<br>');
            const totalHargaItemList = pengajuan.items.map(item => formatRupiah(item.totalHarga)).join('<br>');

            // Hitung total diskon dan total harga keseluruhan dari semua item dalam pengajuan ini
            const totalDiscKeseluruhan = pengajuan.items.reduce((sum, item) => sum + parseRupiahToNumber(item.disc), 0);
            const totalHargaKeseluruhan = pengajuan.items.reduce((sum, item) => sum + parseRupiahToNumber(item.totalHarga), 0);


            row.innerHTML = `
                <td>${pengajuan.tanggal}</td>
                <td>${pengajuan.namaPemasok || 'N/A'}</td>
                <td>${namaBarangList}</td>
                <td>${qList}</td>
                <td>${satuanList}</td>
                <td>${hargaList}</td>
                <td>${discList}</td>
                <td>${totalHargaItemList}</td>
                <td>
                    ${statusText} <br>
                    <button class="printButton btn btn-primary btn-sm" data-index="${index}">Print</button>
                    <button class="setujuButton btn btn-success btn-sm" data-index="${index}" ${isDisabled}>Setuju</button>
                    <button class="deleteButton btn btn-danger btn-sm" data-index="${index}">Delete</button>
                </td>
            `;
            tableBody.appendChild(row);

            // Tambahkan baris total di bawah setiap pengajuan
            const totalSummaryRow = document.createElement('tr');
            totalSummaryRow.innerHTML = `
                <td colspan="6" style="text-align: right; font-weight: bold;">Total Keseluruhan Pengajuan Ini:</td>
                <td style="font-weight: bold;">${formatRupiah(totalDiscKeseluruhan)}</td>
                <td style="font-weight: bold;">${formatRupiah(totalHargaKeseluruhan)}</td>
                <td></td>
            `;
            tableBody.appendChild(totalSummaryRow);

            // Tambahkan pemisah antar pengajuan
            const separatorRow = document.createElement('tr');
            separatorRow.innerHTML = `<td colspan="9"><hr style="border-top: 2px solid #ddd; margin: 10px 0;"></td>`;
            tableBody.appendChild(separatorRow);
        });
    }

    // Panggil renderTable saat DOMContentLoaded
    renderTable();

    // --- EVENT LISTENERS ---

    document.addEventListener('click', function(event) {
        // Tombol Print
        if (event.target.classList.contains('printButton')) {
            const index = event.target.dataset.index;
            printData(index);
        }
        // Tombol Setuju
        else if (event.target.classList.contains('setujuButton')) {
            const index = event.target.dataset.index;
            handleApprove(index);
        }
        // Tombol Delete
        else if (event.target.classList.contains('deleteButton')) {
            const index = event.target.dataset.index;
            if (confirm(`Yakin mau hapus pengajuan ini?`)) {
                deleteItem(index);
            }
        }
    });

    // --- FUNGSI handleApprove ---
    /**
     * Menangani persetujuan pengajuan dan memindahkannya ke 'incomingInventory'.
     * @param {number} index - Indeks pengajuan yang akan disetujui.
     */
    function handleApprove(index) {
        const approvedApplication = dataUntukDiprosesArray[index];

        if (!approvedApplication) {
            alert('Pengajuan tidak ditemukan!');
            return;
        }

        // Cek jika sudah disetujui, jangan lakukan apa-apa
        if (approvedApplication.status === 'Disetujui') {
            alert('Pengajuan ini sudah disetujui sebelumnya.');
            return;
        }

        // 1. Ambil data incoming inventory yang sudah ada
        let incomingInventory = JSON.parse(localStorage.getItem('incomingInventory')) || [];

        // 2. Tambahkan pengajuan yang disetujui ke data incoming inventory
        const newIncomingItem = {
            // Generate PO ID yang unik
            poId: 'PO-' + Date.now().toString().slice(-8) + Math.floor(Math.random() * 1000),
            tanggalPengajuan: approvedApplication.tanggal,
            namaPemasok: approvedApplication.namaPemasok,
            items: approvedApplication.items.map(item => ({
                namaBarang: item.namaBarang,
                kuantitasDipesan: parseFormattedNumber(item.q), // Pastikan ini angka
                satuan: item.satuan,
                hargaSatuan: parseRupiahToNumber(item.harga), // Pastikan ini angka
                statusPenerimaan: 'Menunggu Penerimaan', // Status item di incoming
                kuantitasDiterima: 0 // Inisialisasi kuantitas yang diterima
            })),
            totalHargaPO: parseRupiahToNumber(approvedApplication.totalHarga), // Total harga PO
            statusPengajuan: 'Disetujui', // Status pengajuan secara keseluruhan
            // Perkiraan tanggal kedatangan (misal: 3 hari dari sekarang)
            expectedArrivalDate: new Date(new Date().getTime() + (3 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0]
        };

        incomingInventory.push(newIncomingItem);

        // 3. Simpan kembali data incoming inventory ke localStorage
        localStorage.setItem('incomingInventory', JSON.stringify(incomingInventory));
        console.log("Pengajuan disetujui dan dikirim ke incomingInventory:", newIncomingItem);

        // 4. Update status pengajuan di dataUntukDiprosesArray (TIDAK DIHAPUS)
        dataUntukDiprosesArray[index].status = 'Disetujui';
        dataUntukDiprosesArray[index].poId = newIncomingItem.poId; // Tambahkan PO ID ke pengajuan asli

        // 5. Simpan kembali dataUntukDiajukan yang sudah diupdate ke localStorage
        localStorage.setItem('dataUntukDiajukan', JSON.stringify(dataUntukDiprosesArray));

        // 6. Perbarui tampilan tabel
        renderTable();
        alert(`Pengajuan dari ${approvedApplication.namaPemasok} untuk ${newIncomingItem.poId} telah disetujui dan informasi barang akan datang dikirim ke Inventory (Incoming Goods)!`);
    }

    /**
     * Mencetak detail pengajuan.
     * @param {number} index - Indeks pengajuan yang akan dicetak.
     */
    function printData(index) {
        const pengajuan = dataUntukDiprosesArray[index];
        if (!pengajuan) {
            alert('Data tidak ditemukan!');
            return;
        }

        // Cari data supplier berdasarkan nama pemasok di pengajuan
        const supplierDetail = supplierData.find(s => s.namaSupplier === pengajuan.namaPemasok);

        let supplierInfoHtml = '';
        if (supplierDetail) {
            supplierInfoHtml = `
                <p><strong>Nama Pemasok:</strong> ${supplierDetail.namaSupplier}</p>
                <p><strong>ID Pemasok:</strong> ${supplierDetail.idSupplier}</p>
                <p><strong>No. Telepon:</strong> ${supplierDetail.noSupplier}</p>
                <p><strong>Email:</strong> ${supplierDetail.emailSupplier}</p>
                <p><strong>Alamat:</strong> ${supplierDetail.alamatSupplier}</p>
                <p><strong>No. Rekening:</strong> ${supplierDetail.rekeningSupplier}</p>
                <p><strong>Hutang:</strong> ${formatRupiah(parseFormattedNumber(supplierDetail.hutangSupplier))}</p>
                <hr/>
            `;
        } else {
            supplierInfoHtml = `<p><strong>Nama Pemasok:</strong> ${pengajuan.namaPemasok || 'Tidak Diketahui'}</p><p>Detail Pemasok tidak ditemukan.</p><hr/>`;
        }

        const itemsRows = pengajuan.items.map(item => `
            <tr>
                <td>${item.namaBarang}</td>
                <td>${formatNumber(item.q)}</td> <td>${item.satuan}</td>
                <td>${formatRupiah(item.harga)}</td>
                <td>${formatRupiah(item.disc)}</td>
                <td>${formatRupiah(item.totalHarga)}</td>
            </tr>
        `).join('');

        // Hitung total keseluruhan untuk print (jika belum ada di pengajuan object)
        const totalDiscPrint = pengajuan.items.reduce((sum, item) => sum + parseRupiahToNumber(item.disc), 0);
        const totalHargaPrint = pengajuan.items.reduce((sum, item) => sum + parseRupiahToNumber(item.totalHarga), 0);

        const printContent = `
            <html>
            <head>
                <title>Cetak Pengajuan</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    h1 { text-align: center; }
                    .supplier-info { margin-bottom: 20px; }
                    .supplier-info p { margin: 5px 0; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { padding: 8px; border: 1px solid #ddd; text-align: left; }
                    th { background-color: #f4f4f4; }
                </style>
            </head>
            <body>
                <h1>Pengajuan Pengadaan</h1>
                <div class="supplier-info">
                    <p><strong>Tanggal Pengajuan:</strong> ${pengajuan.tanggal}</p>
                    ${supplierInfoHtml}
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Nama Barang</th>
                            <th>Jumlah</th>
                            <th>Satuan</th>
                            <th>Harga Satuan</th>
                            <th>Diskon Baris</th>
                            <th>Total Harga Baris</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsRows}
                        <tr>
                            <td colspan="4" style="text-align: right;"><strong>Total Diskon Keseluruhan:</strong></td>
                            <td colspan="2"><strong>${formatRupiah(totalDiscPrint)}</strong></td>
                        </tr>
                        <tr>
                            <td colspan="4" style="text-align: right;"><strong>Total Harga Keseluruhan:</strong></td>
                            <td colspan="2"><strong>${formatRupiah(totalHargaPrint)}</strong></td>
                        </tr>
                    </tbody>
                </table>
                <script>window.print(); window.close();</script>
            </body>
            </html>
        `;

        const printWindow = window.open('', '_blank');
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.focus();
    }

    /**
     * Menghapus item pengajuan dari array dan localStorage.
     * @param {number} index - Indeks item yang akan dihapus.
     */
    function deleteItem(index) {
        dataUntukDiprosesArray.splice(index, 1);
        localStorage.setItem('dataUntukDiajukan', JSON.stringify(dataUntukDiprosesArray));
        renderTable(); // Perbarui tampilan tabel setelah penghapusan
    }
});