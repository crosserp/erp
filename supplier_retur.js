document.addEventListener('DOMContentLoaded', function() {
    // --- Referensi Elemen HTML ---
    const rekapDataTableBody = document.getElementById('rekapSupplierDataTableBody');
    const prevPageBtn = document.getElementById('prevPageBtn');
    const nextPageBtn = document.getElementById('nextPageBtn');
    const pageNumbersSpan = document.getElementById('pageNumbers');

    // --- Pengaturan Paginasi ---
    const itemsPerPage = 5; // Jumlah baris per halaman
    let currentPage = 1;    // Halaman saat ini
    let allSupplierReturns = []; // Data retur dari localStorage (termasuk yang sudah diajukan, tapi akan difilter tampilannya)

    // --- Fungsi Pembantu untuk Format Angka dan Rupiah ---

    /**
     * Memformat angka menjadi string dengan pemisah ribuan.
     */
    function formatNumberWithDots(number) {
        if (number === null || number === undefined || number === '' || isNaN(Number(number))) {
            return '';
        }
        return new Intl.NumberFormat('id-ID').format(Number(number));
    }

    /**
     * Memformat angka menjadi string mata uang Rupiah.
     */
    function formatRupiah(angka) {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(angka);
    }

    // --- Fungsi Utama untuk Menampilkan Data ---

    /**
     * Memuat data retur dari localStorage.
     */
    function loadSupplierReturns() {
        try {
            const data = localStorage.getItem('allSupplierReturns');
            allSupplierReturns = JSON.parse(data) || [];
            // Pastikan setiap retur memiliki properti 'status', default 'Draft'
            allSupplierReturns = allSupplierReturns.map(retur => {
                if (!retur.status) {
                    retur.status = 'Draft'; // Status default jika belum ada
                }
                return retur;
            });
            // Urutkan berdasarkan ID terbaru
            allSupplierReturns.sort((a, b) => b.id - a.id); 
        } catch (e) {
            console.error("Error loading supplier returns from localStorage:", e);
            allSupplierReturns = [];
        }
    }

    /**
     * Menampilkan data retur ke dalam tabel sesuai halaman saat ini.
     */
    function displayReturns() {
        rekapDataTableBody.innerHTML = ''; // Bersihkan tabel
        const totalPages = Math.ceil(allSupplierReturns.length / itemsPerPage);

        // Hitung indeks awal dan akhir untuk halaman saat ini
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const currentReturns = allSupplierReturns.slice(startIndex, endIndex);

        if (currentReturns.length === 0) {
            rekapDataTableBody.innerHTML = `<tr><td colspan="9" style="text-align: center;">Tidak ada data retur supplier.</td></tr>`;
        } else {
            currentReturns.forEach(retur => {
                const row = document.createElement('tr');
                let itemsDetail = '';
                let quantitiesDetail = '';
                let keteranganDetail = '';

                if (retur.items && retur.items.length > 0) {
                    retur.items.forEach((item, index) => {
                        itemsDetail += `${item.namaRawMaterial || item.kodeRawMaterial || 'N/A'}`;
                        quantitiesDetail += `${formatNumberWithDots(item.kuantitas || 0)} ${item.satuanRawMaterial || 'N/A'}`;
                        keteranganDetail += `${item.keteranganRetur || '-'}`;

                        if (index < retur.items.length - 1) {
                            itemsDetail += '<br>';
                            quantitiesDetail += '<br>';
                            keteranganDetail += '<br>';
                        }
                    });
                } else {
                    itemsDetail = 'Tidak ada item raw material';
                    quantitiesDetail = '-';
                    keteranganDetail = '-';
                }

                // Tentukan tombol aksi berdasarkan status retur
                let actionButtons = '';
                if (retur.status === 'Draft') {
                    actionButtons = `
                        <button class="btn btn-warning btn-sm edit-btn" data-id="${retur.id}">Edit</button>
                        <button class="btn btn-danger btn-sm delete-btn" data-id="${retur.id}">Hapus</button>
                        <button class="btn btn-primary btn-sm submit-btn" data-id="${retur.id}">Ajukan</button>
                    `;
                } else if (retur.status === 'Diajukan') {
                    // Jika status 'Diajukan', tampilkan status dan tidak ada tombol aksi
                    actionButtons = `<span style="color: green; font-weight: bold;">Diajukan</span>`;
                }

                row.innerHTML = `
                    <td>${retur.tanggalRetur || '-'}</td>
                    <td>${retur.namaSupplier || '-'}</td>
                    <td>${retur.noNotaRetur || '-'}</td>
                    <td>${itemsDetail}</td>
                    <td>${quantitiesDetail}</td>
                    <td>${formatRupiah(retur.totalRetur || 0)}</td>
                    <td>${keteranganDetail}</td>
                    <td><span class="status-retur">${retur.status}</span></td>
                    <td>${actionButtons}</td>
                `;
                rekapDataTableBody.appendChild(row);
            });
        }

        updatePaginationControls();
    }

    /**
     * Memperbarui status tombol paginasi dan nomor halaman.
     */
    function updatePaginationControls() {
        const totalPages = Math.ceil(allSupplierReturns.length / itemsPerPage);
        pageNumbersSpan.textContent = `Halaman ${currentPage} dari ${totalPages || 1}`;

        prevPageBtn.disabled = (currentPage === 1);
        nextPageBtn.disabled = (currentPage === totalPages || allSupplierReturns.length === 0);
    }

    // --- Fungsi Aksi (Edit, Hapus, Ajukan) ---

    /**
     * Mengarahkan ke halaman input untuk mengedit retur.
     * @param {number} id ID retur yang akan diedit.
     */
    function editReturn(id) {
        localStorage.setItem('editReturSupplierId', id);
        window.location.href = 'supplier_retur_input.html';
    }

    /**
     * Menghapus retur dari data dan localStorage.
     * @param {number} id ID retur yang akan dihapus.
     */
    function deleteReturn(id) {
        if (confirm('Apakah Anda yakin ingin menghapus data retur ini?')) {
            allSupplierReturns = allSupplierReturns.filter(retur => retur.id !== id);
            localStorage.setItem('allSupplierReturns', JSON.stringify(allSupplierReturns));
            
            const totalPagesAfterDelete = Math.ceil(allSupplierReturns.length / itemsPerPage);
            if (currentPage > totalPagesAfterDelete && currentPage > 1) {
                currentPage = totalPagesAfterDelete;
            }
            
            displayReturns();
            alert('Data retur berhasil dihapus!');
        }
    }

    /**
     * Mengubah status retur menjadi 'Diajukan' di data lokal dan menyalinnya ke 'submittedSupplierReturns'.
     * @param {number} id ID retur yang akan diajukan.
     */
    function submitReturn(id) {
        if (confirm('Apakah Anda yakin ingin mengajukan retur ini? Retur yang sudah diajukan tidak dapat diedit atau dihapus dari halaman ini.')) {
            const returIndex = allSupplierReturns.findIndex(retur => retur.id === id);

            if (returIndex > -1) {
                const returToSubmit = allSupplierReturns[returIndex];

                // Validasi tambahan sebelum mengajukan
                if (!returToSubmit.items || returToSubmit.items.length === 0) {
                    alert('Tidak bisa mengajukan retur tanpa item bahan baku. Mohon lengkapi detail retur terlebih dahulu.');
                    return;
                }
                
                const hasInvalidItems = returToSubmit.items.some(item => 
                    !item.kodeRawMaterial || item.kuantitas <= 0 || item.harga <= 0
                );

                if (hasInvalidItems) {
                    alert('Tidak bisa mengajukan retur dengan item bahan baku yang tidak lengkap (kode, kuantitas, atau harga belum diisi dengan benar).');
                    return;
                }

                if (returToSubmit.totalRetur <= 0) {
                     alert('Tidak bisa mengajukan retur dengan total retur Rp 0. Pastikan kuantitas dan harga diisi dengan benar.');
                     return;
                }

                // Ubah status retur di array allSupplierReturns
                allSupplierReturns[returIndex].status = 'Diajukan';

                // Ambil data retur yang sudah diajukan dari localStorage
                let submittedReturns = JSON.parse(localStorage.getItem('submittedSupplierReturns')) || [];
                // Tambahkan salinan retur yang baru diajukan (PENTING: Salin objek agar tidak ada referensi yang sama)
                submittedReturns.push({ ...returToSubmit }); // Menggunakan spread operator untuk menyalin objek

                // Simpan kembali ke localStorage
                localStorage.setItem('submittedSupplierReturns', JSON.stringify(submittedReturns));
                // Simpan juga allSupplierReturns yang sudah diperbarui statusnya
                localStorage.setItem('allSupplierReturns', JSON.stringify(allSupplierReturns));
                
                // Perbarui tampilan tabel di halaman ini
                displayReturns(); 
                
                alert('Retur berhasil diajukan! Status telah diperbarui. Anda akan diarahkan ke halaman rekap retur yang diajukan.');
                
                // Redirect ke halaman rekap_retur.html
                // window.location.href = 'rekap_retur.html'; 
            }
        }
    }

    // --- Event Listeners Paginasi ---

    prevPageBtn.addEventListener('click', function() {
        if (currentPage > 1) {
            currentPage--;
            displayReturns();
        }
    });

    nextPageBtn.addEventListener('click', function() {
        const totalPages = Math.ceil(allSupplierReturns.length / itemsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            displayReturns();
        }
    });

    // --- Event Delegation untuk Tombol Edit, Hapus, & Ajukan ---
    rekapDataTableBody.addEventListener('click', function(event) {
        const target = event.target;
        const id = parseInt(target.dataset.id); 

        if (target.classList.contains('edit-btn')) {
            editReturn(id);
        } else if (target.classList.contains('delete-btn')) {
            deleteReturn(id);
        } else if (target.classList.contains('submit-btn')) { 
            submitReturn(id);
        }
    });

    // --- Inisialisasi Awal Halaman ---
    loadSupplierReturns(); // Muat data saat DOMContentLoaded
    displayReturns();     // Tampilkan data pertama kali
});