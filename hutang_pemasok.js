let hutangPemasok=0;

// Fungsi untuk memformat angka saat diinput (menambahkan titik ribuan)
function formatNumber(input) {
    let angka = input.value.replace(/[^0-9]/g, ''); // Hilangkan semua karakter non-angka
    let formattedAngka = new Intl.NumberFormat('id-ID').format(angka); // Format dengan titik ribuan
    input.value = formattedAngka; // Set kembali nilai input dengan format yang baru
  }
  
  // Tambahkan event listener untuk memanggil formatNumber saat input hutangPemasok berubah
  document.getElementById("hutangPemasok").addEventListener("input", function() {
    formatNumber(this);
  });
  
  // Contoh cara mendapatkan nilai jumlah hutang tanpa titik-titik (misalnya saat akan diproses ke server)
  function getCleanNumber(inputId) {
    let angka = document.getElementById(inputId).value.replace(/[^0-9]/g, '');
    return Number(angka) || 0; // Kembalikan angka atau 0 jika kosong
  }
  
  // ... (kode JavaScript lainnya jika ada)
  
  // Contoh penggunaan:
  document.getElementById("hutangPemasok").addEventListener("blur", function() { // Event 'blur' terjadi saat input kehilangan fokus
    let jumlahHutang = getCleanNumber("hutangPemasok");
    console.log("Jumlah Hutang tanpa titik:", jumlahHutang); // Lakukan sesuatu dengan nilai jumlah hutang ini
  });

  document.addEventListener('DOMContentLoaded', () => {
    const simpanButton = document.querySelector('.simpan');
    if (simpanButton) {
        simpanButton.addEventListener('click', simpanDataHutang);
    }

    function simpanDataHutang() {
        const kodePemasok = document.getElementById('kode_pemasok').value;
        const tanggal = document.getElementById('tanggal').value;
        const namaPemasok = document.getElementById('nama').value;
        const alamatPemasok = document.getElementById('alamatPemasok').value;
        const emailPemasok = document.getElementById('emailPemasok').value;
        const nomorPemasok = document.getElementById('nomorPemasok').value;
        const rekeningPemasok = document.getElementById('rekeningPemasok').value;
        const hutangPemasok = document.getElementById('hutangPemasok').value;

        if (!kodePemasok || !tanggal || !namaPemasok || !alamatPemasok || !emailPemasok || !nomorPemasok || !rekeningPemasok || !hutangPemasok) {
            alert('Harap lengkapi semua field!');
            return;
        }

        const dataHutang = {
            kodePemasok,
            tanggal,
            namaPemasok,
            alamatPemasok,
            emailPemasok,
            nomorPemasok,
            rekeningPemasok,
            hutangPemasok
        };

        let dataHutangArray = JSON.parse(localStorage.getItem('dataHutangPemasok')) || [];
        dataHutangArray.push(dataHutang);
        localStorage.setItem('dataHutangPemasok', JSON.stringify(dataHutangArray));

        alert('Data hutang pemasok berhasil disimpan!');
        window.location.href = 'hutang_pemasok_dash.html';
    }
});