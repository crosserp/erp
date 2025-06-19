// organisasi.js
document.addEventListener('DOMContentLoaded', function() {
  const organisasiTableBody = document.getElementById('organisasiTableBody');

  // Fungsi untuk me-render ulang tabel anggota
  function renderAnggotaTable() {
      let daftarAnggota = JSON.parse(localStorage.getItem('daftarAnggota')) || [];

      if (!organisasiTableBody) {
          console.error("Elemen <tbody> tabel tidak ditemukan! Pastikan id='organisasiTableBody' ada di HTML Anda.");
          return;
      }

      organisasiTableBody.innerHTML = ''; // Kosongkan tbody sebelum mengisi data

      if (daftarAnggota.length === 0) {
          const row = document.createElement('tr');
          row.innerHTML = `<td colspan="4" style="text-align: center;">Belum ada data anggota.</td>`;
          organisasiTableBody.appendChild(row);
      } else {
          daftarAnggota.forEach(anggota => {
              const row = document.createElement('tr');
              row.innerHTML = `
                  <td>${anggota.nomor_anggota}</td>
                  <td>${anggota.nama_anggota}</td>
                  <td>${anggota.jenis_jabatan}</td>
                  <td>
                      <button class="update-button" data-id="${anggota.id}">Update</button>
                      <button class="delete-button" data-id="${anggota.id}">Hapus</button>
                  </td>
              `;
              organisasiTableBody.appendChild(row);
          });
      }
  }

  // Panggil fungsi renderAnggotaTable saat DOMContentLoaded
  renderAnggotaTable();

  // --- Event Listener untuk Tombol Update dan Delete ---
  organisasiTableBody.addEventListener('click', function(event) {
      const target = event.target;
      const anggotaId = target.getAttribute('data-id'); // Mengambil ID unik yang kita simpan

      if (target.classList.contains('update-button')) {
          if (anggotaId) {
              // Simpan ID anggota yang akan diupdate ke localStorage
              localStorage.setItem('editAnggotaId', anggotaId);
              // Lalu mengalihkan ke form input organisasi2.html untuk diedit
              window.location.href = 'organisasi2.html';
          } else {
              console.error("ID Anggota tidak ditemukan untuk update.");
          }
      } else if (target.classList.contains('delete-button')) {
          if (anggotaId) {
              handleDeleteAnggota(anggotaId);
          } else {
              console.error("ID Anggota tidak ditemukan untuk delete.");
          }
      }
  });

  // --- Fungsi Handler untuk Delete Anggota ---
  function handleDeleteAnggota(id) {
      if (confirm(`Apakah Anda yakin ingin menghapus anggota ini?`)) {
          let daftarAnggota = JSON.parse(localStorage.getItem('daftarAnggota')) || [];

          // Filter array, sisakan hanya yang ID-nya TIDAK sama dengan ID yang akan dihapus
          const updatedDaftarAnggota = daftarAnggota.filter(anggota => anggota.id !== parseInt(id));

          if (updatedDaftarAnggota.length < daftarAnggota.length) {
              localStorage.setItem('daftarAnggota', JSON.stringify(updatedDaftarAnggota));
              alert(`Data anggota berhasil dihapus.`);
              renderAnggotaTable(); // Render ulang tabel untuk menampilkan perubahan
          } else {
              alert(`Data anggota tidak ditemukan.`);
          }
      }
  }
});