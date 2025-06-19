// data_customer_detail.js

document.addEventListener('DOMContentLoaded', function() {
    const customerDetailCard = document.getElementById('customerDetailCard');
    const noCustomerFoundMessage = document.getElementById('noCustomerFound');
    const backButton = document.getElementById('backButton');
    const catatTransaksiButton = document.getElementById('catattransaksi'); // Tombol "Catat Transaksi"
    const tambahTransaksiPembayaranButton = document.getElementById('tambahTransaksiBtn'); // Tombol "Tambah Transaksi Pembayaran"
    const customerTransactionsTableBody = document.getElementById('customerTransactionsTableBody'); // Tabel riwayat transaksi

    // --- Helper Functions ---

    /**
     * Memformat angka menjadi format mata uang Rupiah lengkap (misal: "Rp 10.000").
     * @param {number|string} angka - Nilai angka yang akan diformat.
     * @returns {string} - Angka yang sudah diformat Rupiah lengkap.
     */
    function formatRupiahDisplay(angka) {
        if (typeof angka === 'string') {
            angka = parseFloat(angka.replace(/[^0-9,]/g, '').replace(',', '.'));
        }
        if (isNaN(angka)) {
            angka = 0;
        }
        const format = new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        });
        return format.format(angka);
    }

    /**
     * Fungsi untuk mendapatkan parameter dari URL.
     * @param {string} name - Nama parameter yang dicari.
     * @returns {string} - Nilai parameter atau string kosong jika tidak ditemukan.
     */
    function getUrlParameter(name) {
        name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
        var results = regex.exec(location.search);
        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    }

    // Ambil ID customer dari parameter URL
    const customerId = parseInt(getUrlParameter('id'));

    // Mengambil data customer dari localStorage
    const customerData = JSON.parse(localStorage.getItem('customerData')) || [];
    const selectedCustomer = customerData.find(customer => customer.id === customerId);

    // Mengambil riwayat transaksi piutang customer
    // Di sini kita akan menggabungkan 'customerTransactions' (piutang baru)
    // dan 'paymentTransactions' (pembayaran piutang)
    const customerTransactions = JSON.parse(localStorage.getItem('customerTransactions')) || [];
    const paymentTransactions = JSON.parse(localStorage.getItem('paymentTransactions')) || [];

    // Gabungkan dan filter transaksi yang relevan untuk customer ini
    const allCustomerRelatedTransactions = [];

    // Tambahkan transaksi piutang baru (misal: penjualan kredit)
    customerTransactions.filter(t => t.customerId === customerId)
        .forEach(t => allCustomerRelatedTransactions.push({
            tanggal: t.tanggal,
            jumlah: t.jumlah,
            keterangan: t.keterangan,
            tipe: 'Piutang Baru' // Tipe transaksi piutang baru
        }));

    // Tambahkan transaksi pembayaran piutang
    paymentTransactions.filter(t => t.customerId === customerId)
        .forEach(t => allCustomerRelatedTransactions.push({
            tanggal: t.tanggal,
            jumlah: -t.jumlahDibayarkan, // Negatifkan jumlah karena ini mengurangi piutang
            keterangan: t.keterangan || `Pembayaran melalui ${t.akunPenerima}`,
            tipe: 'Pembayaran Piutang' // Tipe transaksi pembayaran piutang
        }));
    
    // Urutkan transaksi berdasarkan tanggal (terbaru di atas)
    allCustomerRelatedTransactions.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));


    // --- Tampilkan Detail Customer ---
    if (selectedCustomer) {
        document.getElementById('detail_id_customer').textContent = selectedCustomer.idCustomer || '';
        document.getElementById('detail_nama_customer').textContent = selectedCustomer.namaCustomer || '';
        document.getElementById('detail_no_customer').textContent = selectedCustomer.noCustomer || '';
        document.getElementById('detail_email_customer').textContent = selectedCustomer.emailCustomer || '';
        document.getElementById('detail_piutang_customer').textContent = formatRupiahDisplay(selectedCustomer.piutangCustomer) || '';
        document.getElementById('detail_rekening_customer').textContent = selectedCustomer.rekeningCustomer || '';
        document.getElementById('detail_alamat_customer').textContent = selectedCustomer.alamatCustomer || '';

        customerDetailCard.style.display = 'block';
        noCustomerFoundMessage.style.display = 'none';

        // --- Tampilkan Riwayat Transaksi Piutang ---
        customerTransactionsTableBody.innerHTML = ''; // Kosongkan tabel sebelum mengisi

        if (allCustomerRelatedTransactions.length > 0) {
            allCustomerRelatedTransactions.forEach(transaction => {
                const row = document.createElement('tr');
                // Tentukan warna teks berdasarkan tipe transaksi
                let amountClass = '';
                if (transaction.tipe === 'Pembayaran Piutang') {
                    amountClass = 'text-success'; // Hijau untuk pembayaran masuk
                } else if (transaction.tipe === 'Piutang Baru') {
                    amountClass = 'text-danger'; // Merah untuk piutang baru (uang keluar dari kita)
                }

                row.innerHTML = `
                    <td>${transaction.tanggal}</td>
                    <td class="${amountClass}">${formatRupiahDisplay(transaction.jumlah)}</td>
                    <td>${transaction.keterangan || '-'} (${transaction.tipe})</td>
                `;
                customerTransactionsTableBody.appendChild(row);
            });
        } else {
            const row = document.createElement('tr');
            row.innerHTML = `<td colspan="3" class="text-center">Belum ada riwayat transaksi piutang untuk pelanggan ini.</td>`;
            customerTransactionsTableBody.appendChild(row);
        }

    } else {
        customerDetailCard.style.display = 'none';
        noCustomerFoundMessage.style.display = 'block';
        console.warn("Customer dengan ID:", customerId, "tidak ditemukan.");
        // Sembunyikan juga tabel transaksi jika customer tidak ditemukan
        document.querySelector('.table.table-bordered').style.display = 'none';
        document.querySelector('h3').style.display = 'none'; // Sembunyikan judul tabel
    }

    // --- Event Listeners untuk Tombol Aksi ---
    if (backButton) {
        backButton.addEventListener('click', function() {
            window.location.href = 'data_customer.html'; // Kembali ke halaman daftar customer
        });
    }

    // Event listener untuk tombol "Catat Transaksi" (mencatat piutang baru/penjualan kredit)
    if (catatTransaksiButton && selectedCustomer) {
        catatTransaksiButton.addEventListener('click', function() {
            // Simpan ID customer yang akan dicatat transaksinya di localStorage
            // Ini bisa digunakan di halaman input transaksi piutang baru
            localStorage.setItem('recordNewReceivableCustomerId', customerId);
            // Arahkan ke halaman input transaksi piutang baru
            window.location.href = 'data_customer_detail_input.html';
        });
    } else if (catatTransaksiButton) {
        catatTransaksiButton.disabled = true; // Nonaktifkan tombol jika customer tidak ditemukan
    }

    // Event listener untuk tombol "Tambah Transaksi Pembayaran" (pembayaran piutang oleh customer)
    if (tambahTransaksiPembayaranButton && selectedCustomer) {
        tambahTransaksiPembayaranButton.addEventListener('click', function() {
            // Arahkan ke halaman piutang-piutang.html dan kirim ID customer sebagai parameter URL
            window.location.href = `piutang-piutang.html?customerId=${selectedCustomer.id}`;
        });
    } else if (tambahTransaksiPembayaranButton) {
        tambahTransaksiPembayaranButton.disabled = true; // Nonaktifkan tombol jika customer tidak ditemukan
    }
});