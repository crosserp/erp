// jenis_usaha.js - Untuk halaman yang hanya menampilkan informasi perusahaan

document.addEventListener('DOMContentLoaded', function() {
  // --- Referensi Elemen HTML untuk Menampilkan Data ---
  // Pastikan ID ini ada di halaman jenis_usaha.html Anda
  const displayElements = {
      tipe: document.getElementById('tipe_display_view'), // Gunakan ID berbeda untuk menghindari konflik
      bidangUsaha: document.getElementById('bidangUsaha_display_view'),
      jenisPerusahaan: document.getElementById('jenisPerusahaan_display_view'),
      alamatPerusahaan: document.getElementById('alamatPerusahaan_display_view'),
      noTelepon: document.getElementById('noTelepon_display_view'),
      npwp: document.getElementById('npwp_display_view'),
  };

  const productDisplayAreaView = document.getElementById('productDisplayArea_view'); // ID untuk area produk di halaman view

  // Kunci untuk mengambil data dari localStorage
  const LOCAL_STORAGE_KEY = 'companyProfileData';

  // --- Fungsi untuk Memuat dan Menampilkan Data ---
  function loadAndDisplayCompanyData() {
      const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      let companyData;

      if (storedData) {
          companyData = JSON.parse(storedData);
      } else {
          // Jika belum ada data di localStorage, tampilkan default atau pesan
          companyData = {
              tipe: "Data Belum Diatur",
              bidangUsaha: "Data Belum Diatur",
              jenisPerusahaan: "Data Belum Diatur",
              alamatPerusahaan: "Data Belum Diatur",
              noTelepon: "Data Belum Diatur",
              npwp: "Data Belum Diatur",
              produkDijual: ["Belum ada produk yang tercatat."]
          };
      }

      // Isi elemen HTML dengan data
      for (const key in displayElements) {
          if (displayElements.hasOwnProperty(key) && displayElements[key]) { // Periksa elemen ada
              displayElements[key].textContent = companyData[key] || "Tidak ada data";
          }
      }

      // Tampilkan produk
      productDisplayAreaView.innerHTML = ''; // Bersihkan dulu

      if (companyData.produkDijual && companyData.produkDijual.length > 0) {
          companyData.produkDijual.forEach(product => {
              const p = document.createElement('p'); // Atau span, li, dll.
              p.textContent = product.trim();
              productDisplayAreaView.appendChild(p);
          });
      } else {
          const p = document.createElement('p');
          p.textContent = "Tidak ada produk yang tercatat.";
          productDisplayAreaView.appendChild(p);
      }
  }

  // Panggil fungsi saat halaman dimuat
  loadAndDisplayCompanyData();
});