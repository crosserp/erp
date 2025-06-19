function formatCurrency(number) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(number);
}

const itemsPerPage = 10;
let currentPage = 1;
let dataList = []; // Deklarasikan di scope yang lebih tinggi
let dataDiajukan = JSON.parse(localStorage.getItem('dataDiajukan')) || []; // Load data diajukan

const pageNumbersSpan = document.querySelector('.page-numbers');
const prevButton = document.querySelector('.prev');
const nextButton = document.querySelector('.next');

function loadData() {
    console.log('Fungsi loadData di purchase_retur.js dijalankan!');
    const rawDataList = JSON.parse(localStorage.getItem('dataList'));
    dataList = Array.isArray(rawDataList) ? rawDataList.filter(data => data !== null) : [];
    const tbody = document.getElementById('dataTableBody');

    console.log('Data dari localStorage saat load:', localStorage.getItem('dataList'));
    console.log('Data yang di-parse setelah filter:', dataList);

    if (tbody) {
        displayData(dataList, currentPage, itemsPerPage);
        updatePaginationButtons(dataList);
    } else {
        console.error("Elemen dengan ID 'dataTableBody' tidak ditemukan di HTML purchase_retur.html.");
    }
}

function hapusData(index) {
    const storedDataList = JSON.parse(localStorage.getItem('dataList')) || [];
    if (confirm('Yakin ingin menghapus data ini?')) {
        storedDataList.splice(index, 1);
        localStorage.setItem('dataList', JSON.stringify(storedDataList));
        loadData();
    }
}

function editData(index) {
    const storedDataList = JSON.parse(localStorage.getItem('dataList')) || [];
    const editItem = storedDataList[index];

    localStorage.setItem('editIndex', index);
    localStorage.setItem('editData', JSON.stringify(editItem));

    if (localStorage.getItem('editData') !== null) {
        window.location.href = 'purchase_retur2.html';
    } else {
        alert('Data tidak ditemukan!');
    }
}

function displayData(data, page, itemsPerPage) {
    const tbody = document.getElementById('dataTableBody');
    tbody.innerHTML = ''; // Kosongkan kontainer data
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentPageData = data.slice(startIndex, endIndex);

    currentPageData.forEach((item, index) => {
        const dataIndex = startIndex + index;
        const isDiajukan = dataDiajukan.some(diajukan => diajukan.noNota === item.noNota);

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item.tanggal}</td>
            <td>${item.noNota}</td>
            <td>${item.namaSuplier}</td>
            <td>${item.namaBarang}</td>
            <td>${formatCurrency(item.totalId)}</td>
            <td>
                <button onclick="editData(${dataIndex})">Edit</button>
                <button onclick="hapusData(${dataIndex})">Hapus</button>
                ${isDiajukan ?
                    '<button class="selesai-button" disabled>Selesai</button>' :
                    `<button class="ajukan-button" data-index="${dataIndex}">Ajukan</button>`
                }
            </td>
        `;
        tbody.appendChild(tr);
    });

    // Tambahkan event listener untuk tombol "Ajukan" setelah data ditampilkan
    const ajukanButtons = document.querySelectorAll('.ajukan-button');
    ajukanButtons.forEach(button => {
        button.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            ajukanData(index);
            // Ubah langsung tampilan tombol setelah diklik
            this.classList.remove('ajukan-button');
            this.classList.add('selesai-button');
            this.textContent = 'Selesai';
            this.disabled = true;
        });
    });
}

function updatePaginationButtons(data) {
    const totalPages = Math.ceil(data.length / itemsPerPage);
    pageNumbersSpan.textContent = `${currentPage} dari ${totalPages}`;

    prevButton.disabled = currentPage === 1;
    nextButton.disabled = currentPage === totalPages;
}

function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        displayData(dataList, currentPage, itemsPerPage);
        updatePaginationButtons(dataList);
    }
}

function nextPage() {
    const totalPages = Math.ceil(dataList.length / itemsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        displayData(dataList, currentPage, itemsPerPage);
        updatePaginationButtons(dataList);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadData();

    prevButton.addEventListener('click', prevPage);
    nextButton.addEventListener('click', nextPage);
});

function ajukanData(index) {
    const storedDataList = JSON.parse(localStorage.getItem('dataList')) || [];
    const dataYangDiajukan = storedDataList[index];
    const dataDiajukan = JSON.parse(localStorage.getItem('dataDiajukan')) || [];

    if (confirm(`Yakin ingin mengajukan data dengan No. Nota: ${dataYangDiajukan.noNota}?`)) {
        // Tambahkan data yang diajukan ke array dataDiajukan
        dataDiajukan.push(dataYangDiajukan);
        localStorage.setItem('dataDiajukan', JSON.stringify(dataDiajukan));

        // Tidak perlu loadData() di sini karena perubahan tampilan dilakukan langsung di event listener
    }
}