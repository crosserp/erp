// document.addEventListener('DOMContentLoaded', function () {
//     // Ambil data dari localStorage.
//     const dataProduksi = JSON.parse(localStorage.getItem('permintaanProduksi')) || [];
//     const tbodyProduksi = document.querySelector('.table tbody');

//     // Debug: Periksa isi dataProduksi.
//     console.log('Data dari localStorage (permintaanProduksi):', dataProduksi);

//     if (!tbodyProduksi) {
//         console.error("Elemen <tbody> tabel produksi tidak ditemukan!");
//         return;
//     }

//     if (dataProduksi.length === 0) {
//         const emptyRow = document.createElement('tr');
//         const emptyCell = document.createElement('td');
//         emptyCell.setAttribute('colspan', 6);
//         emptyCell.textContent = 'Belum ada permintaan produksi.';
//         emptyRow.appendChild(emptyCell);
//         tbodyProduksi.appendChild(emptyRow);
//         return;
//     }

//     tbodyProduksi.innerHTML = '';

//     dataProduksi.forEach(pengajuan => {
//         // Debug: Periksa setiap pengajuan.
//         console.log('Pengajuan:', pengajuan);
//         if (pengajuan && pengajuan.detailBarang && Array.isArray(pengajuan.detailBarang)) {
//             pengajuan.detailBarang.forEach(barang => {
//                 // Debug: Periksa setiap barang.
//                 console.log('Barang:', barang);
//                 const tr = document.createElement('tr');
//                 const pengajuanUniqueId = getPengajuanId(pengajuan); // Menggunakan ID unik dari pengajuan asli

//                 tr.innerHTML = `
//                     <td class="t"> <span typ="date">${pengajuan.tanggal || ''}</span></td>
//                     <td class="t"><span type="text">${barang.kodeProduk || ''}</span></td>
//                     <td class="t"><span type="text">${barang.namaBarang || ''}</span></td>
//                     <td class="t"><span type="text">${barang.kuantitas || ''}</span></td>
//                     <td class="t"><span type="text">${barang.satuan || ''}</span></td>
//                     <td class="t">
//                         <button class="print-button" data-id="${pengajuanUniqueId}">Print</button>
//                         <button class="selesai-button" data-id="${pengajuanUniqueId}">Selesai</button>
//                         <button class="delete-button" data-id="${pengajuanUniqueId}">Delete</button>
//                     </td>
//                 `;
//                 tbodyProduksi.appendChild(tr);
//             });
//         } else {
//             console.warn('Pengajuan tidak memiliki detailBarang yang valid atau kosong:', pengajuan);
//         }
//     });

//     // Fungsi ini tidak lagi diperlukan jika Anda menggunakan pengajuan.id langsung
//     // function generateProductId(pengajuan, namaBarang) {
//     //     const datePart = pengajuan.tanggal.replace(/\//g, '');
//     //     const namePart = namaBarang.replace(/\s+/g, '').substring(0, 5).toUpperCase();
//     //     const randomPart = Math.random().toString(36).substring(2, 7).toUpperCase();
//     //     return `${datePart}-${namePart}-${randomPart}`;
//     // }

//     function getPengajuanId(pengajuan) {
//         // Gunakan ID unik dari pengajuan asli (dari pengajuan_goods.js)
//         if (pengajuan && typeof pengajuan.id !== 'undefined') {
//             return pengajuan.id;
//         }
//         // Fallback jika id tidak ditemukan (ini seharusnya tidak terjadi jika data sudah benar)
//         console.error("Pengajuan tidak memiliki ID yang valid untuk getPengajuanId:", pengajuan);
//         return "INVALID_ID_" + Math.random().toString(36).substring(2, 9);
//     }

//     // Event listener untuk tombol Print
//     document.addEventListener('click', function (event) {
//         if (event.target.classList.contains('print-button')) {
//             const pengajuanId = parseInt(event.target.getAttribute('data-id')); // Pastikan ini juga di-parse ke integer
//             handlePrintProduksi(pengajuanId);
//         }
//     });

//     // Event listener untuk tombol Selesai
//     document.addEventListener('click', function (event) {
//         if (event.target.classList.contains('selesai-button')) {
//             const selesaiButton = event.target;
//             const pengajuanId = parseInt(selesaiButton.getAttribute('data-id')); // Pastikan ini juga di-parse ke integer
            
//             // Logika untuk mengubah warna tombol menjadi hijau dan menonaktifkannya
//             selesaiButton.style.backgroundColor = 'green';
//             selesaiButton.textContent = 'Selesai';
//             selesaiButton.disabled = true;

//             handleSelesaiProduksi(pengajuanId);
//         }
//     });

//     // Event listener untuk tombol Delete
//     document.addEventListener('click', function (event) {
//         if (event.target.classList.contains('delete-button')) {
//             const deleteButton = event.target;
//             const pengajuanId = parseInt(deleteButton.getAttribute('data-id')); // Pastikan ini juga di-parse ke integer
//             handleDeleteProduksi(pengajuanId);
//         }
//     });

//     function handlePrintProduksi(id) {
//         const dataProduksi = JSON.parse(localStorage.getItem('permintaanProduksi')) || [];
//         // Menggunakan id (integer) untuk mencari
//         const pengajuanToPrint = dataProduksi.find(p => p.id === id);

//         if (pengajuanToPrint && pengajuanToPrint.detailBarang) {
//             let printContent = `
//                 <html>
//                 <head><title>Permintaan Produksi - ${pengajuanToPrint.namaPemohon} - ${pengajuanToPrint.tanggal}</title>
//                 <style>
//                     table { width: 100%; border-collapse: collapse; }
//                     th, td { border: 1px solid black; padding: 8px; text-align: left; }
//                     th { background-color: #f2f2f2; }
//                 </style>
//                 </head>
//                 <body>
//                     <h1>Permintaan Produksi</h1>
//                     <p>Tanggal: ${pengajuanToPrint.tanggal}</p>
//                     <p>Nama Pemohon: ${pengajuanToPrint.namaPemohon}</p>
//                     <p>Departemen: ${pengajuanToPrint.departement}</p>
//                     <table>
//                         <thead>
//                             <tr>
//                                 <th>No</th>
//                                 <th>Kode Produk</th>
//                                 <th>Nama Barang</th>
//                                 <th>Jumlah</th>
//                                 <th>Satuan</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//             `;

//             pengajuanToPrint.detailBarang.forEach((barang, index) => {
//                 printContent += `
//                                     <tr>
//                                         <td>${index + 1}</td>
//                                         <td>${barang.kodeProduk}</td>
//                                         <td>${barang.namaBarang}</td>
//                                         <td>${barang.kuantitas}</td>
//                                         <td>${barang.satuan || ''}</td>
//                                     </tr>
//                 `;
//             });

//             printContent += `
//                         </tbody>
//                     </table>
//                 </body>
//                 </html>
//                 `;

//             const printWindow = window.open('', '_blank');
//             printWindow.document.write(printContent);
//             printWindow.document.close();
//             printWindow.focus();
//             printWindow.print();
//             printWindow.close();
//         } else {
//             alert('Data permintaan produksi tidak ditemukan untuk dicetak.');
//         }
//     }

//     function handleSelesaiProduksi(id) {
//         console.log(`Produksi dengan ID ${id} telah selesai.`);
//         let dataProduksi = JSON.parse(localStorage.getItem('permintaanProduksi')) || [];
//         const updatedDataProduksi = dataProduksi.map(pengajuan => {
//             if (pengajuan.id === id) { // Menggunakan id (integer) untuk mencari
//                 return { ...pengajuan, status: 'Selesai' }; // Ubah status menjadi 'Selesai'
//             }
//             return pengajuan;
//         });
//         localStorage.setItem('permintaanProduksi', JSON.stringify(updatedDataProduksi));
//         // Anda mungkin perlu me-render ulang tabel jika Anda ingin melihat perubahan status tanpa reload halaman
//         // Jika tidak, status akan terlihat setelah refresh manual
//         location.reload(); // Reload halaman untuk melihat perubahan status
//     }

//     function handleDeleteProduksi(id) {
//         if (confirm('Apakah Anda yakin ingin menghapus permintaan produksi ini?')) {
//             let dataProduksi = JSON.parse(localStorage.getItem('permintaanProduksi')) || [];
//             dataProduksi = dataProduksi.filter(p => p.id !== id); // Menggunakan id (integer) untuk memfilter
//             localStorage.setItem('permintaanProduksi', JSON.stringify(dataProduksi));
//             alert('Permintaan produksi berhasil dihapus.');
//             location.reload();
//         }
//     }
// });



document.addEventListener('DOMContentLoaded', function () {
    const tbodyProduksi = document.querySelector('.table tbody');

    // Load data dengan fungsi khusus untuk membersihkan/memvalidasi
    let dataProduksi = loadAndValidateProduksiData();

    if (!tbodyProduksi) {
        console.error("Elemen <tbody> tabel produksi tidak ditemukan!");
        return;
    }

    if (dataProduksi.length === 0) {
        const emptyRow = document.createElement('tr');
        const emptyCell = document.createElement('td');
        emptyCell.setAttribute('colspan', 6); // Sesuaikan colspan jika jumlah kolom berubah di HTML Anda
        emptyCell.textContent = 'Belum ada permintaan produksi.';
        emptyRow.appendChild(emptyCell);
        tbodyProduksi.appendChild(emptyRow);
        return;
    }

    renderProduksiTable(dataProduksi, tbodyProduksi);

    // --- Helper Functions ---

    function loadAndValidateProduksiData() {
        let rawData = JSON.parse(localStorage.getItem('permintaanProduksi')) || [];
        console.log('Data dari localStorage (permintaanProduksi) mentah:', rawData);

        // Filter data untuk memastikan setiap item memiliki ID dan detailBarang yang valid
        const validatedData = rawData.filter(pengajuan => {
            const isValid = pengajuan && typeof pengajuan.id !== 'undefined' &&
                            pengajuan.detailBarang && Array.isArray(pengajuan.detailBarang) &&
                            pengajuan.detailBarang.length > 0; // Pastikan ada detail barang

            if (!isValid) {
                console.warn('Data pengajuan tidak valid atau rusak, akan diabaikan:', pengajuan);
            }
            return isValid;
        });

        // Simpan kembali data yang sudah divalidasi, untuk membersihkan data rusak di localStorage
        if (validatedData.length !== rawData.length) {
            localStorage.setItem('permintaanProduksi', JSON.stringify(validatedData));
            console.log('Data permintaanProduksi telah dibersihkan dan divalidasi. Jumlah item valid:', validatedData.length);
        }
        return validatedData;
    }

    function renderProduksiTable(data, tableBody) {
        tableBody.innerHTML = ''; // Kosongkan tabel sebelum merender ulang

        data.forEach(pengajuan => {
            console.log('Merender pengajuan:', pengajuan); // Debug: Periksa setiap pengajuan
            const tr = document.createElement('tr');
            const pengajuanUniqueId = pengajuan.id; // Gunakan ID asli yang sudah dipastikan ada

            // Buat string HTML untuk detail barang
            let detailBarangHtml = '<ul>';
            pengajuan.detailBarang.forEach(barang => {
                detailBarangHtml += `<li>${barang.kodeProduk || 'N/A'} - ${barang.namaBarang || 'N/A'} (${barang.kuantitas || 0} ${barang.satuan || 'N/A'})</li>`;
            });
            detailBarangHtml += '</ul>';

            tr.innerHTML = `
                <td class="t"><span typ="date">${pengajuan.tanggal || 'N/A'}</span></td>
                <td class="t"><span type="text">${pengajuan.namaPemohon || 'N/A'}</span></td>
                <td class="t"><span type="text">${pengajuan.departement || 'N/A'}</span></td>
                <td class="t">${detailBarangHtml}</td>
                <td class="t"><span type="text">${pengajuan.prioritas || 'N/A'}</span></td>
                <td class="t">
                    <button class="print-button" data-id="${pengajuanUniqueId}">Print</button>
                    <button class="selesai-button" data-id="${pengajuanUniqueId}">Selesai</button>
                    <button class="delete-button" data-id="${pengajuanUniqueId}">Delete</button>
                </td>
            `;
            tableBody.appendChild(tr);
        });
    }

    // --- Event Listeners ---

    document.addEventListener('click', function (event) {
        const target = event.target;

        if (target.classList.contains('print-button')) {
            const pengajuanId = parseInt(target.getAttribute('data-id'));
            if (!isNaN(pengajuanId)) {
                handlePrintProduksi(pengajuanId);
            } else {
                console.error("ID Print tidak valid:", target.getAttribute('data-id'));
            }
        } else if (target.classList.contains('selesai-button')) {
            const pengajuanId = parseInt(target.getAttribute('data-id'));
            if (!isNaN(pengajuanId)) {
                target.style.backgroundColor = 'green';
                target.textContent = 'Selesai';
                target.disabled = true;
                handleSelesaiProduksi(pengajuanId);
            } else {
                console.error("ID Selesai tidak valid:", target.getAttribute('data-id'));
            }
        } else if (target.classList.contains('delete-button')) {
            const pengajuanId = parseInt(target.getAttribute('data-id'));
            if (!isNaN(pengajuanId)) {
                handleDeleteProduksi(pengajuanId);
            } else {
                console.error("ID Delete tidak valid:", target.getAttribute('data-id'));
            }
        }
    });

    // --- Action Handlers ---

    function handlePrintProduksi(id) {
        const currentDataProduksi = JSON.parse(localStorage.getItem('permintaanProduksi')) || [];
        // Mencari berdasarkan ID (angka)
        const pengajuanToPrint = currentDataProduksi.find(p => p.id === id);

        if (pengajuanToPrint && pengajuanToPrint.detailBarang) {
            let printContent = `
                <html>
                <head><title>Permintaan Produksi - ${pengajuanToPrint.namaPemohon || ''} - ${pengajuanToPrint.tanggal || ''}</title>
                <style>
                    body { font-family: sans-serif; margin: 20px; }
                    h1 { text-align: center; }
                    p { margin-bottom: 5px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid black; padding: 8px; text-align: left; }
                    th { background-color: #f2f2f2; }
                    ul { margin: 0; padding-left: 20px; }
                </style>
                </head>
                <body>
                    <h1>Permintaan Produksi</h1>
                    <p><strong>Tanggal:</strong> ${pengajuanToPrint.tanggal || 'N/A'}</p>
                    <p><strong>Nama Pemohon:</strong> ${pengajuanToPrint.namaPemohon || 'N/A'}</p>
                    <p><strong>Departemen:</strong> ${pengajuanToPrint.departement || 'N/A'}</p>
                    <p><strong>Tanggal Dibutuhkan:</strong> ${pengajuanToPrint.tglButuh || 'N/A'}</p>
                    <p><strong>Prioritas:</strong> ${pengajuanToPrint.prioritas || 'N/A'}</p>
                    <table>
                        <thead>
                            <tr>
                                <th>No</th>
                                <th>Kode Produk</th>
                                <th>Nama Barang</th>
                                <th>Jumlah</th>
                                <th>Satuan</th>
                            </tr>
                        </thead>
                        <tbody>
            `;

            pengajuanToPrint.detailBarang.forEach((barang, index) => {
                printContent += `
                                    <tr>
                                        <td>${index + 1}</td>
                                        <td>${barang.kodeProduk || 'N/A'}</td>
                                        <td>${barang.namaBarang || 'N/A'}</td>
                                        <td>${barang.kuantitas || 0}</td>
                                        <td>${barang.satuan || 'N/A'}</td>
                                    </tr>
                `;
            });

            printContent += `
                        </tbody>
                    </table>
                </body>
                </html>
                `;

            const printWindow = window.open('', '_blank');
            printWindow.document.write(printContent);
            printWindow.document.close();
            printWindow.focus();
            printWindow.print();
            printWindow.close();
        } else {
            alert('Data permintaan produksi tidak ditemukan untuk dicetak.');
        }
    }

    function handleSelesaiProduksi(id) {
        console.log(`Menandai produksi dengan ID ${id} sebagai selesai.`);
        let dataProduksi = JSON.parse(localStorage.getItem('permintaanProduksi')) || [];
        const updatedDataProduksi = dataProduksi.map(pengajuan => {
            if (pengajuan.id === id) {
                return { ...pengajuan, status: 'Selesai' };
            }
            return pengajuan;
        });
        localStorage.setItem('permintaanProduksi', JSON.stringify(updatedDataProduksi));
        // Setelah perubahan, muat ulang dan render ulang data yang divalidasi
        // Ini akan memastikan status 'Selesai' tercermin jika Anda ingin menampilkan status
        // Atau Anda bisa cukup panggil renderProduksiTable(loadAndValidateProduksiData(), tbodyProduksi);
        location.reload(); // Lebih sederhana untuk melihat efek langsung
    }

    function handleDeleteProduksi(id) {
        if (confirm('Apakah Anda yakin ingin menghapus permintaan produksi ini?')) {
            let dataProduksi = JSON.parse(localStorage.getItem('permintaanProduksi')) || [];
            const initialLength = dataProduksi.length;
            dataProduksi = dataProduksi.filter(p => p.id !== id);

            if (dataProduksi.length < initialLength) {
                localStorage.setItem('permintaanProduksi', JSON.stringify(dataProduksi));
                alert('Permintaan produksi berhasil dihapus.');
            } else {
                alert('Permintaan produksi tidak ditemukan.');
            }
            // Setelah penghapusan, muat ulang dan render ulang data yang divalidasi
            location.reload(); // Muat ulang halaman untuk mencerminkan perubahan
        }
    }
});