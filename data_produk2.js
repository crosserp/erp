document.addEventListener('DOMContentLoaded', function() {
    const formProduk = document.getElementById('dataproduk');
    const kodeProdukInput = document.getElementById('kode_produk');
    const namaProdukInput = document.getElementById('nama_produk');
    const satuanProdukSelect = document.getElementById('satuan_produk');
    const simpanButton = document.querySelector('button.simpan');
    const batalButton = document.querySelector('button.batal');

    // -- BAGIAN BARU UNTUK RAW MATERIAL --
    const addRawMaterialButton = document.getElementById('addRawMaterialRow');
    const rawMaterialTableBody = document.querySelector('#rawMaterialTable tbody');
    let rawMaterialRowCount = 0; // Untuk melacak jumlah baris raw material yang ada

    // Fungsi untuk menambah baris raw material baru
    function addRawMaterialRow(name = '', quantity = '', unit = '') {
        const newRow = rawMaterialTableBody.insertRow();
        const currentIndex = rawMaterialTableBody.children.length -1; // Dapatkan index baris yang baru ditambahkan
        newRow.innerHTML = `
            <td>${currentIndex + 1}.</td>
            <td>
                <input type="text" name="raw_materials[${currentIndex}][name]" placeholder="Nama Raw Material" value="${name}" required>
            </td>
            <td>
                <input type="number" name="raw_materials[${currentIndex}][quantity]" placeholder="Kuantitas" value="${quantity}" required min="1">
            </td>
            <td>
                <select name="raw_materials[${currentIndex}][unit]" required>
                    <option value="">Pilih Satuan</option>
                    <option value="pcs" ${unit === 'pcs' ? 'selected' : ''}>Unit (pcs)</option>
                    <option value="buah" ${unit === 'buah' ? 'selected' : ''}>Buah (bh)</option>
                    <option value="lembar" ${unit === 'lembar' ? 'selected' : ''}>Lembar (lbr)</option>
                    <option value="biji" ${unit === 'biji' ? 'selected' : ''}>Biji (bj)</option>
                    <option value="pasang" ${unit === 'pasang' ? 'selected' : ''}>Pasang (psg)</option>
                    <option value="set" ${unit === 'set' ? 'selected' : ''}>Set</option>
                    <option value="kodi" ${unit === 'kodi' ? 'selected' : ''}>Kodi</option>
                    <option value="gross" ${unit === 'gross' ? 'selected' : ''}>Gross</option>
                </select>
            </td>
            <td>
                <button type="button" class="delete-raw-material-row" style="background-color: #dc3545; color: white; border: none; padding: 5px 10px; cursor: pointer;">Hapus</button>
            </td>
        `;
        // rawMaterialRowCount++; // Tidak perlu lagi increment di sini, karena kita pakai actual row count
        updateRowNumbers(); // Panggil fungsi untuk memperbarui nomor baris
    }

    // Fungsi untuk memperbarui nomor baris
    function updateRowNumbers() {
        const rows = rawMaterialTableBody.querySelectorAll('tr');
        rows.forEach((row, index) => {
            row.querySelector('td:first-child').textContent = `${index + 1}.`;
            // Perbarui juga name attribute agar indexnya benar saat di-submit
            row.querySelectorAll('input, select').forEach(input => {
                const oldName = input.name;
                // Pastikan oldName tidak null/undefined sebelum replace
                if (oldName) {
                    const newName = oldName.replace(/\[\d+\]/, `[${index}]`);
                    input.name = newName;
                }
            });
        });
        // Setelah update, set rawMaterialRowCount agar sesuai dengan jumlah baris yang sebenarnya
        rawMaterialRowCount = rows.length;
    }

    // Event listener untuk tombol "Tambah Raw Material"
    if (addRawMaterialButton) {
        addRawMaterialButton.addEventListener('click', function() {
            addRawMaterialRow(); // Tambah baris kosong
        });
    }

    // Event listener untuk tombol "Hapus" pada baris raw material (delegasi event)
    if (rawMaterialTableBody) {
        rawMaterialTableBody.addEventListener('click', function(event) {
            if (event.target.classList.contains('delete-raw-material-row')) {
                // Pastikan setidaknya ada satu baris tersisa
                if (rawMaterialTableBody.children.length > 1) {
                    event.target.closest('tr').remove();
                    // rawMaterialRowCount--; // Tidak perlu decrement di sini, updateRowNumbers yang akan menangani
                    updateRowNumbers(); // Perbarui nomor baris setelah penghapusan
                } else {
                    alert('Minimal harus ada satu raw material.');
                }
            }
        });
    }

    // Memuat baris awal jika belum ada (misal, saat form pertama kali dibuka)
    // Atau jika dalam mode edit, kita akan memuat raw material yang ada
    // PENTING: Perhatikan logika ini agar tidak membuat baris ganda
    if (rawMaterialTableBody && rawMaterialTableBody.children.length === 0) {
        if (!localStorage.getItem('editProdukId')) {
             addRawMaterialRow(); // Tambahkan satu baris kosong secara default HANYA jika bukan mode edit
        }
    }
    // -- AKHIR BAGIAN BARU UNTUK RAW MATERIAL --


    // Mengambil data produk yang sudah ada dari localStorage
    let produkData = JSON.parse(localStorage.getItem('produkData')) || [];

    // Cek apakah ada ID produk yang dikirimkan untuk mode edit
    const editProdukId = localStorage.getItem('editProdukId');

    // Fungsi untuk memuat data produk ke dalam formulir jika dalam mode edit
    function loadProdukForEdit() {
        if (editProdukId) {
            const produkToEdit = produkData.find(p => p.id === parseInt(editProdukId));
            if (produkToEdit) {
                kodeProdukInput.value = produkToEdit.kodeProduk;
                namaProdukInput.value = produkToEdit.namaProduk;
                satuanProdukSelect.value = produkToEdit.satuanProduk;
                // Nonaktifkan input kode produk jika dalam mode edit agar tidak diubah
                kodeProdukInput.readOnly = true;
                kodeProdukInput.style.backgroundColor = '#e0e0e0'; // Memberi sedikit visual feedback

                // -- MUAT RAW MATERIAL SAAT EDIT --
                if (produkToEdit.rawMaterials && produkToEdit.rawMaterials.length > 0) {
                    // Kosongkan baris yang mungkin sudah ada (misal, baris default dari HTML)
                    rawMaterialTableBody.innerHTML = '';
                    rawMaterialRowCount = 0; // Reset hitungan
                    produkToEdit.rawMaterials.forEach(rm => {
                        addRawMaterialRow(rm.name, rm.quantity, rm.unit);
                    });
                } else {
                    // Jika tidak ada raw material yang tersimpan untuk produk ini, tambahkan satu baris kosong
                    addRawMaterialRow();
                }
                // -- AKHIR MUAT RAW MATERIAL SAAT EDIT --

            } else {
                alert('Data produk yang akan diedit tidak ditemukan.');
                // Hapus ID edit yang tidak valid
                localStorage.removeItem('editProdukId');
            }
        }
    }

    // Panggil fungsi load saat DOM selesai dimuat
    loadProdukForEdit();

    // Event listener untuk tombol Simpan
    simpanButton.addEventListener('click', function(event) {
        event.preventDefault(); // Mencegah form submit default

        const kodeProduk = kodeProdukInput.value.trim();
        const namaProduk = namaProdukInput.value.trim();
        const satuanProduk = satuanProdukSelect.value;

        // Validasi input produk utama
        if (!kodeProduk || !namaProduk || !satuanProduk) {
            alert('Kolom Kode Produk, Nama Produk, dan Satuan Produk harus diisi!');
            return;
        }

        // -- VALIDASI DAN PENGAMBILAN DATA RAW MATERIAL --
        const rawMaterials = [];
        let allRawMaterialsValid = true;
        const rawMaterialRows = rawMaterialTableBody.querySelectorAll('tr');

        // PENTING: Periksa jumlah baris raw material yang sebenarnya setelah manipulasi DOM
        if (rawMaterialRows.length === 0) {
            alert('Minimal harus ada satu Raw Material yang diisi.');
            return;
        }

        rawMaterialRows.forEach((row, index) => {
            // Mengambil input field menggunakan name attribute dengan index yang benar
            // Pastikan index yang digunakan di sini sesuai dengan name attribute yang sudah diperbarui oleh updateRowNumbers
            const nameInput = row.querySelector(`input[name="raw_materials[${index}][name]"]`);
            const quantityInput = row.querySelector(`input[name="raw_materials[${index}][quantity]"]`);
            const unitSelect = row.querySelector(`select[name="raw_materials[${index}][unit]"]`);

            const rmName = nameInput ? nameInput.value.trim() : '';
            const rmQuantity = quantityInput ? parseInt(quantityInput.value) : 0;
            const rmUnit = unitSelect ? unitSelect.value : '';

            if (!rmName || rmQuantity <= 0 || !rmUnit) {
                alert(`Raw Material baris ${index + 1}: Nama, Kuantitas (harus > 0), dan Satuan harus diisi.`);
                allRawMaterialsValid = false;
                // Tidak perlu 'return' di sini karena forEach tidak bisa dihentikan
            }
            rawMaterials.push({
                name: rmName,
                quantity: rmQuantity,
                unit: rmUnit
            });
        });

        if (!allRawMaterialsValid) {
            return; // Berhenti dari fungsi simpan jika ada validasi raw material yang gagal
        }
        // -- AKHIR VALIDASI DAN PENGAMBILAN DATA RAW MATERIAL --


        // Cek duplikasi kode produk (hanya jika bukan dalam mode edit atau jika kode produk berubah)
        if (!editProdukId || (editProdukId && produkData.find(p => p.id === parseInt(editProdukId)).kodeProduk !== kodeProduk)) {
            const isDuplicateKode = produkData.some(p => p.kodeProduk === kodeProduk);
            if (isDuplicateKode) {
                alert('Kode Produk sudah ada. Mohon gunakan kode lain.');
                return;
            }
        }

        if (editProdukId) {
            // Mode Edit: Perbarui data produk yang sudah ada
            const indexToUpdate = produkData.findIndex(p => p.id === parseInt(editProdukId));
            if (indexToUpdate > -1) {
                produkData[indexToUpdate].kodeProduk = kodeProduk;
                produkData[indexToUpdate].namaProduk = namaProduk;
                produkData[indexToUpdate].satuanProduk = satuanProduk;
                produkData[indexToUpdate].rawMaterials = rawMaterials; // Simpan raw material
                alert('Data produk berhasil diperbarui!');
            }
            localStorage.removeItem('editProdukId'); // Hapus ID edit setelah selesai
        } else {
            // Mode Tambah: Buat objek produk baru
            const newProduk = {
                id: Date.now(), // ID unik berdasarkan timestamp
                kodeProduk: kodeProduk,
                namaProduk: namaProduk,
                satuanProduk: satuanProduk,
                rawMaterials: rawMaterials // Tambahkan raw material
            };
            produkData.push(newProduk);
            alert('Data produk berhasil disimpan!');
        }

        // Simpan data produk yang diperbarui ke localStorage
        localStorage.setItem('produkData', JSON.stringify(produkData));

        // Arahkan kembali ke halaman daftar produk
        window.location.href = 'data_produk.html';
    });

    // Event listener untuk tombol Batal
    batalButton.addEventListener('click', function(event) {
        event.preventDefault(); // Mencegah perilaku default tombol
        localStorage.removeItem('editProdukId'); // Hapus ID edit jika ada
        window.location.href = 'data_produk.html'; // Kembali ke halaman daftar produk
    });
});