// perencanaan_produksi.js

document.addEventListener('DOMContentLoaded', function() {
  const perencanaanProduksiTableBody = document.getElementById('perencanaanProduksiTableBody');
  const addPerencanaanButton = document.getElementById('addPerencanaanButton');

  // Kunci untuk menyimpan data perencanaan produksi di localStorage
  const PERENCANAAN_PRODUKSI_KEY = 'perencanaanProduksiData';

  /**
   * Mengisi tabel perencanaan produksi dari localStorage.
   */
  function loadPerencanaanProduksiData() {
      const perencanaanProduksiData = JSON.parse(localStorage.getItem(PERENCANAAN_PRODUKSI_KEY)) || [];
      perencanaanProduksiTableBody.innerHTML = ''; // Kosongkan tabel sebelum mengisi

      if (perencanaanProduksiData.length === 0) {
          perencanaanProduksiTableBody.innerHTML = `<tr><td colspan="7" class="text-center">Belum ada data perencanaan produksi.</td></tr>`;
          return;
      }

      perencanaanProduksiData.forEach((data, index) => {
          const row = document.createElement('tr');
          row.innerHTML = `
              <td>${data.tanggal || '-'}</td>
              <td>${data.kodeProduk || '-'}</td>
              <td>${data.namaProduk || '-'}</td>
              <td>${data.jumlahProduksi || '0'}</td>
              <td>${data.satuanProduk || '-'}</td>
              <td>${data.status || 'Tidak Diketahui'}</td>
              <td class="text-center">
                  <button type="button" class="btn btn-warning btn-sm edit-btn" data-index="${index}">Edit</button>
                  <button type="button" class="btn btn-danger btn-sm delete-btn" data-index="${index}">Hapus</button>
                  <button type="button" class="btn btn-info btn-sm detail-btn" data-index="${index}">Detail RM</button>
              </td>
          `;
          perencanaanProduksiTableBody.appendChild(row);
      });

      addEventListenersToButtons(); // Tambahkan event listener setelah baris dibuat
  }

  /**
   * Menambahkan event listener ke tombol-tombol di tabel (Edit, Hapus, Detail RM).
   */
  function addEventListenersToButtons() {
      // Event listener untuk tombol Edit
      document.querySelectorAll('.edit-btn').forEach(button => {
          button.addEventListener('click', function() {
              const indexToEdit = this.dataset.index;
              localStorage.setItem('updatePerencanaanProduksiIndex', indexToEdit); // Simpan indeks yang akan diedit
              window.location.href = 'perencanaan_produksi2.html'; // Arahkan ke halaman form edit
          });
      });

      // Event listener untuk tombol Hapus
      document.querySelectorAll('.delete-btn').forEach(button => {
          button.addEventListener('click', function() {
              const indexToDelete = parseInt(this.dataset.index, 10);
              let perencanaanProduksiData = JSON.parse(localStorage.getItem(PERENCANAAN_PRODUKSI_KEY)) || [];

              if (indexToDelete >= 0 && indexToDelete < perencanaanProduksiData.length) {
                  const confirmDelete = confirm(`Anda yakin ingin menghapus perencanaan produksi untuk ${perencanaanProduksiData[indexToDelete].namaProduk} pada tanggal ${perencanaanProduksiData[indexToDelete].tanggal}?`);

                  if (confirmDelete) {
                      perencanaanProduksiData.splice(indexToDelete, 1); // Hapus elemen dari array
                      localStorage.setItem(PERENCANAAN_PRODUKSI_KEY, JSON.stringify(perencanaanProduksiData));
                      alert('Perencanaan produksi berhasil dihapus!');
                      loadPerencanaanProduksiData(); // Muat ulang tabel
                  }
              } else {
                  alert('Data tidak ditemukan.');
              }
          });
      });

      // Event listener untuk tombol Detail RM (contoh sederhana, bisa dikembangkan)
      document.querySelectorAll('.detail-btn').forEach(button => {
          button.addEventListener('click', function() {
              const index = parseInt(this.dataset.index, 10);
              const perencanaanProduksiData = JSON.parse(localStorage.getItem(PERENCANAAN_PRODUKSI_KEY)) || [];
              const data = perencanaanProduksiData[index];

              if (data && data.rawMaterialsDigunakan && data.rawMaterialsDigunakan.length > 0) {
                  let detailMessage = `Detail Raw Material untuk ${data.namaProduk} (${data.jumlahProduksi} ${data.satuanProduk}):\n\n`;
                  data.rawMaterialsDigunakan.forEach(rm => {
                      detailMessage += `- ${rm.namaRawMaterial}: ${rm.totalKuantitasDigunakan} ${rm.satuan}\n`;
                  });
                  alert(detailMessage);
              } else {
                  alert('Tidak ada detail raw material untuk perencanaan ini.');
              }
          });
      });
  }

  // Event listener untuk tombol "Buat Perencanaan Baru"
  if (addPerencanaanButton) {
      addPerencanaanButton.addEventListener('click', function() {
          localStorage.removeItem('updatePerencanaanProduksiIndex'); // Pastikan tidak ada indeks edit saat membuat baru
          window.location.href = 'perencanaan_produksi2.html'; // Arahkan ke halaman form input
      });
  }

  // --- Inisialisasi Saat Halaman Dimuat ---
  loadPerencanaanProduksiData(); // Muat data perencanaan produksi saat halaman pertama kali dimuat
});