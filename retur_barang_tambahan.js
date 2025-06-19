document.addEventListener('DOMContentLoaded', function() {
    const formRetur = document.getElementById('formRetur');
    const namaCustomerSelect = document.getElementById('nama_customer'); // Ini akan menjadi select
    const tanggalInput = document.getElementById('tanggal');
    const tbodyBarang = document.getElementById('tbodyBarang');
    const tambahBarangButton = document.getElementById('tambahBarang');
    const totalDiskonSpan = document.getElementById('totalDiskon');
    const grandTotalSpan = document.getElementById('grandTotal');
    const simpanButton = document.querySelector('.simpan');
    const batalButton = document.querySelector('.batal');

    // --- Fungsi Bantuan ---
    // Fungsi untuk memformat angka menjadi format Rupiah
    function formatRupiah(value) {
        let number = parseFloat(String(value).replace(/[^0-9,-]/g, '').replace(',', '.')); // Hapus non-angka, ganti koma jadi titik
        if (isNaN(number)) return '';
        let rupiah = new Intl.NumberFormat('id-ID', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(number);
        return 'Rp ' + rupiah;
    }

    // Fungsi untuk membersihkan format Rupiah menjadi angka
    function cleanRupiah(rupiah) {
        if (!rupiah) return 0;
        return parseInt(rupiah.replace(/[^0-9]/g, ''));
    }

    // --- Data dari LocalStorage ---
    const customerData = JSON.parse(localStorage.getItem('customerData')) || [];
    const produkData = JSON.parse(localStorage.getItem('produkData')) || [];

    // --- Inisialisasi Form & Dropdown ---

    // Mengisi dropdown Nama Pelanggan
    function populateCustomerDropdown() {
        namaCustomerSelect.innerHTML = '<option value="">Pilih Pelanggan</option>';
        customerData.forEach(customer => {
            const option = document.createElement('option');
            option.value = customer.id; // Gunakan ID unik customer
            option.textContent = customer.namaCustomer;
            namaCustomerSelect.appendChild(option);
        });
    }

    // Mengisi dropdown Kode Produk, Nama Produk, dan Satuan Produk
    function populateProdukDropdown(kodeSelectElement, namaInput, satuanInput, selectedKodeProduk = null) {
        // Kosongkan dan isi Kode Produk
        kodeSelectElement.innerHTML = '<option value="">Pilih Kode</option>';
        produkData.forEach(produk => {
            const option = document.createElement('option');
            option.value = produk.kodeProduk;
            option.textContent = produk.kodeProduk;
            option.dataset.nama = produk.namaProduk;
            option.dataset.satuan = produk.satuanProduk;
            option.dataset.harga = produk.hargaJual; // Ambil harga jual dari data produk
            kodeSelectElement.appendChild(option);
        });

        // Set nilai jika ada data yang sudah dipilih (untuk mode edit)
        if (selectedKodeProduk) {
            kodeSelectElement.value = selectedKodeProduk;
            const selectedOption = kodeSelectElement.options[kodeSelectElement.selectedIndex];
            namaInput.value = selectedOption.dataset.nama || '';
            satuanInput.value = selectedOption.dataset.satuan || '';
            // Anda mungkin juga ingin mengisi harga default di sini jika diperlukan
            // Ini akan ditangani oleh event listener change di bawah
        }

        // Event listener untuk perubahan Kode Produk
        kodeSelectElement.addEventListener('change', function() {
            const selectedOption = this.options[this.selectedIndex];
            const row = this.closest('tr'); // Dapatkan baris saat ini

            const namaProdukInput = row.querySelector('.nama_produk');
            const satuanProdukInput = row.querySelector('.satuan_produk');
            const hargaInput = row.querySelector('.harga');

            namaProdukInput.value = selectedOption.dataset.nama || '';
            satuanProdukInput.value = selectedOption.dataset.satuan || '';

            // Otomatis isi harga saat kode produk dipilih
            hargaInput.value = formatRupiah(selectedOption.dataset.harga || 0);

            hitungTotalBaris(row); // Hitung ulang total baris ini
            hitungGrandTotal(); // Hitung ulang grand total
        });
    }

    // --- Logika Perhitungan ---

    // Fungsi untuk menghitung total per baris
    function hitungTotalBaris(row) {
        const qtyInput = row.querySelector('.q');
        const hargaInput = row.querySelector('.harga');
        const discInput = row.querySelector('.disc');
        const totalHargaSpan = row.querySelector('.totalHarga');

        const qty = parseInt(qtyInput.value) || 0;
        const harga = cleanRupiah(hargaInput.value);
        const disc = cleanRupiah(discInput.value);

        let subtotal = qty * harga;
        let totalSetelahDisc = subtotal - disc;

        totalHargaSpan.textContent = formatRupiah(totalSetelahDisc);
        return totalSetelahDisc;
    }

    // Fungsi utama hitungTotal yang dipanggil dari onkeyup
    window.hitungTotal = function() { // Dibuat global agar bisa dipanggil dari HTML onkeyup
        const rows = tbodyBarang.querySelectorAll('tr');
        rows.forEach(row => {
            hitungTotalBaris(row);
        });
        hitungGrandTotal();
    };

    // Fungsi untuk memformat input rupiah (dari onkeyup)
    window.formatRupiah = function(element) {
        let value = element.value;
        value = value.replace(/[^0-9]/g, ''); // Hapus semua kecuali angka
        element.value = formatRupiah(value);
    };


    // Fungsi untuk menghitung total diskon dan grand total
    function hitungGrandTotal() {
        let totalSemuaHarga = 0;
        let totalSemuaDiskon = 0;

        const rows = tbodyBarang.querySelectorAll('tr');
        rows.forEach(row => {
            const qty = parseInt(row.querySelector('.q').value) || 0;
            const harga = cleanRupiah(row.querySelector('.harga').value);
            const disc = cleanRupiah(row.querySelector('.disc').value);

            let subtotal = qty * harga;
            totalSemuaHarga += subtotal;
            totalSemuaDiskon += disc;
        });

        const finalGrandTotal = totalSemuaHarga - totalSemuaDiskon;

        totalDiskonSpan.textContent = formatRupiah(totalSemuaDiskon);
        grandTotalSpan.textContent = formatRupiah(finalGrandTotal);
    }

    // --- Menambah dan Menghapus Baris Barang ---

    // Template untuk baris baru
    const rowTemplate = `
        <tr>
            <td class="kode_produk_container">
                <select class="kode_produk_select"></select>
            </td>
            <td><input type="text" class="nama_produk" readonly></td>
            <td><input type="text" class="q" onkeyup="hitungTotal()"></td>
            <td><input type="text" class="satuan_produk" readonly></td>
            <td><input type="text" class="harga" onkeyup="formatRupiah(this); hitungTotal()"></td>
            <td><input type="text" class="disc" onkeyup="formatRupiah(this); hitungTotal()"></td>
            <td><span class="totalHarga">Rp 0</span></td>
            <td><button type="button" class="hapus-barang">Hapus</button></td>
        </tr>
    `;

    function addBarangReturRow(item = null) {
        const newRow = document.createElement('tr');
        newRow.innerHTML = rowTemplate;

        // Ambil elemen di baris baru
        const kodeProdukSelect = newRow.querySelector('.kode_produk_select');
        const namaProdukInput = newRow.querySelector('.nama_produk');
        const satuanProdukInput = newRow.querySelector('.satuan_produk');
        const qtyInput = newRow.querySelector('.q');
        const hargaInput = newRow.querySelector('.harga');
        const discInput = newRow.querySelector('.disc');
        const hapusButton = newRow.querySelector('.hapus-barang');

        // Isi dropdown produk di baris baru
        populateProdukDropdown(kodeProdukSelect, namaProdukInput, satuanProdukInput, item ? item.kode_produk : null);

        // Isi data jika dalam mode edit
        if (item) {
            qtyInput.value = item.qty || '';
            hargaInput.value = formatRupiah(item.harga || 0);
            discInput.value = formatRupiah(item.disc || 0);
        }

        tbodyBarang.appendChild(newRow);

        // Inisialisasi perhitungan untuk baris baru
        hitungTotalBaris(newRow);
        hitungGrandTotal();

        // Event listener untuk tombol hapus di baris ini
        hapusButton.addEventListener('click', function() {
            newRow.remove();
            hitungGrandTotal(); // Hitung ulang total setelah baris dihapus
        });
    }

    // Event listener untuk tombol Tambah Barang
    tambahBarangButton.addEventListener('click', function() {
        addBarangReturRow();
    });

    // --- Load Data untuk Edit (Jika Ada) ---
    const editReturId = localStorage.getItem('editReturId');
    let currentReturToEdit = null;

    if (editReturId) {
        let daftarRetur = JSON.parse(localStorage.getItem('daftarRetur')) || [];
        currentReturToEdit = daftarRetur.find(retur => retur.id === parseInt(editReturId));

        if (currentReturToEdit) {
            // Isi form utama
            namaCustomerSelect.value = currentReturToEdit.customerId || '';
            tanggalInput.value = currentReturToEdit.tanggal || '';

            // Hapus baris default yang kosong jika ada
            tbodyBarang.innerHTML = '';

            // Isi tabel barang retur
            if (currentReturToEdit.items && currentReturToEdit.items.length > 0) {
                currentReturToEdit.items.forEach(item => addBarangReturRow(item));
            } else {
                addBarangReturRow(); // Tambahkan setidaknya satu baris kosong jika tidak ada item
            }

            simpanButton.textContent = 'Update Retur';
            alert('Mode Edit: Memuat data retur.');
        } else {
            alert('Data retur untuk diedit tidak ditemukan. Memulai form baru.');
            localStorage.removeItem('editReturId');
            addBarangReturRow(); // Tambahkan baris kosong untuk form baru
        }
    } else {
        // Mode Tambah Baru: Tambahkan satu baris kosong di awal
        addBarangReturRow();
    }

    // Panggil populateCustomerDropdown setelah DOM siap
    populateCustomerDropdown();
    // Panggil perhitungan awal
    hitungGrandTotal();

    // --- Event Listener Tombol Simpan ---
    simpanButton.addEventListener('click', function() {
        if (!formRetur.checkValidity()) {
            formRetur.reportValidity();
            return;
        }

        const customerId = namaCustomerSelect.value;
        const namaCustomer = namaCustomerSelect.options[namaCustomerSelect.selectedIndex].textContent;
        const tanggal = tanggalInput.value;

        const returItems = [];
        const rows = tbodyBarang.querySelectorAll('tr');

        let isValidItems = true;
        rows.forEach(row => {
            const kodeProduk = row.querySelector('.kode_produk_select').value;
            const namaProduk = row.querySelector('.nama_produk').value;
            const qty = parseInt(row.querySelector('.q').value) || 0;
            const satuan = row.querySelector('.satuan_produk').value;
            const harga = cleanRupiah(row.querySelector('.harga').value);
            const disc = cleanRupiah(row.querySelector('.disc').value);
            const totalHargaItem = cleanRupiah(row.querySelector('.totalHarga').textContent);


            if (!kodeProduk || qty <= 0 || !harga) {
                isValidItems = false;
                alert('Pastikan semua detail barang retur (kode, qty, harga) terisi dengan benar dan qty lebih dari 0.');
                return;
            }

            returItems.push({
                kode_produk: kodeProduk,
                nama_produk: namaProduk,
                qty: qty,
                satuan: satuan,
                harga: harga,
                disc: disc,
                total_harga_item: totalHargaItem
            });
        });

        if (!isValidItems) {
            return;
        }

        if (returItems.length === 0) {
            alert('Harap tambahkan setidaknya satu barang untuk retur.');
            return;
        }

        let newRetur = {
            id: currentReturToEdit ? currentReturToEdit.id : new Date().getTime(), // Gunakan ID unik
            customerId: customerId,
            nama_customer: namaCustomer,
            tanggal: tanggal,
            items: returItems,
            total_diskon_global: cleanRupiah(totalDiskonSpan.textContent),
            grand_total: cleanRupiah(grandTotalSpan.textContent)
        };

        let daftarRetur = JSON.parse(localStorage.getItem('daftarRetur')) || [];

        if (editReturId && currentReturToEdit) {
            // Mode Update
            const index = daftarRetur.findIndex(retur => retur.id === currentReturToEdit.id);
            if (index !== -1) {
                daftarRetur[index] = newRetur;
                alert('Data Retur berhasil diperbarui!');
            } else {
                alert('Kesalahan: Data retur yang akan diperbarui tidak ditemukan.');
                return;
            }
            localStorage.removeItem('editReturId');
        } else {
            // Mode Tambah Baru
            // Anda bisa menambahkan validasi duplikasi ID retur jika diperlukan di sini,
            // atau cukup andalkan timestamp sebagai ID unik.
            daftarRetur.push(newRetur);
            alert('Data Retur berhasil disimpan!');
        }

        localStorage.setItem('daftarRetur', JSON.stringify(daftarRetur));
        window.location.href = 'retur_barang.html'; // Redirect ke halaman daftar retur
    });

    // --- Event Listener Tombol Batal ---
    batalButton.addEventListener('click', function() {
        localStorage.removeItem('editReturId'); // Pastikan ID edit dihapus
        window.location.href = 'retur_barang.html';
    });
});