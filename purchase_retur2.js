let rowCount = 0; // Menginisialisasi rowCount dengan 0
let maxRowCount = 5;

function formatCurrency(number) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(number);
}

function formatRibu(input) {
    input.addEventListener('input', function () {
        let nilai = this.value.replace(/[^0-9]/g, '');
        nilai = nilai.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        this.value = nilai;
    });
}

function calculateTotal(rowIndex = 0) {
    const qInput = document.getElementById(`q${rowIndex}`);
    const hargaInput = document.getElementById(`harga${rowIndex}`);
    const discInput = document.getElementById(`disc${rowIndex}`);
    const totalHargaSpan = document.getElementById(`totalHarga${rowIndex}`);

    const q = parseFloat((qInput?.value || '0').replace(/\./g, '')) || 0;
    const harga = parseFloat((hargaInput?.value || '0').replace(/\./g, '')) || 0;
    const disc = parseFloat((discInput?.value || '0').replace(/\./g, '')) || 0;

    const totalHarga = (q * harga) - disc;

    if (totalHargaSpan) {
        totalHargaSpan.textContent = formatCurrency(totalHarga);
    }

    updateTotalAndDisc();
}

function updateTotalAndDisc() {
    let total = 0;
    let totalDisc = 0;
    for (let i = 0; i < rowCount; i++) {
        const q = parseFloat((document.getElementById(`q${i}`)?.value || '0').replace(/\./g, '')) || 0;
        const harga = parseFloat((document.getElementById(`harga${i}`)?.value || '0').replace(/\./g, '')) || 0;
        const disc = parseFloat((document.getElementById(`disc${i}`)?.value || '0').replace(/\./g, '')) || 0;

        total += (q * harga) - disc;
        totalDisc += disc;
    }

    const discIdElement = document.getElementById('discId');
    if (discIdElement) {
        discIdElement.textContent = formatCurrency(totalDisc);
    } else {
        console.error("Elemen dengan ID 'discId' tidak ditemukan di HTML.");
    }
    document.getElementById('totalId').textContent = formatCurrency(total);
}

function addRow() {
    if (rowCount >= maxRowCount) {
        alert('Maksimal hanya 5 baris!');
        return;
    }

    const table = document.querySelector('.table tbody');
    const tr = document.createElement('tr');
    const rowIndex = rowCount; // Store the current row index

    tr.innerHTML = `
        <td class="t"><input type="text" id="namaBarang${rowIndex}"></td>
        <td class="t"><input type="text" id="q${rowIndex}"></td>
        <td class="t"><input type="text" id="satuan${rowIndex}"></td>
        <td class="t"><input type="text" id="harga${rowIndex}"></td>
        <td class="t"><input type="text" id="disc${rowIndex}"></td>
        <td class="t"><span id="totalHarga${rowIndex}">Rp 0</span></td>
    `;

    table.appendChild(tr);
    const qInput = document.getElementById(`q${rowIndex}`);
    const hargaInput = document.getElementById(`harga${rowIndex}`);
    const discInput = document.getElementById(`disc${rowIndex}`);

    formatRibu(qInput);
    formatRibu(hargaInput);
    formatRibu(discInput);

    qInput.addEventListener('input', () => {
        calculateTotal(rowIndex); // Use the stored rowIndex
    });

    hargaInput.addEventListener('input', () => {
        calculateTotal(rowIndex); // Use the stored rowIndex
    });

    discInput.addEventListener('input', () => {
        calculateTotal(rowIndex); // Use the stored rowIndex
    });

    rowCount++;
}

function initFirstRow() {
    const q = document.getElementById('q');
    const harga = document.getElementById('harga');
    const disc = document.getElementById('disc');
    const namaBarang = document.getElementById('namaBarang');
    const satuan = document.getElementById('satuan');
    const totalHargaSpan = document.getElementById('totalHarga');

    if (q && harga && disc && namaBarang && satuan && totalHargaSpan) {
        q.id = 'q0';
        harga.id = 'harga0';
        disc.id = 'disc0';
        namaBarang.id = 'namaBarang0';
        satuan.id = 'satuan0';
        totalHargaSpan.id = 'totalHarga0';
        totalHargaSpan.textContent = 'Rp 0';

        formatRibu(q);
        formatRibu(harga);
        formatRibu(disc);

        q.addEventListener('input', () => calculateTotal(0));
        harga.addEventListener('input', () => calculateTotal(0));
        disc.addEventListener('input', () => calculateTotal(0));
        updateTotalAndDisc();
    } else {
        console.error("Elemen untuk baris pertama tidak ditemukan di HTML.");
    }
    rowCount = 1; // Set rowCount untuk baris pertama
}

function loadEditData() {
    const editData = localStorage.getItem('editData');
    if (editData) {
        const data = JSON.parse(editData);
        document.getElementById('tanggal').value = data.tanggal;
        document.getElementById('nota').value = data.noNota;
        document.getElementById('tipe').value = data.namaSuplier;

        const tableBody = document.querySelector('.table tbody');
        tableBody.innerHTML = '';
        rowCount = 0; // Reset rowCount sebelum menambahkan baris

        data.daftarBarang.forEach((item, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="t"><input type="text" id="namaBarang${index}" value="${item.nama}"></td>
                <td class="t"><input type="text" id="q${index}" value="${item.q}"></td>
                <td class="t"><input type="text" id="satuan${index}" value="${item.satuan}"></td>
                <td class="t"><input type="text" id="harga${index}" value="${item.harga}"></td>
                <td class="t"><input type="text" id="disc${index}" value="${item.disc}"></td>
                <td class="t"><span id="totalHarga${index}">${item.total}</span></td>
            `;
            tableBody.appendChild(tr);

            const qInput = document.getElementById(`q${index}`);
            const hargaInput = document.getElementById(`harga${index}`);
            const discInput = document.getElementById(`disc${index}`);

            formatRibu(qInput);
            formatRibu(hargaInput);
            formatRibu(discInput);

            qInput.addEventListener('input', () => {
                calculateTotal(index);
            });
            hargaInput.addEventListener('input', () => {
                calculateTotal(index);
            });
            discInput.addEventListener('input', () => {
                calculateTotal(index);
            });
            rowCount = index + 1; // Update rowCount based on loaded data
        });
        updateTotalAndDisc();
    }
}


document.addEventListener('DOMContentLoaded', () => {
    const mode = new URLSearchParams(window.location.search).get('mode');
    if (mode === 'add') {
        localStorage.removeItem('editData');
        localStorage.removeItem('editIndex');
        initFirstRow();
    } else {
        loadEditData();
    }
});

document.getElementById('addRow').addEventListener('click', addRow);

document.getElementById('btnSimpan').addEventListener('click', function () {
    console.log('Tombol Simpan diklik!');
    const tanggal = document.getElementById('tanggal').value;
    const noNota = document.getElementById('nota').value;
    const namaSuplier = document.getElementById('tipe').value;

    const daftarBarang = [];
    let namaGabungan = '';

    for (let i = 0; i < rowCount; i++) {
        const nama = document.getElementById(`namaBarang${i}`)?.value || '';
        const q = document.getElementById(`q${i}`)?.value || '';
        const satuan = document.getElementById(`satuan${i}`)?.value || '';
        const harga = document.getElementById(`harga${i}`)?.value || '';
        const disc = document.getElementById(`disc${i}`)?.value || '';
        const totalHargaElement = document.getElementById(`totalHarga${i}`);
        const totalHargaText = totalHargaElement?.textContent || 'Rp 0';
        // Hilangkan format currency sebelum disimpan
        const totalHargaValue = parseFloat(totalHargaText.replace(/[^0-9]/g, '')) || 0;

        if (nama) {
            daftarBarang.push({
                nama: nama,
                q: q.replace(/\./g, '') || '0',   // Memastikan nilai numerik, default ke '0' jika kosong
                satuan: satuan,
                harga: harga.replace(/\./g, '') || '0', // Memastikan nilai numerik
                disc: disc.replace(/\./g, '') || '0',    // Memastikan nilai numerik
                total: totalHargaValue // Simpan nilai numerik total
            });
            namaGabungan += nama + ', ';
        }
    }

    namaGabungan = namaGabungan.trim().replace(/,\s*$/, '');
    const totalIdElement = document.getElementById('totalId');
    const totalIdText = totalIdElement?.textContent || 'Rp 0';
    const totalIdValue = parseFloat(totalIdText.replace(/[^0-9]/g, '')) || 0;

    const data = {
        tanggal,
        noNota,
        namaSuplier,
        namaBarang: namaGabungan,
        totalId: totalIdValue, // Simpan nilai numerik total keseluruhan
        daftarBarang
    };

    console.log('Data yang akan disimpan:', data);

    let dataList = JSON.parse(localStorage.getItem('dataList')) || [];

    const editIndex = localStorage.getItem('editIndex');
    if (editIndex !== null) {
        // Memperbarui data yang ada di dataList
        dataList[parseInt(editIndex)] = data;
        localStorage.removeItem('editIndex');
        localStorage.removeItem('editData');
    } else {
        // Menambahkan data baru ke dataList
        dataList.push(data);
    }

    localStorage.setItem('dataList', JSON.stringify(dataList));
    console.log('Isi localStorage setelah menyimpan:', localStorage.getItem('dataList'));
    window.location.href = 'purchase_retur.html'; // Redirect setelah menyimpan
});


document.getElementById('btnPrint').addEventListener('click', function() {
    window.print();
});


