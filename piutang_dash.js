document.addEventListener('DOMContentLoaded', () => {
    const tabelBody = document.querySelector("#piutangTable tbody");
    const paginationContainer = document.createElement('div');
    paginationContainer.id = 'pagination';
    paginationContainer.style.marginTop = '10px';
    document.querySelector('.input-group').appendChild(paginationContainer);

    let dataPiutangArray = JSON.parse(localStorage.getItem('dataPiutangPelanggan')) || [];
    let currentPage = 1;
    const rowsPerPage = 10;

    function renderTablePage(page) {
        tabelBody.innerHTML = ''; // Kosongkan isi tabel
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        const pageData = dataPiutangArray.slice(start, end);

        pageData.forEach((piutang, index) => {
            const row = tabelBody.insertRow();
            const kodeCell = row.insertCell();
            const namaCell = row.insertCell();
            const piutangCell = row.insertCell();
            const keteranganCell = row.insertCell();

            kodeCell.textContent = piutang.kodePelanggan;
            namaCell.textContent = piutang.namaPelanggan;
            piutangCell.textContent = piutang.piutangPelanggan;

            const globalIndex = start + index;

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.className = 'delete-btn';
            deleteButton.addEventListener('click', () => {
                dataPiutangArray.splice(globalIndex, 1);
                localStorage.setItem('dataPiutangPelanggan', JSON.stringify(dataPiutangArray));
                const totalPages = Math.ceil(dataPiutangArray.length / rowsPerPage);
                if (currentPage > totalPages) currentPage = totalPages;
                renderTablePage(currentPage);
                renderPagination();
            });

            const updateButton = document.createElement('button');
            updateButton.textContent = 'Update';
            updateButton.className = 'update-btn';
            updateButton.addEventListener('click', () => {
                window.location.href = `piutang.html?index=${globalIndex}`;
            });

            const transaksiButton = document.createElement('button');
            transaksiButton.textContent = 'Transaksi';
            transaksiButton.className = 'transaksi-btn';
            transaksiButton.addEventListener('click', () => {
                window.location.href = `transaksi_piutang.html?index=${globalIndex}`;
            });

            keteranganCell.appendChild(deleteButton);
            keteranganCell.appendChild(updateButton);
            keteranganCell.appendChild(transaksiButton);
        });
    }

    function renderPagination() {
        paginationContainer.innerHTML = '';
        const totalPages = Math.ceil(dataPiutangArray.length / rowsPerPage);
        if (totalPages === 0) return;

        const prevBtn = document.createElement('button');
        prevBtn.textContent = 'Sebelumnya';
        prevBtn.disabled = currentPage === 1;
        prevBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderTablePage(currentPage);
                renderPagination();
            }
        });

        const info = document.createElement('span');
        info.textContent = ` ${currentPage} dari ${totalPages} `;

        const nextBtn = document.createElement('button');
        nextBtn.textContent = 'Selanjutnya';
        nextBtn.disabled = currentPage === totalPages;
        nextBtn.addEventListener('click', () => {
            if (currentPage < totalPages) {
                currentPage++;
                renderTablePage(currentPage);
                renderPagination();
            }
        });

        paginationContainer.appendChild(prevBtn);
        paginationContainer.appendChild(info);
        paginationContainer.appendChild(nextBtn);
    }

    if (tabelBody) {
        renderTablePage(currentPage);
        renderPagination();
    } else {
        console.error("Error: Tabel body tidak ditemukan");
    }
});
