// perencanaan_produksi2.js

document.addEventListener('DOMContentLoaded', function() {
  // --- Elemen DOM Utama ---
  const tanggalProduksiInput = document.getElementById('tanggalProduksi');
  const namaProdukSelect = document.getElementById('namaProduk');
  const kodeProdukDisplay = document.getElementById('kodeProdukDisplay'); // Mengganti idProdukDisplay
  const satuanProdukDisplay = document.getElementById('satuanProdukDisplay'); // Menambah elemen untuk satuan produk
  const rawMaterialTableBody = document.getElementById('rawMaterialTableBody');
  const jumlahProduksiInput = document.getElementById('jumlahProduksi');
  const simpanBtn = document.getElementById('linkSimpan');
  const batalBtn = document.getElementById('linkBatal');
  const form = document.getElementById('perencanaanProduksiForm');

  // --- Data Global dari LocalStorage ---
  // Kunci ini HARUS sesuai dengan kunci yang digunakan di data_produk2.js
  const PRODUCT_MASTER_KEY = 'produkData'; 
  // const RAW_MATERIAL_MASTER_KEY = 'rawMaterialMasterData'; // Tidak lagi diperlukan karena RM ada di dalam data produk

  let productMasterData = JSON.parse(localStorage.getItem(PRODUCT_MASTER_KEY)) || [];
  let perencanaanProduksiData = JSON.parse(localStorage.getItem('perencanaanProduksiData')) || [];

  // Variabel untuk mode edit/update
  let updateIndex = null;
  let selectedProduct = null; // Menyimpan objek produk yang sedang dipilih

  // --- Fungsi Pembantu ---

  /**
   * Memformat angka dengan pemisah ribuan (misal: "1.234.567").
   * Digunakan untuk kuantitas.
   * @param {number|string} number - Angka yang akan diformat.
   * @returns {string} - String angka yang sudah diformat dengan pemisah ribuan.
   */
  function formatNumber(number) {
      if (typeof number === 'string') {
          // Coba parse string ke number terlebih dahulu
          number = parseFloat(number.replace(/\./g, '').replace(/,/g, '.'));
      }
      if (typeof number !== 'number' || isNaN(number)) {
          return '0'; // Default jika bukan angka
      }
      return new Intl.NumberFormat('id-ID').format(number);
  }

  /**
   * Mengurai string angka dengan pemisah ribuan menjadi number.
   * @param {string} formattedString - String yang akan diurai.
   * @returns {number} - Nilai number.
   */
  function parseNumber(formattedString) {
      if (typeof formattedString !== 'string') {
          return 0;
      }
      const cleaned = formattedString.replace(/\./g, '').replace(/,/g, '.');
      return parseFloat(cleaned) || 0;
  }


  /**
   * Mengisi dropdown "Pilih Produk" dari productMasterData.
   */
  function populateProdukSelect() {
      if (!namaProdukSelect) return;

      namaProdukSelect.innerHTML = '<option value="">-- Pilih Produk --</option>'; // Opsi default
      productMasterData.forEach(product => {
          const option = document.createElement('option');
          // Gunakan product.id sebagai value, karena itu yang unik di data_produk2.js Anda
          option.value = product.id; 
          option.textContent = product.namaProduk; // Menampilkan nama produk
          namaProdukSelect.appendChild(option);
      });
  }

  /**
   * Mengisi tabel raw material berdasarkan produk yang dipilih.
   * @param {Object} product - Objek produk yang dipilih.
   * @param {number} jumlahProduksi - Kuantitas produk yang akan dibuat.
   */
  function populateRawMaterialTable(product, jumlahProduksi = 1) {
      if (!rawMaterialTableBody) return;

      rawMaterialTableBody.innerHTML = ''; // Kosongkan tabel sebelumnya

      if (!product || !product.rawMaterials || product.rawMaterials.length === 0) {
          rawMaterialTableBody.innerHTML = `<tr><td colspan="6" class="text-center">Tidak ada data raw material untuk produk ini atau produk belum dipilih.</td></tr>`;
          return;
      }

      product.rawMaterials.forEach((rm, index) => {
          const row = document.createElement('tr');
          // rm.quantity dari data_produk2.js sudah berupa number (parseInt)
          const kuantitasDiperlukan = rm.quantity; 
          const totalKuantitas = kuantitasDiperlukan * jumlahProduksi;

          row.innerHTML = `
              <td>${index + 1}</td>
              <td>${rm.name || '-'}</td>
              <td>${formatNumber(kuantitasDiperlukan)}</td>
              <td>${rm.unit || '-'}</td>
              <td>${formatNumber(jumlahProduksi)}</td>
              <td>${formatNumber(totalKuantitas)}</td>
          `;
          rawMaterialTableBody.appendChild(row);
      });
  }

  /**
   * Memuat data transaksi perencanaan produksi untuk mode pengeditan jika ada updateIndex di localStorage.
   */
  function loadDataForEdit() {
      const editIndexStored = localStorage.getItem('updatePerencanaanProduksiIndex');
      
      if (editIndexStored !== null && perencanaanProduksiData[editIndexStored]) {
          updateIndex = parseInt(editIndexStored, 10); // Simpan indeks yang akan diupdate

          const dataToEdit = perencanaanProduksiData[updateIndex];

          // Isi header form
          if (tanggalProduksiInput) {
              tanggalProduksiInput.value = dataToEdit.tanggal || '';
          }
          if (namaProdukSelect) {
              // Di sini, kita harus mencari produk berdasarkan ID yang tersimpan (dataToEdit.idProduk)
              namaProdukSelect.value = dataToEdit.idProduk; 
              // Trigger change event untuk mengisi detail produk dan tabel raw material
              namaProdukSelect.dispatchEvent(new Event('change'));
          }
          if (jumlahProduksiInput) {
              // Pastikan nilai yang dimuat juga di-parse jika disimpan sebagai string format
              jumlahProduksiInput.value = parseNumber(dataToEdit.jumlahProduksi) || 1;
          }
          // Setelah mengisi jumlah produksi, hitung ulang tabel raw material
          // Ini akan dihandle oleh event listener 'change' pada namaProdukSelect
          // dan 'input' pada jumlahProduksiInput
      } else {
          // Mode entri baru: Set tanggal default ke hari ini
          tanggalProduksiInput.valueAsDate = new Date();
      }
      // Hapus updateIndex dari localStorage setelah digunakan (penting!)
      localStorage.removeItem('updatePerencanaanProduksiIndex'); 
  }


  /**
   * Menyimpan data perencanaan produksi ke localStorage.
   */
  function simpanData() {
      const tanggal = tanggalProduksiInput.value.trim();
      const idProduk = namaProdukSelect.value.trim(); // ID Produk yang dipilih (ID dari data_produk2.js)
      const namaProduk = namaProdukSelect.options[namaProdukSelect.selectedIndex].textContent; // Ambil nama produk dari textContent
      const jumlahProduksi = parseNumber(jumlahProduksiInput.value); // Pastikan ini number

      // Validasi input utama
      if (!tanggal || !idProduk || jumlahProduksi <= 0) {
          alert('Tanggal Produksi, Produk, dan Jumlah Produksi harus diisi dengan benar!');
          return;
      }

      if (!selectedProduct) {
          alert('Produk yang dipilih tidak valid. Mohon pilih ulang produk.');
          return;
      }

      // Kumpulkan data raw material yang terpakai
      const rawMaterialsUsed = [];
      const tableRows = rawMaterialTableBody.querySelectorAll('tr');

      // Pastikan ada baris RM di tabel sebelum mengiterasi
      // Cek apakah ada baris dan apakah baris pertama memiliki cell yang cukup (bukan baris "Tidak ada data")
      if (tableRows.length > 0 && tableRows[0].cells.length > 1) { 
          selectedProduct.rawMaterials.forEach(rm => {
              const kuantitasDiperlukanPerUnit = rm.quantity; // Dari data_produk2.js, sudah number
              const totalKuantitas = kuantitasDiperlukanPerUnit * jumlahProduksi;
              rawMaterialsUsed.push({
                  namaRawMaterial: rm.name, // Menggunakan 'name' dari data_produk2.js
                  kuantitasDiperperlukanPerUnit: formatNumber(kuantitasDiperlukanPerUnit), 
                  satuan: rm.unit, // Menggunakan 'unit' dari data_produk2.js
                  totalKuantitasDigunakan: formatNumber(totalKuantitas) 
              });
          });
      } else {
          alert('Tidak ada raw material yang terkait dengan produk ini. Tidak dapat menyimpan perencanaan.');
          return;
      }
      
      const dataEntry = {
          tanggal: tanggal,
          idProduk: idProduk, // Ini adalah ID unik dari produk (misal timestamp)
          kodeProduk: selectedProduct.kodeProduk, // Tambahkan kode produk
          namaProduk: namaProduk,
          satuanProduk: selectedProduct.satuanProduk, // Tambahkan satuan produk
          jumlahProduksi: formatNumber(jumlahProduksi), // Simpan dalam format string
          rawMaterialsDigunakan: rawMaterialsUsed,
          status: 'Perencanaan Baru' // Status awal perencanaan
      };

      // Dapatkan data terbaru dari localStorage lagi sebelum update/push
      perencanaanProduksiData = JSON.parse(localStorage.getItem('perencanaanProduksiData')) || [];

      if (updateIndex !== null) {
          perencanaanProduksiData[updateIndex] = dataEntry;
          alert('Perencanaan produksi berhasil diperbarui!');
      } else {
          perencanaanProduksiData.push(dataEntry);
          alert('Perencanaan produksi berhasil disimpan!');
      }

      localStorage.setItem('perencanaanProduksiData', JSON.stringify(perencanaanProduksiData));
      window.location.href = 'perencanaan_produksi.html'; // Kembali ke halaman daftar
  }

  // --- Event Listeners ---

  // Event listener untuk perubahan pilihan produk
  namaProdukSelect.addEventListener('change', function() {
      const selectedProductId = this.value;
      // Cari produk berdasarkan 'id' yang unik (timestamp)
      selectedProduct = productMasterData.find(p => p.id == selectedProductId); // Gunakan == untuk komparasi string/number

      if (selectedProduct) {
          kodeProdukDisplay.value = selectedProduct.kodeProduk || '';
          satuanProdukDisplay.value = selectedProduct.satuanProduk || ''; // Menampilkan satuan produk
          // Dapatkan jumlah produksi saat ini untuk update tabel RM
          const currentJumlahProduksi = parseNumber(jumlahProduksiInput.value);
          populateRawMaterialTable(selectedProduct, currentJumlahProduksi);
      } else {
          // Reset tampilan jika tidak ada produk yang dipilih atau produk tidak ditemukan
          kodeProdukDisplay.value = '';
          satuanProdukDisplay.value = '';
          rawMaterialTableBody.innerHTML = `<tr><td colspan="6" class="text-center">Pilih produk terlebih dahulu untuk melihat daftar raw material.</td></tr>`;
      }
  });

  // Event listener untuk perubahan jumlah produksi
  jumlahProduksiInput.addEventListener('input', function() {
      // Pastikan input hanya angka positif, dan minimal 1
      let val = parseInt(this.value, 10);
      if (isNaN(val) || val < 1) {
          val = 1;
      }
      this.value = val;

      if (selectedProduct) {
          populateRawMaterialTable(selectedProduct, val);
      }
  });

  // Event listener untuk tombol Simpan
  form.addEventListener('submit', function(event) {
      event.preventDefault(); // Mencegah submit form default
      simpanData();
  });

  // Event listener untuk tombol Batal
  batalBtn.addEventListener('click', function() {
      localStorage.removeItem('updatePerencanaanProduksiIndex'); // Bersihkan indeks update
      window.location.href = 'perencanaan_produksi.html'; // Kembali ke halaman daftar
  });

  // --- Inisialisasi Saat Halaman Dimuat ---
  populateProdukSelect(); // Isi dropdown produk saat DOM siap
  loadDataForEdit(); // Muat data jika dalam mode edit
});