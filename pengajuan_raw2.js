// pengajuan_raw2.js (VERSI TERBARU DENGAN FORMAT RIBUAN PADA KUANTITAS)

document.addEventListener('DOMContentLoaded', function() {
    const formTransaksi = document.getElementById('form-transaksi');
    const detailTableBody = document.getElementById('detail-rawmaterial-body');
    const tambahBarisButton = document.getElementById('tambahBaris');
    const batalButton = document.querySelector('button.batal');

    const rawMaterialData = JSON.parse(localStorage.getItem('rawMaterialData')) || [];

    // Fungsi untuk memformat angka menjadi string dengan pemisah ribuan
    function formatNumberWithDots(number) {
        if (number === null || isNaN(number)) {
            return '';
        }
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }

    // Fungsi untuk menghilangkan format ribuan dan mengembalikan ke angka integer
    function parseFormattedNumber(formattedNumber) {
        if (!formattedNumber) {
            return null;
        }
        // Hapus semua titik (pemisah ribuan) sebelum parsing ke integer
        const cleanedNumber = formattedNumber.replace(/\./g, '');
        return parseInt(cleanedNumber, 10);
    }

    function populateKodeRawMaterialDropdown(selectElement) {
        selectElement.innerHTML = '<option value="">Pilih Kode</option>';
        rawMaterialData.forEach(item => {
            const option = document.createElement('option');
            option.value = item.kodeRawMaterial;
            option.textContent = item.kodeRawMaterial;
            selectElement.appendChild(option);
        });
    }

    function fillRawMaterialDetails(event) {
        const selectedKode = event.target.value;
        const currentRow = event.target.closest('tr');
        const namaInput = currentRow.querySelector('.nama_rawmaterial');
        const satuanInput = currentRow.querySelector('.satuan_rawmaterial');

        const selectedItem = rawMaterialData.find(item => item.kodeRawMaterial === selectedKode);

        if (selectedItem) {
            namaInput.value = selectedItem.namaRawMaterial;
            satuanInput.value = selectedItem.satuanRawMaterial;
        } else {
            namaInput.value = '';
            satuanInput.value = '';
        }
    }

    function addDynamicEventListeners(row) {
        const kodeSelect = row.querySelector('.kode_rawmaterial');
        const kuantitasInput = row.querySelector('.kuantitas_rawmaterial'); // Ambil input kuantitas
        const hapusButton = row.querySelector('.hapus-baris');

        if (kodeSelect) {
            populateKodeRawMaterialDropdown(kodeSelect);
            kodeSelect.addEventListener('change', fillRawMaterialDetails);
        }

        // Tambahkan event listener untuk memformat angka saat input berubah atau kehilangan fokus
        if (kuantitasInput) {
            // Ketika input diketik, hilangkan titik dan perbarui nilai
            kuantitasInput.addEventListener('input', function() {
                const rawValue = this.value.replace(/\D/g, ''); // Hapus semua non-digit
                this.value = formatNumberWithDots(rawValue);
            });

            // Ketika input kehilangan fokus, pastikan formatnya benar
            kuantitasInput.addEventListener('blur', function() {
                const parsedValue = parseFormattedNumber(this.value);
                if (parsedValue !== null) {
                    this.value = formatNumberWithDots(parsedValue);
                } else {
                    this.value = ''; // Kosongkan jika bukan angka valid
                }
            });
        }

        if (hapusButton) {
            hapusButton.addEventListener('click', function() {
                if (detailTableBody.children.length > 1) {
                    row.remove();
                } else {
                    alert('Minimal harus ada satu baris bahan baku.');
                }
            });
        }
    }

    // Inisialisasi baris pertama yang sudah ada di HTML
    const initialRow = detailTableBody.querySelector('tr');
    if (initialRow) {
        addDynamicEventListeners(initialRow);
        // Jika ada nilai awal, format juga saat DOMContentLoaded
        const initialKuantitasInput = initialRow.querySelector('.kuantitas_rawmaterial');
        if (initialKuantitasInput && initialKuantitasInput.value) {
            initialKuantitasInput.value = formatNumberWithDots(initialKuantitasInput.value);
        }
    }

    tambahBarisButton.addEventListener('click', function() {
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td>
                <select class="kode_rawmaterial" name="detail_kode_rawmaterial" required>
                    <option value="">Pilih Kode</option>
                </select>
            </td>
            <td><input type="text" class="nama_rawmaterial" name="detail_nama_rawmaterial" readonly></td>
            <td><input type="text" class="kuantitas_rawmaterial" name="detail_kuantitas_rawmaterial" min="1" required></td>
            <td><input type="text" class="satuan_rawmaterial" name="detail_satuan_rawmaterial" readonly></td>
            <td><button type="button" class="hapus-baris">Hapus</button></td>
        `;
        detailTableBody.appendChild(newRow);
        addDynamicEventListeners(newRow);
    });

    formTransaksi.addEventListener('submit', function(event) {
        event.preventDefault();

        const tgl = document.getElementById('tgl').value;
        const namaPemohon = document.getElementById('namaPemohon').value.trim();
        const prioritas = document.getElementById('prioritas').value;
        const departement = document.getElementById('departement').value.trim();
        const tglButuh = document.getElementById('tglButuh').value;

        if (!tgl || !namaPemohon || !departement || !tglButuh) {
            alert('Mohon lengkapi semua informasi header pengajuan (Tanggal, Nama Pemohon, Departemen, Tanggal Dibutuhkan).');
            return;
        }

        const detailRows = detailTableBody.querySelectorAll('tr');
        const details = [];

        let isValidDetails = true;
        detailRows.forEach(row => {
            const kodeRawMaterial = row.querySelector('.kode_rawmaterial').value;
            const namaRawMaterial = row.querySelector('.nama_rawmaterial').value;
            // Gunakan parseFormattedNumber saat mengambil nilai dari input
            const kuantitasRawMaterial = parseFormattedNumber(row.querySelector('.kuantitas_rawmaterial').value);
            const satuanRawMaterial = row.querySelector('.satuan_rawmaterial').value;

            if (!kodeRawMaterial || !namaRawMaterial || kuantitasRawMaterial === null || kuantitasRawMaterial <= 0 || !satuanRawMaterial) {
                isValidDetails = false;
                return;
            }

            details.push({
                kodeRawMaterial: kodeRawMaterial,
                namaRawMaterial: namaRawMaterial,
                kuantitasRawMaterial: kuantitasRawMaterial,
                satuanRawMaterial: satuanRawMaterial
            });
        });

        if (!isValidDetails) {
            alert('Mohon lengkapi semua detail bahan baku dengan benar (pilih kode, isi kuantitas > 0). Pastikan kuantitas adalah angka.');
            return;
        }

        if (details.length === 0) {
            alert('Mohon tambahkan setidaknya satu bahan baku yang diajukan.');
            return;
        }

        const newPengajuan = {
            id: Date.now(),
            tgl: tgl,
            namaPemohon: namaPemohon,
            prioritas: prioritas,
            departement: departement,
            tglButuh: tglButuh,
            details: details
        };

        let pengajuanData = JSON.parse(localStorage.getItem('pengajuanRawData')) || [];
        pengajuanData.push(newPengajuan);
        localStorage.setItem('pengajuanRawData', JSON.stringify(pengajuanData));

        alert('Pengajuan berhasil disimpan!');
        // Reset form setelah disimpan
        formTransaksi.reset();
        detailTableBody.innerHTML = '';
        const initialEmptyRow = document.createElement('tr');
        initialEmptyRow.innerHTML = `
            <td>
                <select class="kode_rawmaterial" name="detail_kode_rawmaterial" required>
                    <option value="">Pilih Kode</option>
                </select>
            </td>
            <td><input type="text" class="nama_rawmaterial" name="detail_nama_rawmaterial" readonly></td>
            <td><input type="text" class="kuantitas_rawmaterial" name="detail_kuantitas_rawmaterial" min="1" required></td>
            <td><input type="text" class="satuan_rawmaterial" name="detail_satuan_rawmaterial" readonly></td>
            <td><button type="button" class="hapus-baris">Hapus</button></td>
        `;
        detailTableBody.appendChild(initialEmptyRow);
        addDynamicEventListeners(initialEmptyRow); // Panggil kembali untuk baris baru

        window.location.href = 'pengajuan_raw.html';
    });

    batalButton.addEventListener('click', function(event) {
        event.preventDefault();
        window.location.href = 'pengajuan_raw.html';
    });
});