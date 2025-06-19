document.addEventListener('DOMContentLoaded', function() {
    const formPengajuan = document.getElementById('form-pengajuanfinishedgoods');
    const detailFinishedGoodsBody = document.getElementById('detail-finishedgoods-body');
    const tambahBarisButton = document.getElementById('tambahBaris');
    const simpanPengajuanButton = document.querySelector('.simpan');

    const namaPemohonSelect = document.getElementById('namaPemohon'); // Ambil elemen select nama pemohon
    const departementInput = document.getElementById('departement'); // Ambil elemen input departemen

    let allKaryawanData = []; // Untuk menyimpan data karyawan

    // --- Fungsi untuk memuat data produk dari localStorage ---
    function loadProdukData() {
        const produkData = JSON.parse(localStorage.getItem('produkData')) || [];
        return produkData;
    }

    // --- Fungsi untuk memuat data karyawan dari localStorage ---
    function loadKaryawanData() {
        allKaryawanData = JSON.parse(localStorage.getItem('dataKaryawan')) || [];
        console.log('Data Karyawan dimuat:', allKaryawanData); // Debugging
    }

    // --- Fungsi untuk mengisi dropdown kode produk ---
    function populateKodeProdukDropdown(selectElement) {
        const produkData = loadProdukData();
        selectElement.innerHTML = '<option value="">Pilih Kode</option>';

        produkData.forEach(produk => {
            const option = document.createElement('option');
            option.value = produk.kodeProduk;
            option.textContent = produk.kodeProduk;
            selectElement.appendChild(option);
        });
    }

    // --- Fungsi untuk mengisi dropdown nama pemohon ---
    function populateNamaPemohonDropdown() {
        namaPemohonSelect.innerHTML = '<option value="">Pilih Pemohon</option>'; // Reset dropdown

        allKaryawanData.forEach(karyawan => {
            const option = document.createElement('option');
            option.value = karyawan.namaKaryawan; // Nilai opsi adalah nama karyawan
            option.textContent = karyawan.namaKaryawan; // Teks yang ditampilkan adalah nama karyawan
            namaPemohonSelect.appendChild(option);
        });
    }

    // --- Fungsi untuk menambah baris baru ke tabel detail ---
    function addProductRow() {
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td>
                <select class="kode_produk" name="detail_kode_produk" required>
                    <option value="">Pilih Kode</option>
                </select>
            </td>
            <td><input type="text" class="nama_produk" name="detail_nama_produk" readonly></td>
            <td><input type="number" class="kuantitas_produk" name="detail_kuantitas_produk" min="1" required></td>
            <td><input type="text" class="satuan_produk" name="detail_satuan_produk" readonly></td>
            <td><button type="button" class="hapus-baris">Hapus</button></td>
        `;
        detailFinishedGoodsBody.appendChild(newRow);

        const newSelect = newRow.querySelector('.kode_produk');
        populateKodeProdukDropdown(newSelect);
        addEventListenersToRow(newRow); // Tambahkan event listener untuk baris baru
    }

    // --- Fungsi untuk menambahkan event listeners ke baris tabel (untuk dropdown dan tombol hapus) ---
    function addEventListenersToRow(rowElement) {
        const kodeProdukSelect = rowElement.querySelector('.kode_produk');
        const namaProdukInput = rowElement.querySelector('.nama_produk');
        const satuanProdukInput = rowElement.querySelector('.satuan_produk');
        const hapusButton = rowElement.querySelector('.hapus-baris');

        kodeProdukSelect.addEventListener('change', function() {
            const selectedKode = this.value;
            const produkData = loadProdukData();
            const selectedProduk = produkData.find(produk => produk.kodeProduk === selectedKode);

            if (selectedProduk) {
                namaProdukInput.value = selectedProduk.namaProduk;
                satuanProdukInput.value = selectedProduk.satuanProduk;
            } else {
                namaProdukInput.value = '';
                satuanProdukInput.value = '';
            }
        });

        hapusButton.addEventListener('click', function() {
            if (detailFinishedGoodsBody.children.length > 1) { // Pastikan minimal ada satu baris
                rowElement.remove();
            } else {
                alert('Tidak bisa menghapus semua baris. Minimal harus ada satu baris produk.');
            }
        });
    }

    // --- Fungsi untuk mengisi formulir jika dalam mode edit ---
    function loadEditData() {
        const editPengajuanId = localStorage.getItem('editPengajuanId');
        if (editPengajuanId) {
            const allPengajuan = JSON.parse(localStorage.getItem('daftarPengajuanFinishedGoods')) || [];
            const pengajuanToEdit = allPengajuan.find(p => p.id === parseInt(editPengajuanId));

            if (pengajuanToEdit) {
                // Isi data header
                document.getElementById('tgl').value = pengajuanToEdit.header.tgl;
                // Pilih opsi yang sesuai di dropdown namaPemohon
                namaPemohonSelect.value = pengajuanToEdit.header.namaPemohon;
                // Trigger change event untuk mengisi departemen secara otomatis
                const event = new Event('change');
                namaPemohonSelect.dispatchEvent(event);

                document.getElementById('prioritas').value = pengajuanToEdit.header.prioritas;
                // departementInput.value = pengajuanToEdit.header.departement; // Ini akan diisi otomatis
                document.getElementById('tglButuh').value = pengajuanToEdit.header.tglButuh;

                // Isi data detail produk
                detailFinishedGoodsBody.innerHTML = ''; // Kosongkan baris default
                pengajuanToEdit.details.forEach(detail => {
                    const newRow = document.createElement('tr');
                    newRow.innerHTML = `
                        <td>
                            <select class="kode_produk" name="detail_kode_produk" required>
                                <option value="">Pilih Kode</option>
                            </select>
                        </td>
                        <td><input type="text" class="nama_produk" name="detail_nama_produk" readonly value="${detail.namaProduk}"></td>
                        <td><input type="number" class="kuantitas_produk" name="detail_kuantitas_produk" min="1" required value="${detail.kuantitas}"></td>
                        <td><input type="text" class="satuan_produk" name="detail_satuan_produk" readonly value="${detail.satuan}"></td>
                        <td><button type="button" class="hapus-baris">Hapus</button></td>
                    `;
                    detailFinishedGoodsBody.appendChild(newRow);

                    const kodeProdukSelect = newRow.querySelector('.kode_produk');
                    populateKodeProdukDropdown(kodeProdukSelect);
                    kodeProdukSelect.value = detail.kodeProduk; // Set nilai select
                    addEventListenersToRow(newRow);
                });
                localStorage.removeItem('editPengajuanId'); // Hapus ID setelah digunakan
            }
        } else {
             // Jika tidak ada data edit, pastikan ada satu baris produk awal dan isi dropdownnya
             const initialSelect = detailFinishedGoodsBody.querySelector('.kode_produk');
             if (initialSelect) {
                 populateKodeProdukDropdown(initialSelect);
                 addEventListenersToRow(initialSelect.closest('tr'));
             }
        }
    }


    // --- Event listener untuk perubahan pada dropdown namaPemohon ---
    namaPemohonSelect.addEventListener('change', function() {
        const selectedNama = this.value;
        const selectedKaryawan = allKaryawanData.find(karyawan => karyawan.namaKaryawan === selectedNama);

        if (selectedKaryawan) {
            departementInput.value = selectedKaryawan.departement;
        } else {
            departementInput.value = ''; // Kosongkan jika tidak ada karyawan yang dipilih
        }
    });

    // --- Event listener untuk tombol "Tambah Baris Produk" ---
    tambahBarisButton.addEventListener('click', addProductRow);

    // --- Event listener untuk tombol "Simpan Pengajuan" ---
    simpanPengajuanButton.addEventListener('click', function(event) {
        event.preventDefault(); // Mencegah submit form default

        if (!formPengajuan.checkValidity()) {
            formPengajuan.reportValidity();
            return;
        }

        const tglInput = document.getElementById('tgl');
        const tglButuhInput = document.getElementById('tglButuh');
        const tglValue = new Date(tglInput.value);
        const tglButuhValue = new Date(tglButuhInput.value);

        if (tglButuhValue < tglValue) {
            alert('Tanggal Dibutuhkan tidak boleh lebih awal dari Tanggal Pengajuan.');
            tglButuhInput.focus();
            return;
        }

        const headerData = {
            tgl: tglInput.value,
            namaPemohon: namaPemohonSelect.value, // Ambil nilai dari select
            prioritas: document.getElementById('prioritas').value,
            departement: departementInput.value, // Ambil nilai dari input departement
            tglButuh: tglButuhInput.value
        };

        const detailData = [];
        let allDetailsValid = true;
        detailFinishedGoodsBody.querySelectorAll('tr').forEach((row, index) => {
            const kode = row.querySelector('.kode_produk').value;
            const nama = row.querySelector('.nama_produk').value;
            const kuantitasInput = row.querySelector('.kuantitas_produk');
            const kuantitas = kuantitasInput.value;
            const satuan = row.querySelector('.satuan_produk').value;

            if (!kode || !kuantitas || parseFloat(kuantitas) <= 0) {
                allDetailsValid = false;
                alert(`Pastikan Kode Produk dan Kuantitas diisi dengan benar pada baris ${index + 1} di tabel detail.`);
                kuantitasInput.focus();
                return;
            }

            detailData.push({
                kodeProduk: kode,
                namaProduk: nama,
                kuantitas: parseFloat(kuantitas),
                satuan: satuan
            });
        });

        if (!allDetailsValid) {
            return;
        }

        // Cek apakah ini mode edit atau tambah baru
        let editPengajuanId = localStorage.getItem('editPengajuanId');
        let allPengajuan = JSON.parse(localStorage.getItem('daftarPengajuanFinishedGoods')) || [];

        if (editPengajuanId) {
            // Mode edit: cari dan update pengajuan yang sudah ada
            const indexToUpdate = allPengajuan.findIndex(p => p.id === parseInt(editPengajuanId));
            if (indexToUpdate !== -1) {
                allPengajuan[indexToUpdate] = { ...allPengajuan[indexToUpdate], header: headerData, details: detailData };
            }
        } else {
            // Mode tambah baru: tambahkan pengajuan baru
            const pengajuanData = {
                header: headerData,
                details: detailData,
                id: new Date().getTime(), // ID unik berdasarkan timestamp
                status: 'Draft' // Set status awal ke 'Draft'
            };
            allPengajuan.push(pengajuanData);
        }

        localStorage.setItem('daftarPengajuanFinishedGoods', JSON.stringify(allPengajuan));

        alert('Pengajuan Finished Goods berhasil disimpan!');

        // Reset form dan detail tabel setelah simpan berhasil
        formPengajuan.reset();
        detailFinishedGoodsBody.innerHTML = `
            <tr>
                <td>
                    <select class="kode_produk" name="detail_kode_produk" required>
                        <option value="">Pilih Kode</option>
                    </select>
                </td>
                <td><input type="text" class="nama_produk" name="detail_nama_produk" readonly></td>
                <td><input type="number" class="kuantitas_produk" name="detail_kuantitas_produk" min="1" required></td>
                <td><input type="text" class="satuan_produk" name="detail_satuan_produk" readonly></td>
                <td><button type="button" class="hapus-baris">Hapus</button></td>
            </tr>
        `;
        populateKodeProdukDropdown(detailFinishedGoodsBody.querySelector('.kode_produk'));
        addEventListenersToRow(detailFinishedGoodsBody.querySelector('tr'));
        populateNamaPemohonDropdown(); // Isi ulang dropdown nama pemohon setelah reset
        departementInput.value = ''; // Kosongkan departemen setelah reset

        window.location.href = 'pengajuan_goods.html';
    });

    // --- Inisialisasi saat DOM selesai dimuat ---
    loadKaryawanData(); // Muat data karyawan terlebih dahulu
    populateNamaPemohonDropdown(); // Isi dropdown nama pemohon

    // Panggil loadEditData setelah dropdown namaPemohon terisi
    loadEditData();

    // Jika tidak dalam mode edit, pastikan baris pertama dan dropdownnya terisi
    if (!localStorage.getItem('editPengajuanId')) {
        const initialSelect = detailFinishedGoodsBody.querySelector('.kode_produk');
        if (initialSelect) {
            populateKodeProdukDropdown(initialSelect);
            addEventListenersToRow(initialSelect.closest('tr'));
        }
    }
});