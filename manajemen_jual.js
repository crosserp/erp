// manajemen_jual.js (untuk halaman input produk)

document.addEventListener('DOMContentLoaded', function() {
    console.log('manajemen_jual.js: DOMContentLoaded event fired.'); // DEBUG

    // --- Elemen DOM Halaman Input ---
    const productInputSection = document.getElementById('product-input-section'); // Bagian form
    const scrollToFormBtn = document.getElementById('scrollToFormBtn'); // Tombol gulir ke form

    // --- Elemen Form Input Produk ---
    const productForm = document.getElementById('product-form');
    const formTitle = document.getElementById('form-title');
    const productImageURLInput = document.getElementById('productImageURL');
    const productNameInput = document.getElementById('productName');
    const productCategoryInput = document.getElementById('productCategory');
    const productPriceInput = document.getElementById('productPrice');
    const productQuantityInput = document.getElementById('productQuantity'); // Input kuantitas
    const productUnitInput = document.getElementById('productUnit');       // Input satuan
    const saveProductBtn = document.getElementById('saveProductBtn');
    const cancelEditBtn = document.getElementById('cancelEditBtn');

    // --- Data Global dari LocalStorage ---
    // Kunci LocalStorage harus konsisten di semua skrip terkait produk
    let products = JSON.parse(localStorage.getItem('ecommerceProductCards')) || [];
    console.log('manajemen_jual.js: Products loaded from localStorage (initial):', products); // DEBUG

    // Variabel untuk mode edit/update
    let editProductId = null; // Menggunakan ID produk untuk edit, bukan index

    // --- FUNGSI PEMBANTU UNTUK FORMATTING DAN PARSING ANGKA ---

    /**
     * Memformat angka menjadi string Rupiah (misal: "Rp 1.234.567").
     * @param {number|string} number - Angka yang akan diformat.
     * @returns {string} - String angka yang sudah diformat Rupiah.
     */
    function formatRupiah(number) {
        if (typeof number === 'string' && number.startsWith('Rp')) {
            number = parseRupiahToNumber(number);
        }
        if (typeof number !== 'number' || isNaN(number)) {
            number = 0;
        }
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(number);
    }

    /**
     * Mengurai string Rupiah menjadi angka (number).
     * Ini akan menghilangkan "Rp", titik ribuan, dan mengubah koma desimal menjadi titik jika ada.
     * @param {string} rupiahString - String Rupiah yang akan diurai.
     * @returns {number} - Nilai angka.
     */
    function parseRupiahToNumber(rupiahString) {
        if (typeof rupiahString !== 'string') {
            return 0;
        }
        const cleaned = rupiahString.replace(/Rp\s?/g, '').replace(/\./g, '').replace(/,/g, '.');
        return parseFloat(cleaned) || 0;
    }

    /**
     * Memformat angka menjadi string dengan pemisah ribuan (misal: "1.234").
     * Digunakan untuk input harga atau kuantitas saat diketik agar lebih mudah dibaca.
     * @param {number|string} number - Angka yang akan diformat.
     * @returns {string} - String angka yang sudah diformat dengan pemisah ribuan.
     */
    function formatNumber(number) {
        if (typeof number === 'string') {
            // Hapus semua non-digit kecuali tanda minus di awal
            let cleaned = number.replace(/[^\d-]/g, ''); 
            // Handle multiple minus signs (only allow one at the start)
            if (cleaned.startsWith('-') && cleaned.indexOf('-', 1) !== -1) {
                cleaned = '-' + cleaned.replace(/-/g, '');
            } else {
                cleaned = cleaned.replace(/-/g, '');
            }
            number = parseFloat(cleaned) || 0;
        }
        if (typeof number !== 'number' || isNaN(number)) {
            return '0';
        }
        return new Intl.NumberFormat('id-ID', {
            minimumFractionDigits: 0
        }).format(number);
    }


    // --- FUNGSI MANAJEMEN FORM PRODUK ---

    /**
     * Mengosongkan form input dan mereset status edit.
     */
    function clearForm() {
        console.log('manajemen_jual.js: Clearing form.'); // DEBUG
        productImageURLInput.value = '';
        productNameInput.value = '';
        productCategoryInput.value = '';
        productPriceInput.value = '';
        productQuantityInput.value = ''; // Mengosongkan input kuantitas
        productUnitInput.value = '';       // Mengosongkan input satuan
        editProductId = null;
        formTitle.textContent = 'Tambah Produk Baru';
        saveProductBtn.textContent = 'Simpan Produk';
        cancelEditBtn.classList.add('hidden'); // Sembunyikan tombol batal edit
        productForm.reset(); // Mereset semua input dalam form
    }

    /**
     * Menangani submit form (Tambah/Update produk).
     * Data disimpan ke Local Storage, lalu dialihkan ke manajemen_harga.html
     * @param {Event} event - Objek event dari submit form.
     */
    function handleSubmit(event) {
        event.preventDefault();
        console.log('manajemen_jual.js: Form submitted.'); // DEBUG

        const imageURL = productImageURLInput.value.trim();
        const name = productNameInput.value.trim();
        const category = productCategoryInput.value.trim();
        const price = productPriceInput.value.trim();
        const quantity = productQuantityInput.value.trim(); // Ambil nilai kuantitas
        const unit = productUnitInput.value.trim();           // Ambil nilai satuan

        // Validasi input
        if (!imageURL || !name || !category || !price || !quantity || !unit) {
            alert('Harap isi semua kolom: URL Gambar, Nama Produk, Kategori, Harga, Kuantitas, dan Satuan!');
            return;
        }

        const parsedPrice = parseRupiahToNumber(price);
        const parsedQuantity = parseRupiahToNumber(quantity); // Parse kuantitas sebagai angka

        if (isNaN(parsedPrice) || parsedPrice <= 0) {
            alert('Harga harus berupa angka yang valid dan lebih dari nol!');
            return;
        }
        if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
            alert('Kuantitas harus berupa angka yang valid dan lebih dari nol!');
            return;
        }

        let newProduct;
        if (editProductId) {
            // Mode Update: Perbarui produk yang sudah ada
            const productIndex = products.findIndex(p => p.id === editProductId);
            if (productIndex !== -1) {
                newProduct = {
                    id: editProductId,
                    imageURL: imageURL,
                    name: name,
                    category: category,
                    price: parsedPrice,
                    quantity: parsedQuantity, // Simpan kuantitas
                    unit: unit               // Simpan satuan
                };
                products[productIndex] = newProduct;
                alert('Produk berhasil diperbarui!');
                console.log('manajemen_jual.js: Product updated:', newProduct); // DEBUG
            }
        } else {
            // Mode Tambah Baru: Tambahkan produk baru
            newProduct = {
                id: Date.now().toString(), // ID unik untuk produk baru
                imageURL: imageURL,
                name: name,
                category: category,
                price: parsedPrice,
                quantity: parsedQuantity, // Simpan kuantitas
                unit: unit               // Simpan satuan
            };
            products.push(newProduct);
            alert('Produk berhasil ditambahkan!');
            console.log('manajemen_jual.js: New product added:', newProduct); // DEBUG
        }

        localStorage.setItem('ecommerceProductCards', JSON.stringify(products)); // Simpan perubahan
        console.log('manajemen_jual.js: Products saved to localStorage.'); // DEBUG

        // Redirect ke halaman manajemen_harga.html setelah menyimpan
        window.location.href = 'manajemen_harga.html';
    }

    /**
     * Memuat data produk ke form untuk diedit.
     * Dipanggil jika ada parameter URL untuk edit (dari manajemen_harga.html).
     */
    function loadProductForEdit() {
        console.log('manajemen_jual.js: Checking for product to edit...'); // DEBUG
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');

        if (productId) {
            const productToEdit = products.find(p => p.id === productId);
            if (productToEdit) {
                console.log('manajemen_jual.js: Product found for edit:', productToEdit); // DEBUG
                productImageURLInput.value = productToEdit.imageURL;
                productNameInput.value = productToEdit.name;
                productCategoryInput.value = productToEdit.category;
                productPriceInput.value = formatNumber(productToEdit.price); // Format for display
                productQuantityInput.value = formatNumber(productToEdit.quantity); // Muat kuantitas dan format
                productUnitInput.value = productToEdit.unit;                     // Muat satuan
                
                editProductId = productId; // Set ID produk untuk mode update
                formTitle.textContent = 'Edit Produk';
                saveProductBtn.textContent = 'Update Produk';
                cancelEditBtn.classList.remove('hidden'); // Tampilkan tombol batal edit

                // Gulir ke form saat halaman dimuat dalam mode edit
                if (productInputSection) {
                    productInputSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            } else {
                alert('Produk tidak ditemukan untuk diedit.');
                console.warn('manajemen_jual.js: Product not found for ID:', productId); // DEBUG
                clearForm(); // Bersihkan form jika ID tidak valid
            }
        } else {
            console.log('manajemen_jual.js: No product ID found in URL, starting fresh form.'); // DEBUG
            clearForm(); // Selalu bersihkan form jika tidak dalam mode edit
        }
    }

    // --- INISIALISASI EVENT LISTENERS ---

    // Event listener untuk submit form produk
    if (productForm) {
        productForm.addEventListener('submit', handleSubmit);
    } else {
        console.error("manajemen_jual.js: Elemen form dengan ID 'product-form' tidak ditemukan."); // DEBUG
    }

    // Event listener untuk tombol Batal Edit
    if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', function() {
            console.log('manajemen_jual.js: Cancel Edit button clicked.'); // DEBUG
            clearForm();
            window.location.href = 'manajemen_harga.html'; // Kembali ke manajemen_harga.html
        });
    }

    // Event listener untuk tombol "Tambah Produk Baru" di header (jika ada di halaman ini)
    if (scrollToFormBtn && productInputSection) {
        scrollToFormBtn.addEventListener('click', function() {
            console.log('manajemen_jual.js: Scroll To Form button clicked.'); // DEBUG
            productInputSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            productNameInput.focus(); // Fokus ke input pertama di form
            clearForm(); // Pastikan form bersih saat ingin tambah produk baru
        });
    }

    // Event listener untuk memformat input harga dan kuantitas saat diketik
    if (productPriceInput) {
        productPriceInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/[^\d]/g, ''); // Hanya izinkan digit
            if (value) {
                e.target.value = formatNumber(parseInt(value, 10)); // Format dengan pemisah ribuan
            } else {
                e.target.value = '';
            }
        });
    }
    if (productQuantityInput) { // Event listener untuk kuantitas
        productQuantityInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/[^\d]/g, ''); // Hanya izinkan digit
            if (value) {
                e.target.value = formatNumber(parseInt(value, 10)); // Format dengan pemisah ribuan
            } else {
                e.target.value = '';
            }
        });
    }

    // --- INISIALISASI SAAT HALAMAN DIMUAT ---
    loadProductForEdit(); // Panggil fungsi ini saat halaman dimuat untuk mengecek mode edit
    console.log('manajemen_jual.js: Initialization complete.'); // DEBUG
});