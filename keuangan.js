// keuangan.js

let currentPage = 1;
let rowsPerPage = 9; // Sesuaikan jika Anda ingin jumlah baris per halaman berbeda

// Mengambil data payroll yang diajukan dari localStorage
let submittedPayrollData = JSON.parse(localStorage.getItem('submittedPayrollData')) || [];

function formatRupiah(angka) {
    // Menangani null, undefined, atau NaN
    if (angka === null || angka === undefined || isNaN(angka)) {
        return 'Rp. 0';
    }

    // Jika angka adalah string, coba konversi ke number
    if (typeof angka === 'string') {
        const cleanedAngka = angka.replace(/[^0-9,]/g, '').replace(',', '.');
        angka = parseFloat(cleanedAngka);

        if (isNaN(angka)) {
            return 'Rp. 0';
        }
    }

    // Pastikan angka adalah tipe number sebelum memformat
    if (typeof angka === 'number') {
        return "Rp. " + angka.toLocaleString('id-ID');
    }
    return 'Rp. 0';
}

function renderKeuanganTable() {
    const tableBody = document.getElementById('tabel-body');
    tableBody.innerHTML = '';

    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    if (submittedPayrollData.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="9" style="text-align: center;">Tidak ada data gaji yang diajukan.</td>`;
        tableBody.appendChild(row);
        return;
    }

    for (let i = start; i < end && i < submittedPayrollData.length; i++) {
        const row = document.createElement('tr');
        const payrollItem = submittedPayrollData[i];

        row.innerHTML = `
            <td>${payrollItem.tanggalAjuan || ''}</td>
            <td>${payrollItem.idKaryawan || ''}</td>
            <td>${payrollItem.namaKaryawan || ''}</td>
            <td>${formatRupiah(payrollItem.pendapatan)}</td>
            <td>${formatRupiah(payrollItem.tunjangan)}</td>
            <td>${formatRupiah(payrollItem.bonus)}</td>
            <td>${formatRupiah(payrollItem.pph)}</td>
            <td>${formatRupiah(payrollItem.total)}</td>
            <td>
                <span class="status-${payrollItem.statusAjuan ? payrollItem.statusAjuan.toLowerCase() : 'unknown'}">${payrollItem.statusAjuan || 'N/A'}</span>
                <button class="btn-set-status" data-index="${i}" data-status="Disetujui">Setujui</button>
                <button class="btn-set-status" data-index="${i}" data-status="Ditolak">Tolak</button>
            </td>
        `;
        tableBody.appendChild(row);
    }
    addKeuanganEventListeners();
}

function renderKeuanganPagination() {
    const paginationContainer = document.querySelector('.pagination');
    paginationContainer.innerHTML = '';

    const totalPages = Math.ceil(submittedPayrollData.length / rowsPerPage);

    const prevButton = document.createElement('button');
    prevButton.textContent = 'Sebelumnya';
    prevButton.classList.add('prev');
    prevButton.disabled = currentPage === 1;
    prevButton.onclick = prevKeuanganPage;
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
            renderKeuanganTable();
            renderKeuanganPagination();
        });
        pageNumbersSpan.appendChild(pageNumber);
    }
    paginationContainer.appendChild(pageNumbersSpan);

    const nextButton = document.createElement('button');
    nextButton.textContent = 'Selanjutnya';
    nextButton.classList.add('next');
    nextButton.disabled = currentPage === totalPages;
    nextButton.onclick = nextKeuanganPage;
    paginationContainer.appendChild(nextButton);
}

function addKeuanganEventListeners() {
    document.querySelectorAll('.btn-set-status').forEach(button => {
        button.addEventListener('click', function() {
            const index = parseInt(this.dataset.index);
            const newStatus = this.dataset.status;

            if (confirm(`Apakah Anda yakin ingin mengubah status gaji ini menjadi "${newStatus}"?`)) {
                if (submittedPayrollData[index]) {
                    submittedPayrollData[index].statusAjuan = newStatus;
                    // Optionally, add a timestamp for when the status was changed
                    submittedPayrollData[index].tanggalPerubahanStatus = new Date().toLocaleDateString('id-ID');

                    localStorage.setItem('submittedPayrollData', JSON.stringify(submittedPayrollData));
                    alert(`Status gaji berhasil diubah menjadi "${newStatus}"!`);
                    renderKeuanganTable(); // Render ulang tabel untuk menampilkan status terbaru
                }
            }
        });
    });
}

function prevKeuanganPage() {
    if (currentPage > 1) {
        currentPage--;
        renderKeuanganTable();
        renderKeuanganPagination();
    }
}

function nextKeuanganPage() {
    if (currentPage < Math.ceil(submittedPayrollData.length / rowsPerPage)) {
        currentPage++;
        renderKeuanganTable();
        renderKeuanganPagination();
    }
}

// Inisialisasi saat jendela dimuat
window.onload = function() {
    renderKeuanganTable();
    renderKeuanganPagination();
};