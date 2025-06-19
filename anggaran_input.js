let keterangan = "";
let akun = 0;
let anggaran = 0;

// Fungsi untuk format Rupiah (opsional, jika ingin menampilkan dalam format Rupiah)
function formatRupiah(angka) {
  const format = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  });
  return format.format(angka);
}

// Fungsi untuk menghitung total (saat ini hanya menampilkan anggaran)
function hitungTotal() {
  // Pastikan nilai anggaran berupa angka tanpa titik
  anggaran = Number(document.getElementById("anggaran").value.replace(/[^0-9]/g, '')) || 0;

  // Jika ingin menampilkan dalam format Rupiah:
  // document.getElementById("anggaran").value = formatRupiah(anggaran); 

  // Atau, tampilkan sebagai angka biasa dengan pemisah ribuan:
  document.getElementById("anggaran").value = new Intl.NumberFormat('id-ID').format(anggaran);
}

// Event listener untuk input
document.getElementById("keterangan").addEventListener("input", function () {
  keterangan = this.value;
});

document.getElementById("akun").addEventListener("input", hitungTotal);
document.getElementById("anggaran").addEventListener("input", hitungTotal);

// Inisialisasi tampilan saat halaman dimuat
window.onload = function () {
  hitungTotal();
};

// Fungsi untuk memformat angka saat diinput (menambahkan titik ribuan)
function formatNumber(input) {
  let angka = input.value.replace(/[^0-9]/g, '');
  let formattedAngka = new Intl.NumberFormat('id-ID').format(angka);
  input.value = formattedAngka;
}

// Tambahkan event listener untuk memanggil formatNumber saat input anggaran berubah
document.getElementById("anggaran").addEventListener("input", function() {
  formatNumber(this);
});