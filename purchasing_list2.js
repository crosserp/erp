// purchasing_list2.js

document.addEventListener('DOMContentLoaded', function() {
    // --- Elemen DOM Utama ---
    const namaSupplierSelect = document.getElementById('nama_supplier'); // Select element
    const tanggalInput = document.getElementById('tanggal');
    const tableBody = document.getElementById('tableBody');
    const tambahBarangBtn = document.getElementById('tambah');
    const simpanBtn = document.getElementById('linkSimpan');
    const batalBtn = document.getElementById('linkBatal');
    const discIdSpan = document.getElementById('discId'); // Pastikan ID ini ada di HTML Anda
    const totalIdSpan = document.getElementById('totalId'); // Pastikan ID ini ada di HTML Anda

    // --- Data Global dari LocalStorage ---
    let supplierData = JSON.parse(localStorage.getItem('supplierData')) || [];
    // *** PERBAIKAN PENTING DI SINI: Kunci localStorage HARUS konsisten ***
    let rawMaterialData = JSON.parse(localStorage.getItem('rawMaterialMasterData')) || []; 
    let purchasingData = JSON.parse(localStorage.getItem('purchasingData')) || [];

    // Variabel untuk mode edit/update
    let updateIndex = null;

    // --- Fungsi Pembantu ---

    /**
     * Memformat angka menjadi string Rupiah (misal: "Rp 1.234.567").
     * @param {number|string} number - Angka yang akan diformat.
     * @returns {string} - String Rupiah yang sudah diformat.
     */
    function formatRupiah(number) {
        // Pastikan input adalah angka, jika tidak kembalikan "Rp 0"
        if (typeof number !== 'number' || isNaN(number)) {
            number = 0;
        }
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0 // Sesuaikan jika Anda butuh desimal (misal: 2)
        }).format(number);
    }

    /**
     * Mengurai string Rupiah atau angka yang diformat menjadi number.
     * Menggunakan parseFloat untuk mengakomodasi potensi nilai desimal.
     * @param {string} formattedString - String yang akan diurai (Rupiah atau angka dengan pemisah ribuan).
     * @returns {number} - Nilai number (bisa float jika ada desimal).
     */
    function parseRupiah(formattedString) {
        if (typeof formattedString !== 'string') {
            return 0;
        }
        // Hapus semua karakter non-digit kecuali koma/titik desimal
        // Ganti koma desimal ke titik (sesuai standar parseFloat)
        const cleaned = formattedString.replace(/Rp\s?/g, '').replace(/\./g, '').replace(/,/g, '.');
        return parseFloat(cleaned) || 0;
    }

    /**
     * Memformat input angka (misalnya kuantitas) dengan pemisah ribuan.
     * @param {HTMLInputElement} inputElement - Elemen input HTML.
     */
    function formatAngkaRibuan(inputElement) {
        let value = inputElement.value.replace(/\D/g, ''); // Hapus semua karakter non-digit
        if (value) {
            inputElement.value = new Intl.NumberFormat('id-ID').format(parseInt(value, 10));
        } else {
            inputElement.value = '';
        }
    }

    /**
     * Menghitung total harga untuk satu baris item.
     * @param {HTMLInputElement} inputElement - Elemen input yang memicu perhitungan (qty, harga, disc).
     */
    function hitungTotalHarga(inputElement) {
        const tr = inputElement.closest('tr');
        if (!tr) return;

        const qInput = tr.querySelector('.q');
        const hargaInput = tr.querySelector('.harga');
        const discInput = tr.querySelector('.disc');
        const totalHargaSpan = tr.querySelector('.totalHarga');

        const q = qInput ? parseRupiah(qInput.value) : 0;
        const harga = hargaInput ? parseRupiah(hargaInput.value) : 0;
        const discBaris = discInput ? parseRupiah(discInput.value) : 0;

        const subtotal = (q * harga);
        const totalBaris = subtotal - discBaris;

        if (totalHargaSpan) {
            totalHargaSpan.textContent = formatRupiah(totalBaris);
        }

        hitungTotalKeseluruhan(); // Perbarui total keseluruhan setelah setiap baris dihitung
    }

    /**
     * Menghitung total diskon keseluruhan dan total harga keseluruhan dari semua baris.
     */
    function hitungTotalKeseluruhan() {
        // Hanya jalankan jika tableBody sudah ada dan memiliki baris
        if (!tableBody || tableBody.children.length === 0) {
            if (discIdSpan) discIdSpan.textContent = formatRupiah(0);
            if (totalIdSpan) totalIdSpan.textContent = formatRupiah(0);
            return;
        }

        const tableRows = document.querySelectorAll('#tableBody tr');
        let totalDiscKeseluruhan = 0;
        let totalHargaKeseluruhan = 0;

        tableRows.forEach(row => {
            const discInput = row.querySelector('.disc');
            const totalHargaSpan = row.querySelector('.totalHarga');

            if (discInput) {
                totalDiscKeseluruhan += parseRupiah(discInput.value);
            }
            if (totalHargaSpan) {
                totalHargaKeseluruhan += parseRupiah(totalHargaSpan.textContent);
            }
        });

        // Pastikan elemen ada sebelum mencoba mengisi textContent
        if (discIdSpan) {
            discIdSpan.textContent = formatRupiah(totalDiscKeseluruhan);
        } else {
            console.warn("Elemen dengan ID 'discId' tidak ditemukan di DOM. Total diskon tidak dapat ditampilkan.");
        }
        
        if (totalIdSpan) {
            totalIdSpan.textContent = formatRupiah(totalHargaKeseluruhan);
        } else {
            console.warn("Elemen dengan ID 'totalId' tidak ditemukan di DOM. Total harga tidak dapat ditampilkan.");
        }
    }

    /**
     * Mengisi dropdown "Nama Supplier" dari data supplier.
     */
    function populateSupplierSelect() {
        if (!namaSupplierSelect) return;

        namaSupplierSelect.innerHTML = '<option value="">Pilih Pemasok</option>'; // Opsi default
        supplierData.forEach(supplier => {
            const option = document.createElement('option');
            option.value = supplier.namaSupplier;
            option.textContent = supplier.namaSupplier;
            namaSupplierSelect.appendChild(option);
        });
    }

    /**
     * Mengisi dropdown "Nama Barang" dari data raw material.
     * @param {HTMLSelectElement} selectElement - Elemen <select> untuk namaBarang.
     */
    function populateRawMaterialSelect(selectElement) {
        if (!selectElement) return;

        selectElement.innerHTML = '<option value="">Pilih Barang</option>'; // Opsi default
        rawMaterialData.forEach(material => {
            const option = document.createElement('option');
            // Menggunakan properti 'namaRawMaterial' untuk value dan textContent
            option.value = material.namaRawMaterial;
            option.textContent = material.namaRawMaterial;
            selectElement.appendChild(option);
        });
    }

    /**
     * Menambahkan baris baru ke tabel detail item.
     */
    function tambahBaris() {
        if (!tableBody) {
            console.error("Elemen 'tableBody' tidak ditemukan.");
            return;
        }

        // Batasi maksimal 5 baris
        if (tableBody.children.length >= 5) {
            alert('Maksimal 5 baris barang dapat ditambahkan!');
            return;
        }

        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td class="t"><select class="namaBarang"></select></td>
            <td class="t"><input type="text" class="q" value="0"></td>
            <td class="t"><input type="text" class="satuan" readonly></td>
            <td class="t"><input type="text" class="harga" value="${formatRupiah(0)}"></td>
            <td class="t"><input type="text" class="disc" value="${formatRupiah(0)}"></td>
            <td class="t"><span class="totalHarga">${formatRupiah(0)}</span></td>
            <td><button type="button" class="hapus-baris">Hapus</button></td>
        `;
        tableBody.appendChild(newRow);

        // Ambil elemen dari baris baru untuk event listener
        const namaBarangSelect = newRow.querySelector('.namaBarang');
        const qInput = newRow.querySelector('.q');
        const hargaInput = newRow.querySelector('.harga');
        const discInput = newRow.querySelector('.disc');
        const hapusBtn = newRow.querySelector('.hapus-baris');
        const satuanInput = newRow.querySelector('.satuan');

        // Isi dropdown nama barang
        populateRawMaterialSelect(namaBarangSelect);

        // Event listener untuk perubahan nama barang (untuk mengisi satuan)
        if (namaBarangSelect) {
            namaBarangSelect.addEventListener('change', function() {
                const selectedMaterialName = this.value;
                // Cari material berdasarkan nama yang dipilih
                const selectedMaterial = rawMaterialData.find(m => m.namaRawMaterial === selectedMaterialName);
                if (satuanInput) {
                    satuanInput.value = selectedMaterial ? selectedMaterial.satuanRawMaterial : '';
                }
                hitungTotalHarga(qInput); // Hitung ulang total untuk baris ini
            });
        }

        // Event listener untuk input kuantitas
        if (qInput) {
            qInput.addEventListener('input', function() { formatAngkaRibuan(this); }); // Gunakan 'input' untuk real-time formatting
            qInput.addEventListener('blur', function() { hitungTotalHarga(this); }); // Hitung total saat blur
        }

        // Event listener untuk input harga
        if (hargaInput) {
            hargaInput.addEventListener('input', function() { this.value = formatRupiah(parseRupiah(this.value)); });
            hargaInput.addEventListener('blur', function() { hitungTotalHarga(this); });
        }

        // Event listener untuk input diskon
        if (discInput) {
            discInput.addEventListener('input', function() { this.value = formatRupiah(parseRupiah(this.value)); });
            discInput.addEventListener('blur', function() { hitungTotalHarga(this); });
        }

        // Event listener untuk tombol hapus baris
        if (hapusBtn) {
            hapusBtn.addEventListener('click', function() {
                if (confirm('Apakah Anda yakin ingin menghapus baris ini?')) {
                    newRow.remove();
                    hitungTotalKeseluruhan(); // Perbarui total setelah baris dihapus
                }
            });
        }

        hitungTotalKeseluruhan(); // Perbarui total setelah baris baru ditambahkan
    }

    /**
     * Memuat data transaksi untuk mode pengeditan jika ada updateIndex di localStorage.
     */
    function loadDataForEdit() {
        const editIndexStored = localStorage.getItem('updateIndex');
        
        if (editIndexStored !== null && purchasingData[editIndexStored]) {
            updateIndex = parseInt(editIndexStored, 10); // Simpan indeks yang akan diupdate

            const dataToEdit = purchasingData[updateIndex];

            // Isi header form
            if (namaSupplierSelect) {
                namaSupplierSelect.value = dataToEdit.namaPemasok || '';
            }
            if (tanggalInput) {
                tanggalInput.value = dataToEdit.tanggal || '';
            }

            // Bersihkan dan isi ulang tabel detail item
            if (tableBody) {
                tableBody.innerHTML = '';
            } else {
                console.error("Elemen 'tableBody' tidak ditemukan saat memuat data edit.");
                return;
            }
            
            dataToEdit.items.forEach(item => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td class="t"><select class="namaBarang"></select></td>
                    <td class="t"><input type="text" class="q"></td>
                    <td class="t"><input type="text" class="satuan" readonly></td>
                    <td class="t"><input type="text" class="harga"></td>
                    <td class="t"><input type="text" class="disc"></td>
                    <td class="t"><span class="totalHarga"></span></td>
                    <td><button type="button" class="hapus-baris">Hapus</button></td>
                `;
                tableBody.appendChild(row);

                // Ambil elemen dari baris yang dimuat
                const namaBarangSelect = row.querySelector('.namaBarang');
                const qInput = row.querySelector('.q');
                const satuanInput = row.querySelector('.satuan');
                const hargaInput = row.querySelector('.harga');
                const discInput = row.querySelector('.disc');
                const totalHargaSpan = row.querySelector('.totalHarga');
                const hapusBtn = row.querySelector('.hapus-baris');

                // Isi dropdown dan set nilai
                populateRawMaterialSelect(namaBarangSelect);
                if (namaBarangSelect) {
                    namaBarangSelect.value = item.namaBarang || '';
                }
                
                // Set nilai input field dari data yang dimuat dan terapkan formatting
                if (qInput) {
                    qInput.value = item.q; // Tetapkan nilai asli
                    formatAngkaRibuan(qInput); // Terapkan format angka ribuan
                }
                if (satuanInput) {
                    satuanInput.value = item.satuan || '';
                }
                if (hargaInput) {
                    hargaInput.value = item.harga ? formatRupiah(parseRupiah(item.harga)) : formatRupiah(0);
                }
                if (discInput) {
                    discInput.value = item.disc ? formatRupiah(parseRupiah(item.disc)) : formatRupiah(0);
                }
                if (totalHargaSpan) {
                    totalHargaSpan.textContent = item.totalHarga ? formatRupiah(parseRupiah(item.totalHarga)) : formatRupiah(0);
                }

                // Lampirkan kembali event listener untuk baris yang diedit
                if (namaBarangSelect) {
                    namaBarangSelect.addEventListener('change', function() {
                        const selectedMaterialName = this.value;
                        const selectedMaterial = rawMaterialData.find(m => m.namaRawMaterial === selectedMaterialName);
                        if (satuanInput) {
                            satuanInput.value = selectedMaterial ? selectedMaterial.satuanRawMaterial : '';
                        }
                        hitungTotalHarga(qInput);
                    });
                }

                if (qInput) {
                    qInput.addEventListener('input', function() { formatAngkaRibuan(this); });
                    qInput.addEventListener('blur', function() { hitungTotalHarga(this); });
                }

                if (hargaInput) {
                    hargaInput.addEventListener('input', function() { this.value = formatRupiah(parseRupiah(this.value)); });
                    hargaInput.addEventListener('blur', function() { hitungTotalHarga(this); });
                }

                if (discInput) {
                    discInput.addEventListener('input', function() { this.value = formatRupiah(parseRupiah(this.value)); });
                    discInput.addEventListener('blur', function() { hitungTotalHarga(this); });
                }

                if (hapusBtn) {
                    hapusBtn.addEventListener('click', function() {
                        if (confirm('Apakah Anda yakin ingin menghapus baris ini?')) {
                            row.remove();
                            hitungTotalKeseluruhan();
                        }
                    });
                }
            });
            hitungTotalKeseluruhan(); // Hitung ulang total setelah semua baris dimuat
        } else {
            // Mode entri baru: tambahkan 1 baris kosong secara default
            tambahBaris();
        }
        localStorage.removeItem('updateIndex'); // Hapus updateIndex dari localStorage setelah digunakan (penting!)
    }

    /**
     * Menyimpan data transaksi pembelian ke localStorage.
     */
    function simpanData() {
        const namaPemasok = namaSupplierSelect ? namaSupplierSelect.value.trim() : '';
        const tanggal = tanggalInput ? tanggalInput.value.trim() : '';
        const tableRows = document.querySelectorAll('#tableBody tr');
        const items = [];

        // Validasi header
        if (!namaPemasok || !tanggal) {
            alert('Nama Pemasok dan Tanggal harus diisi!');
            return;
        }

        // Validasi detail item
        let hasValidItems = false;
        tableRows.forEach(row => {
            const namaBarangSelect = row.querySelector('.namaBarang');
            const qInput = row.querySelector('.q');
            const satuanInput = row.querySelector('.satuan');
            const hargaInput = row.querySelector('.harga');
            const discInput = row.querySelector('.disc');
            const totalHargaSpan = row.querySelector('.totalHarga');

            // Lakukan null check untuk setiap elemen sebelum mengambil nilai
            const namaBarang = namaBarangSelect ? namaBarangSelect.value : '';
            // Parse nilai numerik untuk validasi
            const qParsed = qInput ? parseRupiah(qInput.value) : 0;
            // Harga dan diskon juga perlu diparse untuk validasi jika perlu
            // const hargaParsed = hargaInput ? parseRupiah(hargaInput.value) : 0;
            // const discParsed = discInput ? parseRupiah(discInput.value) : 0;

            // Simpan sebagai string yang diformat
            const qFormatted = qInput ? qInput.value : '0';
            const hargaFormatted = hargaInput ? hargaInput.value : formatRupiah(0);
            const discFormatted = discInput ? discInput.value : formatRupiah(0);
            const totalHargaFormatted = totalHargaSpan ? totalHargaSpan.textContent : formatRupiah(0);


            // Hanya tambahkan item jika nama barang tidak kosong dan kuantitas valid (lebih dari 0)
            if (namaBarang && qParsed > 0) {
                items.push({
                    namaBarang: namaBarang,
                    q: qFormatted, 
                    satuan: satuanInput ? satuanInput.value : '',
                    harga: hargaFormatted, 
                    disc: discFormatted, 
                    totalHarga: totalHargaFormatted 
                });
                hasValidItems = true;
            }
        });

        if (!hasValidItems) {
            alert('Minimal ada satu item barang dengan kuantitas yang valid (Q > 0).');
            return;
        }

        // Objek data transaksi pembelian
        const dataEntry = {
            namaPemasok: namaPemasok,
            tanggal: tanggal,
            items: items,
            // Perbaikan: Pastikan elemen discIdSpan dan totalIdSpan ada sebelum mengakses textContent
            totalDisc: discIdSpan ? discIdSpan.textContent : formatRupiah(0),
            totalHarga: totalIdSpan ? totalIdSpan.textContent : formatRupiah(0)
        };

        // Dapatkan data terbaru dari localStorage lagi, untuk menghindari masalah konkurensi jika ada perubahan lain
        // Ini memastikan kita bekerja dengan data paling baru sebelum memodifikasinya
        purchasingData = JSON.parse(localStorage.getItem('purchasingData')) || [];

        if (updateIndex !== null) {
            // Mode Edit: Perbarui entri yang sudah ada
            // Pertahankan status isDiajukan jika ada dari data sebelumnya
            if (purchasingData[updateIndex] && typeof purchasingData[updateIndex].isDiajukan !== 'undefined') {
                dataEntry.isDiajukan = purchasingData[updateIndex].isDiajukan;
            } else {
                dataEntry.isDiajukan = false; // Default false jika tidak ada status sebelumnya
            }
            purchasingData[updateIndex] = dataEntry;
            alert('Data pembelian berhasil diperbarui!');
        } else {
            // Mode Tambah Baru: Tambahkan entri baru
            dataEntry.isDiajukan = false; // Set default isDiajukan untuk entri baru
            purchasingData.push(dataEntry);
            alert('Data pembelian berhasil disimpan!');
        }

        // Simpan kembali data purchasing ke localStorage
        localStorage.setItem('purchasingData', JSON.stringify(purchasingData));

        // Arahkan kembali ke halaman daftar purchasing_list.html
        window.location.href = 'purchasing_list.html';
    }

    // --- Inisialisasi Event Listeners ---
    if (tambahBarangBtn) {
        tambahBarangBtn.addEventListener('click', tambahBaris);
    }
    if (simpanBtn) {
        simpanBtn.addEventListener('click', simpanData);
    }
    if (batalBtn) {
        batalBtn.addEventListener('click', function(event) {
            event.preventDefault(); // Mencegah form submit default
            localStorage.removeItem('updateIndex'); // Hapus updateIndex jika ada
            window.location.href = 'purchasing_list.html';
        });
    }

    // --- Inisialisasi Saat Halaman Dimuat ---
    populateSupplierSelect(); // Isi dropdown supplier saat DOM siap
    loadDataForEdit(); // Panggil ini terakhir agar semua elemen dan data siap
});