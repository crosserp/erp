// permintaan_pengadaan.js (VERSI TERBARU UNTUK MENAMPILKAN DAFTAR PENGADAAN)

let currentPage = 1;
let rowsPerPage = 5; // Sesuaikan jumlah baris per halaman
// Mengambil data pengadaan yang sudah diajukan
let submittedPengadaanData = JSON.parse(localStorage.getItem('submittedPengadaanData')) || [];

// Fungsi untuk mendapatkan ID unik pengajuan (sesuai dengan yang disimpan di pengajuan_raw2.js)
// Ini tidak lagi diperlukan karena kita akan menggunakan pengajuan.id langsung
// function getPengajuanId(pengajuan) {
//     return pengajuan.id; // Menggunakan ID unik yang sudah ada
// }

function renderTable() {
    const tableBody = document.getElementById('detail-pengadaan-body');
    tableBody.innerHTML = ''; // Kosongkan tbody dulu

    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    // Pastikan kita memaginasi di level pengajuan, bukan detail barang
    const paginatedPengadaan = submittedPengadaanData.slice(start, end);

    if (paginatedPengadaan.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td colspan="8" style="text-align: center;">Tidak ada data permintaan pengadaan.</td>`;
        tableBody.appendChild(tr);
        return;
    }

    paginatedPengadaan.forEach(pengajuan => {
        // Jika pengajuan memiliki detail, iterasi dan tampilkan
        if (pengajuan.details && pengajuan.details.length > 0) {
            pengajuan.details.forEach((detail, indexDetail) => {
                const tr = document.createElement('tr');
                const isFirstDetail = indexDetail === 0;

                tr.innerHTML = `
                    <td class="t">${isFirstDetail ? (pengajuan.tgl || '') : ''}</td>
                    <td class="t">${isFirstDetail ? (pengajuan.namaPemohon || '') : ''}</td>
                    <td class="t">${isFirstDetail ? (pengajuan.departement || '') : ''}</td>
                    <td class="t">${isFirstDetail ? (pengajuan.tglButuh || '') : ''}</td>
                    <td class="t">${isFirstDetail ? (pengajuan.prioritas || '') : ''}</td>
                    <td class="t">${detail.namaRawMaterial || ''}</td>
                    <td class="t">${detail.kuantitasRawMaterial || ''} ${detail.satuanRawMaterial || ''}</td>
                    <td class="t">
                        ${isFirstDetail ? `
                            <button class="print-button" data-id="${pengajuan.id}">Print</button>
                            <button class="delete-button" data-id="${pengajuan.id}">Delete</button>
                        ` : ''}
                    </td>
                `;
                tableBody.appendChild(tr);
            });
        } else {
            // Jika tidak ada detail barang dalam pengajuan
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="t">${pengajuan.tgl || ''}</td>
                <td class="t">${pengajuan.namaPemohon || ''}</td>
                <td class="t">${pengajuan.departement || ''}</td>
                <td class="t">${pengajuan.tglButuh || ''}</td>
                <td class="t">${pengajuan.prioritas || ''}</td>
                <td colspan="2" style="text-align: center;">Tidak ada detail bahan baku.</td>
                <td class="t">
                    <button class="print-button" data-id="${pengajuan.id}">Print</button>
                    <button class="delete-button" data-id="${pengajuan.id}">Delete</button>
                </td>
            `;
            tableBody.appendChild(tr);
        }
    });

    addEventListeners(); // Panggil fungsi untuk menambahkan event listener
}

function renderPagination() {
    const paginationContainer = document.querySelector('.pagination');
    if (!paginationContainer) {
        console.error("Elemen '.pagination' tidak ditemukan di DOM.");
        return;
    }
    paginationContainer.innerHTML = '';

    const totalPages = Math.ceil(submittedPengadaanData.length / rowsPerPage);

    const prevButton = document.createElement('button');
    prevButton.textContent = 'Sebelumnya';
    prevButton.classList.add('prev');
    prevButton.disabled = currentPage === 1;
    prevButton.onclick = prevPage;
    paginationContainer.appendChild(prevButton);

    const pageNumbers = document.createElement('span');
    pageNumbers.classList.add('page-numbers');
    paginationContainer.appendChild(pageNumbers);

    for (let i = 1; i <= totalPages; i++) {
        const pageNumber = document.createElement('span');
        pageNumber.textContent = i;
        if (i === currentPage) {
            pageNumber.classList.add('active');
        }
        pageNumber.addEventListener('click', () => {
            currentPage = i;
            renderTable();
            renderPagination();
        });
        pageNumbers.appendChild(pageNumber);
        // Hapus separator "dari" jika tidak diperlukan
        // if (i < totalPages) {
        //     const separator = document.createElement('span');
        //     separator.textContent = "dari";
        //     pageNumbers.appendChild(separator);
        // }
    }

    const nextButton = document.createElement('button');
    nextButton.textContent = 'Selanjutnya';
    nextButton.classList.add('next');
    nextButton.disabled = currentPage === totalPages;
    nextButton.onclick = nextPage;
    paginationContainer.appendChild(nextButton);
}

function addEventListeners() {
    // Event listener untuk tombol Print
    document.querySelectorAll('.print-button').forEach(button => {
        button.addEventListener('click', function() {
            const pengadaanId = parseInt(this.dataset.id);
            handlePrint(pengadaanId);
        });
    });

    // Event listener untuk tombol Delete
    document.querySelectorAll('.delete-button').forEach(button => {
        button.addEventListener('click', function() {
            const pengadaanId = parseInt(this.dataset.id);
            handleDelete(pengadaanId);
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
    if (currentPage < Math.ceil(submittedPengadaanData.length / rowsPerPage)) {
        currentPage++;
        renderTable();
        renderPagination();
    }
}

function handlePrint(id) {
    const pengajuanToPrint = submittedPengadaanData.find(p => p.id === id);

    if (pengajuanToPrint && pengajuanToPrint.details) { // Sesuaikan dengan properti 'details'
        let printContent = `
            <html>
            <head><title>Permintaan Pengadaan - ${pengajuanToPrint.namaPemohon} - ${pengajuanToPrint.tgl}</title>
            <style>
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid black; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
                h1, p { font-family: sans-serif; }
            </style>
            </head>
            <body>
                <h1>Permintaan Pengadaan</h1>
                <p>ID Pengajuan: ${pengajuanToPrint.id}</p>
                <p>Tanggal Pengajuan: ${pengajuanToPrint.tgl}</p>
                <p>Nama Pemohon: ${pengajuanToPrint.namaPemohon}</p>
                <p>Departemen: ${pengajuanToPrint.departement}</p>
                <p>Tanggal Dibutuhkan: ${pengajuanToPrint.tglButuh}</p>
                <p>Prioritas: ${pengajuanToPrint.prioritas}</p>
                <h2>Detail Bahan Baku</h2>
                <table>
                    <thead>
                        <tr>
                            <th>No</th>
                            <th>Kode Raw Material</th>
                            <th>Nama Raw Material</th>
                            <th>Kuantitas</th>
                            <th>Satuan</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        pengajuanToPrint.details.forEach((detail, index) => { // Iterasi melalui 'details'
            printContent += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${detail.kodeRawMaterial}</td>
                    <td>${detail.namaRawMaterial}</td>
                    <td>${detail.kuantitasRawMaterial}</td>
                    <td>${detail.satuanRawMaterial}</td>
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
        alert('Data pengadaan tidak ditemukan untuk dicetak.');
    }
}

function handleDelete(id) {
    if (confirm('Apakah Anda yakin ingin menghapus permintaan pengadaan ini?')) {
        // Filter, buang pengajuan dengan ID yang sama
        submittedPengadaanData = submittedPengadaanData.filter(p => p.id !== id);

        // Simpan lagi ke localStorage
        localStorage.setItem('submittedPengadaanData', JSON.stringify(submittedPengadaanData));

        alert('Permintaan pengadaan berhasil dihapus.');

        // Render ulang tabel dan pagination setelah penghapusan
        // Sesuaikan currentPage jika data terakhir di halaman dihapus
        const totalPages = Math.ceil(submittedPengadaanData.length / rowsPerPage);
        if (currentPage > totalPages && totalPages > 0) {
            currentPage = totalPages;
        } else if (totalPages === 0) {
            currentPage = 1; // Jika tidak ada data lagi
        }
        renderTable();
        renderPagination();
    }
}

// Inisialisasi saat DOM selesai dimuat
document.addEventListener('DOMContentLoaded', function() {
    renderTable();
    renderPagination();
});