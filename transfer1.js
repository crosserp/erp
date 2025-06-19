// Script lengkap mengelola transfer antar akun dengan update saldo otomatis
document.addEventListener('DOMContentLoaded', function() {
    let allAccountsData = [];
    let currentSelectedAccountBalance = 0;
    let currentSelectedAccountNumber = '';

    const namaAkunSelect = document.getElementById('nama_akun');
    const namaAkunTujuanSelect = document.getElementById('nama_akun_tujuan');
    const tipePembayaranInput = document.getElementById('tipe');
    const jumlahInput = document.getElementById('jumlah');
    const simpanButton = document.querySelector('.simpan');
    const batalButton = document.querySelector('.batal');
    const formIsiTabelTransfer = document.querySelector('.isi-tabel-transfer');
    const formPaymentType = document.getElementById('paymentTypeForm');

    // Format angka ke Rupiah Indonesia
    function formatRupiah(angka) {
        if (typeof angka === 'string') {
            angka = parseFloat(angka.replace(/[^0-9,.-]/g, '').replace(',', '.'));
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

    // Format input angka dengan ribuan tanpa simbol mata uang
    function formatNumber(inputElement) {
        let value = inputElement.value.replace(/[^0-9]/g, '');
        let formattedValue = new Intl.NumberFormat('id-ID').format(parseInt(value, 10) || 0);
        inputElement.value = formattedValue;
    }

    // Bersihkan input angka dari format ribuan dan simbol
    function getCleanNumber(inputId) {
        const inputElement = document.getElementById(inputId);
        if (inputElement) {
            let value = inputElement.value.replace(/[^0-9]/g, '');
            return Number(value) || 0;
        }
        return 0;
    }

    // Muat data akun dari localStorage
    function loadAccountsData() {
        let dataAkun = localStorage.getItem('dataAkun');
        allAccountsData = dataAkun ? JSON.parse(dataAkun) : [];
        console.log("Data Akun dimuat:", allAccountsData);
    }

    // Isi dropdown akun (sumber atau tujuan)
    function populateAccountSelect(selectElement, defaultOptionText) {
        if (allAccountsData.length === 0) {
            loadAccountsData();
        }

        // Pakai Map untuk unikasi berdasarkan nomor akun
        const uniqueAccountsMap = new Map();
        allAccountsData.forEach(akun => {
            uniqueAccountsMap.set(akun.nomorAkun, {
                namaAkun: akun.namaAkun,
                nomorAkun: akun.nomorAkun,
                tipeAkun: akun.tipeAkun
            });
        });

        selectElement.innerHTML = `<option value="">${defaultOptionText}</option>`;

        if (uniqueAccountsMap.size > 0) {
            uniqueAccountsMap.forEach(akunInfo => {
                const option = document.createElement('option');
                option.value = akunInfo.nomorAkun;
                option.textContent = `${akunInfo.namaAkun} (${akunInfo.nomorAkun})`;
                selectElement.appendChild(option);
            });
            console.log(`Dropdown ${selectElement.id} berhasil diisi.`);
        } else {
            console.warn(`Tidak ada data akun untuk dropdown ${selectElement.id}.`);
        }
    }

    // Update saldo akun sumber dan tujuan berdasarkan transfer
    function updateAccountBalances(nomorAkunSumber, nomorAkunTujuan, jumlahTransfer) {
        const indexSumber = allAccountsData.findIndex(a => a.nomorAkun === nomorAkunSumber);
        const indexTujuan = allAccountsData.findIndex(a => a.nomorAkun === nomorAkunTujuan);

        if (indexSumber === -1) {
            alert('Akun sumber tidak ditemukan.');
            return false;
        }
        if (indexTujuan === -1) {
            alert('Akun tujuan tidak ditemukan.');
            return false;
        }

        let saldoSumber = parseFloat(allAccountsData[indexSumber].saldoAkun.replace(/[^0-9,-]+/g, "").replace(",", "."));
        let saldoTujuan = parseFloat(allAccountsData[indexTujuan].saldoAkun.replace(/[^0-9,-]+/g, "").replace(",", "."));
        let tipeTujuan = allAccountsData[indexTujuan].tipeAkun;

        // Cek saldo sumber cukup
        if (saldoSumber < jumlahTransfer) {
            alert(`Saldo akun sumber (${formatRupiah(saldoSumber)}) tidak cukup untuk melakukan transfer sebesar ${formatRupiah(jumlahTransfer)}.`);
            return false;
        }

        // Kurangi saldo akun sumber
        let newSaldoSumber = saldoSumber - jumlahTransfer;
        allAccountsData[indexSumber].saldoAkun = formatRupiah(newSaldoSumber);
        console.log(`Saldo akun sumber diperbarui: ${formatRupiah(saldoSumber)} -> ${formatRupiah(newSaldoSumber)}`);

        // Update saldo akun tujuan berdasarkan tipe akun
        let newSaldoTujuan = saldoTujuan;
        if (tipeTujuan === 'Liabilitas' || tipeTujuan === 'Pendapatan' || tipeTujuan === 'Ekuitas') {
            // Akun dengan saldo normal kredit -> pengurangan saldo akun tujuan saat penerimaan transfer
            newSaldoTujuan -= jumlahTransfer;
            console.log(`Saldo akun tujuan (${tipeTujuan}) DIKURANGI: ${formatRupiah(saldoTujuan)} - ${formatRupiah(jumlahTransfer)} = ${formatRupiah(newSaldoTujuan)}`);
        } else if (tipeTujuan === 'Aset' || tipeTujuan === 'Beban') {
            // Akun saldo normal debit -> penambahan saldo akun tujuan
            newSaldoTujuan += jumlahTransfer;
            console.log(`Saldo akun tujuan (${tipeTujuan}) DITAMBAH: ${formatRupiah(saldoTujuan)} + ${formatRupiah(jumlahTransfer)} = ${formatRupiah(newSaldoTujuan)}`);
        } else {
            console.warn(`Tipe akun tujuan '${tipeTujuan}' tidak dikenali atau tidak ada logika saldo otomatis.`);
        }

        allAccountsData[indexTujuan].saldoAkun = formatRupiah(newSaldoTujuan);

        return true;
    }

    // Event change untuk memilih akun sumber: update saldo dan nomor akun saat dipilih
    if (namaAkunSelect) {
        namaAkunSelect.addEventListener('change', function() {
            const selectedNomorAkun = this.value;
            const selectedAccount = allAccountsData.find(akun => akun.nomorAkun === selectedNomorAkun);

            if (selectedAccount) {
                currentSelectedAccountBalance = parseFloat(selectedAccount.saldoAkun.replace(/[^0-9,-]+/g, "").replace(",", "."));
                currentSelectedAccountNumber = selectedAccount.nomorAkun;
                console.log(`Akun sumber dipilih: ${selectedAccount.namaAkun}, Saldo: ${formatRupiah(currentSelectedAccountBalance)}`);
            } else {
                currentSelectedAccountBalance = 0;
                currentSelectedAccountNumber = '';
                console.log('Akun sumber tidak dipilih atau tidak ditemukan.');
            }
        });
    }

    // Event input untuk format otomatis jumlah transfer
    if (jumlahInput) {
        jumlahInput.addEventListener('input', function() {
            formatNumber(this);
        });

        jumlahInput.addEventListener('blur', function() {
            const cleanValue = getCleanNumber(this.id);
            this.value = formatRupiah(cleanValue);
        });

        jumlahInput.addEventListener('focus', function() {
            const cleanValue = getCleanNumber(this.id);
            this.value = cleanValue === 0 ? '' : cleanValue.toString();
        });
    }

    // Event klik tombol simpan transfer
    if (simpanButton) {
        simpanButton.addEventListener('click', function(event) {
            event.preventDefault();

            const tipePembayaran = tipePembayaranInput ? tipePembayaranInput.value : '';
            const selectedNomorAkunSumber = namaAkunSelect ? namaAkunSelect.value : '';
            const selectedNamaAkunSumberText = namaAkunSelect ? namaAkunSelect.options[namaAkunSelect.selectedIndex].textContent : '';
            const selectedNomorAkunTujuan = namaAkunTujuanSelect ? namaAkunTujuanSelect.value : '';
            const selectedNamaAkunTujuanText = namaAkunTujuanSelect ? namaAkunTujuanSelect.options[namaAkunTujuanSelect.selectedIndex].textContent : '';
            const bulan = document.getElementById('bulan') ? document.getElementById('bulan').value : '';
            const nomorRekening = document.getElementById('bank') ? document.getElementById('bank').value : '';
            const jumlahTransfer = getCleanNumber('jumlah');

            // Validasi wajib diisi dan jumlah > 0
            if (!tipePembayaran || !selectedNomorAkunSumber || !selectedNomorAkunTujuan || !bulan || !nomorRekening || jumlahTransfer <= 0) {
                alert('Harap melengkapi semua kolom dan pastikan jumlah lebih dari 0.');
                return;
            }

            // Lakukan update saldo dengan fungsi khusus
            const berhasilUpdate = updateAccountBalances(selectedNomorAkunSumber, selectedNomorAkunTujuan, jumlahTransfer);
            if (!berhasilUpdate) {
                return;
            }

            // Simpan data akun terbaru ke localStorage
            localStorage.setItem('dataAkun', JSON.stringify(allAccountsData));

            // Simpan data transfer ke localStorage
            let dataTransfer = localStorage.getItem('dataTransfer');
            dataTransfer = dataTransfer ? JSON.parse(dataTransfer) : [];

            const newTransfer = {
                id: Date.now(),
                tipePembayaran: tipePembayaran,
                namaAkunSumber: selectedNamaAkunSumberText,
                nomorAkunSumber: selectedNomorAkunSumber,
                namaAkunTujuan: selectedNamaAkunTujuanText,
                nomorAkunTujuan: selectedNomorAkunTujuan,
                bulan: bulan,
                nomorRekeningTujuan: nomorRekening,
                jumlah: jumlahTransfer
            };

            dataTransfer.push(newTransfer);
            localStorage.setItem('dataTransfer', JSON.stringify(dataTransfer));
            alert('Data transfer berhasil disimpan!');

            // Reset form
            if (formPaymentType) formPaymentType.reset();
            if (formIsiTabelTransfer) formIsiTabelTransfer.reset();
            if (namaAkunSelect) namaAkunSelect.value = '';
            if (namaAkunTujuanSelect) namaAkunTujuanSelect.value = '';

            currentSelectedAccountBalance = 0;
            currentSelectedAccountNumber = '';

            // Reload data dan isi ulang dropdown untuk reflect saldo terbaru
            loadAccountsData();
            populateAccountSelect(namaAkunSelect, '-- Pilih Akun Sumber --');
            populateAccountSelect(namaAkunTujuanSelect, '-- Pilih Akun Tujuan --');
        });
    }

    // Event klik tombol batal untuk reset dan redirect
    if (batalButton) {
        batalButton.addEventListener('click', function(event) {
            event.preventDefault();

            if (formPaymentType) formPaymentType.reset();
            if (formIsiTabelTransfer) formIsiTabelTransfer.reset();
            if (namaAkunSelect) namaAkunSelect.value = '';
            if (namaAkunTujuanSelect) namaAkunTujuanSelect.value = '';

            currentSelectedAccountBalance = 0;
            currentSelectedAccountNumber = '';

            window.location.href = 'transfer.html';
        });
    }

    // Inisialisasi utama saat halaman siap
    loadAccountsData();
    populateAccountSelect(namaAkunSelect, '-- Pilih Akun Sumber --');
    populateAccountSelect(namaAkunTujuanSelect, '-- Pilih Akun Tujuan --');
});

