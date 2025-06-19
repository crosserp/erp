// purchasingvendor.js

document.addEventListener('DOMContentLoaded', () => {
    // --- Data Produk (Simulasi Database) ---
    // Gambar produk diharapkan ada di folder 'ecom/'
    // Contoh: ecom/groupset_shimano.jpg, ecom/wheelset_mtb.jpg, ecom/sadel_sport.jpg
    const products = [
        {
            id: 'p001',
            name: 'Groupset Shimano Deore M6100 1x12',
            description: 'Groupset lengkap Shimano Deore M6100 1x12 speed, termasuk shifter, RD, crankset, cassette, dan rantai. Ideal untuk sepeda gunung.',
            price: 3800000, // Harga per set
            unit: 'set',
            stock: 15, // Kuantitas awal
            imageUrl: 'ecom/groupset_shimano.jpg',
            category: 'Raw Material Sepeda',
            supplier: {
                nama: 'PT Komponen Sepeda Asia',
                telepon: '081234567890',
                email: 'sales@komasia.com',
                rekening: 'BNI 1234567890 (a.n. PT Komponen Sepeda Asia)',
                alamat: 'Jl. Industri Sepeda No. 1, Bekasi'
            }
        },
        {
            id: 'p002',
            name: 'Wheelset MTB 27.5 Inch Alloy',
            description: 'Wheelset sepeda gunung ukuran 27.5 inci, material alloy ringan dan kuat. Cocok untuk penggunaan trail dan cross-country.',
            price: 1200000, // Harga per pasang
            unit: 'pasang',
            stock: 10,
            imageUrl: 'ecom/wheelset_mtb.jpg',
            category: 'Raw Material Sepeda',
            supplier: {
                nama: 'CV Roda Jaya Makmur',
                telepon: '(021) 7654321',
                email: 'info@rodajaya.com',
                rekening: 'BCA 9876543210 (a.n. CV Roda Jaya Makmur)',
                alamat: 'Jl. Raya Cikarang KM 5, Cikarang'
            }
        },
        {
            id: 'p003',
            name: 'Sadel Sepeda Ergonomis Gel',
            description: 'Sadel sepeda dengan desain ergonomis dan lapisan gel untuk kenyamanan maksimal dalam perjalanan jauh. Universal fit.',
            price: 250000, // Harga per buah
            unit: 'buah',
            stock: 50,
            imageUrl: 'ecom/sadel_sport.jpg',
            category: 'Raw Material Sepeda',
            supplier: {
                nama: 'Pemasok Aksesoris Bike',
                telepon: '087654321098',
                email: 'order@pabike.co.id',
                rekening: 'Mandiri 112233445566 (a.n. Pemasok Aksesoris Bike)',
                alamat: 'Jl. Sudirman No. 10, Jakarta Pusat'
            }
        },
        {
            id: 'p004',
            name: 'Tiang Sadel Aluminium 27.2mm',
            description: 'Tiang sadel sepeda bahan aluminium ringan dengan diameter 27.2mm dan panjang 350mm. Kuat dan tahan karat.',
            price: 150000, // Harga per buah
            unit: 'buah',
            stock: 40,
            imageUrl: 'ecom/tiang_sadel_alloy.jpg',
            category: 'Raw Material Sepeda',
            supplier: {
                nama: 'Pemasok Aksesoris Bike', // Supplier sama
                telepon: '087654321098',
                email: 'order@pabike.co.id',
                rekening: 'Mandiri 112233445566 (a.n. Pemasok Aksesoris Bike)',
                alamat: 'Jl. Sudirman No. 10, Jakarta Pusat'
            }
        },
        {
            id: 'p005',
            name: 'Stang Sepeda Flatbar 720mm',
            description: 'Stang sepeda model flatbar lebar 720mm, bahan aluminium, cocok untuk sepeda urban dan MTB.',
            price: 180000,
            unit: 'buah',
            stock: 30,
            imageUrl: 'ecom/stang_flatbar.jpg',
            category: 'Raw Material Sepeda',
            supplier: {
                nama: 'PT Komponen Sepeda Asia',
                telepon: '081234567890',
                email: 'sales@komasia.com',
                rekening: 'BNI 1234567890 (a.n. PT Komponen Sepeda Asia)',
                alamat: 'Jl. Industri Sepeda No. 1, Bekasi'
            }
        },
        {
            id: 'p006',
            name: 'Stem Sepeda Alloy 90mm',
            description: 'Stem sepeda bahan alloy dengan panjang 90mm dan sudut 6 derajat. Kuat dan presisi.',
            price: 130000,
            unit: 'buah',
            stock: 35,
            imageUrl: 'ecom/stem_alloy.jpg',
            category: 'Raw Material Sepeda',
            supplier: {
                nama: 'PT Komponen Sepeda Asia',
                telepon: '081234567890',
                email: 'sales@komasia.com',
                rekening: 'BNI 1234567890 (a.n. PT Komponen Sepeda Asia)',
                alamat: 'Jl. Industri Sepeda No. 1, Bekasi'
            }
        },
        {
            id: 'p007',
            name: 'Grip Stang Karet Ergonomis',
            description: 'Grip stang sepeda dari karet berkualitas tinggi, desain ergonomis untuk pegangan yang nyaman dan anti-slip.',
            price: 60000,
            unit: 'pasang',
            stock: 60,
            imageUrl: 'ecom/grip_ergonomis.jpg',
            category: 'Raw Material Sepeda',
            supplier: {
                nama: 'Pemasok Aksesoris Bike',
                telepon: '087654321098',
                email: 'order@pabike.co.id',
                rekening: 'Mandiri 112233445566 (a.n. Pemasok Aksesoris Bike)',
                alamat: 'Jl. Sudirman No. 10, Jakarta Pusat'
            }
        },
        {
            id: 'p008',
            name: 'Pedal Sepeda Nylon Flat',
            description: 'Pedal sepeda flat dari bahan nylon komposit, ringan dan kuat dengan pin anti-slip. Universal thread.',
            price: 90000,
            unit: 'pasang',
            stock: 45,
            imageUrl: 'ecom/pedal_nylon.jpg',
            category: 'Raw Material Sepeda',
            supplier: {
                nama: 'CV Roda Jaya Makmur',
                telepon: '(021) 7654321',
                email: 'info@rodajaya.com',
                rekening: 'BCA 9876543210 (a.n. CV Roda Jaya Makmur)',
                alamat: 'Jl. Raya Cikarang KM 5, Cikarang'
            }
        },
        {
            id: 'p009',
            name: 'Set Baut & Mur Sepeda Universal',
            description: 'Berbagai ukuran baut dan mur khusus sepeda, material stainless steel anti karat. Cocok untuk perakitan umum.',
            price: 75000,
            unit: 'set',
            stock: 80,
            imageUrl: 'ecom/baut_mur_sepeda.jpg',
            category: 'Hardware Sepeda',
            supplier: {
                nama: 'PT Fastener Global',
                telepon: '(021) 88776655',
                email: 'contact@fastenerglobal.com',
                rekening: 'Mandiri 0987654321 (a.n. PT Fastener Global)',
                alamat: 'Jl. Raya Industri No. 3, Karawang'
            }
        },
        {
            id: 'p010',
            name: 'Sekrup Khusus Sepeda (Berbagai Ukuran)',
            description: 'Set sekrup khusus untuk komponen sepeda, kuat dan presisi. Material baja karbon dengan coating anti karat.',
            price: 60000,
            unit: 'set',
            stock: 70,
            imageUrl: 'ecom/sekrup_sepeda.jpg',
            category: 'Hardware Sepeda',
            supplier: {
                nama: 'PT Fastener Global', // Supplier sama
                telepon: '(021) 88776655',
                email: 'contact@fastenerglobal.com',
                rekening: 'Mandiri 0987654321 (a.n. PT Fastener Global)',
                alamat: 'Jl. Raya Industri No. 3, Karawang'
            }
        },
        {
            id: 'p011',
            name: 'Kabel Rem & Shifter Sepeda Set',
            description: 'Set kabel dalam dan luar untuk rem dan shifter sepeda. Kualitas premium untuk kinerja pengereman dan perpindahan gigi optimal.',
            price: 110000,
            unit: 'set',
            stock: 55,
            imageUrl: 'ecom/kabel_sepeda.jpg',
            category: 'Hardware Sepeda',
            supplier: {
                nama: 'CV Bike Parts Supply',
                telepon: '081122334455',
                email: 'admin@bikeparts.co.id',
                rekening: 'BNI Syariah 9988776655 (a.n. CV Bike Parts Supply)',
                alamat: 'Jl. Veteran No. 100, Surabaya'
            }
        },
        {
            id: 'p012',
            name: 'Gemuk Sepeda Lithium Base',
            description: 'Gemuk khusus sepeda berbasis lithium, tahan air, dan mengurangi gesekan pada bearing dan komponen bergerak.',
            price: 85000,
            unit: 'tube',
            stock: 40,
            imageUrl: 'ecom/gemuk_sepeda.jpg',
            category: 'Bahan Perawatan',
            supplier: {
                nama: 'PT Solusi Lubricant',
                telepon: '(021) 55443322',
                email: 'order@solusilube.com',
                rekening: 'BCA 1231231231 (a.n. PT Solusi Lubricant)',
                alamat: 'Komp. Pergudangan Prima, Jakarta Barat'
            }
        }
    ];

    // --- Elemen DOM ---
    const productList = document.getElementById('product-list');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartCountSpan = document.getElementById('cart-count');
    const cartTotalSpan = document.getElementById('cart-total');
    const emptyCartMessage = document.getElementById('empty-cart-message');
    const checkoutBtn = document.getElementById('checkout-btn');
    const clearCartBtn = document.getElementById('clear-cart-btn');

    // Elemen Modal Nota Pembelian
    const invoiceModal = document.getElementById('invoiceModal');
    const closeInvoiceModalBtn = document.querySelector('#invoiceModal .close-button');
    const invoiceDetailsContainer = document.getElementById('invoiceDetails');
    const printInvoiceBtn = document.querySelector('#invoiceModal .print-button');


    // --- State Aplikasi (Data Keranjang & Stok Produk) ---
    // Menggunakan localStorage untuk menyimpan keranjang dan stok agar tetap ada setelah refresh
    let cart = JSON.parse(localStorage.getItem('bikePartsCart')) || []; // Ubah nama key localStorage
    // Jika currentProducts belum ada di localStorage, gunakan data 'products' awal
    let currentProducts = JSON.parse(localStorage.getItem('bikePartsProducts')) || products; // Ubah nama key localStorage

    // --- Fungsi Helper ---
    /**
     * Memformat angka menjadi format mata uang Rupiah.
     * @param {number} number - Angka yang akan diformat.
     * @returns {string} - Angka dalam format Rupiah.
     */
    function formatRupiah(number) {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(number);
    }

    /**
     * Menyimpan data keranjang ke localStorage.
     */
    function saveCart() {
        localStorage.setItem('bikePartsCart', JSON.stringify(cart)); // Ubah nama key
    }

    /**
     * Menyimpan data produk (termasuk stok terbaru) ke localStorage.
     */
    function saveProducts() {
        localStorage.setItem('bikePartsProducts', JSON.stringify(currentProducts)); // Ubah nama key
    }

    // --- Render Produk ---
    /**
     * Merender (menampilkan) semua produk ke halaman web.
     * Memperbarui status stok dan tombol "Tambahkan ke Keranjang".
     */
    function renderProducts() {
        productList.innerHTML = ''; // Bersihkan daftar produk
        currentProducts.forEach(product => {
            const productCard = document.createElement('div');
            productCard.classList.add('product-card');

            const stockText = product.stock > 0 ? `Stok: ${product.stock} ${product.unit}` : '<span style="color: red; font-weight: bold;">Stok Habis!</span>';
            const isDisabled = product.stock <= 0;

            productCard.innerHTML = `
                <img src="${product.imageUrl || 'https://via.placeholder.com/200x200?text=Gambar+Tidak+Ada'}" alt="${product.name}">
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p class="description-text">${product.description}</p>
                    <p class="price">${formatRupiah(product.price)} / ${product.unit}</p>
                    <p class="stock">${stockText}</p>
                    
                    <div class="supplier-info">
                        <h4>Informasi Supplier:</h4>
                        <p><strong>Nama:</strong> ${product.supplier.nama}</p>
                        <p><strong>Telepon:</strong> ${product.supplier.telepon}</p>
                        <p><strong>Email:</strong> ${product.supplier.email}</p>
                        <p><strong>No. Rekening:</strong> ${product.supplier.rekening}</p>
                        <p><strong>Alamat:</strong> ${product.supplier.alamat}</p>
                    </div>

                    <button class="add-to-cart" data-id="${product.id}" ${isDisabled ? 'disabled' : ''}>
                        ${isDisabled ? 'Stok Habis' : 'Tambahkan ke Keranjang'}
                    </button>
                </div>
            `;
            productList.appendChild(productCard);
        });

        // Tambahkan event listener untuk tombol "Tambahkan ke Keranjang"
        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', addToCart);
        });
    }

    // --- Tambahkan ke Keranjang ---
    /**
     * Menambahkan produk ke keranjang belanja.
     * Mengurangi stok produk yang relevan.
     * @param {Event} event - Objek event dari klik tombol.
     */
    function addToCart(event) {
        const productId = event.target.dataset.id;
        const productToAdd = currentProducts.find(p => p.id === productId);

        // Validasi stok
        if (!productToAdd || productToAdd.stock <= 0) {
            alert('Produk ini kehabisan stok!');
            return;
        }

        // Cari item di keranjang
        const existingCartItem = cart.find(item => item.id === productId);

        if (existingCartItem) {
            // Jika produk sudah ada di keranjang, tingkatkan kuantitasnya
            existingCartItem.quantity++;
        } else {
            // Jika produk belum ada di keranjang, tambahkan sebagai item baru
            cart.push({ ...productToAdd, quantity: 1 });
        }

        // Kurangi stok produk yang sebenarnya
        productToAdd.stock--;
        
        // Simpan perubahan ke localStorage
        saveCart();
        saveProducts();
        
        // Render ulang tampilan
        renderProducts(); // Update tampilan stok produk
        renderCart();     // Update tampilan keranjang
    }

    // --- Render Keranjang ---
    /**
     * Merender (menampilkan) item-item di keranjang belanja.
     * Mengupdate total harga dan jumlah item di header.
     */
    function renderCart() {
        cartItemsContainer.innerHTML = ''; // Bersihkan kontainer keranjang
        let total = 0;

        if (cart.length === 0) {
            // Tampilkan pesan keranjang kosong dan nonaktifkan tombol
            emptyCartMessage.style.display = 'block';
            checkoutBtn.disabled = true;
            clearCartBtn.disabled = true;
        } else {
            // Sembunyikan pesan keranjang kosong dan aktifkan tombol
            emptyCartMessage.style.display = 'none';
            checkoutBtn.disabled = false;
            clearCartBtn.disabled = false;
            
            cart.forEach(item => {
                const productInStock = currentProducts.find(p => p.id === item.id); // Dapatkan info stok terbaru
                const isIncreaseDisabled = productInStock ? productInStock.stock <= 0 : true;

                const cartItemDiv = document.createElement('div');
                cartItemDiv.classList.add('cart-item');
                cartItemDiv.innerHTML = `
                    <img src="${item.imageUrl || 'https://via.placeholder.com/80x80?text=Gambar+Tidak+Ada'}" alt="${item.name}">
                    <div class="cart-item-details">
                        <h4>${item.name}</h4>
                        <p class="price">${formatRupiah(item.price)} / ${item.unit}</p>
                    </div>
                    <div class="cart-item-quantity">
                        <button data-id="${item.id}" data-action="decrease">-</button>
                        <span>${item.quantity}</span>
                        <button data-id="${item.id}" data-action="increase" ${isIncreaseDisabled ? 'disabled' : ''}>+</button>
                    </div>
                    <button class="remove-from-cart" data-id="${item.id}">Hapus</button>
                `;
                cartItemsContainer.appendChild(cartItemDiv);
                total += item.price * item.quantity;
            });
        }
        
        // Update total harga dan jumlah item di keranjang
        cartTotalSpan.textContent = formatRupiah(total);
        cartCountSpan.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);

        // Tambahkan event listener untuk tombol kuantitas dan hapus setelah rendering
        document.querySelectorAll('.cart-item-quantity button').forEach(button => {
            button.addEventListener('click', updateCartQuantity);
        });
        document.querySelectorAll('.remove-from-cart').forEach(button => {
            button.addEventListener('click', removeFromCart);
        });
    }

    // --- Update Kuantitas di Keranjang (Increase/Decrease) ---
    /**
     * Memperbarui kuantitas produk di keranjang (menambah atau mengurangi).
     * Mengurangi atau mengembalikan stok produk yang relevan.
     * @param {Event} event - Objek event dari klik tombol.
     */
    function updateCartQuantity(event) {
        const productId = event.target.dataset.id;
        const action = event.target.dataset.action;
        const cartItem = cart.find(item => item.id === productId);
        const productInStock = currentProducts.find(p => p.id === productId);

        if (!cartItem || !productInStock) return; // Pastikan item dan stok ada

        if (action === 'increase') {
            if (productInStock.stock > 0) { // Hanya tingkatkan jika stok tersedia
                cartItem.quantity++;
                productInStock.stock--;
            } else {
                alert('Tidak ada lagi stok untuk produk ini.');
            }
        } else if (action === 'decrease') {
            if (cartItem.quantity > 1) { // Hanya kurangi jika kuantitas lebih dari 1
                cartItem.quantity--;
                productInStock.stock++;
            } else {
                // Jika kuantitas menjadi 0, hapus item dari keranjang
                removeFromCart({ target: { dataset: { id: productId } } });
                return; // Keluar dari fungsi karena item sudah dihapus
            }
        }
        // Simpan perubahan dan render ulang
        saveCart();
        saveProducts();
        renderProducts(); // Perbarui tampilan produk (terutama stok)
        renderCart();
    }

    // --- Hapus dari Keranjang ---
    /**
     * Menghapus item dari keranjang belanja.
     * Mengembalikan stok produk yang relevan.
     * @param {Event} event - Objek event dari klik tombol.
     */
    function removeFromCart(event) {
        const productId = event.target.dataset.id;
        const itemIndex = cart.findIndex(item => item.id === productId);

        if (itemIndex > -1) {
            const removedItem = cart[itemIndex];
            const productInStock = currentProducts.find(p => p.id === productId);

            // Kembalikan stok produk yang dihapus ke array produk utama
            if (productInStock) {
                productInStock.stock += removedItem.quantity;
            }

            cart.splice(itemIndex, 1); // Hapus item dari array keranjang
            
            saveCart();
            saveProducts();
            renderProducts(); // Perbarui tampilan produk (terutama stok)
            renderCart();
        }
    }

    // --- Checkout ---
    /**
     * Memproses checkout: menampilkan nota pembelian dan membersihkan keranjang.
     */
    function checkout() {
        if (cart.length === 0) {
            alert('Keranjang Anda kosong. Tambahkan produk terlebih dahulu!');
            return;
        }

        const now = new Date();
        const transactionId = `PO-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${Date.now().toString().slice(-6)}`;
        const transactionDate = now.toLocaleString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        let invoiceHtml = `
            <h2>Nota Pembelian Material Sepeda</h2>
            <p><strong>Tanggal:</strong> ${transactionDate}</p>
            <p><strong>Nomor PO:</strong> ${transactionId}</p>
            <hr>
            <table>
                <thead>
                    <tr>
                        <th>Produk</th>
                        <th>Kuantitas</th>
                        <th>Harga Satuan</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
        `;

        let grandTotal = 0;
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            grandTotal += itemTotal;
            invoiceHtml += `
                <tr>
                    <td>${item.name}</td>
                    <td>${item.quantity} ${item.unit}</td>
                    <td>${formatRupiah(item.price)}</td>
                    <td>${formatRupiah(itemTotal)}</td>
                </tr>
            `;
        });

        invoiceHtml += `
                </tbody>
            </table>
            <hr>
            <h3>Total Keseluruhan: ${formatRupiah(grandTotal)}</h3>
            <hr>
            <h4>Informasi Pembayaran Supplier:</h4>
        `;

        // Kumpulkan daftar supplier unik dari keranjang
        const uniqueSuppliers = {};
        cart.forEach(item => {
            if (!uniqueSuppliers[item.supplier.nama]) {
                uniqueSuppliers[item.supplier.nama] = item.supplier;
            }
        });

        for (const supplierName in uniqueSuppliers) {
            const supplier = uniqueSuppliers[supplierName];
            invoiceHtml += `
                <div class="supplier-payment-info">
                    <p><strong>Nama Supplier:</strong> ${supplier.nama}</p>
                    <p><strong>No. Rekening:</strong> ${supplier.rekening}</p>
                    <p><strong>Telepon:</strong> ${supplier.telepon}</p>
                    <p><strong>Email:</strong> ${supplier.email}</p>
                </div>
            `;
        }

        invoiceDetailsContainer.innerHTML = invoiceHtml;
        invoiceModal.style.display = 'block';

        // Kosongkan keranjang setelah checkout
        cart = [];
        saveCart();
        renderCart();
        renderProducts(); // Pastikan stok diperbarui di tampilan produk
    }

    // --- Clear Cart ---
    /**
     * Mengosongkan keranjang dan mengembalikan stok produk yang relevan.
     */
    function clearCart() {
        if (confirm('Apakah Anda yakin ingin mengosongkan keranjang belanja? Stok produk akan dikembalikan.')) {
            cart.forEach(item => {
                const productInStock = currentProducts.find(p => p.id === item.id);
                if (productInStock) {
                    productInStock.stock += item.quantity;
                }
            });
            cart = [];
            saveCart();
            saveProducts();
            renderProducts();
            renderCart();
            alert('Keranjang belanja telah dikosongkan. Stok produk telah dikembalikan.');
        }
    }


    // --- Event Listeners ---
    checkoutBtn.addEventListener('click', checkout);
    clearCartBtn.addEventListener('click', clearCart);
    closeInvoiceModalBtn.addEventListener('click', () => {
        invoiceModal.style.display = 'none';
    });
    printInvoiceBtn.addEventListener('click', () => {
        const printContent = invoiceDetailsContainer.innerHTML;
        const originalContent = document.body.innerHTML;
        document.body.innerHTML = `
            <html>
                <head>
                    <title>Nota Pembelian</title>
                    <style>
                        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 20px; color: #333; }
                        h2 { text-align: center; color: #2c3e50; margin-bottom: 20px; }
                        p { margin-bottom: 5px; }
                        hr { border: 0; border-top: 1px solid #eee; margin: 20px 0; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                        th { background-color: #f2f2f2; }
                        tfoot { font-weight: bold; }
                        .supplier-payment-info { border: 1px solid #ccc; padding: 15px; margin-top: 15px; border-radius: 5px; background-color: #f9f9f9; }
                        .supplier-payment-info p { margin: 0; }
                    </style>
                </head>
                <body>
                    ${printContent}
                </body>
            </html>
        `;
        window.print();
        document.body.innerHTML = originalContent; // Kembalikan konten asli setelah cetak
        invoiceModal.style.display = 'none'; // Sembunyikan modal setelah cetak
        window.location.reload(); // Mungkin perlu refresh untuk mengembalikan semua event listener
    });

    // --- Inisialisasi Aplikasi ---
    renderProducts(); // Tampilkan produk saat halaman dimuat
    renderCart();     // Tampilkan keranjang saat halaman dimuat
});