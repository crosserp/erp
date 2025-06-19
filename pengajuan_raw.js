// document.addEventListener('DOMContentLoaded', function () {
//     const pengajuanRawTableBody = document.getElementById('pengajuanRaw');
//     const paginationContainer = document.querySelector('.pagination');
//     const pageNumbersSpan = paginationContainer.querySelector('.page-numbers');
//     const prevButton = paginationContainer.querySelector('.prev');
//     const nextButton = paginationContainer.querySelector('.next');

//     const itemsPerPage = 5;
//     let currentPage = 1;
//     let pengajuanData = [];
//     let pengajuanStatus = {};

//     const storedPengajuan = localStorage.getItem('pengajuanRawMaterials');
//     const storedStatus = localStorage.getItem('pengajuanRawStatus');
//     if (storedPengajuan) {
//         pengajuanData = JSON.parse(storedPengajuan);
//         if (storedStatus) {
//             pengajuanStatus = JSON.parse(storedStatus);
//         }
//         displayPengajuan(pengajuanData, currentPage);
//         setupPagination(pengajuanData);
//     }

//     function displayPengajuan(data, page) {
//         pengajuanRawTableBody.innerHTML = '';

//         const startIndex = (page - 1) * itemsPerPage;
//         const endIndex = startIndex + itemsPerPage;
//         const currentPageData = data.slice(startIndex, endIndex);

//         currentPageData.forEach((pengajuan) => {
//             pengajuan.detailBarang.forEach((barang, indexBarang) => {
//                 const row = pengajuanRawTableBody.insertRow();
//                 const isFirstItem = indexBarang === 0;

//                 if (isFirstItem) {
//                     insertCell(row, pengajuan.tanggal, pengajuan.detailBarang.length);
//                     insertCell(row, pengajuan.namaPemohon, pengajuan.detailBarang.length);
//                     insertCell(row, pengajuan.departement, pengajuan.detailBarang.length);
//                     insertCell(row, pengajuan.tglButuh, pengajuan.detailBarang.length);
//                     insertCell(row, pengajuan.prioritas, pengajuan.detailBarang.length);
//                 }

//                 insertCell(row, barang.namaBarang);
//                 insertCell(row, barang.kuantitas);

//                 const keteranganCell = row.insertCell();
//                 const pengajuanId = getPengajuanId(pengajuan);

//                 if (isFirstItem) {
//                     const updateButton = createButton('Update', () => handleUpdate(pengajuanId));
//                     const deleteButton = createButton('Delete', () => handleDelete(pengajuanId));
//                     const ajukanButton = createButton('Ajukan', () => handleAjukan(pengajuanId));

//                     // Jika sudah diajukan, warna tombol Ajukan jadi hijau
//                     if (pengajuanStatus[pengajuanId]) {
//                         ajukanButton.style.backgroundColor = 'green';
//                         ajukanButton.style.color = 'white';
//                     }

//                     keteranganCell.appendChild(updateButton);
//                     keteranganCell.appendChild(deleteButton);
//                     keteranganCell.appendChild(ajukanButton);
//                 } else {
//                     keteranganCell.textContent = '';
//                 }
//             });
//         });
//     }

//     function createButton(text, onClick) {
//         const button = document.createElement('button');
//         button.textContent = text;
//         button.addEventListener('click', onClick);
//         button.style.marginRight = '5px';
//         return button;
//     }

//     function insertCell(row, text, rowSpan) {
//         const cell = row.insertCell();
//         cell.textContent = text;
//         if (rowSpan > 1) {
//             cell.rowSpan = rowSpan;
//         }
//     }

//     function getPengajuanId(pengajuan) {
//         return `${pengajuan.tanggal}-${pengajuan.namaPemohon}-${new Date(pengajuan.tglButuh).getTime()}`;
//     }

//     function handleUpdate(id) {
//         localStorage.setItem('editPengajuanId', id);
//         window.location.href = 'pengajuan_raw2.html?edit=' + id;
//     }

//     function handleDelete(id) {
//         if (confirm('Apakah Anda yakin ingin menghapus pengajuan ini?')) {
//             const indexToDelete = pengajuanData.findIndex(pengajuan => getPengajuanId(pengajuan) === id);
//             if (indexToDelete !== -1) {
//                 pengajuanData.splice(indexToDelete, 1);
//                 localStorage.setItem('pengajuanRawMaterials', JSON.stringify(pengajuanData));
//                 delete pengajuanStatus[id];
//                 localStorage.setItem('pengajuanRawStatus', JSON.stringify(pengajuanStatus));
//                 displayPengajuan(pengajuanData, currentPage);
//                 setupPagination(pengajuanData);
//             }
//         }
//     }

//     function handleAjukan(id) {
//         if (confirm('Apakah Anda yakin ingin mengajukan pengajuan ini?')) {
//             pengajuanStatus[id] = true;
//             localStorage.setItem('pengajuanRawStatus', JSON.stringify(pengajuanStatus));
    
//             const pengajuanYangAkanDiajukan = pengajuanData.find(p => getPengajuanId(p) === id);
//             if (pengajuanYangAkanDiajukan) {
//                 // Pastikan kita selalu bekerja dengan array
//                 let semuaPengajuanDiajukan = JSON.parse(localStorage.getItem('pengajuanDiajukan')) || [];
    
//                 // Cek apakah semuaPengajuanDiajukan adalah array sebelum melakukan push
//                 if (Array.isArray(semuaPengajuanDiajukan)) {
//                     const sudahAda = semuaPengajuanDiajukan.some(p => getPengajuanId(p) === id);
//                     if (!sudahAda) {
//                         semuaPengajuanDiajukan.push(pengajuanYangAkanDiajukan);
//                         localStorage.setItem('pengajuanDiajukan', JSON.stringify(semuaPengajuanDiajukan));
//                     }
//                 } else {
//                     console.error('Data pengajuanDiajukan yang diambil bukan array');
//                 }
//             }
    
//             alert('Data pengajuan berhasil diajukan!');
//             // Tidak reload halaman! Tombol tetap ada dan warnanya berubah.
//             displayPengajuan(pengajuanData, currentPage);
//             setupPagination(pengajuanData);
//         }
//     }
    

//     function setupPagination(data) {
//         const totalPages = Math.ceil(data.length / itemsPerPage);

//         pageNumbersSpan.innerHTML = '';
//         for (let i = 1; i <= totalPages; i++) {
//             const pageNumber = document.createElement('span');
//             pageNumber.textContent = i;
//             if (i === currentPage) {
//                 pageNumber.classList.add('active');
//             }
//             pageNumber.addEventListener('click', () => {
//                 currentPage = i;
//                 displayPengajuan(data, currentPage);
//                 updatePaginationButtons(totalPages);
//                 updateActivePageNumber();
//             });
//             pageNumbersSpan.appendChild(pageNumber);
//         }

//         updatePaginationButtons(totalPages);
//     }

//     function updatePaginationButtons(totalPages) {
//         prevButton.disabled = currentPage === 1;
//         nextButton.disabled = currentPage === totalPages || totalPages === 0;
//     }

//     function updateActivePageNumber() {
//         const pageNumberSpans = pageNumbersSpan.querySelectorAll('span');
//         pageNumberSpans.forEach(span => span.classList.remove('active'));
//         pageNumberSpans[currentPage - 1]?.classList.add('active');
//     }

//     window.prevPage = function () {
//         if (currentPage > 1) {
//             currentPage--;
//             displayPengajuan(pengajuanData, currentPage);
//             updatePaginationButtons(Math.ceil(pengajuanData.length / itemsPerPage));
//             updateActivePageNumber();
//         }
//     };

//     window.nextPage = function () {
//         const totalPages = Math.ceil(pengajuanData.length / itemsPerPage);
//         if (currentPage < totalPages) {
//             currentPage++;
//             displayPengajuan(pengajuanData, currentPage);
//             updatePaginationButtons(totalPages);
//             updateActivePageNumber();
//         }
//     };
// });








// pengajuan_raw.js (VERSI TERBARU UNTUK MENGIRIM DATA KE DAFTAR PENGADAAN)

let currentPage = 1;
let rowsPerPage = 5;
let pengajuanData = JSON.parse(localStorage.getItem('pengajuanRawData')) || [];

function renderTable() {
    const tableBody = document.getElementById('pengajuan-table-body');
    tableBody.innerHTML = '';

    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    const paginatedData = pengajuanData.slice(start, end);

    if (paginatedData.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="8" style="text-align: center;">Tidak ada data pengajuan.</td>`;
        tableBody.appendChild(row);
        return;
    }

    paginatedData.forEach((pengajuan, indexInPage) => {
        let detailHtml = '<ul class="detail-item">';
        if (pengajuan.details && pengajuan.details.length > 0) {
            pengajuan.details.forEach(detail => {
                detailHtml += `
                    <li>
                        Kode: ${detail.kodeRawMaterial}<br>
                        Nama: ${detail.namaRawMaterial}<br>
                        Kuantitas: ${detail.kuantitasRawMaterial} ${detail.satuanRawMaterial}
                    </li>
                `;
            });
        } else {
            detailHtml += '<li>Tidak ada detail bahan baku.</li>';
        }
        detailHtml += '</ul>';

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${pengajuan.id}</td>
            <td>${pengajuan.tgl}</td>
            <td>${pengajuan.namaPemohon}</td>
            <td>${pengajuan.prioritas}</td>
            <td>${pengajuan.departement}</td>
            <td>${pengajuan.tglButuh}</td>
            <td>${detailHtml}</td>
            <td>
                <button class="btn-ajukan" data-id="${pengajuan.id}">Ajukan</button>
                <button class="btn-edit" data-id="${pengajuan.id}">Edit</button>
                <button class="btn-delete" data-id="${pengajuan.id}">Hapus</button>
            </td>
        `;
        tableBody.appendChild(row);
    });

    addEventListenersToButtons();
}

function renderPagination() {
    const paginationContainer = document.querySelector('.pagination');
    if (!paginationContainer) {
        console.error("Elemen '.pagination' tidak ditemukan di DOM.");
        return;
    }
    paginationContainer.innerHTML = '';

    const totalPages = Math.ceil(pengajuanData.length / rowsPerPage);

    const prevButton = document.createElement('button');
    prevButton.textContent = 'Sebelumnya';
    prevButton.classList.add('prev');
    prevButton.disabled = currentPage === 1;
    prevButton.onclick = prevPage;
    paginationContainer.appendChild(prevButton);

    const pageNumbersSpan = document.createElement('span');
    pageNumbersSpan.classList.add('page-numbers');

    for (let i = 1; i <= totalPages; i++) {
        const pageNumber = document.createElement('span');
        pageNumber.textContent = i;
        pageNumber.classList.add('page-num');
        if (i === currentPage) {
            pageNumber.classList.add('active');
        }
        pageNumber.addEventListener('click', () => {
            currentPage = i;
            renderTable();
            renderPagination();
        });
        pageNumbersSpan.appendChild(pageNumber);
    }
    paginationContainer.appendChild(pageNumbersSpan);

    const nextButton = document.createElement('button');
    nextButton.textContent = 'Selanjutnya';
    nextButton.classList.add('next');
    nextButton.disabled = currentPage === totalPages;
    nextButton.onclick = nextPage;
    paginationContainer.appendChild(nextButton);
}

function addEventListenersToButtons() {
    document.querySelectorAll('.btn-ajukan').forEach(button => {
        button.addEventListener('click', function() {
            const pengajuanId = parseInt(this.dataset.id);
            const pengajuanToSubmit = pengajuanData.find(p => p.id === pengajuanId);

            if (pengajuanToSubmit) {
                // Ambil data pengadaan yang sudah ada
                let submittedPengadaanData = JSON.parse(localStorage.getItem('submittedPengadaanData')) || [];
                
                // Cek apakah pengajuan ini sudah ada di daftar pengadaan
                const isAlreadySubmitted = submittedPengadaanData.some(p => p.id === pengajuanId);

                if (!isAlreadySubmitted) {
                    submittedPengadaanData.push(pengajuanToSubmit);
                    localStorage.setItem('submittedPengadaanData', JSON.stringify(submittedPengadaanData));
                    alert(`Pengajuan dengan ID ${pengajuanId} berhasil dikirimkan untuk pengadaan!`);
                } else {
                    alert(`Pengajuan dengan ID ${pengajuanId} sudah pernah diajukan untuk pengadaan.`);
                }
                // TIDAK ADA REDIRECT DI SINI
            } else {
                alert('Data pengajuan tidak ditemukan.');
            }
        });
    });

    document.querySelectorAll('.btn-edit').forEach(button => {
        button.addEventListener('click', function() {
            const pengajuanId = parseInt(this.dataset.id);
            localStorage.setItem('editPengajuanId', pengajuanId);
            window.location.href = 'pengajuan_raw2.html';
        });
    });

    document.querySelectorAll('.btn-delete').forEach(button => {
        button.addEventListener('click', function() {
            const pengajuanId = parseInt(this.dataset.id);
            if (confirm('Apakah Anda yakin ingin menghapus pengajuan ini?')) {
                const indexToDelete = pengajuanData.findIndex(p => p.id === pengajuanId);
                if (indexToDelete > -1) {
                    pengajuanData.splice(indexToDelete, 1);
                    localStorage.setItem('pengajuanRawData', JSON.stringify(pengajuanData));

                    const totalPages = Math.ceil(pengajuanData.length / rowsPerPage);
                    if (currentPage > totalPages && totalPages > 0) {
                        currentPage = totalPages;
                    } else if (totalPages === 0) {
                        currentPage = 1;
                    }

                    renderTable();
                    renderPagination();
                }
            }
        });
    });
}

function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        renderTable();
        renderPagination();
    }
}

function nextPage() {
    if (currentPage < Math.ceil(pengajuanData.length / rowsPerPage)) {
        currentPage++;
        renderTable();
        renderPagination();
    }
}

document.addEventListener('DOMContentLoaded', function() {
    renderTable();
    renderPagination();
});