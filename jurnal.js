let kode = 0;
let keterangan = "";
let debit = 0;
let kredit = 0;
let totalKredit = 0;
let totalDebit = 0;

// Fungsi untuk format Rupiah (dengan pembulatan ke bilangan bulat)
function formatRupiah(angka) {
    const format = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0 // Hilangkan angka desimal
    });
    return format.format(angka);
}

// Fungsi untuk menghitung total dan menampilkan Rupiah
function hitungTotal() {
    kode = Number(document.getElementById("kode").value) || 0;
    keterangan = document.getElementById("keterangan").value;

    // Ambil nilai debit dan kredit tanpa format ribuan
    debit = Number(document.getElementById("debit").value.replace(/[^0-9]/g, '')) || 0;
    kredit = Number(document.getElementById("kredit").value.replace(/[^0-9]/g, '')) || 0;

    totalKredit = kredit; // Perbaikan: gunakan += jika ingin akumulasi
    totalDebit = debit;   // Perbaikan: gunakan += jika ingin akumulasi

    document.getElementById("t-debit").textContent = formatRupiah(totalDebit);
    document.getElementById("t-kredit").textContent = formatRupiah(totalKredit);
}

// Event listener untuk input
document.getElementById("keterangan").addEventListener("input", function () {
    keterangan = this.value;
});

document.getElementById("kode").addEventListener("input", hitungTotal);

// Event listener untuk debit dan kredit dengan format ribuan
document.getElementById("debit").addEventListener("input", function() {
    formatNumber(this);
    hitungTotal();
});

document.getElementById("kredit").addEventListener("input", function() {
    formatNumber(this);
    hitungTotal();
});


// Tombol Simpan
document.querySelector(".simpan").addEventListener("click", function () {
    // Logika untuk menyimpan data, misalnya ke database atau local storage
    console.log("Data disimpan:", {
        kode: kode,
        keterangan: keterangan,
        debit: debit,
        kredit: kredit
    });
    // Reset form setelah disimpan jika diperlukan
    resetForm();
});

// Tombol Batal
document.querySelector(".batal").addEventListener("click", function () {
    resetForm();
});

// Fungsi untuk mereset form
function resetForm() {
    document.getElementById("kode").value = "";
    document.getElementById("keterangan").value = "";
    document.getElementById("debit").value = "";
    document.getElementById("kredit").value = "";
    kode = 0;
    keterangan = "";
    debit = 0;
    kredit = 0;
    totalKredit = 0;
    totalDebit = 0;
    hitungTotal(); // Update tampilan total
}

// Inisialisasi tampilan Rupiah saat halaman dimuat
window.onload = function () {
    hitungTotal();
};


// Fungsi untuk memformat angka saat diinput (menambahkan titik ribuan)
function formatNumber(input) {
    let angka = input.value.replace(/[^0-9]/g, '');
    let formattedAngka = new Intl.NumberFormat('id-ID').format(angka);
    input.value = formattedAngka;
}