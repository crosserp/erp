document.addEventListener('DOMContentLoaded', function() {
    const pengajuanListBody = document.getElementById('pengajuan-list-body');
    const prevPageButton = document.getElementById('prevPage');
    const nextPageButton = document.getElementById('nextPage');
    const pageNumbersSpan = document.getElementById('pageNumbers');

    const itemsPerPage = 5;
    let currentPage = 1;
    let allPengajuan = [];

    function loadPengajuanData() {
        allPengajuan = JSON.parse(localStorage.getItem('daftarPengajuanFinishedGoods')) || [];
        console.log('Data dari localStorage setelah dimuat:', allPengajuan); // DEBUG: Cek data awal

        allPengajuan.forEach(pengajuan => {
            if (!pengajuan.status) {
                pengajuan.status = 'Draft';
            }
            // DEBUG: Cek ID dan tipenya saat dimuat
            console.log(`Pengajuan ID: ${pengajuan.id}, Tipe: ${typeof pengajuan.id}`);
        });

        allPengajuan.sort((a, b) => new Date(b.header.tgl) - new Date(a.header.tgl));
    }

    function savePengajuanData() {
        localStorage.setItem('daftarPengajuanFinishedGoods', JSON.stringify(allPengajuan));
        console.log('Data disimpan ke localStorage:', allPengajuan); // DEBUG: Cek data saat disimpan
    }

    function renderPengajuanTable() {
        pengajuanListBody.innerHTML = '';

        const totalPages = Math.ceil(allPengajuan.length / itemsPerPage);

        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const currentPengajuan = allPengajuan.slice(startIndex, endIndex);

        if (currentPengajuan.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `<td colspan="8" style="text-align: center;">Belum ada data pengajuan.</td>`;
            pengajuanListBody.appendChild(row);
        } else {
            currentPengajuan.forEach((pengajuan, index) => {
                const row = document.createElement('tr');
                const rowNumber = startIndex + index + 1;

                row.innerHTML = `
                    <td>${pengajuan.id}</td>
                    <td>${pengajuan.header.tgl}</td>
                    <td>${pengajuan.header.namaPemohon}</td>
                    <td>${pengajuan.header.departement}</td>
                    <td>${pengajuan.header.tglButuh}</td>
                    <td>${pengajuan.header.prioritas}</td>
                    <td>${pengajuan.status}</td>
                    <td class="action-buttons">
                        ${pengajuan.status === 'Draft' ?
                            `<button class="btn-update" data-id="${pengajuan.id}">Update</button>
                             <button class="btn-ajukan" data-id="${pengajuan.id}">Ajukan</button>`
                            : ''
                        }
                        <button class="btn-print" data-id="${pengajuan.id}">Print</button>
                        <button class="btn-delete" data-id="${pengajuan.id}">Hapus</button>
                    </td>
                `;
                pengajuanListBody.appendChild(row);
            });
        }

        updatePaginationControls(totalPages);
        addEventListenersToButtons();
    }

    function updatePaginationControls(totalPages) {
        // Pastikan pageNumbersSpan tidak null sebelum mengakses textContent
        if (pageNumbersSpan) {
            pageNumbersSpan.textContent = `Halaman ${currentPage} dari ${totalPages || 1}`;
        } else {
            console.error("Elemen dengan ID 'pageNumbers' tidak ditemukan.");
        }
        
        // Pastikan tombol-tombol paginasi tidak null
        if (prevPageButton) {
            prevPageButton.disabled = currentPage === 1;
        }
        if (nextPageButton) {
            nextPageButton.disabled = currentPage === totalPages || allPengajuan.length === 0;
        }
    }

    function addEventListenersToButtons() {
        // Event listener untuk tombol Update
        document.querySelectorAll('.btn-update').forEach(button => {
            button.addEventListener('click', function() {
                const pengajuanId = parseInt(this.dataset.id);
                console.log('Tombol Update diklik. ID:', pengajuanId, 'Tipe ID:', typeof pengajuanId); // DEBUG
                editPengajuan(pengajuanId);
            });
        });

        // Event listener untuk tombol Ajukan
        document.querySelectorAll('.btn-ajukan').forEach(button => {
            button.addEventListener('click', function() {
                const pengajuanId = parseInt(this.dataset.id);
                console.log('Tombol Ajukan diklik. ID:', pengajuanId, 'Tipe ID:', typeof pengajuanId); // DEBUG
                ajukanPengajuan(pengajuanId);
            });
        });

        // Event listener untuk tombol Print
        document.querySelectorAll('.btn-print').forEach(button => {
            button.addEventListener('click', function() {
                const pengajuanId = parseInt(this.dataset.id);
                console.log('Tombol Print diklik. ID:', pengajuanId, 'Tipe ID:', typeof pengajuanId); // DEBUG
                printPengajuan(pengajuanId);
            });
        });

        // Event listener untuk tombol Hapus
        document.querySelectorAll('.btn-delete').forEach(button => {
            button.addEventListener('click', function() {
                const pengajuanId = parseInt(this.dataset.id);
                console.log('Tombol Hapus diklik. ID:', pengajuanId, 'Tipe ID:', typeof pengajuanId); // DEBUG
                deletePengajuan(pengajuanId);
            });
        });
    }

    function prevPage() {
        if (currentPage > 1) {
            currentPage--;
            renderPengajuanTable();
        }
    }

    function nextPage() {
        const totalPages = Math.ceil(allPengajuan.length / itemsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            renderPengajuanTable();
        }
    }

    function editPengajuan(id) {
        localStorage.setItem('editPengajuanId', id);
        window.location.href = 'pengajuan_goods2.html';
    }

    function ajukanPengajuan(id) {
        const index = allPengajuan.findIndex(p => p.id === id);
        console.log('Mencari pengajuan untuk diajukan dengan ID:', id, 'Ditemukan di index:', index); // DEBUG
        if (index !== -1) {
            if (confirm('Apakah Anda yakin ingin mengajukan pengajuan ini? Setelah diajukan, tidak bisa diubah.')) {
                const pengajuanYangDiajukan = allPengajuan[index];
                pengajuanYangDiajukan.status = 'Diajukan';

                // Buat objek data yang akan disimpan untuk permintaan produksi
                const dataUntukProduksi = {
                    id: pengajuanYangDiajukan.id, // Pertahankan ID unik
                    tanggal: pengajuanYangDiajukan.header.tgl,
                    namaPemohon: pengajuanYangDiajukan.header.namaPemohon,
                    departement: pengajuanYangDiajukan.header.departement,
                    tglButuh: pengajuanYangDiajukan.header.tglButuh,
                    prioritas: pengajuanYangDiajukan.header.prioritas,
                    status: 'Diajukan', // Status di permintaan produksi
                    detailBarang: pengajuanYangDiajukan.details.map(detail => ({
                        kodeProduk: detail.kodeProduk,
                        namaBarang: detail.namaProduk, // Sesuaikan dengan nama properti di permintaan_produksi.js
                        kuantitas: detail.kuantitas,
                        satuan: detail.satuan
                    }))
                };

                // Ambil data permintaan produksi yang sudah ada
                let daftarPermintaanProduksi = JSON.parse(localStorage.getItem('permintaanProduksi')) || [];

                // Tambahkan pengajuan yang diajukan ke daftar (jika belum ada untuk menghindari duplikat)
                const existsInProduction = daftarPermintaanProduksi.some(item => item.id === dataUntukProduksi.id);
                if (!existsInProduction) {
                    daftarPermintaanProduksi.push(dataUntukProduksi);
                    localStorage.setItem('permintaanProduksi', JSON.stringify(daftarPermintaanProduksi));
                    console.log('Data pengajuan berhasil ditambahkan ke permintaanProduksi localStorage:', dataUntukProduksi);
                } else {
                    console.log('Pengajuan dengan ID ini sudah ada di permintaanProduksi. Tidak ada penambahan.');
                }

                savePengajuanData(); // Simpan perubahan status di daftarPengajuanFinishedGoods
                alert('Pengajuan berhasil diajukan!');
                renderPengajuanTable();
            }
        } else {
            alert('Pengajuan tidak ditemukan.');
        }
    }

    function printPengajuan(id) {
        const selectedPengajuan = allPengajuan.find(p => p.id === id);
        console.log('Mencari pengajuan untuk dicetak dengan ID:', id, 'Ditemukan:', selectedPengajuan); // DEBUG
        if (selectedPengajuan) {
            let printContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Print Pengajuan Finished Goods</title>
                    <style>
                        body { font-family: sans-serif; margin: 20px; color: #333; }
                        h2, h3 { text-align: center; color: #000; }
                        p { margin-bottom: 5px; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
                        th { background-color: #f2f2f2; }
                    </style>
                </head>
                <body>
                    <h2>Detail Pengajuan Finished Goods</h2>
                    <p><strong>Tanggal Pengajuan:</strong> ${selectedPengajuan.header.tgl}</p>
                    <p><strong>Nama Pemohon:</strong> ${selectedPengajuan.header.namaPemohon}</p>
                    <p><strong>Departemen:</strong> ${selectedPengajuan.header.departement}</p>
                    <p><strong>Tanggal Dibutuhkan:</strong> ${selectedPengajuan.header.tglButuh}</p>
                    <p><strong>Prioritas:</strong> ${selectedPengajuan.header.prioritas}</p>
                    <p><strong>Status:</strong> ${selectedPengajuan.status}</p>

                    <h3>Detail Produk:</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Kode Produk</th>
                                <th>Nama Produk</th>
                                <th>Kuantitas</th>
                                <th>Satuan</th>
                            </tr>
                        </thead>
                        <tbody>
            `;
            if (selectedPengajuan.details && selectedPengajuan.details.length > 0) {
                selectedPengajuan.details.forEach(detail => {
                    printContent += `
                        <tr>
                            <td>${detail.kodeProduk}</td>
                            <td>${detail.namaProduk}</td>
                            <td>${detail.kuantitas}</td>
                            <td>${detail.satuan}</td>
                        </tr>
                    `;
                });
            } else {
                printContent += `<tr><td colspan="4">Tidak ada detail produk.</td></tr>`;
            }
            printContent += `
                        </tbody>
                    </table>
                </body>
                </html>
            `;

            const printWindow = window.open('', '_blank');
            printWindow.document.write(printContent);
            printWindow.document.close();
            printWindow.print();
        } else {
            alert('Pengajuan tidak ditemukan untuk dicetak.');
        }
    }

    function deletePengajuan(id) {
        if (confirm('Apakah Anda yakin ingin menghapus pengajuan ini?')) {
            const initialLength = allPengajuan.length; // DEBUG
            allPengajuan = allPengajuan.filter(pengajuan => pengajuan.id !== id);
            console.log('Mencoba menghapus ID:', id, 'Jumlah pengajuan sebelum:', initialLength, 'Sesudah:', allPengajuan.length); // DEBUG

            if (allPengajuan.length < initialLength) { // Cek apakah ada yang terhapus
                savePengajuanData();
                alert('Pengajuan berhasil dihapus!');
            } else {
                alert('Pengajuan tidak ditemukan atau tidak dapat dihapus.');
            }

            const totalPagesAfterDelete = Math.ceil(allPengajuan.length / itemsPerPage);
            if (currentPage > totalPagesAfterDelete && currentPage > 1) {
                currentPage = totalPagesAfterDelete;
            }
            renderPengajuanTable();
        }
    }

    loadPengajuanData();
    renderPengajuanTable();

    // Pastikan elemen-elemen ini memiliki ID yang sesuai di HTML Anda
    // <button class="prev" id="prevPage">Sebelumnya</button>
    // <span class="page-numbers" id="pageNumbers"></span>
    // <button class="next" id="nextPage">Selanjutnya</button>
    if (prevPageButton) {
        prevPageButton.addEventListener('click', prevPage);
    } else {
        console.error("Elemen dengan ID 'prevPage' tidak ditemukan.");
    }
    if (nextPageButton) {
        nextPageButton.addEventListener('click', nextPage);
    } else {
        console.error("Elemen dengan ID 'nextPage' tidak ditemukan.");
    }
});