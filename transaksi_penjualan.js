document.addEventListener('DOMContentLoaded', function() {
    // --- Referensi Elemen HTML ---
    const formTransaksi = document.getElementById('form-transaksi'); // Pastikan form Anda memiliki id="form-transaksi"
    const salesDataTableBody = document.getElementById('salesData'); // tbody dari tabel detail barang
    const totalBayarElement = document.getElementById('totalBayar'); // Span/div untuk menampilkan total pembayaran
    const tambahBarisButton = document.getElementById('tambahBaris'); // Tombol "Tambah Baris"
    const simpanButton = document.querySelector('button[type="submit"]'); // Tombol "Simpan"
    const batalButton = document.querySelector('button.batal'); // Tombol "Batal"

    let maxRows = 5; // Batasan jumlah baris detail barang
    let currentRows = 0; // Menghitung jumlah baris saat ini di tabel detail

    // Ambil elemen select untuk Nama Pelanggan
    const namaPelangganSelect = document.getElementById('nama_pelanggan'); // Pastikan select ini memiliki id="nama_pelanggan"

    // --- Data Master dari LocalStorage ---
    // Asumsi data ini sudah disimpan oleh script lain (misalnya dari halaman master data pelanggan/produk)
    const customerData = JSON.parse(localStorage.getItem('customerData')) || [];
    const produkData = JSON.parse(localStorage.getItem('produkData')) || [];

    // --- Fungsi Pembantu untuk Format Angka dan Rupiah ---

    /**
     * Memformat angka menjadi string dengan pemisah ribuan (contoh: 1000000 -> 1.000.000).
     * @param {number|string} number Angka yang akan diformat.
     * @returns {string} Angka yang sudah diformat atau string kosong jika input tidak valid.
     */
    function formatNumberWithDots(number) {
        if (number === null || isNaN(number) || number === '') {
            return '';
        }
        // Pastikan input adalah number, lalu konversi ke string dan tambahkan pemisah ribuan
        return parseFloat(number).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }

    /**
     * Menghilangkan format ribuan (titik) dari string dan mengembalikan ke angka integer.
     * @param {string} formattedNumber String angka yang sudah diformat (contoh: "1.000.000").
     * @returns {number|null} Angka integer atau null jika input tidak valid.
     */
    function parseFormattedNumber(formattedNumber) {
        if (!formattedNumber) {
            return null;
        }
        // Hapus semua karakter non-digit kecuali tanda minus di awal
        const cleanedNumber = formattedNumber.toString().replace(/[^0-9-]/g, '');
        return parseInt(cleanedNumber, 10);
    }

    /**
     * Memformat angka menjadi string mata uang Rupiah (contoh: 1000000 -> Rp 1.000.000).
     * @param {number|string} angka Angka yang akan diformat.
     * @returns {string} String mata uang Rupiah yang sudah diformat.
     */
    function formatRupiah(angka) {
        return `Rp ${formatNumberWithDots(angka)}`;
    }

    // --- Fungsionalitas Dropdown Header Form ---

    /**
     * Mengisi dropdown Nama Pelanggan dari data pelanggan yang ada di localStorage.
     */
    function populateNamaPelangganDropdown() {
        namaPelangganSelect.innerHTML = '<option value="">Pilih Pelanggan</option>'; // Opsi default
        customerData.forEach(customer => {
            const option = document.createElement('option');
            // Simpan nama pelanggan sebagai value, teks tampilan bisa nama + ID
            option.value = customer.namaCustomer;
            option.textContent = `${customer.namaCustomer} (ID: ${customer.idCustomer})`;
            namaPelangganSelect.appendChild(option);
        });
    }

    // --- Fungsionalitas Tabel Detail Barang ---

    /**
     * Mengisi dropdown Kode Produk untuk setiap baris detail dari data produk di localStorage.
     * @param {HTMLSelectElement} selectElement Elemen <select> kode produk.
     */
    function populateKodeProdukDropdown(selectElement) {
        selectElement.innerHTML = '<option value="">Pilih Kode</option>'; // Opsi default
        produkData.forEach(produk => {
            const option = document.createElement('option');
            option.value = produk.kodeProduk;
            option.textContent = produk.kodeProduk;
            selectElement.appendChild(option);
        });
    }

    /**
     * Mengisi detail barang (nama_produk, satuan_produk, harga) berdasarkan kode_produk yang dipilih.
     * Dipicu oleh event 'change' pada dropdown kode_produk.
     * @param {Event} event Event 'change'.
     */
    function fillProdukDetails(event) {
        const selectedKode = event.target.value;
        const currentRow = event.target.closest('tr');
        const namaProdukInput = currentRow.querySelector('.nama_produk');
        const satuanProdukInput = currentRow.querySelector('.satuan_produk');
        const hargaInput = currentRow.querySelector('.harga'); // input harga

        const selectedProduk = produkData.find(p => p.kodeProduk === selectedKode);

        if (selectedProduk) {
            namaProdukInput.value = selectedProduk.namaProduk || '';
            satuanProdukInput.value = selectedProduk.satuanProduk || '';
            // Asumsi harga disimpan di properti `hargaProduk` pada objek produk
            hargaInput.value = formatNumberWithDots(selectedProduk.hargaProduk) || '';
        } else {
            // Jika kode produk tidak ditemukan, kosongkan detailnya
            namaProdukInput.value = '';
            satuanProdukInput.value = '';
            hargaInput.value = '';
        }
        // Pemicu hitung ulang total baris setelah detail diisi (terutama harga)
        calculateRowTotal(currentRow.querySelector('.kuantitas'));
    }

    /**
     * Menghitung total per baris (kuantitas * harga - diskon).
     * Dipicu oleh event 'input' atau 'blur' pada input kuantitas, harga, dan diskon.
     * @param {HTMLInputElement} inputElement Input yang memicu perhitungan (kuantitas, harga, atau diskon).
     */
    function calculateRowTotal(inputElement) {
        const row = inputElement.closest('tr');
        const kuantitas = parseFormattedNumber(row.querySelector('.kuantitas').value) || 0;
        const harga = parseFormattedNumber(row.querySelector('.harga').value) || 0;
        const diskon = parseFormattedNumber(row.querySelector('.diskon').value) || 0;

        if (kuantitas >= 0 && harga >= 0 && diskon >= 0) {
            let total = (kuantitas * harga);
            total = total - diskon; // Terapkan diskon sebagai nilai absolut
            row.querySelector('.total').textContent = formatRupiah(total);
        } else {
            row.querySelector('.total').textContent = formatRupiah(0);
        }
        calculateOverallTotal(); // Hitung ulang total pembayaran keseluruhan setelah setiap baris berubah
    }

    /**
     * Menghitung total pembayaran keseluruhan dari semua baris detail barang.
     */
    function calculateOverallTotal() {
        let overallTotal = 0;
        salesDataTableBody.querySelectorAll('tr').forEach(row => {
            const totalText = row.querySelector('.total').textContent;
            const total = parseFormattedNumber(totalText.replace('Rp ', '')) || 0;
            overallTotal += total;
        });
        totalBayarElement.textContent = formatRupiah(overallTotal);
    }

    /**
     * Menambahkan baris baru ke tabel detail barang.
     */
    function addRow() {
        if (currentRows < maxRows) {
            const newRow = document.createElement('tr');
            newRow.innerHTML = `
                <td>
                    <select class="kode_produk" name="detail_kode_produk" required></select>
                </td>
                <td><input type="text" class="nama_produk" name="detail_nama_produk" readonly></td>
                <td><input type="text" class="kuantitas" name="detail_kuantitas" required></td>
                <td><input type="text" class="satuan_produk" name="detail_satuan_produk" readonly></td>
                <td><input type="text" class="harga" name="detail_harga" required></td>
                <td><input type="text" class="diskon" name="detail_diskon" value="0" required></td>
                <td><span class="total" style="font-size: 12px; text-align: right;">${formatRupiah(0)}</span></td>
                <td><button type="button" class="delete-row-btn">Hapus</button></td>
            `;
            salesDataTableBody.appendChild(newRow);
            newRow.style.backgroundColor = "#fff"; // Memberikan warna latar belakang agar terlihat

            // Inisialisasi dropdown Kode Produk untuk baris baru
            const kodeProdukSelect = newRow.querySelector('.kode_produk');
            populateKodeProdukDropdown(kodeProdukSelect);

            // Tambahkan event listener untuk perubahan kode produk
            kodeProdukSelect.addEventListener('change', fillProdukDetails);

            // Tambahkan event listener untuk input kuantitas, harga, dan diskon
            newRow.querySelectorAll('.kuantitas, .harga, .diskon').forEach(input => {
                input.addEventListener('input', function() {
                    const rawValue = this.value.replace(/\D/g, ''); // Hapus semua non-digit
                    this.value = formatNumberWithDots(rawValue); // Format dengan titik
                    calculateRowTotal(this);
                });
                input.addEventListener('blur', function() { // Tambah blur untuk memastikan format saat fokus hilang
                    const parsedValue = parseFormattedNumber(this.value);
                    this.value = formatNumberWithDots(parsedValue);
                    calculateRowTotal(this);
                });
            });

            // Event listener untuk tombol hapus baris
            newRow.querySelector('.delete-row-btn').addEventListener('click', function() {
                // Pastikan tidak menghapus semua baris jika hanya ada satu
                if (salesDataTableBody.children.length > 1) {
                    newRow.remove();
                    currentRows--;
                    calculateOverallTotal();
                } else {
                    alert('Minimal harus ada satu baris barang.');
                }
            });

            currentRows++;
            calculateOverallTotal(); // Perbarui total setelah menambahkan baris
        } else {
            alert(`Maksimal ${maxRows} baris dapat ditambahkan!`);
        }
    }

    // --- Inisialisasi Awal Halaman ---

    // Isi dropdown nama pelanggan saat halaman dimuat
    populateNamaPelangganDropdown();

    // --- Fungsionalitas Edit Sales Order (Pemuatan Data) ---
    // Cek apakah ada ID transaksi yang disimpan untuk diedit dari localStorage
    const editSalesOrderId = localStorage.getItem('editSalesOrderId');
    if (editSalesOrderId) {
        const allTransactions = JSON.parse(localStorage.getItem('allSalesTransactions')) || [];
        const salesOrderToEdit = allTransactions.find(t => t.id === parseInt(editSalesOrderId));

        if (salesOrderToEdit) {
            // Isi form header dengan data transaksi yang akan diedit
            document.getElementById('id').value = salesOrderToEdit.tanggal; // Pastikan elemen input tanggal memiliki id="id"
            document.getElementById('nota').value = salesOrderToEdit.noNota; // Pastikan elemen input nota memiliki id="nota"
            namaPelangganSelect.value = salesOrderToEdit.namaPelanggan; // Mengisi dropdown nama pelanggan
            document.getElementById('jPenjualan').value = salesOrderToEdit.jenisPenjualan; // Pastikan elemen input jenis penjualan memiliki id="jPenjualan"

            // Kosongkan dan isi ulang tabel detail barang
            salesDataTableBody.innerHTML = '';
            currentRows = 0; // Reset counter baris

            // Tambahkan baris untuk setiap item dalam transaksi yang diedit
            salesOrderToEdit.items.forEach(item => {
                addRow(); // Tambahkan baris baru (ini juga mengisi dropdown kode produk)
                const row = salesDataTableBody.lastElementChild; // Ambil baris yang baru ditambahkan

                const kodeProdukSelect = row.querySelector('.kode_produk');
                kodeProdukSelect.value = item.kodeProduk; // Set value dropdown kode produk

                // Penting: Pemicu event 'change' secara manual pada dropdown kode produk.
                // Ini akan memanggil `fillProdukDetails` dan mengisi nama_produk, satuan, dan harga.
                const changeEvent = new Event('change');
                kodeProdukSelect.dispatchEvent(changeEvent);

                // Set nilai input lainnya dari item
                row.querySelector('.nama_produk').value = item.namaProduk;
                row.querySelector('.kuantitas').value = formatNumberWithDots(item.kuantitas);
                row.querySelector('.satuan_produk').value = item.satuanProduk;
                row.querySelector('.harga').value = formatNumberWithDots(item.harga);
                row.querySelector('.diskon').value = formatNumberWithDots(item.diskon); // Terapkan format untuk diskon
                row.querySelector('.total').textContent = formatRupiah(item.total); // Set total per baris

                // Panggil calculateRowTotal untuk memastikan total per baris terhitung ulang
                calculateRowTotal(row.querySelector('.kuantitas'));
            });
            calculateOverallTotal(); // Hitung total keseluruhan setelah semua baris detail dimuat
        } else {
            // Jika ID edit ada tapi transaksi tidak ditemukan di localStorage (misalnya, sudah dihapus)
            alert('Transaksi yang akan diedit tidak ditemukan. Memulai transaksi baru.');
            localStorage.removeItem('editSalesOrderId'); // Hapus ID edit yang tidak valid
            addRow(); // Mulai form kosong untuk transaksi baru
        }
    } else {
        // Jika tidak ada ID edit di localStorage, berarti ini mode tambah baru, tambahkan satu baris kosong
        addRow();
    }

    // --- Event Listeners Utama ---

    // Event listener untuk tombol 'Tambah Baris'
    tambahBarisButton.addEventListener('click', addRow);

    // Event listener untuk tombol 'Simpan' (submit form)
    simpanButton.addEventListener('click', function(event) {
        event.preventDefault(); // Mencegah submit default form

        // --- Ambil dan Validasi Data Header Form ---
        const tanggal = document.getElementById('id').value; // Menggunakan ID 'id' untuk tanggal
        const nota = document.getElementById('nota').value.trim();
        const namaPelanggan = namaPelangganSelect.value;
        const jenisPenjualan = document.getElementById('jPenjualan').value.trim();
        const totalPembayaran = parseFormattedNumber(totalBayarElement.textContent.replace('Rp ', '')) || 0;

        // Validasi data header
        if (!tanggal || !nota || !namaPelanggan || !jenisPenjualan) {
            alert('Mohon lengkapi semua data header transaksi: Tanggal, No Nota, Nama Pelanggan, dan Jenis Penjualan.');
            return;
        }

        // --- Ambil dan Validasi Data Detail Barang ---
        const detailRows = salesDataTableBody.querySelectorAll('tr');
        const items = [];
        let isValidDetail = true;

        if (detailRows.length === 0 || (detailRows.length === 1 && !detailRows[0].querySelector('.kode_produk').value)) {
            alert('Mohon tambahkan setidaknya satu item barang ke transaksi.');
            return;
        }

        detailRows.forEach(row => {
            const kodeProduk = row.querySelector('.kode_produk').value;
            const namaProduk = row.querySelector('.nama_produk').value;
            const kuantitas = parseFormattedNumber(row.querySelector('.kuantitas').value);
            const satuanProduk = row.querySelector('.satuan_produk').value;
            const harga = parseFormattedNumber(row.querySelector('.harga').value);
            const diskon = parseFormattedNumber(row.querySelector('.diskon').value) || 0;
            const total = parseFormattedNumber(row.querySelector('.total').textContent.replace('Rp ', ''));

            // Validasi setiap baris detail
            if (!kodeProduk || !namaProduk || isNaN(kuantitas) || kuantitas <= 0 || !satuanProduk || isNaN(harga) || harga <= 0 || isNaN(diskon) || isNaN(total)) {
                isValidDetail = false; // Set flag menjadi false jika ada masalah di baris ini
            }

            // Hanya push item jika validasi detail berhasil untuk baris ini
            if (isValidDetail) {
                items.push({
                    kodeProduk: kodeProduk,
                    namaProduk: namaProduk,
                    kuantitas: kuantitas,
                    satuanProduk: satuanProduk,
                    harga: harga,
                    diskon: diskon,
                    total: total
                });
            }
        });

        // Tampilkan alert validasi detail jika ada masalah setelah memeriksa semua baris
        if (!isValidDetail) {
            alert('Mohon lengkapi detail barang dengan benar (pilih kode, kuantitas > 0, harga > 0, diskon >= 0).');
            return; // Hentikan proses simpan
        }

        // Validasi total pembayaran keseluruhan
        if (totalPembayaran <= 0) {
            alert('Total pembayaran harus lebih dari Rp 0. Pastikan kuantitas dan harga diisi dengan benar.');
            return;
        }

        // --- Siapkan Objek Transaksi untuk Disimpan ---
        let salesOrderIdToSave = localStorage.getItem('editSalesOrderId');
        if (!salesOrderIdToSave) {
            // Jika tidak ada ID edit, berarti ini transaksi baru, buat ID unik (timestamp)
            salesOrderIdToSave = Date.now();
        }

        const transactionData = {
            id: parseInt(salesOrderIdToSave), // Pastikan ID tersimpan sebagai number
            tanggal: tanggal,
            noNota: nota,
            namaPelanggan: namaPelanggan,
            jenisPenjualan: jenisPenjualan,
            items: items, // Array detail barang
            totalPembayaran: totalPembayaran
        };

        // --- Simpan ke LocalStorage ---
        let allTransactions = JSON.parse(localStorage.getItem('allSalesTransactions')) || [];

        const existingIndex = allTransactions.findIndex(t => t.id === parseInt(salesOrderIdToSave));
        if (existingIndex > -1) {
            // Mode edit: Ganti objek transaksi lama dengan yang baru di array
            allTransactions[existingIndex] = transactionData;
            alert('Transaksi Penjualan berhasil diperbarui!');
        } else {
            // Mode tambah baru: Tambahkan transaksi baru ke array
            allTransactions.push(transactionData);
            alert('Transaksi Penjualan berhasil disimpan!');
        }

        // Simpan kembali seluruh array transaksi ke localStorage
        localStorage.setItem('allSalesTransactions', JSON.stringify(allTransactions));

        // Hapus ID edit dari localStorage setelah selesai menyimpan/memperbarui
        localStorage.removeItem('editSalesOrderId');

        // Arahkan kembali ke halaman daftar sales order
        window.location.href = 'sales-order.html';
    });

    // Event listener untuk tombol 'Batal'
    batalButton.addEventListener('click', function(event) {
        event.preventDefault(); // Mencegah perilaku default tombol
        localStorage.removeItem('editSalesOrderId'); // Bersihkan ID edit jika ada
        window.location.href = 'sales-order.html'; // Kembali ke halaman daftar
    });
});