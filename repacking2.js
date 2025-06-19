// Fungsi untuk simpan data
function simpanData() {
  // Ambil nilai dari input
  const tanggal = document.getElementById("tanggal").value;
  const kodeProduk = document.getElementById("kodeProduk").value;
  const produkAwal = document.getElementById("produkAwal").value;
  const ProdukAkhir = document.getElementById("ProdukAkhir").value;
  const jumlahSebelum = document.getElementById("jumlahSebelum").value;
  const jumlahSesudah = document.getElementById("jumlahSesudah").value;

  // Buat objek data
  const data = {
    tanggal: tanggal,
    kodeProduk: kodeProduk,
    produkAwal: produkAwal,
    ProdukAkhir: ProdukAkhir,
    jumlahSebelum: jumlahSebelum,
    jumlahSesudah: jumlahSesudah
  };

  // Ambil data yang sudah ada dari localStorage atau buat array kosong jika belum ada
  let repackingData = JSON.parse(localStorage.getItem("repackingData")) || [];

  // Jika dataToUpdate tidak kosong, maka update data yang dipilih
  if (dataToUpdate) {
    const index = repackingData.findIndex(item => item.tanggal === dataToUpdate.tanggal);
    repackingData[index] = {
      tanggal: tanggal,
      kodeProduk: kodeProduk,
      produkAwal: produkAwal,
      ProdukAkhir: ProdukAkhir,
      jumlahSebelum: jumlahSebelum,
      jumlahSesudah: jumlahSesudah
    };
  } else {
    // Jika dataToUpdate kosong, maka tambahkan data baru
    repackingData.push(data);
  }

  // Simpan data ke localStorage
  localStorage.setItem("repackingData", JSON.stringify(repackingData));

  // Redirect ke halaman repacking.html
  window.location.href = "repacking.html";
}

// Fungsi untuk memformat inputan menjadi ribuan
function formatRibu(input) {
  var num = input.value.replace(/\D/g, '');
  var num2 = '';
  var j = 0;
  var ukuran_num = num.length;
  for (i = ukuran_num; i > 0; i--) {
    if (j == 3) {
      j = 0;
      num2 = '.' + num2;
    }
    j++;
    num2 = num[i - 1] + num2;
  }
  input.value = num2;
}

// Tambahkan event listener pada inputan jumlah sebelum dan jumlah sesudah
document.getElementById('jumlahSebelum').addEventListener('input', function() {
  formatRibu(this);
});

document.getElementById('jumlahSesudah').addEventListener('input', function() {
  formatRibu(this);
});

// Ambil data yang akan diupdate dari localStorage
const dataToUpdate = JSON.parse(localStorage.getItem("dataToUpdate"));

// Jika dataToUpdate tidak kosong, maka isi form dengan data yang akan diupdate
if (dataToUpdate) {
  document.getElementById("tanggal").value = dataToUpdate.tanggal;
  document.getElementById("kodeProduk").value = dataToUpdate.kodeProduk;
  document.getElementById("produkAwal").value = dataToUpdate.produkAwal;
  document.getElementById("ProdukAkhir").value = dataToUpdate.ProdukAkhir;
  document.getElementById("jumlahSebelum").value = dataToUpdate.jumlahSebelum;
  document.getElementById("jumlahSesudah").value = dataToUpdate.jumlahSesudah;
}

// Tambahkan event listener pada tombol simpan
document.getElementById("simpan").addEventListener("click", simpanData);

// Jika dataToUpdate tidak kosong, maka edit data
if (dataToUpdate) {
  // Tampilkan form edit data
  document.getElementById("form-edit").style.display = "block";
  document.getElementById("form-add").style.display = "none";
} else {
  // Tampilkan form add data
  document.getElementById("form-edit").style.display = "none";
  document.getElementById("form-add").style.display = "block";
}