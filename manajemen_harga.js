document.addEventListener('DOMContentLoaded', function() {
    console.log('manajemen_harga.js: DOMContentLoaded event fired.'); // DEBUG

    const productsListing = document.getElementById('products-listing');
    const noProductsMessage = document.getElementById('no-products-message');
    const refreshProductsBtn = document.getElementById('refreshProductsBtn');

    // --- Elemen UI untuk Fitur Baru ---
    const notificationArea = document.getElementById('notification-area');
    const sellerBalanceSpan = document.getElementById('seller-balance');
    const simulatePurchaseBtn = document.getElementById('simulatePurchaseBtn');
    const viewOrdersBtn = document.getElementById('viewOrdersBtn');

    // Modal elements
    const orderModal = document.getElementById('orderModal');
    const closeModalBtn = orderModal.querySelector('.close-button');
    const orderListing = document.getElementById('order-listing');
    const emptyOrdersMessage = orderModal.querySelector('.empty-orders-message');

    // --- Elemen UI untuk Laporan dan Penarikan Saldo ---
    const generateReportBtn = document.getElementById('generateReportBtn');
    const withdrawBalanceBtn = document.getElementById('withdrawBalanceBtn');

    const reportModal = document.getElementById('reportModal');
    const closeReportModalBtn = reportModal.querySelector('.close-button');
    const reportListing = document.getElementById('reportListing');
    const emptyReportMessage = reportModal.querySelector('.empty-report-message');
    const totalSalesCountSpan = document.getElementById('totalSalesCount');
    const totalRevenueSpan = document.getElementById('totalRevenue');
    const reportStatusFilter = document.getElementById('reportStatusFilter');
    const reportSearchInput = document.getElementById('reportSearch');

    // --- Elemen baru untuk filter tanggal ---
    const reportStartDateInput = document.getElementById('reportStartDate');
    const reportEndDateInput = document.getElementById('reportEndDate');
    const applyReportFilterBtn = document.getElementById('applyReportFilterBtn');
    // --- Akhir elemen baru ---

    const withdrawModal = document.getElementById('withdrawModal');
    const closeWithdrawModalBtn = withdrawModal.querySelector('.close-button');
    const currentBalanceWithdrawSpan = document.getElementById('currentBalanceWithdraw');
    const withdrawAmountInput = document.getElementById('withdrawAmount');
    const processWithdrawBtn = document.getElementById('processWithdrawBtn');
    const invoiceArea = document.getElementById('invoiceArea');

    // --- Data Global dari LocalStorage ---
    let products = JSON.parse(localStorage.getItem('ecommerceProductCards')) || [];
    let sellerBalance = parseFloat(localStorage.getItem('sellerBalance')) || 0;
    let pendingOrders = JSON.parse(localStorage.getItem('pendingOrders')) || [];
    let withdrawalHistory = JSON.parse(localStorage.getItem('withdrawalHistory')) || [];

    // --- Variabel untuk Otomatisasi ---
    const PURCHASE_INTERVAL = 10000;
    const CANCELLATION_TIMEOUT = 20000;

    let purchaseIntervalId;
    let cancellationTimeouts = {};

    console.log('manajemen_harga.js: Products loaded from localStorage (initial):', products);
    console.log('manajemen_harga.js: Seller Balance loaded (initial):', sellerBalance);
    console.log('manajemen_harga.js: Pending Orders loaded (initial):', pendingOrders);
    console.log('manajemen_harga.js: Withdrawal History loaded (initial):', withdrawalHistory);

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
     * Digunakan untuk kuantitas.
     * @param {number|string} number - Angka yang akan diformat.
     * @returns {string} - String angka yang sudah diformat dengan pemisah ribuan.
     */
    function formatQuantity(number) {
        if (typeof number === 'string') {
            let cleaned = number.replace(/[^\d-]/g, '');
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

    /**
     * Menampilkan notifikasi pop-up.
     * @param {string} message - Pesan notifikasi.
     * @param {string} type - Tipe notifikasi ('success', 'error', 'info', dll.).
     * @param {number} duration - Durasi tampilan notifikasi dalam milidetik.
     */
    function showNotification(message, type = 'success', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notificationArea.appendChild(notification);

        // Hapus notifikasi setelah durasi
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, duration);
    }

    // --- FUNGSI INJEKSI DATA AWAL (DUMMY DATA) ---
    function injectInitialProducts() {
        console.log('manajemen_harga.js: Entering injectInitialProducts(). Current products length:', products.length);
        if (products.length === 0) {
            const initialBikes = [
                {
                    id: '1718712345678',
                    imageURL: 'https://placehold.co/400x250/C6D8D5/3D5757?text=Sepeda+Lipat+Urban',
                    name: 'Sepeda Gunung X-Trail',
                    category: 'Sepeda Gunung',
                    price: 3500000,
                    quantity: 15,
                    unit: 'unit',
                    isSystemProduct: true
                },
                {
                    id: '1718712345679',
                    imageURL: '[https://placehold.co/400x250/C6D8D5/3D5757?text=Sepeda+Lipat+Urban](https://placehold.co/400x250/C6D8D5/3D5757?text=Sepeda+Lipat+Urban)',
                    name: 'Sepeda Lipat Urban',
                    category: 'Sepeda Lipat',
                    price: 2200000,
                    quantity: 20,
                    unit: 'unit',
                    isSystemProduct: true
                },
                {
                    id: '1718712345680',
                    imageURL: '[https://placehold.co/400x250/C6D8D5/3D5757?text=Sepeda+Balap+AeroPro](https://placehold.co/400x250/C6D8D5/3D5757?text=Sepeda+Balap+AeroPro)',
                    name: 'Sepeda Balap AeroPro',
                    category: 'Sepeda Balap',
                    price: 7800000,
                    quantity: 8,
                    unit: 'unit',
                    isSystemProduct: true
                },
                {
                    id: '1718712345681',
                    imageURL: '[https://placehold.co/400x250/C6D8D5/3D5757?text=Sepeda+Anak+FunRide](https://placehold.co/400x250/C6D8D5/3D5757?text=Sepeda+Anak+FunRide)',
                    name: 'Sepeda Anak FunRide',
                    category: 'Sepeda Anak',
                    price: 850000,
                    quantity: 30,
                    unit: 'unit',
                    isSystemProduct: true
                },
                {
                    id: '1718712345682',
                    imageURL: '[https://placehold.co/400x250/C6D8D5/3D5757?text=Sepeda+Listrik+E-Bike](https://placehold.co/400x250/C6D8D5/3D5757?text=Sepeda+Listrik+E-Bike)',
                    name: 'Sepeda Listrik E-Bike',
                    category: 'Sepeda Listrik',
                    price: 12500000,
                    quantity: 10,
                    unit: 'unit',
                    isSystemProduct: true
                }
            ];

            products = initialBikes;
            localStorage.setItem('ecommerceProductCards', JSON.stringify(products));
            console.log("manajemen_harga.js: DEBUG: Produk sepeda awal telah diinjeksikan ke localStorage.");
        } else {
            console.log("manajemen_harga.js: DEBUG: LocalStorage sudah berisi produk, tidak menginjeksikan data awal.");
        }
    }

    // --- FUNGSI TAMPILAN PRODUK (untuk Dashboard Penjual) ---

    /**
     * Membuat dan menampilkan kartu produk di halaman.
     */
    function renderProducts() {
        console.log('manajemen_harga.js: Entering renderProducts().');
        if (!productsListing) {
            console.error("manajemen_harga.js: Elemen dengan ID 'products-listing' tidak ditemukan.");
            return;
        }

        products = JSON.parse(localStorage.getItem('ecommerceProductCards')) || [];
        console.log('manajemen_harga.js: Products re-loaded for rendering:', products);

        productsListing.innerHTML = ''; // Bersihkan daftar produk yang ada

        if (products.length === 0) {
            noProductsMessage.classList.remove('hidden');
            console.log('manajemen_harga.js: No products found, showing message.');
            return;
        } else {
            noProductsMessage.classList.add('hidden');
            console.log('manajemen_harga.js: Products found, rendering cards.');
        }

        products.forEach((product) => {
            const productCard = document.createElement('article');
            productCard.className = 'product-card';
            productCard.setAttribute('tabindex', '0');
            productCard.setAttribute('role', 'group');
            productCard.setAttribute('aria-labelledby', `product-${product.id}-title`);
            productCard.setAttribute('aria-describedby', `product-${product.id}-category product-${product.id}-price product-${product.id}-quantity`);

            let buttonsHtml = '';

            // Tombol edit dan delete hanya untuk produk yang bukan produk sistem
            if (!product.isSystemProduct) {
                buttonsHtml += `
                    <button class="btn-edit" data-product-id="${product.id}" aria-label="Edit Produk ${product.name}">Edit</button>
                    <button class="btn-delete" data-product-id="${product.id}" aria-label="Hapus Produk ${product.name}">Hapus</button>
                `;
            }

            productCard.innerHTML = `
                <img src="${product.imageURL}"
                     alt="Foto Produk: ${product.name}"
                     class="product-image"
                     onerror="this.onerror=null;this.src='[https://placehold.co/400x250/C6D8D5/3D5757?text=Gambar+Tidak+Ada](https://placehold.co/400x250/C6D8D5/3D5757?text=Gambar+Tidak+Ada)';">
                <div class="product-info">
                    <h2 class="product-title" id="product-${product.id}-title">${product.name}</h2>
                    <p class="product-category" id="product-${product.id}-category">Kategori: ${product.category}</p>
                    <p class="product-price" id="product-${product.id}-price">${formatRupiah(product.price)}</p>
                    <p class="product-quantity" id="product-${product.id}-quantity">Stok: ${formatQuantity(product.quantity)} ${product.unit}</p>
                    ${buttonsHtml}
                </div>
            `;
            productsListing.appendChild(productCard);
        });
    }

    /**
     * Menangani klik tombol Edit pada kartu produk.
     * Mengarahkan ke manajemen_jual.html untuk mengedit produk.
     * @param {Event} event - Objek event dari klik tombol.
     */
    function handleEdit(event) {
        const productId = event.target.dataset.productId;
        const product = products.find(p => p.id === productId);
        if (product && product.isSystemProduct) {
            console.warn(`manajemen_harga.js: Attempted to edit a system product (ID: ${productId}). Action blocked.`);
            showNotification('Produk ini adalah produk sistem dan tidak dapat diedit.', 'error');
            return;
        }

        console.log('manajemen_harga.js: Edit button clicked for product ID:', productId);
        window.location.href = `manajemen_jual.html?edit=true&id=${productId}`;
    }

    /**
     * Menangani klik tombol Hapus pada kartu produk.
     * Menghapus produk dari Local Storage dan merender ulang.
     * @param {Event} event - Objek event dari klik tombol.
     */
    function handleDelete(event) {
        const productId = event.target.dataset.productId;
        const productIndex = products.findIndex(p => p.id === productId);
        console.log('manajemen_harga.js: Delete button clicked for product ID:', productId);

        const product = products[productIndex];
        if (product && product.isSystemProduct) {
            console.warn(`manajemen_harga.js: Attempted to delete a system product (ID: ${productId}). Action blocked.`);
            showNotification('Produk ini adalah produk sistem dan tidak dapat dihapus.', 'error');
            return;
        }

        if (productIndex !== -1) {
            if (confirm(`Apakah Anda yakin ingin menghapus produk "${products[productIndex].name}" ini?`)) {
                products.splice(productIndex, 1);
                localStorage.setItem('ecommerceProductCards', JSON.stringify(products));
                renderProducts();
                showNotification('Produk berhasil dihapus!');
                console.log('manajemen_harga.js: Product deleted. New products array:', products);
            }
        }
    }

    // --- FUNGSI MANAJEMEN PESANAN (Simulasi Pembelian & Pengiriman) ---

    /**
     * Mensimulasikan adanya pembelian baru oleh 'sistem'.
     * Memilih produk acak dari daftar yang tersedia dan membuat pesanan.
     */
    function simulatePurchase() {
        console.log('manajemen_harga.js: simulatePurchase() triggered.');
        // Filter produk yang bisa dibeli (stok > 0 dan bukan produk sistem)
        const purchasableProducts = products.filter(p => p.quantity > 0 && !p.isSystemProduct);

        if (purchasableProducts.length === 0) {
            showNotification('Tidak ada produk yang tersedia untuk simulasi pembelian (stok habis atau semua produk sistem)!', 'error', 5000);
            return;
        }

        const productToBuy = purchasableProducts[Math.floor(Math.random() * purchasableProducts.length)];
        // Beli minimal 1, maksimal 3, dan tidak lebih dari stok yang ada
        const quantityToBuy = Math.max(1, Math.min(Math.floor(Math.random() * 3) + 1, productToBuy.quantity));

        if (quantityToBuy === 0) {
            showNotification(`Stok ${productToBuy.name} tidak mencukupi untuk simulasi pembelian.`, 'error');
            return;
        }

        const orderItem = {
            productId: productToBuy.id,
            name: productToBuy.name,
            price: productToBuy.price,
            quantity: quantityToBuy,
            unit: productToBuy.unit
        };

        const productIndex = products.findIndex(p => p.id === productToBuy.id);
        if (productIndex !== -1) {
            products[productIndex].quantity -= quantityToBuy;
            localStorage.setItem('ecommerceProductCards', JSON.stringify(products));
            renderProducts();
        }

        const newOrder = {
            id: 'ORD-' + Date.now().toString().slice(-8) + Math.floor(Math.random() * 1000),
            date: new Date().toLocaleString(),
            createdAt: Date.now(),
            items: [orderItem],
            totalPrice: orderItem.price * orderItem.quantity,
            status: 'pending'
        };

        pendingOrders.push(newOrder);
        localStorage.setItem('pendingOrders', JSON.stringify(pendingOrders));

        showNotification(`Simulasi pembelian produk "${productToBuy.name}" (x${quantityToBuy}) berhasil. Pesanan menunggu pengiriman.`, 'info', 6000);
        console.log('manajemen_harga.js: Simulated purchase. New order:', newOrder);
        updateOrderModal();

        const cancelId = setTimeout(() => {
            cancelOrder(newOrder.id);
        }, CANCELLATION_TIMEOUT);
        cancellationTimeouts[newOrder.id] = cancelId;
        console.log(`manajemen_harga.js: Set cancellation timeout for Order ID ${newOrder.id.substring(0,8)}...`);
    }

    /**
     * Memperbarui tampilan modal daftar pesanan.
     */
    function updateOrderModal() {
        pendingOrders = JSON.parse(localStorage.getItem('pendingOrders')) || [];
        orderListing.innerHTML = '';

        if (pendingOrders.length === 0) {
            emptyOrdersMessage.classList.remove('hidden');
        } else {
            emptyOrdersMessage.classList.add('hidden');
            const sortedOrders = [...pendingOrders].sort((a, b) => {
                const statusOrder = { 'pending': 1, 'shipped': 2, 'cancelled': 3 };
                if (statusOrder[a.status] !== statusOrder[b.status]) {
                    return statusOrder[a.status] - statusOrder[b.status];
                }
                return new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date);
            });

            sortedOrders.forEach(order => {
                const orderItemDiv = document.createElement('div');
                orderItemDiv.className = 'order-item';

                let itemsHtml = order.items.map(item => `
                    ${item.name} (${formatRupiah(item.price)}) x ${item.quantity} ${item.unit || 'unit'}
                `).join('<br>');

                let shipButtonHtml = '';
                let statusClass = '';
                let statusText = '';
                let timestampInfo = `Tanggal Pesan: ${order.date}<br>`;

                if (order.status === 'pending') {
                    shipButtonHtml = `<button class="btn-ship-order" data-order-id="${order.id}">Kirim Pesanan</button>`;
                    statusClass = 'pending';
                    statusText = 'PENDING';
                    const timeRemaining = cancellationTimeouts[order.id] ?
                        (order.createdAt + CANCELLATION_TIMEOUT - Date.now()) : -1;

                    if (timeRemaining > 0) {
                        timestampInfo += `Batas Kirim: ${Math.ceil(timeRemaining / 1000)} detik tersisa`;
                    } else if (timeRemaining <= 0 && !cancellationTimeouts[order.id]) {
                                timestampInfo += `Batas Kirim: Habis`;
                    }
                } else if (order.status === 'shipped') {
                    statusClass = 'shipped';
                    statusText = 'TERKIRIM';
                    if (order.shippedAt) {
                        timestampInfo += `Terkirim: ${new Date(order.shippedAt).toLocaleString()}`;
                    }
                } else if (order.status === 'cancelled') {
                    statusClass = 'error';
                    statusText = 'DIBATALKAN';
                    if (order.cancelledAt) {
                        timestampInfo += `Dibatalkan: ${new Date(order.cancelledAt).toLocaleString()}`;
                    }
                }

                orderItemDiv.innerHTML = `
                    <div class="order-item-info">
                        <strong>Order ID: ${order.id.substring(0, 8)}</strong><br>
                        ${timestampInfo}<br>
                        Produk:<br>${itemsHtml}<br>
                        Total Pembelian: ${formatRupiah(order.totalPrice)}<br>
                        Status: <span class="order-status ${statusClass}">${statusText}</span>
                    </div>
                    ${shipButtonHtml}
                `;
                orderListing.appendChild(orderItemDiv);
            });
        }

        sellerBalanceSpan.textContent = formatRupiah(sellerBalance);
    }

    /**
     * Menandai pesanan sebagai 'terkirim' dan menambahkan dana ke saldo penjual.
     * Fungsi ini dipanggil secara manual dari klik tombol "Kirim Pesanan".
     * @param {string} orderId - ID pesanan yang akan dikirim.
     */
    function markOrderAsShipped(orderId) {
        let orderToShip = pendingOrders.find(order => order.id === orderId && order.status === 'pending');

        if (orderToShip) {
            orderToShip.status = 'shipped';
            orderToShip.shippedAt = new Date().toISOString();

            if (cancellationTimeouts[orderToShip.id]) {
                clearTimeout(cancellationTimeouts[orderToShip.id]);
                delete cancellationTimeouts[orderToShip.id];
                console.log(`manajemen_harga.js: Cleared cancellation timeout for Order ID ${orderToShip.id.substring(0,8)}...`);
            }

            sellerBalance += orderToShip.totalPrice;
            localStorage.setItem('sellerBalance', sellerBalance.toString());
            localStorage.setItem('pendingOrders', JSON.stringify(pendingOrders));

            showNotification(`Pesanan ID ${orderToShip.id.substring(0, 8)}... berhasil dikirim! Saldo bertambah ${formatRupiah(orderToShip.totalPrice)}.`, 'success', 7000);
            console.log(`manajemen_harga.js: Order ${orderToShip.id} shipped. Seller balance updated: ${formatRupiah(sellerBalance)}`);
            updateOrderModal();
            renderReport();
        } else {
            showNotification('Gagal mengirim pesanan atau pesanan sudah tidak pending/tidak ditemukan.', 'error');
        }
    }

    /**
     * Membatalkan pesanan dan mengembalikan stok produk yang terkait.
     * Fungsi ini dipanggil secara otomatis jika pesanan tidak dikirim dalam batas waktu.
     * @param {string} orderId - ID pesanan yang akan dibatalkan.
     */
    function cancelOrder(orderId) {
        const orderIndex = pendingOrders.findIndex(order => order.id === orderId);

        if (orderIndex !== -1 && pendingOrders[orderIndex].status === 'pending') {
            const order = pendingOrders[orderIndex];
            order.status = 'cancelled';
            order.cancelledAt = new Date().toISOString();

            order.items.forEach(item => {
                const productIndex = products.findIndex(p => p.id === item.productId);
                if (productIndex !== -1) {
                    products[productIndex].quantity += item.quantity;
                }
            });
            localStorage.setItem('ecommerceProductCards', JSON.stringify(products));
            renderProducts();

            localStorage.setItem('pendingOrders', JSON.stringify(pendingOrders));

            showNotification(`Pesanan ID ${order.id.substring(0, 8)}... dibatalkan otomatis (tidak dikirim dalam ${CANCELLATION_TIMEOUT/1000} detik). Stok dikembalikan.`, 'error', 7000);
            console.log(`manajemen_harga.js: Order ${order.id} cancelled. Stock refunded.`);
            updateOrderModal();
            renderReport();
        }

        if (cancellationTimeouts[orderId]) {
            clearTimeout(cancellationTimeouts[orderId]);
            delete cancellationTimeouts[orderId];
        }
    }

    // FUNGSI LAPORAN PENJUALAN (dengan Filter Tanggal)
    function renderReport() {
        pendingOrders = JSON.parse(localStorage.getItem('pendingOrders')) || [];
        const filterStatus = reportStatusFilter.value;
        const searchTerm = reportSearchInput.value.toLowerCase();

        // --- Ambil nilai tanggal dari input ---
        const startDateValue = reportStartDateInput.value;
        const endDateValue = reportEndDateInput.value;

        let startDate = null;
        let endDate = null;

        if (startDateValue) {
            startDate = new Date(startDateValue);
            startDate.setHours(0, 0, 0, 0); // Atur waktu ke awal hari
        }
        if (endDateValue) {
            endDate = new Date(endDateValue);
            endDate.setHours(23, 59, 59, 999); // Atur waktu ke akhir hari
        }
        // --- Akhir pengambilan nilai tanggal ---

        // Filter dan urutkan pesanan untuk laporan
        const filteredOrders = pendingOrders.filter(order => {
            const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
            const matchesSearch = searchTerm === '' ||
                                    order.id.toLowerCase().includes(searchTerm) ||
                                    order.items.some(item => item.name.toLowerCase().includes(searchTerm));

            // --- Filter berdasarkan tanggal ---
            const orderDate = new Date(order.date); // Konversi string tanggal pesanan menjadi objek Date
            let matchesDate = true;
            if (startDate && orderDate < startDate) {
                matchesDate = false;
            }
            if (endDate && orderDate > endDate) {
                matchesDate = false;
            }
            // --- Akhir filter tanggal ---

            return matchesStatus && matchesSearch && matchesDate; // Gabungkan semua kriteria filter
        }).sort((a, b) => new Date(b.date) - new Date(a.date)); // Urutkan dari yang terbaru

        reportListing.innerHTML = '';
        let totalSalesCount = 0;
        let totalRevenue = 0;

        if (filteredOrders.length === 0) {
            emptyReportMessage.classList.remove('hidden');
        } else {
            emptyReportMessage.classList.add('hidden');
            filteredOrders.forEach(order => {
                const reportItemDiv = document.createElement('div');
                reportItemDiv.className = 'report-item';

                let itemsHtml = order.items.map(item => `
                    ${item.name} (${formatRupiah(item.price)}) x ${item.quantity} ${item.unit || 'unit'}
                `).join('<br>');

                let statusClass = '';
                let statusText = '';

                if (order.status === 'shipped') {
                    statusClass = 'shipped';
                    statusText = 'TERKIRIM';
                    totalSalesCount++;
                    totalRevenue += order.totalPrice;
                } else if (order.status === 'cancelled') {
                    statusClass = 'error';
                    statusText = 'DIBATALKAN';
                } else if (order.status === 'pending') {
                    statusClass = 'pending';
                    statusText = 'PENDING';
                }

                reportItemDiv.innerHTML = `
                    <div class="report-item-info">
                        <strong>Order ID: ${order.id.substring(0, 8)}</strong><br>
                        Tanggal: ${order.date}<br>
                        Produk:<br>${itemsHtml}<br>
                        Total: ${formatRupiah(order.totalPrice)}<br>
                        Status: <span class="order-status ${statusClass}">${statusText}</span>
                    </div>
                `;
                reportListing.appendChild(reportItemDiv);
            });
        }

        totalSalesCountSpan.textContent = totalSalesCount;
        totalRevenueSpan.textContent = formatRupiah(totalRevenue);
    }

    // FUNGSI PENARIKAN SALDO
    function showWithdrawalModal() {
        currentBalanceWithdrawSpan.textContent = formatRupiah(sellerBalance);
        withdrawAmountInput.value = '';
        invoiceArea.innerHTML = '';
        withdrawModal.style.display = 'block';
    }

    function processWithdrawal() {
        const amountToWithdraw = parseFloat(withdrawAmountInput.value);

        if (isNaN(amountToWithdraw) || amountToWithdraw <= 0) {
            showNotification('Jumlah penarikan tidak valid.', 'error');
            return;
        }

        if (amountToWithdraw > sellerBalance) {
            showNotification('Saldo tidak mencukupi untuk penarikan ini.', 'error');
            return;
        }

        if (amountToWithdraw < 1000) {
            showNotification('Jumlah penarikan minimal Rp 1.000.', 'error');
            return;
        }

        if (confirm(`Apakah Anda yakin ingin menarik saldo sebesar ${formatRupiah(amountToWithdraw)}?`)) {
            sellerBalance -= amountToWithdraw;
            localStorage.setItem('sellerBalance', sellerBalance.toString());

            const withdrawal = {
                id: 'WD-' + Date.now().toString().slice(-8) + Math.floor(Math.random() * 1000),
                date: new Date().toLocaleString(),
                amount: amountToWithdraw,
                status: 'completed'
            };
            withdrawalHistory.push(withdrawal);
            localStorage.setItem('withdrawalHistory', JSON.stringify(withdrawalHistory));

            currentBalanceWithdrawSpan.textContent = formatRupiah(sellerBalance);
            sellerBalanceSpan.textContent = formatRupiah(sellerBalance);

            showNotification(`Penarikan ${formatRupiah(amountToWithdraw)} berhasil!`, 'success', 5000);
            console.log('manajemen_harga.js: Withdrawal processed:', withdrawal);

            displayWithdrawalInvoice(withdrawal);
        }
    }

    function displayWithdrawalInvoice(withdrawal) {
        invoiceArea.innerHTML = `
            <h3>INVOICE PENARIKAN SALDO</h3>
            <p><strong>Invoice ID:</strong> ${withdrawal.id}</p>
            <p><strong>Tanggal:</strong> ${withdrawal.date}</p>
            <p><strong>Jumlah Penarikan:</strong> ${formatRupiah(withdrawal.amount)}</p>
            <p><strong>Status:</strong> ${withdrawal.status.toUpperCase()}</p>
            <p>Terima kasih atas transaksi Anda.</p>
        `;
    }

    // INISIALISASI EVENT LISTENERS (Tambahkan ini di bagian bawah script Anda)
    // Event listener untuk tombol Edit dan Hapus pada kartu produk
    if (productsListing) {
        productsListing.addEventListener('click', function(event) {
            if (event.target.classList.contains('btn-edit')) {
                handleEdit(event);
            } else if (event.target.classList.contains('btn-delete')) {
                handleDelete(event);
            }
        });
    }

    // Event listener untuk tombol "Refresh Produk"
    if (refreshProductsBtn) {
        refreshProductsBtn.addEventListener('click', function() {
            console.log('manajemen_harga.js: Refresh Products button clicked.');
            renderProducts();
            showNotification('Daftar produk diperbarui!', 'info');
        });
    }

    // Event listeners untuk tombol dan modal Pesanan
    if (simulatePurchaseBtn) {
        // simulatePurchaseBtn.addEventListener('click', simulatePurchase); // Nonaktifkan manual click, akan diotomatisasi
    }
    if (viewOrdersBtn) {
        viewOrdersBtn.addEventListener('click', function() {
            updateOrderModal();
            orderModal.style.display = 'block';
        });
    }
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', function() {
            orderModal.style.display = 'none';
        });
    }
    // Event listener untuk tombol Kirim Pesanan di dalam modal pesanan
    if (orderListing) {
        orderListing.addEventListener('click', function(event) {
            if (event.target.classList.contains('btn-ship-order')) {
                const orderId = event.target.dataset.orderId;
                markOrderAsShipped(orderId);
            }
        });
    }

    // Event listeners untuk Laporan Penjualan
    if (generateReportBtn) {
        generateReportBtn.addEventListener('click', function() {
            // ... (Your code for opening the report modal and rendering the report)
            renderReport(); // Call renderReport when the report button is clicked
            reportModal.style.display = 'block';
        });
    }

    if (closeReportModalBtn) {
        closeReportModalBtn.addEventListener('click', function() {
            reportModal.style.display = 'none';
        });
    }

    // Event listeners for report filters
    if (reportStatusFilter) {
        reportStatusFilter.addEventListener('change', renderReport);
    }
    if (reportSearchInput) {
        reportSearchInput.addEventListener('keyup', renderReport);
    }

    // Add event listeners for the new date filter inputs and button
    if (reportStartDateInput) {
        reportStartDateInput.addEventListener('change', renderReport);
    }
    if (reportEndDateInput) {
        reportEndDateInput.addEventListener('change', renderReport);
    }
    // No need for a separate applyReportFilterBtn listener if renderReport is called on change/keyup

    // Event listeners for Withdraw Balance
    if (withdrawBalanceBtn) {
        withdrawBalanceBtn.addEventListener('click', showWithdrawalModal);
    }
    if (closeWithdrawModalBtn) {
        closeWithdrawModalBtn.addEventListener('click', function() {
            withdrawModal.style.display = 'none';
        });
    }
    if (processWithdrawBtn) {
        processWithdrawBtn.addEventListener('click', processWithdrawal);
    }

    // Initialize all functionality on page load
    injectInitialProducts(); // Call this to ensure dummy data is there
    renderProducts(); // Display products when the page loads
    updateOrderModal(); // Initialize order modal display
    sellerBalanceSpan.textContent = formatRupiah(sellerBalance); // Display initial balance

    // Start automatic purchase simulation if not already running
    if (!purchaseIntervalId) {
        purchaseIntervalId = setInterval(simulatePurchase, PURCHASE_INTERVAL);
        console.log('manajemen_harga.js: Automatic purchase simulation started.');
    } else {
        console.log('manajemen_harga.js: Automatic purchase simulation already running.');
    }

    // Re-evaluate cancellation timers on page load
    pendingOrders.forEach(order => {
        if (order.status === 'pending' && !cancellationTimeouts[order.id]) {
            const timeElapsed = Date.now() - order.createdAt;
            const timeRemaining = CANCELLATION_TIMEOUT - timeElapsed;

            if (timeRemaining > 0) {
                const cancelId = setTimeout(() => {
                    cancelOrder(order.id);
                }, timeRemaining);
                cancellationTimeouts[order.id] = cancelId;
                console.log(`manajemen_harga.js: Resumed cancellation timeout for Order ID ${order.id.substring(0,8)}... (remaining: ${timeRemaining / 1000}s)`);
            } else {
                // If time already expired, cancel immediately
                cancelOrder(order.id);
            }
        }
    });

}); // End of DOMContentLoaded