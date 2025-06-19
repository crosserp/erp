// jenis_usaha_edit.js - Untuk halaman detail/edit informasi perusahaan

document.addEventListener('DOMContentLoaded', function() {
    // --- Referensi Elemen HTML ---
    const editButton = document.getElementById('editButton');
    const saveButton = document.getElementById('saveButton');
    const cancelButton = document.getElementById('cancelButton');

    // Elemen untuk menampilkan data (span)
    const displayElements = {
        tipe: document.getElementById('tipe_display'),
        bidangUsaha: document.getElementById('bidangUsaha_display'),
        jenisPerusahaan: document.getElementById('jenisPerusahaan_display'),
        alamatPerusahaan: document.getElementById('alamatPerusahaan_display'),
        noTelepon: document.getElementById('noTelepon_display'),
        npwp: document.getElementById('npwp_display'),
    };

    // Elemen untuk input data (input fields)
    const inputElements = {
        tipe: document.getElementById('tipe_input'),
        bidangUsaha: document.getElementById('bidangUsaha_input'),
        jenisPerusahaan: document.getElementById('jenisPerusahaan_input'),
        alamatPerusahaan: document.getElementById('alamatPerusahaan_input'),
        noTelepon: document.getElementById('noTelepon_input'),
        npwp: document.getElementById('npwp_input'),
    };

    const productDisplayArea = document.getElementById('productDisplayArea');
    const productEditArea = document.getElementById('productEditArea');
    const productTextarea = document.getElementById('product_textarea');

    // Kunci untuk menyimpan data di localStorage
    const LOCAL_STORAGE_KEY = 'companyProfileData';

    // --- Data Awal (Default jika belum ada di localStorage) ---
    let companyData = {
        tipe: "Belum Diisi",
        bidangUsaha: "Belum Diisi",
        jenisPerusahaan: "Belum Diisi",
        alamatPerusahaan: "Belum Diisi",
        noTelepon: "Belum Diisi",
        npwp: "Belum Diisi",
        produkDijual: ["Belum ada produk"]
    };

    // --- Fungsi untuk Memuat Data dari Local Storage ---
    function loadCompanyData() {
        const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (storedData) {
            // Jika ada data di localStorage, gunakan itu
            companyData = JSON.parse(storedData);
        } else {
            // Jika belum ada data di localStorage, simpan data default sebagai inisialisasi
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(companyData));
        }
        updateDisplay(); // Selalu perbarui tampilan setelah memuat data
    }

    // --- Fungsi untuk Memperbarui Tampilan (dari data saat ini) ---
    function updateDisplay() {
        for (const key in displayElements) {
            if (displayElements.hasOwnProperty(key)) {
                // Pastikan nilai tidak undefined atau null
                displayElements[key].textContent = companyData[key] || "Tidak ada data";
                displayElements[key].style.display = 'inline'; // Pastikan display
            }
        }
        // Perbarui tampilan produk
        updateProductDisplay();
    }

    // --- Fungsi untuk Memperbarui Tampilan Produk ---
    function updateProductDisplay() {
        // Bersihkan area display produk
        productDisplayArea.innerHTML = ''; 

        if (companyData.produkDijual && companyData.produkDijual.length > 0) {
            companyData.produkDijual.forEach(product => {
                const span = document.createElement('span');
                span.textContent = product.trim();
                span.style.display = 'block'; // Tampilkan setiap produk di baris baru
                productDisplayArea.appendChild(span);
            });
        } else {
            const span = document.createElement('span');
            span.textContent = "Tidak ada produk yang tercatat.";
            span.style.display = 'block';
            productDisplayArea.appendChild(span);
        }
        productDisplayArea.style.display = 'block'; // Pastikan area ini terlihat
    }

    // --- Fungsi untuk Mengaktifkan Mode Edit ---
    function enableEditMode() {
        // Sembunyikan elemen display, tampilkan elemen input
        for (const key in displayElements) {
            if (displayElements.hasOwnProperty(key)) {
                displayElements[key].style.display = 'none';
                inputElements[key].value = displayElements[key].textContent; // Isi input dengan data saat ini
                inputElements[key].style.display = 'inline-block'; // Tampilkan input
            }
        }

        // Sembunyikan area tampilan produk, tampilkan area edit produk
        productDisplayArea.style.display = 'none';
        productEditArea.style.display = 'block';
        // Gabungkan array produk menjadi string untuk textarea
        productTextarea.value = companyData.produkDijual.join(', ');

        // Sembunyikan tombol Edit, tampilkan tombol Simpan dan Batal
        editButton.style.display = 'none';
        saveButton.style.display = 'inline-block';
        cancelButton.style.display = 'inline-block';
    }

    // --- Fungsi untuk Menonaktifkan Mode Edit dan Menyimpan Data ---
    function saveChanges() {
        // --- Validasi Input ---
        let isValid = true;
        let errorMessage = "Mohon lengkapi data berikut:\n";

        if (!inputElements.tipe.value.trim()) { errorMessage += "- Jenis Perusahaan\n"; isValid = false; }
        if (!inputElements.bidangUsaha.value.trim()) { errorMessage += "- Bidang Usaha\n"; isValid = false; }
        if (!inputElements.jenisPerusahaan.value.trim()) { errorMessage += "- Nama Perusahaan\n"; isValid = false; }
        if (!inputElements.alamatPerusahaan.value.trim()) { errorMessage += "- Alamat Perusahaan\n"; isValid = false; }
        if (!inputElements.noTelepon.value.trim()) { errorMessage += "- Nomor Telepon\n"; isValid = false; }
        if (!inputElements.npwp.value.trim()) { errorMessage += "- NPWP\n"; isValid = false; }
        if (!productTextarea.value.trim()) { errorMessage += "- Produk yang Dijual\n"; isValid = false; }

        if (!isValid) {
            alert(errorMessage);
            return; // Hentikan proses jika validasi gagal
        }

        // Ambil nilai dari input dan perbarui objek companyData
        for (const key in inputElements) {
            if (inputElements.hasOwnProperty(key)) {
                companyData[key] = inputElements[key].value.trim();
            }
        }
        // Pisahkan string produk kembali menjadi array, buang spasi ekstra, dan filter item kosong
        companyData.produkDijual = productTextarea.value.split(',').map(item => item.trim()).filter(item => item !== '');

        // Simpan data ke Local Storage
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(companyData));
        
        alert("Informasi perusahaan berhasil disimpan!");
        disableEditMode(); // Kembali ke mode tampilan
    }

    // --- Fungsi untuk Menonaktifkan Mode Edit dan Membatalkan Perubahan ---
    function cancelEdit() {
        // Muat ulang data dari localStorage (atau data awal jika belum ada di LS)
        loadCompanyData(); // Ini akan mereset tampilan ke data yang tersimpan
        alert("Perubahan dibatalkan.");
        disableEditMode(); // Kembali ke mode tampilan
    }

    // --- Fungsi untuk Menonaktifkan Mode Edit (kembali ke tampilan) ---
    function disableEditMode() {
        // Sembunyikan elemen input, tampilkan elemen display
        for (const key in displayElements) {
            if (displayElements.hasOwnProperty(key)) {
                displayElements[key].style.display = 'inline';
                inputElements[key].style.display = 'none';
            }
        }

        // Sembunyikan area edit produk, tampilkan area tampilan produk
        productEditArea.style.display = 'none';
        productDisplayArea.style.display = 'block'; // Pastikan ini terlihat

        // Sembunyikan tombol Simpan dan Batal, tampilkan tombol Edit
        editButton.style.display = 'inline-block';
        saveButton.style.display = 'none';
        cancelButton.style.display = 'none';
    }

    // --- Event Listeners ---
    editButton.addEventListener('click', enableEditMode);
    saveButton.addEventListener('click', saveChanges);
    cancelButton.addEventListener('click', cancelEdit);

    // --- Inisialisasi: Muat data saat halaman pertama kali dimuat ---
    loadCompanyData();
});