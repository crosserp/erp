const dataBody = document.getElementById('dataBody');
const paginationContainer = document.querySelector('.pagination');
const pageNumbersSpan = paginationContainer.querySelector('.page-numbers');
const prevButton = document.getElementById('prevButton'); // Gunakan getElementById
const nextButton = document.getElementById('nextButton'); // Gunakan getElementById

let currentPage = 1;
const itemsPerPage = 10;
let allData = [];

function renderTable(data) {
    dataBody.innerHTML = '';
    if (data.length === 0) {
        dataBody.innerHTML = '<tr><td colspan="7">Tidak ada data di halaman ini.</td></tr>';
        return;
    }
    data.forEach((item, index) => {
        const newRow = dataBody.insertRow();
        const tanggalCell = newRow.insertCell();
        const waktuCell = newRow.insertCell();
        const supplierCell = newRow.insertCell();
        const ekspedisiCell = newRow.insertCell();
        const kendaraanCell = newRow.insertCell();
        const supirCell = newRow.insertCell();
        const aksiCell = newRow.insertCell();

        tanggalCell.textContent = item.tanggal;
        waktuCell.textContent = item.waktu;
        supplierCell.textContent = item.namaSupplier;
        ekspedisiCell.textContent = item.ekspedisi;
        kendaraanCell.textContent = item.kendaraan;
        supirCell.textContent = item.supir;

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.className = 'delete-btn';
        deleteButton.dataset.index = allData.findIndex(d => d === item);
        deleteButton.addEventListener('click', function() {
            hapusData(this.dataset.index);
        });
        aksiCell.appendChild(deleteButton);
    });
}

function renderPagination() {
    const totalPages = Math.ceil(allData.length / itemsPerPage);
    pageNumbersSpan.textContent = `${currentPage} / ${totalPages}`;
    prevButton.disabled = currentPage === 1;
    nextButton.disabled = currentPage === totalPages || totalPages === 0;

    if (totalPages <= 1) {
        paginationContainer.style.display = 'none';
    } else {
        paginationContainer.style.display = 'flex';
    }
}

function getCurrentPageData() {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return allData.slice(startIndex, endIndex);
}

function fetchDataAndPaginate() {
    const savedData = localStorage.getItem('leveringData');
    if (savedData) {
        allData = JSON.parse(savedData);
        renderTable(getCurrentPageData());
        renderPagination();
    } else {
        dataBody.innerHTML = '<tr><td colspan="7">Tidak ada data.</td></tr>';
        paginationContainer.style.display = 'none';
    }
}

function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        fetchDataAndPaginate();
    }
}

function nextPage() {
    const totalPages = Math.ceil(allData.length / itemsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        fetchDataAndPaginate();
    }
}

function hapusData(indexToDelete) {
    const savedData = localStorage.getItem('leveringData');
    if (savedData) {
        allData = JSON.parse(savedData);
        allData.splice(indexToDelete, 1);
        localStorage.setItem('leveringData', JSON.stringify(allData));
        currentPage = 1;
        fetchDataAndPaginate();
    }
}

document.addEventListener('DOMContentLoaded', function() {
    fetchDataAndPaginate();
    prevButton.addEventListener('click', prevPage);
    nextButton.addEventListener('click', nextPage);
});