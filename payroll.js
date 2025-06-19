// payroll.js
let currentPage = 1;
let rowsPerPage = 9;
// Mengambil data payrollData dari localStorage
let dataArray = JSON.parse(localStorage.getItem('payrollData')) || [];

function formatRupiah(angka) {
    // Menangani null, undefined, atau NaN
    if (angka === null || angka === undefined || isNaN(angka)) {
        return 'Rp. 0';
    }

    // Jika angka adalah string, coba konversi ke number
    if (typeof angka === 'string') {
        // Hapus semua karakter non-digit kecuali koma (untuk desimal)
        // Kemudian ganti koma dengan titik jika ada (untuk parseFloat)
        // Konversi ke integer jika tidak ada desimal yang diharapkan
        const cleanedAngka = angka.replace(/[^0-9,]/g, '').replace(',', '.');
        angka = parseFloat(cleanedAngka);

        // Setelah parsing, cek lagi apakah angka valid
        if (isNaN(angka)) {
            return 'Rp. 0';
        }
    }

    // Pastikan angka adalah tipe number sebelum memformat
    if (typeof angka === 'number') {
        return "Rp. " + angka.toLocaleString('id-ID'); // Gunakan toLocaleString untuk format IDR
    }
    return 'Rp. 0'; // Fallback jika tidak dikenali
}

function renderTable() {
    const tableBody = document.getElementById('tabel-body');
    tableBody.innerHTML = '';

    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    // Pastikan dataArray tidak kosong
    if (dataArray.length === 0) {
        const row = document.createElement('tr');
        // Update colspan to 11 to account for the new "Tanggal" column
        row.innerHTML = `<td colspan="11" style="text-align: center;">Tidak ada data gaji yang tersedia.</td>`;
        tableBody.appendChild(row);
        return; // Hentikan fungsi jika tidak ada data
    }

    for (let i = start; i < end && i < dataArray.length; i++) {
        const row = document.createElement('tr');
        const payrollItem = dataArray[i]; // Ambil objek payroll untuk kemudahan akses

        // Pastikan properti 'tanggalPayroll' ada. Jika tidak, gunakan string kosong.
        const tanggalPayroll = payrollItem.tanggalPayroll || '';

        row.innerHTML = `
            <td>${tanggalPayroll}</td>
            <td>${payrollItem.idKaryawan || ''}</td>
            <td>${payrollItem.namaKaryawan || ''}</td>
      
            <td>${formatRupiah(payrollItem.pendapatan)}</td>
            <td>${formatRupiah(payrollItem.tunjangan)}</td>
            <td>${formatRupiah(payrollItem.bonus)}</td>
            <td>${formatRupiah(payrollItem.pph)}</td>
            <td>${formatRupiah(payrollItem.total)}</td>
            <td>
                <button class="btn-ajukan-payroll" data-index="${i}">Ajukan</button>
                <button class="btn-print-payroll" data-index="${i}">Print</button>
                <button class="btn-update" data-index="${i}">Update</button>
                <button class="btn-delete" data-index="${i}">Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    }

    addEventListeners();
}

function renderPagination() {
    const paginationContainer = document.querySelector('.pagination');
    paginationContainer.innerHTML = ''; // Kosongkan pagination sebelum mengisi ulang

    const totalPages = Math.ceil(dataArray.length / rowsPerPage);

    const prevButton = document.createElement('button');
    prevButton.textContent = 'Sebelumnya';
    prevButton.classList.add('prev');
    prevButton.disabled = currentPage === 1; // Nonaktifkan jika di halaman pertama
    prevButton.onclick = prevPage;
    paginationContainer.appendChild(prevButton);

    const pageNumbersSpan = document.createElement('span');
    pageNumbersSpan.classList.add('page-numbers');

    for (let i = 1; i <= totalPages; i++) {
        const pageNumber = document.createElement('span');
        pageNumber.textContent = i;
        pageNumber.classList.add('page-num'); // Tambahkan kelas untuk nomor halaman
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
    nextButton.disabled = currentPage === totalPages; // Nonaktifkan jika di halaman terakhir
    nextButton.onclick = nextPage;
    paginationContainer.appendChild(nextButton);
}

function addEventListeners() {
    // Event listener untuk tombol Update
    document.querySelectorAll('.btn-update').forEach(button => {
        button.addEventListener('click', function() {
            const index = this.dataset.index; // Menggunakan data-index
            localStorage.setItem('updatePayrollIndex', index); // Simpan indeks data yang akan diupdate
            window.location.href = 'payroll2.html'; // Redirect ke halaman form input
        });
    });

    // Event listener untuk tombol Delete
    document.querySelectorAll('.btn-delete').forEach(button => {
        button.addEventListener('click', function() {
            const index = this.dataset.index; // Menggunakan data-index
            if (confirm('Apakah Anda yakin ingin menghapus data gaji ini?')) {
                dataArray.splice(index, 1); // Hapus data dari array
                localStorage.setItem('payrollData', JSON.stringify(dataArray)); // Simpan kembali ke localStorage

                // Sesuaikan currentPage jika data terakhir di halaman dihapus
                const totalPages = Math.ceil(dataArray.length / rowsPerPage);
                if (currentPage > totalPages && totalPages > 0) {
                    currentPage = totalPages;
                } else if (totalPages === 0) {
                    currentPage = 1; // Jika tidak ada data lagi, kembali ke halaman 1
                }

                renderTable();
                renderPagination();
            }
        });
    });

    // Event listener untuk tombol Ajukan (Payroll)
    document.querySelectorAll('.btn-ajukan-payroll').forEach(button => {
        button.addEventListener('click', function() {
            const index = parseInt(this.dataset.index); // Ambil indeks data
            const payrollItem = dataArray[index]; // Ambil objek payroll yang relevan

            if (payrollItem) {
                if (confirm(`Apakah Anda yakin ingin mengajukan gaji untuk ${payrollItem.namaKaryawan}?`)) {
                    let submittedPayrollData = JSON.parse(localStorage.getItem('submittedPayrollData')) || [];

                    const submittedItem = {
                        ...payrollItem,
                        statusAjuan: 'Pending',
                        tanggalAjuan: new Date().toLocaleDateString('id-ID')
                    };

                    // Cek apakah data gaji dengan ID Karyawan yang sama sudah pernah diajukan
                    const existingIndex = submittedPayrollData.findIndex(item => item.idKaryawan === submittedItem.idKaryawan);
                    if (existingIndex > -1) {
                        submittedPayrollData[existingIndex] = submittedItem; // Update yang sudah ada
                    } else {
                        submittedPayrollData.push(submittedItem); // Tambah baru
                    }

                    localStorage.setItem('submittedPayrollData', JSON.stringify(submittedPayrollData));
                    alert(`Gaji ${payrollItem.namaKaryawan} berhasil diajukan!`);
                }
            } else {
                alert('Data gaji tidak ditemukan untuk diajukan.');
            }
        });
    });

    // Event listener untuk tombol Print (Payroll)
    document.querySelectorAll('.btn-print-payroll').forEach(button => {
        button.addEventListener('click', function() {
            const index = parseInt(this.dataset.index); // Ambil indeks data
            const payrollItem = dataArray[index]; // Ambil objek payroll yang relevan

            if (payrollItem) {
                printPayrollSlip(payrollItem); // Panggil fungsi print
            } else {
                alert('Data gaji tidak ditemukan untuk dicetak.');
            }
        });
    });
}

// Fungsi untuk mencetak slip gaji
function printPayrollSlip(payroll) {
    // Pastikan tanggalPayroll memiliki nilai atau string kosong
    const tanggalPayrollToDisplay = payroll.tanggalPayroll || 'Tidak Tersedia';

    let printContent = `
        <style>
            body { font-family: 'Arial', sans-serif; margin: 20px; font-size: 12px; }
            .container { width: 300px; margin: 0 auto; border: 1px solid #ccc; padding: 15px; }
            h2 { text-align: center; margin-bottom: 15px; font-size: 16px; }
            .info-row { display: flex; justify-content: space-between; margin-bottom: 5px; }
            .info-row span:first-child { font-weight: bold; width: 120px; }
            .detail-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            .detail-table th, .detail-table td { border: 1px solid #eee; padding: 8px; text-align: left; }
            .detail-table th { background-color: #f9f9f9; }
            .total { font-weight: bold; text-align: right; margin-top: 10px; font-size: 14px; }
        </style>
        <div class="container">
            <h2>SLIP GAJI</h2>
            <div class="info-row">
                <span>Tanggal Payroll:</span> <span>${tanggalPayrollToDisplay}</span>
            </div>
            <div class="info-row">
                <span>ID Karyawan:</span> <span>${payroll.idKaryawan || ''}</span>
            </div>
            <div class="info-row">
                <span>Nama Karyawan:</span> <span>${payroll.namaKaryawan || ''}</span>
            </div>
            <div class="info-row">
                <span>Rekening:</span> <span>${payroll.rekeningKaryawan || ''}</span>
            </div>
            <div class="info-row">
                <span>Periode:</span> <span>${new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long' })}</span>
            </div>
            <hr/>
            <table class="detail-table">
                <thead>
                    <tr>
                        <th>Deskripsi</th>
                        <th>Jumlah</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Pendapatan Pokok</td>
                        <td>${formatRupiah(payroll.pendapatan)}</td>
                    </tr>
                    <tr>
                        <td>Tunjangan</td>
                        <td>${formatRupiah(payroll.tunjangan)}</td>
                    </tr>
                    <tr>
                        <td>Bonus</td>
                        <td>${formatRupiah(payroll.bonus)}</td>
                    </tr>
                    <tr>
                        <td>Potongan PPH</td>
                        <td>${formatRupiah(payroll.pph)}</td>
                    </tr>
                </tbody>
            </table>
            <div class="total">
                Total Gaji Bersih: ${formatRupiah(payroll.total)}
            </div>
            <p style="text-align: center; margin-top: 20px;">Terima kasih.</p>
        </div>
    `;

    const printWindow = window.open('', '', 'height=600,width=400');
    printWindow.document.write('<html><head><title>Cetak Slip Gaji</title>');
    printWindow.document.write('</head><body>');
    printWindow.document.write(printContent);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
}


function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        renderTable();
        renderPagination();
    }
}

function nextPage() {
    if (currentPage < Math.ceil(dataArray.length / rowsPerPage)) {
        currentPage++;
        renderTable();
        renderPagination();
    }
}

// Inisialisasi saat jendela dimuat
window.onload = function() {
    renderTable();
    renderPagination();
};