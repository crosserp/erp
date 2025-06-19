document.addEventListener('DOMContentLoaded', function() {
    // --- Referensi Elemen HTML ---
    const formRetur = document.getElementById('form-retur');
    const returDataTableBody = document.getElementById('returData');
    const totalReturElement = document.getElementById('totalRetur');
    const tambahBarisButton = document.getElementById('tambahBaris');
    const simpanButton = document.querySelector('button[type="submit"][form="form-retur"]');
    const batalButton = document.querySelector('button.batal');

    const namaSupplierSelect = document.getElementById('nama_supplier');

    const tanggalInput = document.getElementById('tanggal_retur');
    const notaReturInput = document.getElementById('no_nota_retur');
    const jenisReturInput = document.getElementById('jenis_retur');

    let maxRows = 5;
    let currentRows = 0;

    // --- Data Master dari LocalStorage ---
    const supplierData = JSON.parse(localStorage.getItem('supplierData')) || [];
    // UBAH: Mengambil data dari 'rawMaterialData'
    const rawMaterialData = JSON.parse(localStorage.getItem('rawMaterialData')) || []; 

    // --- Fungsi Pembantu untuk Format Angka dan Rupiah ---
    // Fungsi ini tidak perlu diubah karena formatnya umum.
    function formatNumberWithDots(number) {
        if (number === null || number === undefined || number === '' || isNaN(Number(number))) {
            return '';
        }
        return new Intl.NumberFormat('id-ID').format(Number(number));
    }

    function parseFormattedNumber(formattedNumber) {
        if (!formattedNumber || typeof formattedNumber !== 'string') {
            return 0;
        }
        const cleanedNumber = formattedNumber.replace(/[^0-9-]/g, '');
        return parseInt(cleanedNumber, 10) || 0;
    }

    function formatRupiah(angka) {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(angka);
    }

    // --- Fungsionalitas Dropdown Header Form ---

    function populateNamaSupplierDropdown() {
        namaSupplierSelect.innerHTML = '<option value="">Pilih Supplier</option>'; 
        supplierData.forEach(supplier => {
            const option = document.createElement('option');
            option.value = supplier.namaSupplier;
            option.textContent = `${supplier.namaSupplier} (ID: ${supplier.idSupplier})`;
            namaSupplierSelect.appendChild(option);
        });
    }

    // --- Fungsionalitas Tabel Detail Barang Retur ---

    /**
     * UBAH: Mengisi dropdown Kode Raw Material dari data rawMaterialData.
     * @param {HTMLSelectElement} selectElement Elemen <select> kode raw material.
     */
    function populateKodeRawMaterialDropdown(selectElement) { // Nama fungsi diubah
        selectElement.innerHTML = '<option value="">Pilih Kode</option>';
        // UBAH: Menggunakan rawMaterialData
        rawMaterialData.forEach(raw => { 
            const option = document.createElement('option');
            // UBAH: properti kodeRawMaterial
            option.value = raw.kodeRawMaterial; 
            option.textContent = raw.kodeRawMaterial;
            selectElement.appendChild(option);
        });
    }

    /**
     * UBAH: Mengisi detail raw material (nama_rawmaterial, satuan_rawmaterial, harga) 
     * berdasarkan kode_rawmaterial yang dipilih.
     * @param {Event} event Event 'change'.
     */
    function fillRawMaterialDetails(event) { // Nama fungsi diubah
        const selectedKode = event.target.value;
        const currentRow = event.target.closest('tr');
        // UBAH: class nama_produk menjadi nama_rawmaterial
        const namaRawMaterialInput = currentRow.querySelector('.nama_rawmaterial'); 
        // UBAH: class satuan_produk menjadi satuan_rawmaterial
        const satuanRawMaterialInput = currentRow.querySelector('.satuan_rawmaterial'); 
        const hargaInput = currentRow.querySelector('.harga');

        // UBAH: Mencari di rawMaterialData dan properti kodeRawMaterial
        const selectedRawMaterial = rawMaterialData.find(rm => rm.kodeRawMaterial === selectedKode); 

        if (selectedRawMaterial) {
            // UBAH: Menggunakan properti namaRawMaterial, satuanRawMaterial, hargaRawMaterial
            namaRawMaterialInput.value = selectedRawMaterial.namaRawMaterial || '';
            satuanRawMaterialInput.value = selectedRawMaterial.satuanRawMaterial || '';
            hargaInput.value = formatNumberWithDots(selectedRawMaterial.hargaRawMaterial || 0); // Asumsi ada hargaRawMaterial
        } else {
            namaRawMaterialInput.value = '';
            satuanRawMaterialInput.value = '';
            hargaInput.value = '';
        }
        calculateRowTotal(currentRow.querySelector('.kuantitas'));
    }

    function calculateRowTotal(inputElement) {
        const row = inputElement.closest('tr');
        const kuantitas = parseFormattedNumber(row.querySelector('.kuantitas').value);
        const harga = parseFormattedNumber(row.querySelector('.harga').value);
        
        if (kuantitas >= 0 && harga >= 0) {
            let total = (kuantitas * harga);
            row.querySelector('.total').textContent = formatRupiah(total);
        } else {
            row.querySelector('.total').textContent = formatRupiah(0);
        }
        calculateOverallTotal();
    }

    function calculateOverallTotal() {
        let overallTotal = 0;
        returDataTableBody.querySelectorAll('tr').forEach(row => {
            const totalText = row.querySelector('.total').textContent;
            const total = parseFormattedNumber(totalText);
            overallTotal += total;
        });
        totalReturElement.textContent = formatRupiah(overallTotal);
    }

    function addRow() {
        if (currentRows < maxRows) {
            const newRow = document.createElement('tr');
            newRow.innerHTML = `
                <td>
                    <select class="kode_rawmaterial form-control" name="detail_kode_rawmaterial[]" required></select> </td>
                <td><input type="text" class="nama_rawmaterial form-control" name="detail_nama_rawmaterial[]" readonly></td> <td><input type="text" class="kuantitas form-control" name="detail_kuantitas[]" required></td>
                <td><input type="text" class="satuan_rawmaterial form-control" name="detail_satuan_rawmaterial[]" readonly></td> <td><input type="text" class="harga form-control" name="detail_harga[]" required></td>
                <td><input type="text" class="keterangan_retur form-control" name="detail_keterangan_retur[]" placeholder="Keterangan retur"></td>
                <td><span class="total" style="font-size: 12px; text-align: right;">${formatRupiah(0)}</span></td>
                <td><button type="button" class="btn btn-danger btn-sm delete-row-btn">Hapus</button></td>
            `;
            returDataTableBody.appendChild(newRow);

            // UBAH: Panggil populateKodeRawMaterialDropdown
            const kodeRawMaterialSelect = newRow.querySelector('.kode_rawmaterial'); 
            populateKodeRawMaterialDropdown(kodeRawMaterialSelect);

            // UBAH: Tambahkan event listener untuk perubahan kode raw material
            kodeRawMaterialSelect.addEventListener('change', fillRawMaterialDetails);

            newRow.querySelectorAll('.kuantitas, .harga').forEach(input => {
                input.addEventListener('input', function() {
                    const rawValue = this.value.replace(/[^0-9]/g, '');
                    this.value = formatNumberWithDots(rawValue);
                    calculateRowTotal(this);
                });
                input.addEventListener('blur', function() {
                    const parsedValue = parseFormattedNumber(this.value);
                    this.value = formatNumberWithDots(parsedValue);
                    calculateRowTotal(this);
                });
            });

            newRow.querySelector('.delete-row-btn').addEventListener('click', function() {
                if (returDataTableBody.children.length > 1) {
                    newRow.remove();
                    currentRows--;
                    calculateOverallTotal();
                } else {
                    alert('Minimal harus ada satu baris bahan baku retur.'); // Pesan disesuaikan
                }
            });

            currentRows++;
            calculateOverallTotal();
            updateTambahBarisButtonState();
        } else {
            alert(`Anda telah mencapai batas maksimal ${maxRows} baris detail retur bahan baku!`); // Pesan disesuaikan
        }
    }

    function updateTambahBarisButtonState() {
        tambahBarisButton.disabled = (currentRows >= maxRows);
    }

    // --- Inisialisasi Awal Halaman ---

    populateNamaSupplierDropdown();

    const editReturId = localStorage.getItem('editReturSupplierId');
    if (editReturId) {
        const allReturns = JSON.parse(localStorage.getItem('allSupplierReturns')) || [];
        const returToEdit = allReturns.find(t => t.id === parseInt(editReturId));

        if (returToEdit) {
            tanggalInput.value = returToEdit.tanggalRetur || '';
            notaReturInput.value = returToEdit.noNotaRetur || '';
            namaSupplierSelect.value = returToEdit.namaSupplier || '';
            jenisReturInput.value = returToEdit.jenisRetur || '';

            returDataTableBody.innerHTML = '';
            currentRows = 0;

            if (returToEdit.items && returToEdit.items.length > 0) {
                returToEdit.items.forEach(item => {
                    addRow();
                    const row = returDataTableBody.lastElementChild;

                    // UBAH: Menggunakan kode_rawmaterial
                    const kodeRawMaterialSelect = row.querySelector('.kode_rawmaterial'); 
                    kodeRawMaterialSelect.value = item.kodeRawMaterial; // Asumsi item.kodeRawMaterial

                    setTimeout(() => {
                        const changeEvent = new Event('change');
                        kodeRawMaterialSelect.dispatchEvent(changeEvent);

                        // UBAH: properti nama_rawmaterial, satuan_rawmaterial
                        row.querySelector('.nama_rawmaterial').value = item.namaRawMaterial || '';
                        row.querySelector('.kuantitas').value = formatNumberWithDots(item.kuantitas || 0);
                        row.querySelector('.satuan_rawmaterial').value = item.satuanRawMaterial || '';
                        row.querySelector('.harga').value = formatNumberWithDots(item.harga || 0);
                        row.querySelector('.keterangan_retur').value = item.keteranganRetur || '';
                        row.querySelector('.total').textContent = formatRupiah(item.total || 0);

                        calculateRowTotal(row.querySelector('.kuantitas'));
                    }, 50);
                });
            } else {
                addRow();
            }
            calculateOverallTotal();
        } else {
            alert('Retur yang akan diedit tidak ditemukan. Memulai retur baru.');
            localStorage.removeItem('editReturSupplierId');
            addRow();
        }
    } else {
        addRow();
    }
    updateTambahBarisButtonState();

    // --- Event Listeners Utama ---

    tambahBarisButton.addEventListener('click', addRow);

    simpanButton.addEventListener('click', function(event) {
        event.preventDefault();

        const tanggalRetur = tanggalInput.value;
        const noNotaRetur = notaReturInput.value.trim();
        const namaSupplier = namaSupplierSelect.value;
        const jenisRetur = jenisReturInput.value.trim();
        const totalRetur = parseFormattedNumber(totalReturElement.textContent);

        if (!tanggalRetur || !noNotaRetur || !namaSupplier || !jenisRetur) {
            alert('Mohon lengkapi semua data header retur: Tanggal Retur, No. Nota Retur, Nama Supplier, dan Jenis Retur.');
            return;
        }

        const detailRows = returDataTableBody.querySelectorAll('tr');
        const items = [];
        let isValidDetail = true;

        if (detailRows.length === 0) {
            alert('Mohon tambahkan setidaknya satu item bahan baku retur ke transaksi.'); // Pesan disesuaikan
            return;
        }

        detailRows.forEach(row => {
            // UBAH: kodeRawMaterial, namaRawMaterial, satuanRawMaterial
            const kodeRawMaterial = row.querySelector('.kode_rawmaterial').value; 
            const namaRawMaterial = row.querySelector('.nama_rawmaterial').value; 
            const kuantitas = parseFormattedNumber(row.querySelector('.kuantitas').value);
            const satuanRawMaterial = row.querySelector('.satuan_rawmaterial').value; 
            const harga = parseFormattedNumber(row.querySelector('.harga').value);
            const keteranganRetur = row.querySelector('.keterangan_retur').value.trim();
            const total = parseFormattedNumber(row.querySelector('.total').textContent);

            // Validasi disesuaikan
            if (!kodeRawMaterial || !namaRawMaterial || kuantitas <= 0 || !satuanRawMaterial || harga <= 0 || total < 0) {
                isValidDetail = false;
            }

            if (isValidDetail) {
                items.push({
                    kodeRawMaterial: kodeRawMaterial, // UBAH: properti
                    namaRawMaterial: namaRawMaterial, // UBAH: properti
                    kuantitas: kuantitas,
                    satuanRawMaterial: satuanRawMaterial, // UBAH: properti
                    harga: harga,
                    keteranganRetur: keteranganRetur,
                    total: total
                });
            }
        });

        if (!isValidDetail) {
            alert('Mohon lengkapi detail bahan baku retur dengan benar (pilih kode, kuantitas > 0, harga > 0, total tidak boleh negatif).'); // Pesan disesuaikan
            return;
        }

        if (totalRetur <= 0 && items.length > 0) {
            alert('Total retur harus lebih dari Rp 0. Pastikan kuantitas dan harga diisi dengan benar.');
            return;
        }

        let returIdToSave = localStorage.getItem('editReturSupplierId');
        const isEditing = !!returIdToSave;

        if (!isEditing) {
            returIdToSave = Date.now();
        }

        const returData = {
            id: parseInt(returIdToSave),
            tanggalRetur: tanggalRetur,
            noNotaRetur: noNotaRetur,
            namaSupplier: namaSupplier,
            jenisRetur: jenisRetur,
            items: items, // Array detail bahan baku retur
            totalRetur: totalRetur
        };

        let allReturns = JSON.parse(localStorage.getItem('allSupplierReturns')) || [];

        if (isEditing) {
            const existingIndex = allReturns.findIndex(t => t.id === parseInt(returIdToSave));
            if (existingIndex > -1) {
                allReturns[existingIndex] = returData;
                alert('Retur Supplier (Bahan Baku) berhasil diperbarui!'); // Pesan disesuaikan
            } else {
                allReturns.push(returData);
                alert('Retur Supplier (Bahan Baku) berhasil disimpan sebagai retur baru (ID edit tidak valid)!'); // Pesan disesuaikan
            }
        } else {
            allReturns.push(returData);
            alert('Retur Supplier (Bahan Baku) berhasil disimpan!'); // Pesan disesuaikan
        }

        localStorage.setItem('allSupplierReturns', JSON.stringify(allReturns));

        localStorage.removeItem('editReturSupplierId');

        window.location.href = 'supplier_retur.html';
    });

    batalButton.addEventListener('click', function(event) {
        event.preventDefault();
        localStorage.removeItem('editReturSupplierId');
        window.location.href = 'supplier_retur.html';
    });
});