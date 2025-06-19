const dataPerPage = 15;
let currentPage = 1;
let allData = [];

function formatCurrency(number) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(number);
}

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOMContentLoaded di permintaan_barang.js terpanggil.");
    loadDataPermintaan();

    const btnPrintPermintaan = document.getElementById('btnPrintPermintaan');
    if (btnPrintPermintaan) {
        btnPrintPermintaan.addEventListener('click', cetakSemuaData);
    }

    const prevButton = document.querySelector('.prev');
    const nextButton = document.querySelector('.next');

    if (prevButton) prevButton.addEventListener('click', prevPage);
    if (nextButton) nextButton.addEventListener('click', nextPage);

    loadSalesOrderForPermintaan();
});

function loadSalesOrderForPermintaan() {
    const prosesPermintaanData = localStorage.getItem('prosesPermintaanData');
    console.log("Data dari localStorage (prosesPermintaanData) di permintaan_barang.js:", prosesPermintaanData);

    if (prosesPermintaanData) {
        try {
            const transaksi = JSON.parse(prosesPermintaanData);
            console.log("Data setelah di-parse (transaksi) di permintaan_barang.js:", transaksi);
            console.log("Isi transaksi.items:", transaksi.items);

            if (!transaksi.items || !Array.isArray(transaksi.items)) {
                console.warn("transaksi.items bukan array atau tidak ada:", transaksi.items);
                return;
            }

            const newPermintaanItems = transaksi.items.map(item => {
                console.log("Memproses item:", item);
                // Pastikan transaksi.noNota ada dan bukan undefined atau null
                const notaValue = transaksi.noNota ? String(transaksi.noNota) : `TANPA_NOTA-${Date.now()}`; // Fallback ke ID unik jika noNota undefined
                return {
                    id: `PB-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                    tanggal: transaksi.tanggal,
                    nota: notaValue, // Menggunakan nilai nota yang sudah dipastikan ada
                    kodeBarang: item.kodeProduk,
                    namaBarang: item.namaProduk,
                    kuantitas: item.kuantitas,
                    satuan: item.satuanProduk,
                    namaPelanggan: transaksi.namaPelanggan,
                    harga: item.harga,
                    diskon: item.diskon,
                    total: item.total,
                    status: 'Baru'
                };
            });

            console.log("newPermintaanItems setelah mapping:", newPermintaanItems);
            const existingData = JSON.parse(localStorage.getItem('permintaanBarangItems')) || [];

            // Gabungkan data yang sudah ada dengan data baru.
            // Anda mungkin ingin menambahkan logika deduplikasi di sini
            // jika tidak ingin ada duplikasi nota yang sama (misalnya, jika pengguna mengklik "Pengiriman" dua kali untuk nota yang sama).
            // Contoh deduplikasi sederhana berdasarkan nota:
            const combinedDataMap = new Map();
            existingData.forEach(item => combinedDataMap.set(item.id, item)); // Gunakan ID unik
            newPermintaanItems.forEach(item => combinedDataMap.set(item.id, item));

            const updatedData = Array.from(combinedDataMap.values());

            console.log("Data yang akan disimpan ke permintaanBarangItems:", updatedData);
            localStorage.setItem('permintaanBarangItems', JSON.stringify(updatedData));
            console.log("Data berhasil disimpan ke permintaanBarangItems:", localStorage.getItem('permintaanBarangItems'));

            loadDataPermintaan();

        } catch (error) {
            console.error('Gagal memproses data Sales Order dari localStorage:', error);
            alert('Gagal memproses data permintaan barang. Silakan coba lagi.');
        } finally {
            localStorage.removeItem('prosesPermintaanData');
            console.log("Data prosesPermintaanData dihapus dari localStorage.");
        }
    } else {
        console.log("Tidak ada data prosesPermintaanData ditemukan di localStorage di permintaan_barang.js.");
    }
}

function loadDataPermintaan() {
    const savedData = localStorage.getItem('permintaanBarangItems');
    console.log("Data dari localStorage (permintaanBarangItems):", savedData);
    try {
        const parsedData = JSON.parse(savedData);
        allData = Array.isArray(parsedData) ? parsedData : [];
        console.log("Data setelah di-parse (allData) di loadDataPermintaan:", allData);
    } catch (error) {
        console.error('Gagal parsing data dari localStorage:', error);
        allData = [];
    }

    renderTable(allData, currentPage);
    renderPagination(allData.length);
}

function renderTable(data, page) {
    console.log("Data yang diterima renderTable:", data);
    const groupedDataMap = {};
    data.forEach(item => {
        // Hanya proses item jika memiliki properti 'nota' yang valid (tidak undefined atau null)
        // Dan ubah ke string untuk konsistensi
        const itemNota = item.nota ? String(item.nota) : ''; // Pastikan nota adalah string

        if (itemNota) { // Pastikan nota tidak kosong
            if (!groupedDataMap[itemNota]) {
                groupedDataMap[itemNota] = {
                    tanggal: item.tanggal,
                    nota: itemNota, // Gunakan itemNota yang sudah divalidasi
                    namaPelanggan: item.namaPelanggan,
                    status: 'Baru',
                    barangList: []
                };
            }
            if (item.status === 'Selesai') {
                groupedDataMap[itemNota].status = 'Selesai';
            }
            groupedDataMap[itemNota].barangList.push({
                namaBarang: item.namaBarang,
                kuantitas: item.kuantitas,
                satuan: item.satuan
            });
        } else {
            console.warn("Item dengan nota tidak valid dilewati:", item);
        }
    });

    const groupedData = Object.values(groupedDataMap);
    groupedData.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
    console.log("Data setelah dikelompokkan (groupedData):", groupedData);

    const startIndex = (page - 1) * dataPerPage;
    const endIndex = startIndex + dataPerPage;
    const currentPageData = groupedData.slice(startIndex, endIndex);
    console.log("Data untuk halaman saat ini (currentPageData):", currentPageData);

    const tbodyPermintaan = document.getElementById('permintaanBarangData');

    if (tbodyPermintaan) {
        tbodyPermintaan.innerHTML = '';

        if (currentPageData.length === 0 && groupedData.length > 0 && currentPage > 1) {
            currentPage = Math.max(1, currentPage - 1);
            renderTable(data, currentPage);
            return;
        } else if (groupedData.length === 0) {
            tbodyPermintaan.innerHTML = '<tr><td colspan="5" style="text-align: center;">Tidak ada data permintaan barang.</td></tr>';
            renderPagination(0);
            return;
        }

        currentPageData.forEach((group) => {
            const tr = document.createElement('tr');
            const barangGabungan = group.barangList.map(b => `${b.namaBarang} (${b.kuantitas} ${b.satuan})`).join('<br>');

            // Pastikan data-nota hanya diisi jika group.nota valid
            const currentNota = group.nota || ''; // Fallback ke string kosong jika nota undefined/null

            let actionButtons = `<button class="print-button" data-nota="${currentNota}">Print</button>`;
            if (group.status === 'Selesai') {
                actionButtons += `<span style="margin-left:10px; color:green; font-weight: bold;">Selesai</span>`;
            } else {
                actionButtons += `<button class="process-button" data-nota="${currentNota}" style="margin-left:10px;">Proses</button>`;
            }
            // Tombol hapus hanya jika nota valid
            if (currentNota) { // Hanya tampilkan tombol hapus jika nota ada
                actionButtons += `<button class="delete-button" data-nota="${currentNota}" style="margin-left:10px; color:red;">Hapus</button>`;
            } else {
                actionButtons += `<span style="margin-left:10px; color:gray;">Tidak dapat dihapus (nota tidak valid)</span>`;
            }
            actionButtons += `<button class="ajukan-produksi-button" data-nota="${currentNota}" style="margin-left: 10px;">Ajukan Produksi</button>`;


            tr.innerHTML = `
                <td>${group.tanggal || '-'}</td>
                <td>${group.nota || '-'}</td>
                <td>${barangGabungan || '-'}</td>
                <td>${group.namaPelanggan || '-'}</td>
                <td>${actionButtons}</td>
            `;

            tbodyPermintaan.appendChild(tr);

            tr.querySelector('.print-button')?.addEventListener('click', function (e) {
                e.stopPropagation();
                printSingleNota(group.nota);
            });

            tr.querySelector('.process-button')?.addEventListener('click', function () {
                ubahStatusPerNota(group.nota);
            });

            // Hanya tambahkan event listener jika tombol delete ada
            if (currentNota) {
                tr.querySelector('.delete-button')?.addEventListener('click', function () {
                    const notaToDelete = this.getAttribute('data-nota');
                    hapusPermintaanPerNota(notaToDelete);
                });
            }

            tr.querySelector('.ajukan-produksi-button')?.addEventListener('click', function () {
                const notaToProduce = this.getAttribute('data-nota');
                ajukanProduksi(notaToProduce);
            });
        });
    }
    renderPagination(groupedData.length);
}

function renderPagination(totalData) {
    const totalPages = Math.ceil(totalData / dataPerPage);
    const pageNumbersSpan = document.querySelector('.page-numbers');
    const prevButton = document.querySelector('.prev');
    const nextButton = document.querySelector('.next');

    if (pageNumbersSpan) {
        pageNumbersSpan.textContent = `Halaman ${currentPage} dari ${totalPages || 1}`;
    }

    if (prevButton) prevButton.disabled = currentPage === 1;
    if (nextButton) nextButton.disabled = currentPage === totalPages || totalPages === 0;
}

function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        loadDataPermintaan();
    }
}

function nextPage() {
    const totalPages = Math.ceil(allData.length / dataPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        loadDataPermintaan();
    }
}

function cetakSemuaData() {
    window.print();
}

function printSingleNota(nota) {
    const dataUntukNota = allData.filter(item => item.nota === nota);

    if (dataUntukNota.length > 0) {
        const printWindow = window.open('', '_blank');
        const first = dataUntukNota[0];
        const rows = dataUntukNota.map(item => `
                    <tr>
                        <td>${item.namaBarang || '-'}</td>
                        <td>${item.kuantitas || '-'}</td>
                        <td>${item.satuan || '-'}</td>
                        <td>${item.harga ? formatCurrency(parseFloat(item.harga)) : '-'}</td>
                        <td>${item.diskon ? formatCurrency(parseFloat(item.diskon)) : '-'}</td>
                        <td>${item.total ? formatCurrency(parseFloat(item.total)) : '-'}</td>
                    </tr>
        `).join('');

        let printContent = `
                    <html>
                    <head><title>Detail Permintaan Barang</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        h2 { text-align: center; margin-bottom: 20px; }
                        .info-header { margin-bottom: 15px; border: 1px solid #ccc; padding: 10px; border-radius: 5px; }
                        .info-header div { margin-bottom: 5px; }
                        .info-header label { font-weight: bold; margin-right: 5px; min-width: 120px; display: inline-block; }
                        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
                        th, td { border: 1px solid black; padding: 8px; text-align: left; font-size: 0.9em; }
                        th { background-color: #f2f2f2; }
                        .status { margin-top: 20px; font-weight: bold; }
                    </style>
                    </head>
                    <body>
                        <h2>Detail Permintaan Barang</h2>
                        <div class="info-header">
                            <div><label>Tanggal:</label> <span>${first.tanggal || '-'}</span></div>
                            <div><label>No Nota:</label> <span>${first.nota || '-'}</span></div>
                            <div><label>Nama Pelanggan:</label> <span>${first.namaPelanggan || '-'}</span></div>
                        </div>
                        <h3>Detail Barang:</h3>
                        <table>
                            <thead>
                                <tr>
                                    <th>Nama Barang</th>
                                    <th>Kuantitas</th>
                                    <th>Satuan</th>
                                    <th>Harga</th>
                                    <th>Diskon</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${rows}
                            </tbody>
                        </table>
                        <div class="status">Status: <span>${first.status || 'Baru'}</span></div>
                    </body>
                    </html>
        `;

        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 300);
    } else {
        alert('Data tidak ditemukan untuk dicetak.');
    }
}

function ubahStatusPerNota(nota) {
    let changed = false;
    // Menggunakan Set untuk melacak nota yang statusnya diubah menjadi 'Selesai'
    const notasToBeCompleted = new Set();

    allData = allData.map(item => {
        if (item.nota === nota) {
            item.status = 'Selesai';
            changed = true;
            notasToBeCompleted.add(nota); // Tandai nota ini untuk selesai
        }
        return item;
    });

    if (changed) {
        // Jika ada nota yang berubah status menjadi 'Selesai', pastikan semua item dengan nota tersebut juga 'Selesai'
        // Ini adalah double-check untuk konsistensi di local storage
        allData = allData.map(item => {
            if (notasToBeCompleted.has(item.nota)) {
                return { ...item, status: 'Selesai' };
            }
            return item;
        });

        localStorage.setItem('permintaanBarangItems', JSON.stringify(allData));
        loadDataPermintaan();
    }
}

function hapusPermintaanPerNota(notaToDelete) {
    // Pastikan notaToDelete adalah string valid sebelum melanjutkan
    if (!notaToDelete || typeof notaToDelete !== 'string') {
        console.error("Nota yang akan dihapus tidak valid:", notaToDelete);
        alert("Tidak dapat menghapus data: Nomor nota tidak valid.");
        return;
    }

    if (confirm(`Apakah Anda yakin ingin menghapus permintaan dengan No. Nota: ${notaToDelete}?`)) {
        // Filter out all items belonging to the notaToDelete
        const updatedData = allData.filter(item => {
            // Periksa item.nota dengan aman sebelum membandingkan
            const itemNota = item.nota ? String(item.nota) : '';
            return itemNota !== notaToDelete;
        });

        localStorage.setItem('permintaanBarangItems', JSON.stringify(updatedData));
        loadDataPermintaan(); // Muat ulang data dan render tabel
    }
}

function ajukanProduksi(nota) {
    const permintaanUntukProduksi = allData.filter(item => item.nota === nota);
    console.log("Data permintaan untuk produksi:", permintaanUntukProduksi);
    if (permintaanUntukProduksi.length > 0) {
        const formattedData = {
            id: `PROD-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            tanggal: permintaanUntukProduksi[0].tanggal,
            noNotaAsal: nota,
            namaPemohon: permintaanUntukProduksi[0].namaPelanggan,
            departemen: 'Penjualan',
            tglButuh: permintaanUntukProduksi[0].tanggal,
            prioritas: 'Normal',
            statusProduksi: 'Menunggu',
            detailBarang: permintaanUntukProduksi.map(item => ({
                kodeProduk: item.kodeBarang,
                namaBarang: item.namaBarang,
                kuantitas: item.kuantitas,
                satuan: item.satuan
            }))
        };
        console.log("Data yang diformat untuk produksi:", formattedData);

        try {
            const existingProduksiData = JSON.parse(localStorage.getItem('permintaanProduksi')) || [];
            const updatedProduksiData = [...existingProduksiData, formattedData];
            localStorage.setItem('permintaanProduksi', JSON.stringify(updatedProduksiData));
            console.log("Data berhasil disimpan ke permintaanProduksi:", localStorage.getItem('permintaanProduksi'));
            alert('Data berhasil dikirimkan ke halaman permintaan produksi!');
        } catch (error) {
            console.error("Terjadi kesalahan saat menyimpan data produksi:", error);
            alert('Terjadi kesalahan saat mengirim data ke halaman permintaan produksi.');
        }
    } else {
        alert(`Data permintaan dengan No. Nota ${nota} tidak ditemukan.`);
    }
}