// login.js

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const kataSandiInput = document.getElementById('kata_sandi');

    if (loginForm) {
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Mencegah form submit default

            const email = emailInput.value;
            const password = kataSandiInput.value;

            if (!email || !password) {
                alert('Harap masukkan email dan kata sandi Anda.');
                return;
            }

            let registeredAccounts = localStorage.getItem('registeredAccounts');
            registeredAccounts = registeredAccounts ? JSON.parse(registeredAccounts) : [];

            const foundAccount = registeredAccounts.find(account =>
                account.email === email && account.kataSandi === password
            );

            if (foundAccount) {
                alert('Login berhasil! Selamat datang, ' + foundAccount.namaLengkap);
                sessionStorage.setItem('loggedInUserEmail', foundAccount.email);

                // --- BAGIAN YANG DIUBAH ---
                window.location.href = 'dashboard_erp.html'; // Ubah dari 'data_akun.html'
                // --- AKHIR BAGIAN YANG DIUBAH ---

            } else {
                alert('Email atau kata sandi salah. Silakan coba lagi.');
            }
        });
    } else {
        console.error("Form login tidak ditemukan. Pastikan ada elemen <form id='loginForm'> di HTML.");
    }
});







// login.js

// document.addEventListener('DOMContentLoaded', function() {
//     const loginForm = document.getElementById('loginForm');
//     const emailInput = document.getElementById('email');
//     const kataSandiInput = document.getElementById('kata_sandi');
//     const statusMessage = document.getElementById('statusMessage'); // Elemen untuk menampilkan pesan

//     // Fungsi untuk menampilkan pesan temporer (mengganti alert)
//     function showMessage(message, type = 'info') {
//         statusMessage.textContent = message;
//         statusMessage.classList.add('show');
//         if (type === 'error') {
//             statusMessage.style.backgroundColor = 'rgba(220, 38, 38, 0.8)'; // Merah
//         } else if (type === 'success') {
//             statusMessage.style.backgroundColor = 'rgba(5, 150, 105, 0.8)'; // Hijau
//         } else {
//             statusMessage.style.backgroundColor = 'rgba(0, 0, 0, 0.7)'; // Default gelap
//         }

//         setTimeout(() => {
//             statusMessage.classList.remove('show');
//             statusMessage.style.backgroundColor = ''; // Reset warna
//         }, 3000); // Pesan akan hilang setelah 3 detik
//     }

//     if (loginForm) {
//         loginForm.addEventListener('submit', function(event) {
//             event.preventDefault(); // Mencegah form submit default

//             const email = emailInput.value;
//             const password = kataSandiInput.value;

//             if (!email || !password) {
//                 showMessage('Harap masukkan email dan kata sandi Anda.', 'error');
//                 return;
//             }

//             let registeredAccounts = localStorage.getItem('registeredAccounts');
//             registeredAccounts = registeredAccounts ? JSON.parse(registeredAccounts) : [];

//             const foundAccount = registeredAccounts.find(account =>
//                 account.email === email && account.kataSandi === password
//             );

//             if (foundAccount) {
//                 showMessage('Login berhasil! Selamat datang, ' + foundAccount.namaLengkap, 'success');
//                 sessionStorage.setItem('loggedInUserEmail', foundAccount.email);

//                 // Redirect ke halaman login_user.html setelah login akun utama berhasil
//                 setTimeout(() => {
//                     window.location.href = 'login_user.html';
//                 }, 1000); // Beri sedikit waktu agar pesan terlihat
//             } else {
//                 showMessage('Email atau kata sandi salah. Silakan coba lagi.', 'error');
//             }
//         });
//     } else {
//         console.error("Form login tidak ditemukan. Pastikan ada elemen <form id='loginForm'> di HTML.");
//     }
// });
