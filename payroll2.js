// payroll2.js

function formatRupiah(angka) {
  if (typeof angka === 'number') {
      return angka.toLocaleString('id-ID');
  }
  return '';
}

function removeFormatRupiah(angka) {
  if (typeof angka === 'string') {
      const cleanedAngka = angka.replace(/[^0-9]/g, '');
      return cleanedAngka ? parseInt(cleanedAngka) : 0;
  }
  return 0;
}

function hitungTotal() {
  const pendapatan = removeFormatRupiah(document.getElementById("pendapatan").value);
  const tunjangan = removeFormatRupiah(document.getElementById("tunjangan").value);
  const bonus = removeFormatRupiah(document.getElementById("bonus").value);
  const pph = removeFormatRupiah(document.getElementById("pph").value);

  const total = pendapatan + tunjangan + bonus - pph;

  const totalInput = document.getElementById("total");
  if (totalInput) { // Pastikan elemen 'total' ada
      totalInput.value = formatRupiah(total);
  }
}

// Fungsi untuk mengisi dropdown Nama Karyawan dan detailnya
function populateAndHandleKaryawanSelection() {
  const namaKaryawanSelect = document.getElementById("nama_karyawan"); // Sekarang ini adalah SELECT
  const idKaryawanInput = document.getElementById("id_karyawan");     // Sekarang ini adalah INPUT
  const rekeningKaryawanInput = document.getElementById("rekening_karyawan");

  // Ambil dataKaryawan dari localStorage
  let dataKaryawan = localStorage.getItem('dataKaryawan');
  let karyawanArray = dataKaryawan ? JSON.parse(dataKaryawan) : [];

  // Kosongkan opsi yang ada (kecuali opsi default)
  namaKaryawanSelect.innerHTML = '<option value="">Pilih Nama Karyawan</option>';

  // Isi dropdown dengan semua Nama karyawan yang ada
  karyawanArray.forEach(karyawan => {
      const option = document.createElement('option');
      // Gunakan namaKaryawan sebagai value dan textContent
      option.value = karyawan.namaKaryawan;
      option.textContent = karyawan.namaKaryawan;
      namaKaryawanSelect.appendChild(option);
  });

  // Tambahkan event listener pada dropdown Nama Karyawan
  namaKaryawanSelect.addEventListener('change', function() {
      const selectedName = this.value; // Nama karyawan yang dipilih
      // Cari karyawan berdasarkan nama yang dipilih
      const selectedKaryawan = karyawanArray.find(karyawan => karyawan.namaKaryawan === selectedName);

      if (selectedKaryawan) {
          idKaryawanInput.value = selectedKaryawan.idKaryawan;       // Isi ID Karyawan
          rekeningKaryawanInput.value = selectedKaryawan.rekeningKaryawan; // Isi Rekening Karyawan
      } else {
          // Jika tidak ada nama yang dipilih atau nama tidak valid, kosongkan field
          idKaryawanInput.value = '';
          rekeningKaryawanInput.value = '';
      }
      hitungTotal();
  });
}

// Event listeners untuk input finansial (TIDAK BERUBAH)
document.getElementById("pendapatan").addEventListener("input", function() {
  this.value = formatRupiah(removeFormatRupiah(this.value));
  hitungTotal();
});

document.getElementById("tunjangan").addEventListener("input", function() {
  this.value = formatRupiah(removeFormatRupiah(this.value));
  hitungTotal();
});

document.getElementById("bonus").addEventListener("input", function() {
  this.value = formatRupiah(removeFormatRupiah(this.value));
  hitungTotal();
});

document.getElementById("pph").addEventListener("input", function() {
  this.value = formatRupiah(removeFormatRupiah(this.value));
  hitungTotal();
});

// Event listener untuk submit form
document.getElementById("form-payroll").addEventListener("submit", function(event) {
  event.preventDefault(); // Mencegah form melakukan submit default (reload halaman)

  // Ambil nilai tanggal payroll
  const tanggalPayroll = document.getElementById("tanggalpayroll").value;

  // Ambil nilai dari field yang sudah diubah perannya
  const namaKaryawan = document.getElementById("nama_karyawan").value; // Ini sekarang dari SELECT
  const idKaryawan = document.getElementById("id_karyawan").value;     // Ini sekarang dari INPUT READONLY
  const rekeningKaryawan = document.getElementById("rekening_karyawan").value;

  const pendapatan = removeFormatRupiah(document.getElementById("pendapatan").value);
  const tunjangan = removeFormatRupiah(document.getElementById("tunjangan").value);
  const bonus = removeFormatRupiah(document.getElementById("bonus").value);
  const pph = removeFormatRupiah(document.getElementById("pph").value);
  const total = removeFormatRupiah(document.getElementById("total").value);

  // Validasi: pastikan Nama Karyawan dipilih dan field lainnya terisi
  if (!tanggalPayroll || !namaKaryawan || !idKaryawan || !rekeningKaryawan) {
      alert("Mohon lengkapi Tanggal, pilih Nama Karyawan, dan pastikan ID Karyawan serta No Rekening terisi.");
      return;
  }
  if (pendapatan === 0 && tunjangan === 0 && bonus === 0 && pph === 0) {
      alert("Mohon masukkan setidaknya satu nilai pendapatan, tunjangan, bonus, atau pph.");
      return;
  }

  // Buat objek data gaji
  const newPayrollEntry = {
      tanggalPayroll: tanggalPayroll,
      idKaryawan: idKaryawan,
      namaKaryawan: namaKaryawan,
      rekeningKaryawan: rekeningKaryawan,
      pendapatan: pendapatan,
      tunjangan: tunjangan,
      bonus: bonus,
      pph: pph,
      total: total
  };

  // Ambil data gaji yang sudah ada dari localStorage
  let payrollData = localStorage.getItem('payrollData');
  let payrollArray = payrollData ? JSON.parse(payrollData) : [];

  // Cek apakah sedang dalam mode update
  const updatePayrollIndex = localStorage.getItem('updatePayrollIndex');

  if (updatePayrollIndex !== null && payrollArray[updatePayrollIndex]) {
      // Mode update: Perbarui data yang ada di indeks tersebut
      payrollArray[updatePayrollIndex] = newPayrollEntry;
      localStorage.removeItem('updatePayrollIndex'); // Hapus flag update
      alert("Data gaji berhasil diperbarui!");
  } else {
      // Mode tambah baru: Tambahkan data baru ke array
      payrollArray.push(newPayrollEntry);
      alert("Data gaji berhasil disimpan!");
  }

  // Simpan kembali array ke localStorage
  localStorage.setItem('payrollData', JSON.stringify(payrollArray));

  // Kosongkan formulir setelah disimpan/diperbarui
  document.getElementById("tanggalpayroll").value = '';
  document.getElementById("pendapatan").value = '';
  document.getElementById("tunjangan").value = '';
  document.getElementById("bonus").value = '';
  document.getElementById("pph").value = '';
  document.getElementById("total").value = '';

  // Kosongkan pilihan dan input yang terkait dengan karyawan
  document.getElementById("nama_karyawan").value = ''; // Kosongkan pilihan nama
  document.getElementById("id_karyawan").value = '';   // Kosongkan ID
  document.getElementById("rekening_karyawan").value = ''; // Kosongkan rekening

  // Redirect ke halaman tampilan payroll
  window.location.href = 'payroll.html';
});

// Event listener untuk tombol Batal (TIDAK BERUBAH)
document.getElementById('linkBatal').addEventListener('click', function(event) {
  event.preventDefault(); // Mencegah link melakukan navigasi default
  localStorage.removeItem('updatePayrollIndex'); // Pastikan flag update dihapus saat batal
  window.location.href = 'payroll.html'; // Kembali ke halaman payroll.html
});

// Inisialisasi saat DOM selesai dimuat
document.addEventListener('DOMContentLoaded', function() {
  populateAndHandleKaryawanSelection(); // Panggil fungsi untuk mengisi dropdown dan menangani perubahan

  // Cek jika ada data yang akan diupdate
  const updatePayrollIndex = localStorage.getItem('updatePayrollIndex');
  if (updatePayrollIndex !== null) {
      let payrollData = localStorage.getItem('payrollData');
      let payrollArray = payrollData ? JSON.parse(payrollData) : [];

      const dataToUpdate = payrollArray[updatePayrollIndex];

      if (dataToUpdate) {
          // Isi formulir dengan data yang akan diupdate
          document.getElementById("tanggalpayroll").value = dataToUpdate.tanggalPayroll || '';

          // Set nilai nama_karyawan (yang sekarang adalah select)
          const namaKaryawanSelect = document.getElementById("nama_karyawan");
          namaKaryawanSelect.value = dataToUpdate.namaKaryawan;

          // Trigger perubahan pada select nama_karyawan untuk mengisi ID dan rekening
          const changeEvent = new Event('change');
          namaKaryawanSelect.dispatchEvent(changeEvent);

          document.getElementById("pendapatan").value = formatRupiah(dataToUpdate.pendapatan);
          document.getElementById("tunjangan").value = formatRupiah(dataToUpdate.tunjangan);
          document.getElementById("bonus").value = formatRupiah(dataToUpdate.bonus);
          document.getElementById("pph").value = formatRupiah(dataToUpdate.pph);
          document.getElementById("total").value = formatRupiah(dataToUpdate.total);

          // Lakukan perhitungan ulang untuk memastikan total benar
          hitungTotal();
      } else {
          // Jika indeks tidak valid, hapus flag update
          localStorage.removeItem('updatePayrollIndex');
      }
  } else {
      // Jika tidak ada mode update, hitung total awal (jika ada nilai default di form)
      hitungTotal();
  }
});