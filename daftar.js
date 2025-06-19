// daftar.js

document.addEventListener('DOMContentLoaded', function() {
    const registrationForm = document.querySelector('form'); // Ini akan menargetkan form pertama di halaman
    const namaLengkapInput = document.getElementById('nama_lengkap');
    const emailInput = document.getElementById('email');
    const kataSandiInput = document.getElementById('kata_sandi');
    const setujuCheckbox = document.getElementById('setuju');

    // MENGHILANGKAN REFERENSI KE nama_instansi DAN no_telepon KARENA TIDAK ADA DI HTML
    // const namaInstansiInput = document.getElementById('nama_instansi'); // Hapus atau tambahkan ke HTML
    // const noTeleponInput = document.getElementById('no_telepon');     // Hapus atau tambahkan ke HTML

    if (registrationForm) {
        registrationForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Mencegah form submit default

            // Validasi sederhana - hanya untuk input yang ADA di HTML
            if (!namaLengkapInput.value.trim() || !emailInput.value.trim() || !kataSandiInput.value.trim()) {
                alert('Harap lengkapi semua kolom yang wajib diisi (Nama Lengkap, Email, Kata Sandi).');
                return;
            }

            // Validasi format email
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(emailInput.value.trim())) {
                alert('Format email tidak valid. Harap masukkan email yang benar.');
                return;
            }

            // Validasi kekuatan kata sandi (minimal 8 karakter dan kombinasi angka)
            const password = kataSandiInput.value;
            if (password.length < 8 || !/\d/.test(password)) {
                alert('Kata sandi harus minimal 8 karakter dan mengandung setidaknya satu angka.');
                return;
            }

            if (!setujuCheckbox.checked) {
                alert('Anda harus menyetujui Syarat & Ketentuan dan Kebijakan Privasi.');
                return;
            }

            // Buat objek akun baru
            const newAccount = {
                id: Date.now(), // ID unik berdasarkan timestamp
                namaLengkap: namaLengkapInput.value.trim(),
                // namaInstansi: namaInstansiInput.value, // Hapus ini jika tidak ada di HTML
                email: emailInput.value.trim(),
                // noTelepon: noTeleponInput.value,     // Hapus ini jika tidak ada di HTML
                kataSandi: kataSandiInput.value // Simpan kata sandi, *CATATAN: untuk aplikasi nyata, kata sandi harus di-hash!*
            };

            // Ambil data akun yang sudah ada dari localStorage
            let registeredAccounts = localStorage.getItem('registeredAccounts');
            registeredAccounts = registeredAccounts ? JSON.parse(registeredAccounts) : [];

            // Cek apakah email sudah terdaftar
            const emailExists = registeredAccounts.some(account => account.email === newAccount.email);
            if (emailExists) {
                alert('Email ini sudah terdaftar. Silakan gunakan email lain atau login.');
                return;
            }

            // Tambahkan akun baru ke daftar
            registeredAccounts.push(newAccount);

            // Simpan kembali daftar akun ke localStorage
            localStorage.setItem('registeredAccounts', JSON.stringify(registeredAccounts));

            alert('Pendaftaran berhasil! Silakan login dengan akun Anda.');

            // Redirect ke halaman login
            window.location.href = 'login.html'; // Pastikan nama file login.html sudah benar
        });
    } else {
        console.error("Form pendaftaran tidak ditemukan. Pastikan ada elemen <form> di HTML Anda.");
    }
});