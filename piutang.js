let piutangPelanggan = 0;

// Fungsi untuk memformat angka dengan titik ribuan
function formatNumber(input) {
    let angka = input.value.replace(/[^0-9]/g, ''); // Hilangkan semua karakter non-angka
    let formattedAngka = new Intl.NumberFormat('id-ID').format(angka); // Format dengan titik ribuan
    input.value = formattedAngka; // Set kembali nilai input dengan format yang baru
}

// Tambahkan event listener untuk memanggil formatNumber saat input piutangPelanggan berubah
document.getElementById("piutangPelanggan").addEventListener("input", function () {
    formatNumber(this);
});

// Contoh cara mendapatkan nilai jumlah piutang tanpa titik-titik (misalnya saat akan diproses ke server)
function getCleanNumber(inputId) {
    let angka = document.getElementById(inputId).value.replace(/[^0-9]/g, '');
    return Number(angka) || 0; // Kembalikan angka atau 0 jika kosong
}

// ... (kode JavaScript lainnya jika ada)

// Contoh penggunaan:
document.getElementById("piutangPelanggan").addEventListener("blur", function () { // Event 'blur' terjadi saat input kehilangan fokus
    let jumlahPiutang = getCleanNumber("piutangPelanggan");
    console.log("Jumlah Piutang tanpa titik:", jumlahPiutang); // Lakukan sesuatu dengan nilai jumlah piutang ini
});


document.addEventListener('DOMContentLoaded', () => {
    const simpanButton = document.querySelector('.simpan');
    if (simpanButton) {
        simpanButton.addEventListener('click', simpanDataPiutang);
    }

    function simpanDataPiutang() {
        const kodePelanggan = document.getElementById('kode_pelanggan').value;
        const tanggal = document.getElementById('tanggal').value;
        const namaPelanggan = document.getElementById('nama').value;
        const alamatPelanggan = document.getElementById('alamatPelanggan').value;
        const emailPelanggan = document.getElementById('emailPelanggan').value;
        const nomorPelanggan = document.getElementById('nomorPelanggan').value;
        const rekeningPelanggan = document.getElementById('rekeningPelanggan').value;
        const piutangPelanggan = document.getElementById('piutangPelanggan').value;

        if (!kodePelanggan || !tanggal || !namaPelanggan || !alamatPelanggan || !emailPelanggan || !nomorPelanggan || !rekeningPelanggan || !piutangPelanggan) {
            alert('Harap lengkapi semua field!');
            return;
        }

        const dataPiutang = {
            kodePelanggan,
            tanggal,
            namaPelanggan,
            alamatPelanggan,
            emailPelanggan,
            nomorPelanggan,
            rekeningPelanggan,
            piutangPelanggan
        };

        let dataPiutangArray = JSON.parse(localStorage.getItem('dataPiutangPelanggan')) || [];
        dataPiutangArray.push(dataPiutang);
        localStorage.setItem('dataPiutangPelanggan', JSON.stringify(dataPiutangArray));

        alert('Data piutang pelanggan berhasil disimpan!');
        window.location.href = 'piutang_dash.html';
    }
});