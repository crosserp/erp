// // finished_good2.js

// document.addEventListener('DOMContentLoaded', function() {
//   // --- Ambil Referensi Elemen HTML ---
//   const tanggalInput = document.getElementById('tanggal');
//   const kodeProdukSelect = document.getElementById('kode_produk');
//   const namaProdukInput = document.getElementById('nama_produk');
//   const satuanInput = document.getElementById('satuan');
//   const totalBarangInput = document.getElementById('totalBarang'); // Input 'Total Barang' dari HTML
//   const totalIdSpan = document.getElementById('totalId'); // Span untuk menampilkan total di bawah tabel input
//   const simpanButton = document.getElementById('simpanButton');
//   const batalButton = document.getElementById('batalButton');
//   const errorMessageDiv = document.getElementById('errorMessage');

//   // --- Sumber Data: Muat data produk dari localStorage ---
//   // Diasumsikan 'produkData' sudah ada di localStorage dari data_produk2.js
//   const produkData = JSON.parse(localStorage.getItem('produkData')) || [];
//   console.log("DEBUG: produkData berhasil dimuat:", produkData);

//   // --- Fungsi untuk Mengisi Dropdown Kode Produk ---
//   function populateKodeProdukSelect() {
//       if (produkData.length === 0) {
//           errorMessageDiv.textContent = "Tidak ada data produk ditemukan. Harap tambahkan produk di halaman data produk terlebih dahulu.";
//           kodeProdukSelect.innerHTML = '<option value="">-- Tidak ada produk --</option>';
//           simpanButton.disabled = true; // Nonaktifkan tombol simpan jika tidak ada produk
//           return;
//       }

//       produkData.forEach(produk => {
//           const option = document.createElement('option');
//           option.value = produk.kodeProduk;
//           option.textContent = `${produk.kodeProduk} - ${produk.namaProduk}`;
//           kodeProdukSelect.appendChild(option);
//       });
//       console.log("DEBUG: Dropdown Kode Produk berhasil diisi.");
//   }

//   // --- Fungsi untuk Mengisi Nama Barang dan Satuan Otomatis ---
//   function updateProductDetails() {
//       const selectedKode = kodeProdukSelect.value;
//       const selectedProduk = produkData.find(p => p.kodeProduk === selectedKode);

//       if (selectedProduk) {
//           namaProdukInput.value = selectedProduk.namaProduk;
//           satuanInput.value = selectedProduk.satuanProduk;
//           console.log(`DEBUG: Produk terpilih: ${selectedProduk.namaProduk}, Satuan: ${selectedProduk.satuanProduk}`);
//       } else {
//           namaProdukInput.value = '';
//           satuanInput.value = '';
//           console.log("DEBUG: Tidak ada produk dipilih atau ditemukan.");
//       }
//       updateTotal(); // Perbarui total juga ketika detail produk berubah
//   }

//   // --- Fungsi untuk Memperbarui Tampilan Total Barang ---
//   function updateTotal() {
//       // Mengambil nilai dari input totalBarang
//       const value = parseFloat(totalBarangInput.value); 
      
//       // Memastikan nilai adalah angka dan tidak negatif
//       if (!isNaN(value) && value >= 0) {
//           totalIdSpan.textContent = value.toFixed(0); // Tampilkan sebagai bilangan bulat
//       } else {
//           totalIdSpan.textContent = '0'; // Jika tidak valid, tampilkan 0
//       }
//       console.log("DEBUG: Total Barang diperbarui menjadi:", totalIdSpan.textContent);
//   }

//   // --- Fungsi untuk Menangani Proses Simpan Data ---
//   function simpanData() {
//       errorMessageDiv.textContent = ''; // Bersihkan pesan error sebelumnya

//       const tanggal = tanggalInput.value;
//       const kodeProduk = kodeProdukSelect.value;
//       const namaProduk = namaProdukInput.value;
//       const satuan = satuanInput.value;
      
//       // --- PENTING: Penanganan Total Barang ---
//       // Dapatkan nilai dari input 'totalBarangInput'
//       const totalBarangInputValue = totalBarangInput.value.trim();
//       const jumlahBarang = parseFloat(totalBarangInputValue); // Parse string ke angka
      
//       // --- Validasi Input ---
//       if (!tanggal) {
//           errorMessageDiv.textContent = "Tanggal harus diisi.";
//           return;
//       }
//       if (!kodeProduk) {
//           errorMessageDiv.textContent = "Kode Produk harus dipilih.";
//           return;
//       }
//       // Nama Barang dan Satuan seharusnya terisi otomatis, tapi kita validasi
//       if (!namaProduk || !satuan) {
//            errorMessageDiv.textContent = "Nama Barang atau Satuan tidak terisi otomatis. Pilih Kode Produk yang valid.";
//            return;
//       }
//       // Validasi khusus untuk jumlahBarang: pastikan bukan kosong, angka, dan tidak negatif
//       if (totalBarangInputValue === '' || isNaN(jumlahBarang) || jumlahBarang < 0) {
//           errorMessageDiv.textContent = "Jumlah Barang harus angka positif dan tidak boleh kosong.";
//           return;
//       }

//       // Ambil data finished goods yang sudah ada dari localStorage
//       let finishedGoodsData = JSON.parse(localStorage.getItem('finishedGoodsData')) || [];

//       // Buat objek entri data baru
//       const newEntry = {
//           id: Date.now(), // ID unik berdasarkan timestamp
//           tanggal: tanggal,
//           kodeProduk: kodeProduk,
//           namaProduk: namaProduk,
//           satuan: satuan,
//           jumlahBarang: jumlahBarang, // Pastikan menggunakan properti 'jumlahBarang' dan nilai yang sudah divalidasi
//           terpakai: 0, // Default nilai 'Terpakai'
//           keterangan: '', // Default nilai 'Keterangan'
//           timestamp: new Date().toISOString() // Untuk melacak waktu penyimpanan
//       };

//       finishedGoodsData.push(newEntry);
//       localStorage.setItem('finishedGoodsData', JSON.stringify(finishedGoodsData));

//       alert('Data Finished Good berhasil disimpan!');
//       console.log("DEBUG: Data Finished Good berhasil disimpan:", newEntry);

//       // --- Arahkan ke halaman finished_good.html setelah berhasil simpan ---
//       window.location.href = 'finished_good.html';
//   }

//   // --- Event Listener ---
//   // Panggil fungsi pengisian dropdown saat halaman dimuat
//   populateKodeProdukSelect(); 

//   // Event listener untuk perubahan pada dropdown Kode Produk
//   kodeProdukSelect.addEventListener('change', updateProductDetails);

//   // Event listener untuk setiap kali ada input pada field Total Barang
//   totalBarangInput.addEventListener('input', updateTotal);

//   // Event listener untuk tombol Simpan
//   simpanButton.addEventListener('click', simpanData);
  
//   // Event listener untuk tombol Batal
//   batalButton.addEventListener('click', function() {
//       if (confirm('Apakah Anda yakin ingin membatalkan? Perubahan tidak akan disimpan.')) {
//           console.log("DEBUG: Transaksi dibatalkan. Mengarahkan ke finished_good.html.");
//           window.location.href = 'finished_good.html'; // Kembali ke halaman daftar
//       }
//   });

//   // --- Pengaturan Awal Saat Halaman Dimuat ---
//   // Set tanggal default ke hari ini
//   tanggalInput.value = new Date().toISOString().split('T')[0];
// });






// finished_good2.js

document.addEventListener('DOMContentLoaded', function() {
    // --- Ambil Referensi Elemen HTML ---
    const tanggalInput = document.getElementById('tanggal'); 
    const kodeProdukSelect = document.getElementById('kode_produk');
    const namaProdukInput = document.getElementById('nama_produk');
    const satuanInput = document.getElementById('satuan');
    const barangMasukInput = document.getElementById('barang_masuk_input');
    const barangKeluarInput = document.getElementById('barang_keluar_input');
    const totalBarangDisplay = document.getElementById('total_barang_display'); 
    const simpanButton = document.getElementById('simpanButton');
    const batalButton = document.getElementById('batalButton');
    const errorMessageDiv = document.getElementById('errorMessage');

    // --- Sumber Data: Muat data produk dari localStorage ---
    const produkData = JSON.parse(localStorage.getItem('produkData')) || [];

    // --- Variabel untuk menyimpan stok awal produk yang dipilih ---
    let initialProductStock = 0;
    // Variabel untuk menyimpan ID item yang sedang diedit (null jika mode tambah baru)
    let editingItemId = null; 

    // --- Helper Function untuk Memformat Angka dengan Titik Ribuan ---
    function formatNumber(num) {
        if (typeof num !== 'number' || isNaN(num)) {
            return '-'; 
        }
        return num.toLocaleString('id-ID');
    }

    // --- Fungsi untuk Mengisi Dropdown Kode Produk ---
    function populateKodeProdukSelect() {
        if (produkData.length === 0) {
            errorMessageDiv.textContent = "Tidak ada data produk ditemukan. Harap tambahkan produk di halaman data produk terlebih dahulu.";
            kodeProdukSelect.innerHTML = '<option value="">-- Tidak ada produk --</option>';
            simpanButton.disabled = true; 
            return;
        }

        const defaultOption = document.createElement('option');
        defaultOption.value = "";
        defaultOption.textContent = "-- Pilih Kode Produk --";
        kodeProdukSelect.appendChild(defaultOption);

        produkData.forEach(produk => {
            const option = document.createElement('option');
            option.value = produk.kodeProduk;
            option.textContent = `${produk.kodeProduk} - ${produk.namaProduk}`;
            kodeProdukSelect.appendChild(option);
        });
    }

    // --- Fungsi untuk Mengisi Nama Barang dan Satuan Otomatis ---
    function updateProductDetails() {
        const selectedKode = kodeProdukSelect.value;
        const selectedProduk = produkData.find(p => p.kodeProduk === selectedKode);

        if (selectedProduk) {
            namaProdukInput.value = selectedProduk.namaProduk;
            satuanInput.value = selectedProduk.satuanProduk;
            // Saat produk dipilih (atau di mode edit), muat stok terakhirnya
            loadCurrentStock(selectedKode, editingItemId); 
        } else {
            // Reset semua field jika tidak ada produk yang dipilih
            namaProdukInput.value = '';
            satuanInput.value = '';
            barangMasukInput.value = '0';
            barangKeluarInput.value = '0';
            totalBarangDisplay.value = '0'; 
            initialProductStock = 0; 
        }
        updateTotalBarangDisplayed(); 
    }

    // --- Fungsi untuk Memuat Stok Terakhir dari Produk Terpilih ---
    function loadCurrentStock(kodeProduk, currentEditingId = null) {
        const finishedGoodsData = JSON.parse(localStorage.getItem('finishedGoodsData')) || [];
        
        // Filter data untuk kodeProduk yang sama
        let relevantEntries = finishedGoodsData.filter(item => item.kodeProduk === kodeProduk);

        // Jika sedang mode edit, kecualikan item yang sedang diedit dari perhitungan stok awal
        // Karena stok awal harusnya adalah stok sebelum transaksi yang sedang diedit ini
        if (currentEditingId) {
            relevantEntries = relevantEntries.filter(item => item.id !== currentEditingId);
        }

        // Cari entri terakhir dari data yang relevan
        const latestEntry = relevantEntries
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .shift(); 

        initialProductStock = latestEntry ? (latestEntry.totalBarangAkhir || 0) : 0;
        
        totalBarangDisplay.value = formatNumber(initialProductStock); 
        console.log(`DEBUG: Stok awal produk ${kodeProduk} (dihitung tanpa ID ${currentEditingId}): ${initialProductStock}`);
    }

    // --- Fungsi untuk Memperbarui Tampilan Total Barang Berdasarkan Input Masuk/Keluar ---
    function updateTotalBarangDisplayed() {
        const barangMasuk = parseFloat(barangMasukInput.value) || 0;
        const barangKeluar = parseFloat(barangKeluarInput.value) || 0;

        barangMasukInput.value = Math.max(0, barangMasuk);
        barangKeluarInput.value = Math.max(0, barangKeluar);

        const calculatedTotal = initialProductStock + barangMasuk - barangKeluar;
        
        totalBarangDisplay.value = formatNumber(Math.max(0, calculatedTotal)); 
    }

    // --- Fungsi untuk Menangani Proses Simpan Data (Tambah Baru atau Edit) ---
    function simpanData() {
        errorMessageDiv.textContent = ''; 

        const tanggal = tanggalInput.value;
        const kodeProduk = kodeProdukSelect.value;
        const namaProduk = namaProdukInput.value;
        const satuan = satuanInput.value;
        const barangMasuk = parseFloat(barangMasukInput.value) || 0;
        const barangKeluar = parseFloat(barangKeluarInput.value) || 0;

        // --- Validasi Input ---
        if (!tanggal) {
            errorMessageDiv.textContent = "Tanggal harus diisi.";
            return;
        }
        if (!kodeProduk) {
            errorMessageDiv.textContent = "Kode Produk harus dipilih.";
            return;
        }
        if (!namaProduk || !satuan) {
            errorMessageDiv.textContent = "Nama Barang atau Satuan tidak terisi otomatis. Pilih Kode Produk yang valid.";
            return;
        }
        if (barangMasuk === 0 && barangKeluar === 0 && !editingItemId) { // Hanya validasi ini jika bukan mode edit
            errorMessageDiv.textContent = "Masukkan jumlah Barang Masuk atau Barang Keluar.";
            return;
        }
        
        const currentStockAvailable = initialProductStock + barangMasuk;
        if (barangKeluar > currentStockAvailable) {
             errorMessageDiv.textContent = `Jumlah Barang Keluar (${formatNumber(barangKeluar)}) tidak boleh melebihi Total Barang yang tersedia (${formatNumber(currentStockAvailable)}).`;
             return;
        }

        let finishedGoodsData = JSON.parse(localStorage.getItem('finishedGoodsData')) || [];
        let newEntry;

        if (editingItemId) {
            // --- Mode Edit ---
            // Cari indeks item yang sedang diedit
            const indexToEdit = finishedGoodsData.findIndex(item => item.id === editingItemId);
            if (indexToEdit !== -1) {
                // Buat objek data yang diperbarui
                newEntry = {
                    ...finishedGoodsData[indexToEdit], // Salin properti yang sudah ada
                    tanggal: tanggal,
                    kodeProduk: kodeProduk, // Kode produk bisa berubah, tapi logikanya akan lebih kompleks jika kode berubah
                    namaProduk: namaProduk,
                    satuan: satuan,
                    barangMasuk: barangMasuk,
                    barangKeluar: barangKeluar,
                    // totalBarangAkhir akan dihitung ulang di bawah, jadi abaikan nilai lama
                    timestamp: new Date().toISOString() // Update timestamp untuk menandai kapan diedit
                };
                // Ganti entri lama dengan entri yang diperbarui
                finishedGoodsData[indexToEdit] = newEntry;

                alert('Data pergerakan barang berhasil diperbarui!');
                console.log("DEBUG: Data Finished Good berhasil diperbarui:", newEntry);
            } else {
                errorMessageDiv.textContent = "Data yang akan diedit tidak ditemukan.";
                console.error("ERROR: Data dengan ID", editingItemId, "tidak ditemukan untuk diedit.");
                return;
            }
        } else {
            // --- Mode Tambah Baru ---
            newEntry = {
                id: Date.now(), 
                tanggal: tanggal,
                kodeProduk: kodeProduk,
                namaProduk: namaProduk,
                satuan: satuan,
                barangMasuk: barangMasuk,
                barangKeluar: barangKeluar,
                // totalBarangAkhir akan dihitung ulang di bawah
                timestamp: new Date().toISOString() 
            };
            finishedGoodsData.push(newEntry);

            alert('Data pergerakan barang berhasil disimpan!');
            console.log("DEBUG: Data Finished Good berhasil disimpan (baru):", newEntry);
        }

        // --- Hitung Ulang Semua totalBarangAkhir setelah perubahan ---
        // Ini adalah langkah KRUSIAL untuk menjaga konsistensi stok
        const updatedFinishedGoodsData = calculateAllTotalBarangAkhir(finishedGoodsData);
        localStorage.setItem('finishedGoodsData', JSON.stringify(updatedFinishedGoodsData));
        
        // Hapus ID edit dari Local Storage setelah selesai
        localStorage.removeItem('editFinishedGoodsId');
        window.location.href = 'finished_good.html'; 
    }

    // --- Fungsi untuk Menghitung Ulang totalBarangAkhir untuk Semua Entri ---
    // Ini diperlukan karena perubahan pada satu entri bisa memengaruhi total selanjutnya
    function calculateAllTotalBarangAkhir(data) {
        // Kelompokkan data berdasarkan kode produk dan urutkan berdasarkan timestamp
        const groupedData = data.reduce((acc, item) => {
            if (!acc[item.kodeProduk]) {
                acc[item.kodeProduk] = [];
            }
            acc[item.kodeProduk].push(item);
            return acc;
        }, {});

        for (const kodeProduk in groupedData) {
            // Urutkan entri berdasarkan timestamp (paling lama ke paling baru)
            groupedData[kodeProduk].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

            let currentStock = 0;
            groupedData[kodeProduk].forEach(item => {
                currentStock = currentStock + (item.barangMasuk || 0) - (item.barangKeluar || 0);
                item.totalBarangAkhir = Math.max(0, currentStock); // Pastikan tidak negatif
            });
        }
        // Gabungkan kembali semua data yang sudah dihitung ulang
        return Object.values(groupedData).flat();
    }


    // --- Fungsi untuk Memuat Data untuk Mode Edit ---
    function loadDataForEdit() {
        const idToEdit = localStorage.getItem('editFinishedGoodsId');
        if (idToEdit) {
            editingItemId = parseFloat(idToEdit); // Pastikan ini adalah angka
            const finishedGoodsData = JSON.parse(localStorage.getItem('finishedGoodsData')) || [];
            const dataToEdit = finishedGoodsData.find(item => item.id === editingItemId);

            if (dataToEdit) {
                // Isi form dengan data yang akan diedit
                tanggalInput.value = dataToEdit.tanggal;
                kodeProdukSelect.value = dataToEdit.kodeProduk;
                // Nonaktifkan select kode produk agar tidak diubah saat edit untuk menjaga konsistensi data
                kodeProdukSelect.disabled = true; 
                
                // Panggil updateProductDetails untuk mengisi nama dan satuan otomatis
                // Ini juga akan memicu loadCurrentStock dengan ID yang dikecualikan
                updateProductDetails(); 

                namaProdukInput.value = dataToEdit.namaProduk; // Pastikan ini terisi juga
                satuanInput.value = dataToEdit.satuan;         // Pastikan ini terisi juga

                barangMasukInput.value = dataToEdit.barangMasuk || '0';
                barangKeluarInput.value = dataToEdit.barangKeluar || '0';
                
                // Karena kita sudah memuat stok awal yang benar di updateProductDetails,
                // totalBarangDisplay akan menampilkan stok yang benar untuk perhitungan di UI.

                // Setelah form terisi, panggil updateTotalBarangDisplayed untuk update total di UI
                updateTotalBarangDisplayed(); 
                
                console.log("DEBUG: Data untuk diedit berhasil dimuat:", dataToEdit);
                // Biarkan ID di localStorage sampai simpan berhasil
            } else {
                console.error("ERROR: Data dengan ID", idToEdit, "tidak ditemukan di Local Storage untuk diedit.");
                localStorage.removeItem('editFinishedGoodsId'); // Hapus ID yang tidak valid
            }
        }
    }

    // --- Event Listener ---
    populateKodeProdukSelect(); 

    kodeProdukSelect.addEventListener('change', updateProductDetails);
    barangMasukInput.addEventListener('input', updateTotalBarangDisplayed);
    barangKeluarInput.addEventListener('input', updateTotalBarangDisplayed);

    simpanButton.addEventListener('click', simpanData);
    
    batalButton.addEventListener('click', function() {
        if (confirm('Apakah Anda yakin ingin membatalkan? Perubahan tidak akan disimpan.')) {
            localStorage.removeItem('editFinishedGoodsId'); // Hapus ID edit jika dibatalkan
            window.location.href = 'finished_good.html';
        }
    });

    // --- Pengaturan Awal Saat Halaman Dimuat ---
    if (tanggalInput) {
        tanggalInput.value = new Date().toISOString().split('T')[0];
    }

    // Panggil loadDataForEdit() saat halaman dimuat
    loadDataForEdit();

    // Pastikan nilai awal input barang masuk/keluar menjadi 0 dan update display total
    if (!editingItemId) { // Hanya reset jika bukan mode edit
        barangMasukInput.value = '0';
        barangKeluarInput.value = '0';
        totalBarangDisplay.value = '0'; 
    }
});