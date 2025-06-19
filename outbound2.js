document.addEventListener('DOMContentLoaded', function() {
    const outboundForm = document.getElementById('outboundForm');
    const namaCustomerSelect = document.getElementById('nama_customer_select');
    const alamatCustomerInput = document.getElementById('alamat_customer_input');
    const nomorSuratInput = document.getElementById('nomorSurat');
    const tanggalInput = document.getElementById('tanggal');
    const outboundItemsBody = document.getElementById('outboundItemsBody');
    const tambahBarisButton = document.getElementById('tambahBaris');
    const simpanOutboundButton = document.getElementById('simpanOutbound');
    const outboundItemRowTemplate = document.getElementById('outboundItemRowTemplate');
    const keteranganOutboundInput = document.getElementById('keteranganOutbound'); // Pastikan ini ada di HTML outbound2.html Anda

    // --- Fungsi untuk mengisi dropdown Nama Penerima (Customer) ---
    function populateCustomerDropdown(selectedCustomerId = null) {
        const customers = JSON.parse(localStorage.getItem('customerData')) || [];
        namaCustomerSelect.innerHTML = '<option value="">Pilih Nama Customer</option>';

        customers.forEach(customer => {
            const option = document.createElement('option');
            option.value = customer.idCustomer;
            option.textContent = customer.namaCustomer;
            option.dataset.alamat = customer.alamatCustomer;
            namaCustomerSelect.appendChild(option);
        });

        if (selectedCustomerId) {
            namaCustomerSelect.value = selectedCustomerId;
            // Panggil event change secara manual untuk mengisi alamat
            // Ini tetap perlu karena event change untuk alamat
            namaCustomerSelect.dispatchEvent(new Event('change'));
        }

        namaCustomerSelect.addEventListener('change', function() {
            const selectedOption = this.options[this.selectedIndex];
            alamatCustomerInput.value = selectedOption.dataset.alamat || '';
        });
    }

    // --- Fungsi untuk mengisi dropdown Produk (Kode, Nama, Satuan) ---
    function populateProdukDropdown(selectElement, namaInput, satuanInput, selectedKodeProduk = null) {
        const produkData = JSON.parse(localStorage.getItem('produkData')) || [];
        selectElement.innerHTML = '<option value="">Pilih Kode</option>';

        produkData.forEach(produk => {
            const option = document.createElement('option');
            option.value = produk.kodeProduk;
            option.textContent = produk.kodeProduk;
            option.dataset.nama = produk.namaProduk;
            option.dataset.satuan = produk.satuanProduk;
            selectElement.appendChild(option);
        });

        if (selectedKodeProduk) {
            selectElement.value = selectedKodeProduk;
            // *** PERBAIKAN UTAMA DI SINI ***
            // Setelah menyetel nilai dropdown, cari opsi yang dipilih
            const selectedOption = selectElement.options[selectElement.selectedIndex];
            // Langsung isi nama dan satuan tanpa menunggu event 'change'
            namaInput.value = selectedOption.dataset.nama || '';
            satuanInput.value = selectedOption.dataset.satuan || '';
            // Anda bisa tetap memicu event change jika ada logika lain yang bergantung padanya
            // selectElement.dispatchEvent(new Event('change'));
        }

        // Event listener untuk mengisi nama dan satuan saat kode produk dipilih (interaksi manual)
        selectElement.addEventListener('change', function() {
            const selectedOption = this.options[this.selectedIndex];
            namaInput.value = selectedOption.dataset.nama || '';
            satuanInput.value = selectedOption.dataset.satuan || '';
        });
    }

    // --- Fungsi untuk menambah baris produk ke tabel outbound ---
    function addOutboundItemRow(item = null) { // Tambahkan parameter item untuk data existing
        const newRow = outboundItemRowTemplate.content.firstElementChild.cloneNode(true);
        outboundItemsBody.appendChild(newRow);

        const kodeProdukSelect = newRow.querySelector('.kode_produk_select');
        const namaProdukInput = newRow.querySelector('.nama_produk_input');
        const satuanProdukInput = newRow.querySelector('.satuan_produk_input');
        const ekspedisiSelect = newRow.querySelector('.ekspedisi_select');
        const jumlahInput = newRow.querySelector('.jumlah_input');
        const hapusBarisButton = newRow.querySelector('.hapus-baris');

        // Panggil populateProdukDropdown dengan data item jika ada
        populateProdukDropdown(kodeProdukSelect, namaProdukInput, satuanProdukInput, item ? item.kode_produk : null);

        // Isi data lain jika ada item yang diberikan (mode edit)
        if (item) {
            ekspedisiSelect.value = item.ekspedisi || '';
            jumlahInput.value = item.jumlah || '';
        }

        hapusBarisButton.addEventListener('click', function() {
            newRow.remove();
        });
    }

    // --- Inisialisasi Form (Cek mode Edit atau Tambah Baru) ---
    const editOutboundId = localStorage.getItem('editOutboundId');
    let currentOutboundToEdit = null;

    if (editOutboundId) {
        let daftarOutbound = JSON.parse(localStorage.getItem('daftarOutbound')) || [];
        currentOutboundToEdit = daftarOutbound.find(outbound => outbound.id == editOutboundId);

        if (currentOutboundToEdit) {
            // Isi form utama
            nomorSuratInput.value = currentOutboundToEdit.nomor_surat;
            tanggalInput.value = currentOutboundToEdit.tanggal;
            alamatCustomerInput.value = currentOutboundToEdit.alamat_customer;
            populateCustomerDropdown(currentOutboundToEdit.customer_id); // Isi dropdown customer
            
            // Isi keterangan (jika ada inputnya)
            if (keteranganOutboundInput) {
                keteranganOutboundInput.value = currentOutboundToEdit.keterangan || '';
            }

            // Kosongkan baris default sebelum mengisi detail barang yang ada
            outboundItemsBody.innerHTML = '';
            if (currentOutboundToEdit.items && currentOutboundToEdit.items.length > 0) {
                currentOutboundToEdit.items.forEach(item => addOutboundItemRow(item));
            } else {
                addOutboundItemRow(); // Tambahkan setidaknya satu baris kosong jika tidak ada item
            }

            // Ubah teks tombol simpan menjadi "Update"
            simpanOutboundButton.textContent = 'Update Outbound';
            nomorSuratInput.readOnly = true; // Nonaktifkan input nomor surat agar tidak diubah saat update

            alert('Mode Edit: Memuat data outbound.');
        } else {
            alert('Data outbound untuk diedit tidak ditemukan. Memulai form baru.');
            localStorage.removeItem('editOutboundId');
            populateCustomerDropdown();
            addOutboundItemRow();
        }
    } else {
        // Mode Tambah Baru
        populateCustomerDropdown();
        addOutboundItemRow(); // Tambahkan baris pertama secara default
    }

    // --- Event Listener untuk tombol Tambah Barang ---
    tambahBarisButton.addEventListener('click', addOutboundItemRow);

    // --- Event Listener untuk tombol Simpan/Update Outbound ---
    simpanOutboundButton.addEventListener('click', function() {
        if (!outboundForm.checkValidity()) {
            outboundForm.reportValidity();
            return;
        }

        const namaCustomer = namaCustomerSelect.options[namaCustomerSelect.selectedIndex].textContent;
        const customerId = namaCustomerSelect.value;
        const nomorSurat = nomorSuratInput.value;
        const tanggal = tanggalInput.value;
        const alamatCustomer = alamatCustomerInput.value;
        const keteranganOutbound = keteranganOutboundInput ? keteranganOutboundInput.value : '';

        const outboundItems = [];
        const rows = outboundItemsBody.querySelectorAll('tr');

        let isValidItems = true;
        rows.forEach(row => {
            const kodeProdukSelect = row.querySelector('.kode_produk_select');
            const namaProdukInput = row.querySelector('.nama_produk_input');
            const satuanProdukInput = row.querySelector('.satuan_produk_input');
            const ekspedisiSelect = row.querySelector('.ekspedisi_select');
            const jumlahInput = row.querySelector('.jumlah_input');

            if (!kodeProdukSelect.value || !ekspedisiSelect.value || !jumlahInput.value || parseInt(jumlahInput.value) <= 0) {
                isValidItems = false;
                alert('Pastikan semua detail barang (kode, ekspedisi, jumlah) terisi dengan benar dan jumlah lebih dari 0.');
                return;
            }

            outboundItems.push({
                kode_produk: kodeProdukSelect.value,
                nama_produk: namaProdukInput.value,
                satuan_produk: satuanProdukInput.value,
                ekspedisi: ekspedisiSelect.value,
                jumlah: parseInt(jumlahInput.value)
            });
        });

        if (!isValidItems) {
            return;
        }

        if (outboundItems.length === 0) {
            alert('Harap tambahkan setidaknya satu barang untuk outbound.');
            return;
        }

        let newOutbound = {
            nama_customer: namaCustomer,
            customer_id: customerId,
            nomor_surat: nomorSurat,
            tanggal: tanggal,
            alamat_customer: alamatCustomer,
            items: outboundItems,
            keterangan: keteranganOutbound
        };

        let daftarOutbound = JSON.parse(localStorage.getItem('daftarOutbound')) || [];

        if (editOutboundId) {
            const index = daftarOutbound.findIndex(outbound => outbound.id == editOutboundId);
            if (index !== -1) {
                newOutbound.id = currentOutboundToEdit.id;
                daftarOutbound[index] = newOutbound;
                alert('Data Outbound berhasil diperbarui!');
            } else {
                alert('Kesalahan: Data outbound yang akan diperbarui tidak ditemukan.');
                return;
            }
            localStorage.removeItem('editOutboundId');
        } else {
            const isNomorSuratExist = daftarOutbound.some(out => out.nomor_surat === nomorSurat);
            if (isNomorSuratExist) {
                alert('Nomor Surat ini sudah ada. Harap gunakan nomor surat lain.');
                return;
            }
            newOutbound.id = new Date().getTime();
            daftarOutbound.push(newOutbound);
            alert('Data Outbound berhasil disimpan!');
        }

        localStorage.setItem('daftarOutbound', JSON.stringify(daftarOutbound));
        window.location.href = 'outbound.html';
    });
});