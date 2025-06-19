// let currentPage = 1;
// const rowsPerPage = 8;
// let truckData = [];

// function displayTruckData() {
//     truckData = JSON.parse(localStorage.getItem("truckData")) || [];
//     const tableBody = document.getElementById("truckTable")?.querySelector("tbody");

//     if (!tableBody) {
//         console.error("Elemen tabel atau tbody tidak ditemukan.");
//         return;
//     }

//     tableBody.innerHTML = "";
//     displayList(truckData, tableBody, rowsPerPage, currentPage);
//     setupPagination(truckData, rowsPerPage);
// }

// function displayList(items, wrapper, rowsPerPage, page) {
//     wrapper.innerHTML = "";
//     page--;

//     let start = rowsPerPage * page;
//     let end = start + rowsPerPage;
//     let paginatedItems = items.slice(start, end);

//     paginatedItems.forEach((data, index) => {
//         const row = wrapper.insertRow();
//         const cell1 = row.insertCell(0);
//         const cell2 = row.insertCell(1);
//         const cell3 = row.insertCell(2);
//         const cell4 = row.insertCell(3);
//         const cell5 = row.insertCell(4);
//         const cell6 = row.insertCell(5);
//         const cell7 = row.insertCell(6);
//         const cell8 = row.insertCell(7);

//         cell1.textContent = data.tanggal;
//         cell2.textContent = data.waktu;
//         cell3.textContent = data.noPol;
//         cell4.textContent = data.dokumen;
//         cell5.textContent = data.keperluan;
//         cell6.textContent = data.ekspedisi;
//         cell7.textContent = data.kendaraan;

//         cell8.innerHTML = `
//             <button onclick="updateTruckData(${index})">Update</button>
//             <button onclick="deleteTruckData(${index})">Delete</button>
//         `;
//     });
// }

// function setupPagination(items, rowsPerPage) {
//     const pagination = document.querySelector(".pagination");
//     pagination.innerHTML = "";

//     const prevButton = document.createElement('button');
//     prevButton.innerText = "Sebelumnya";
//     prevButton.classList.add('prev');
//     prevButton.addEventListener('click', prevPage);
//     pagination.appendChild(prevButton);

//     let pageCount = Math.ceil(items.length / rowsPerPage);
//     for (let i = 1; i < pageCount + 1; i++) {
//         let btn = paginationButton(i, items);
//         pagination.appendChild(btn);
//     }

//     const nextButton = document.createElement('button');
//     nextButton.innerText = "Selanjutnya";
//     nextButton.classList.add('next');
//     nextButton.addEventListener('click', nextPage);
//     pagination.appendChild(nextButton);
// }

// function paginationButton(page, items) {
//     let button = document.createElement('button');
//     button.innerText = page;
//     button.classList.add('page-number');

//     if (currentPage == page) button.classList.add('active');

//     button.addEventListener('click', function() {
//         currentPage = page;
//         displayList(items, document.getElementById("truckTable").querySelector("tbody"), rowsPerPage, currentPage);

//         let current_btn = document.querySelector('.pagination button.active');
//         current_btn.classList.remove('active');

//         button.classList.add('active');
//     });

//     return button;
// }

// function prevPage() {
//     if (currentPage > 1) {
//         currentPage--;
//         displayTruckData();
//     }
// }

// function nextPage() {
//     const totalPages = Math.ceil(truckData.length / rowsPerPage);
//     if (currentPage < totalPages) {
//         currentPage++;
//         displayTruckData();
//     }
// }

// if (window.location.pathname.endsWith("truckin_out.html")) {
//     document.addEventListener('DOMContentLoaded', displayTruckData);

//     // Tambahkan event listener untuk tombol "Add"
//     document.getElementById('addButton').addEventListener('click', addTruckData);
// }

// function addTruckData() {
//     localStorage.setItem("addData", "true");
//     window.location.href = 'truckin_out2.html';
// }

// function updateTruckData(index) {
//     const truckData = JSON.parse(localStorage.getItem("truckData")) || [];
//     const actualIndex = (currentPage - 1) * rowsPerPage + index;

//     if (actualIndex >= truckData.length) {
//         console.error("Indeks data tidak valid.");
//         return;
//     }

//     const data = truckData[actualIndex];
//     localStorage.setItem("updateData", JSON.stringify(data));
//     localStorage.setItem("updateIndex", actualIndex);
//     window.location.href = 'truckin_out2.html';
// }

// function deleteTruckData(index) {
//     let truckData = JSON.parse(localStorage.getItem("truckData")) || [];
//     const actualIndex = (currentPage - 1) * rowsPerPage + index;

//     if (actualIndex >= truckData.length) {
//         console.error("Indeks data tidak valid untuk dihapus.");
//         return;
//     }

//     truckData.splice(actualIndex, 1);
//     localStorage.setItem("truckData", JSON.stringify(truckData));
//     displayTruckData();
// }

// // truckin_out.js
// // truckin_out.js
// function addTruckData() {
//     localStorage.removeItem("updateIndex"); // Pastikan tidak ada indeks update
//     localStorage.setItem("addData", "true");
//     window.location.href = 'truckin_out2.html';
// }

let currentPage = 1;
const rowsPerPage = 8;
let truckData = [];

function displayTruckData() {
    truckData = JSON.parse(localStorage.getItem("truckData")) || [];
    const tableBody = document.getElementById("truckTable")?.querySelector("tbody");

    if (!tableBody) {
        console.error("Elemen tabel atau tbody tidak ditemukan.");
        return;
    }

    tableBody.innerHTML = "";
    displayList(truckData, tableBody, rowsPerPage, currentPage);
    setupPagination(truckData, rowsPerPage);
}

function displayList(items, wrapper, rowsPerPage, page) {
    wrapper.innerHTML = "";
    page--;

    let start = rowsPerPage * page;
    let end = start + rowsPerPage;
    let paginatedItems = items.slice(start, end);

    paginatedItems.forEach((data, index) => {
        const row = wrapper.insertRow();
        const cell1 = row.insertCell(0);
        const cell2 = row.insertCell(1);
        const cell3 = row.insertCell(2);
        const cell4 = row.insertCell(3);
        const cell5 = row.insertCell(4);
        const cell6 = row.insertCell(5);
        const cell7 = row.insertCell(6);
        const cell8 = row.insertCell(7);

        cell1.textContent = data.tanggal;
        cell2.textContent = data.waktu;
        cell3.textContent = data.noPol;
        cell4.textContent = data.dokumen;
        cell5.textContent = data.keperluan;
        cell6.textContent = data.ekspedisi;
        cell7.textContent = data.kendaraan;

        cell8.innerHTML = `
            <button onclick="updateTruckData(${index})">Update</button>
            <button onclick="deleteTruckData(${index})">Delete</button>
        `;
    });
}

function setupPagination(items, rowsPerPage) {
    const pagination = document.querySelector(".pagination");
    pagination.innerHTML = "";

    const prevButton = document.createElement('button');
    prevButton.innerText = "Sebelumnya";
    prevButton.classList.add('prev');
    prevButton.addEventListener('click', prevPage);
    pagination.appendChild(prevButton);

    let pageCount = Math.ceil(items.length / rowsPerPage);
    for (let i = 1; i < pageCount + 1; i++) {
        let btn = paginationButton(i, items);
        pagination.appendChild(btn);
    }

    const nextButton = document.createElement('button');
    nextButton.innerText = "Selanjutnya";
    nextButton.classList.add('next');
    nextButton.addEventListener('click', nextPage);
    pagination.appendChild(nextButton);
}

function paginationButton(page, items) {
    let button = document.createElement('button');
    button.innerText = page;
    button.classList.add('page-number');

    if (currentPage == page) button.classList.add('active');

    button.addEventListener('click', function() {
        currentPage = page;
        displayList(items, document.getElementById("truckTable").querySelector("tbody"), rowsPerPage, currentPage);

        let current_btn = document.querySelector('.pagination button.active');
        current_btn.classList.remove('active');

        button.classList.add('active');
    });

    return button;
}

function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        displayTruckData();
    }
}

function nextPage() {
    const totalPages = Math.ceil(truckData.length / rowsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        displayTruckData();
    }
}

if (window.location.pathname.endsWith("truckin_out.html")) {
    document.addEventListener('DOMContentLoaded', displayTruckData);

    // Tambahkan event listener untuk tombol "Add"
    document.getElementById('addButton').addEventListener('click', addTruckData);
}

function addTruckData() {
    console.log("Tombol Add diklik");
    localStorage.removeItem("updateIndex");
    window.location.href = 'truckin_out2.html';
}

function updateTruckData(index) {
    const truckData = JSON.parse(localStorage.getItem("truckData")) || [];
    const actualIndex = (currentPage - 1) * rowsPerPage + index;

    if (actualIndex >= truckData.length) {
        console.error("Indeks data tidak valid.");
        return;
    }

    const data = truckData[actualIndex];
    localStorage.setItem("updateData", JSON.stringify(data));
    localStorage.setItem("updateIndex", actualIndex);
    window.location.href = 'truckin_out2.html';
}

function deleteTruckData(index) {
    let truckData = JSON.parse(localStorage.getItem("truckData")) || [];
    const actualIndex = (currentPage - 1) * rowsPerPage + index;

    if (actualIndex >= truckData.length) {
        console.error("Indeks data tidak valid untuk dihapus.");
        return;
    }

    truckData.splice(actualIndex, 1);
    localStorage.setItem("truckData", JSON.stringify(truckData));
    displayTruckData();
}