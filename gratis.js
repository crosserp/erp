// Fungsi untuk memvalidasi form
function validateForm() {
    // Ambil nilai input
    var namaLengkap = document.getElementById("nama_lengkap").value;
    var namaInstansi = document.getElementById("nama_instansi").value;
    var email = document.getElementById("email").value;
    var noTelepon = document.getElementById("no_telepon").value;
    var kataSandi = document.getElementById("kata_sandi").value;
    var setuju = document.getElementById("setuju").checked;
  
    // Validasi nama lengkap
    if (namaLengkap.length < 3) {
      alert("Nama lengkap harus minimal 3 karakter");
      return false;
    }
  
    // Validasi nama instansi
    if (namaInstansi.length < 3) {
      alert("Nama instansi harus minimal 3 karakter");
      return false;
    }
  
    // Validasi email
    var emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      alert("Email tidak valid");
      return false;
    }
  
    // Validasi no telepon
    var noTeleponRegex = /^\d{10,12}$/;
    if (!noTeleponRegex.test(noTelepon)) {
      alert("No telepon harus 10-12 digit");
      return false;
    }
  
    // Validasi kata sandi
    var kataSandiRegex = /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/;
    if (!kataSandiRegex.test(kataSandi)) {
      alert("Kata sandi harus minimal 8 karakter dan kombinasi huruf dan angka");
      return false;
    }
  
    // Validasi setuju
    if (!setuju) {
      alert("Anda harus menyetujui syarat dan ketentuan");
      return false;
    }
  
    // Jika semua validasi berhasil, maka form dapat dikirim
    return true;
  }
  
  // Tambahkan event listener pada tombol submit
  document.addEventListener("DOMContentLoaded", function() {
    var form = document.querySelector("form");
    form.addEventListener("submit", function(event) {
      if (!validateForm()) {
        event.preventDefault();
      }
    });
  });