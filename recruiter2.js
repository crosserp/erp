// // recruiter2.js
// document.addEventListener('DOMContentLoaded', () => {
//     // Pastikan ID form ada di HTML Anda: <form id="formrecruiter">
//     const formRecruiter = document.getElementById('formrecruiter');
    
//     // Tombol "Iklankan" di recruiter2.html memiliki class "simpan"
//     const simpanButton = document.querySelector('.simpan'); 
    
//     const tanggalRecruiterInput = document.getElementById('tanggal_recruiter');

//     // Mengatur tanggal hari ini sebagai nilai default untuk 'Tanggal Pembuatan'
//     const today = new Date();
//     const year = today.getFullYear();
//     const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
//     const day = String(today.getDate()).padStart(2, '0');
//     tanggalRecruiterInput.value = `${year}-${month}-${day}`;

//     // Pastikan tombol 'simpan' ditemukan sebelum menambahkan event listener
//     if (simpanButton) {
//         simpanButton.addEventListener('click', (event) => {
//             event.preventDefault(); // Mencegah form di-submit secara default

//             // --- FUNGSI UNTUK MENGAMBIL NILAI CHECKBOX YANG TERPILIH ---
//             function getCheckedValues(containerId) {
//                 const checkboxes = document.querySelectorAll(`#${containerId} input[type="checkbox"]:checked`);
//                 return Array.from(checkboxes).map(checkbox => checkbox.value);
//             }

//             const formData = {
//                 tanggal_recruiter: document.getElementById('tanggal_recruiter').value,
//                 jabatan_karyawan: document.getElementById('jabatan_karyawan').value,
//                 deskripsi_pekerjaan: document.getElementById('deskripsi_pekerjaan').value,
//                 tanggungjawab_pekerjaan: document.getElementById('tanggungjawab_pekerjaan').value,
//                 keahlian: document.getElementById('keahlian').value,
//                 // Mengambil nilai dari checkbox menggunakan fungsi pembantu
//                 pendidikan: getCheckedValues('pendidikan'), 
//                 pengalaman: getCheckedValues('pengalaman'),
//                 tipe_pekerjaan: document.getElementById('tipe_pekerjaan').value,
//                 gaji: document.getElementById('gaji').value,
//                 status: 'active' // Status default saat pertama kali diiklankan
//             };

//             // Debugging: Cek data yang akan disimpan di konsol
//             console.log("Data yang akan disimpan:", formData);

//             // Ambil data lowongan yang sudah ada dari Local Storage, atau array kosong jika belum ada
//             const existingJobPostings = JSON.parse(localStorage.getItem('jobPostings')) || [];

//             // Tambahkan lowongan kerja baru ke array
//             existingJobPostings.push(formData);

//             // Simpan kembali array yang sudah diperbarui ke Local Storage
//             localStorage.setItem('jobPostings', JSON.stringify(existingJobPostings));

//             // Debugging: Cek isi Local Storage setelah disimpan
//             console.log("Local Storage setelah menyimpan:", JSON.parse(localStorage.getItem('jobPostings')));

//             // Redirect ke halaman recruiter.html
//             window.location.href = 'recruiter.html';
//         });
//     } else {
//         console.error("Error: Tombol dengan class 'simpan' tidak ditemukan di recruiter2.html");
//     }
// });





// recruiter2.js
document.addEventListener('DOMContentLoaded', () => {
    const formRecruiter = document.getElementById('formrecruiter');
    const simpanButton = document.querySelector('.simpan');
    const tanggalRecruiterInput = document.getElementById('tanggal_recruiter');

    // Mengatur tanggal hari ini sebagai nilai default untuk 'Tanggal Pembuatan'
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    tanggalRecruiterInput.value = `${year}-${month}-${day}`;

    // --- Data Pelamar Dummy (Bisa Anda Kembangkan) ---
 
    const dummyCandidates = [
        { nama_pelamar: "Andi Wijaya", no_telepon: "081211112222", pendidikan: ["Sarjana/S1"], pengalaman: ["1-2 Tahun"], deskripsi: "Antusias di bidang IT.", jabatan_terkait: ["software engineer", "technical support staff"] },
        { nama_pelamar: "Bunga Lestari", no_telepon: "081333334444", pendidikan: ["Master/ S2"], pengalaman: ["3-5 Tahun"], deskripsi: "Berpengalaman di manajemen keuangan.", jabatan_terkait: ["manajer keuangan", "staff Akuntansi"] },
        { nama_pelamar: "Candra Kirana", no_telepon: "081955556666", pendidikan: ["Diploma/D3"], pengalaman: ["Fresh Graduate"], deskripsi: "Lulusan baru dengan semangat belajar.", jabatan_terkait: ["staff pemasaran", "operator produksi"] },
        { nama_pelamar: "Dina Putri", no_telepon: "087877778888", pendidikan: ["Sarjana/S1"], pengalaman: ["6-10 Tahun"], deskripsi: "Pakar di bidang pemasaran digital.", jabatan_terkait: ["spesialisasi marketing", "manajer pemasaran"] },
        { nama_pelamar: "Eko Prasetyo", no_telepon: "085299990000", pendidikan: ["SMA / SMK/ STM"], pengalaman: ["1-2 Tahun"], deskripsi: "Teknisi handal dengan pengalaman lapangan.", jabatan_terkait: ["operator produksi", "technical support staff"] },
        { nama_pelamar: "Fina Indah", no_telepon: "081122334455", pendidikan: ["Sarjana/S1"], pengalaman: ["3-5 Tahun"], deskripsi: "Spesialis HR dengan fokus rekrutmen.", jabatan_terkait: ["staff hrd", "spesialis rekruitmen"] },
        { nama_pelamar: "Fitria", no_telepon: "081122334455", pendidikan: ["Sarjana/S1"], pengalaman: ["3-5 Tahun"], deskripsi: "Spesialis HR dengan fokus rekrutmen.", jabatan_terkait: ["staff hrd", "spesialis rekruitmen"] },
        { nama_pelamar: "Eko saputra", no_telepon: "087877778888", pendidikan: ["Sarjana/S1"], pengalaman: ["6-10 Tahun"], deskripsi: "Pakar di bidang pemasaran digital.", jabatan_terkait: ["spesialisasi marketing", "manajer pemasaran"] },
        { nama_pelamar: "Dudi", no_telepon: "085299990000", pendidikan: ["SMA / SMK/ STM"], pengalaman: ["1-2 Tahun"], deskripsi: "Teknisi handal dengan pengalaman lapangan.", jabatan_terkait: ["staff logistik", "technical support staff"] },
        // Anda mungkin perlu menambahkan lebih banyak pelamar dummy atau menyesuaikan yang sudah ada
        // agar mencakup semua opsi jabatan yang ada di HTML Anda.
          // Keuangan
          { nama_pelamar: "Andi Wijaya", no_telepon: "081211112222", pendidikan: ["Sarjana/S1"], pengalaman: ["1-2 Tahun"], deskripsi: "Antusias di bidang akuntansi dan keuangan, cepat belajar.", jabatan_terkait: ["staff Akuntansi", "akuntan pajak"] },
          { nama_pelamar: "Bunga Lestari", no_telepon: "081333334444", pendidikan: ["Master/S2"], pengalaman: ["3-5 Tahun"], deskripsi: "Berpengalaman di manajemen keuangan dan audit internal.", jabatan_terkait: ["manajer keuangan", "internal auditor", "akuntan pajak"] },
          { nama_pelamar: "Citra Dewi", no_telepon: "081912345678", pendidikan: ["Sarjana/S1"], pengalaman: ["6-10 Tahun"], deskripsi: "Pakar strategi keuangan, mampu memimpin tim besar.", jabatan_terkait: ["direktur keuangan", "manajer keuangan", "kepala departemen audit internal"] },
          { nama_pelamar: "Dimas Pratama", no_telepon: "087788889999", pendidikan: ["Diploma/D3"], pengalaman: ["Fresh Graduate"], deskripsi: "Cermat dan teliti dalam pembukuan dasar.", jabatan_terkait: ["staff Akuntansi"] },
          { nama_pelamar: "Eka Suryani", no_telepon: "085611223344", pendidikan: ["Sarjana/S1"], pengalaman: ["3-5 Tahun"], deskripsi: "Fokus pada kepatuhan pajak dan pelaporan keuangan.", jabatan_terkait: ["akuntan pajak", "staff Akuntansi"] },
          { nama_pelamar: "Faisal Rahman", no_telepon: "081223456789", pendidikan: ["Sarjana/S1"], pengalaman: ["Fresh Graduate"], deskripsi: "Tertarik pada analisis finansial dan data.", jabatan_terkait: ["staff Akuntansi"] }, // Tambahan untuk fresh graduate akuntansi
  
          // Pemasaran & Penjualan
          { nama_pelamar: "Farah Adiba", no_telepon: "081122334455", pendidikan: ["Sarjana/S1"], pengalaman: ["1-2 Tahun"], deskripsi: "Kreatif dan adaptif di dunia pemasaran digital, menguasai SEO/SEM.", jabatan_terkait: ["staff pemasaran", "spesialisasi marketing"] },
          { nama_pelamar: "Gilang Ramadhan", no_telepon: "081234567890", pendidikan: ["Sarjana/S1"], pengalaman: ["3-5 Tahun"], deskripsi: "Berpengalaman dalam pengembangan strategi pemasaran terintegrasi.", jabatan_terkait: ["manajer pemasaran", "spesialisasi marketing"] },
          { nama_pelamar: "Hanafi Putra", no_telepon: "087890123456", pendidikan: ["Master/S2"], pengalaman: ["6-10 Tahun"], deskripsi: "Visioner dalam kepemimpinan departemen pemasaran, berorientasi hasil.", jabatan_terkait: ["kepala departement pemasaran", "manajer pemasaran"] },
          { nama_pelamar: "Indah Permata", no_telepon: "085711112222", pendidikan: ["SMA / SMK/ STM"], pengalaman: ["1-2 Tahun"], deskripsi: "Enerjik, komunikatif, dan berorientasi target dalam penjualan.", jabatan_terkait: ["sales executive"] },
          { nama_pelamar: "Joko Susilo", no_telepon: "081322223333", pendidikan: ["Sarjana/S1"], pengalaman: ["3-5 Tahun"], deskripsi: "Mampu memotivasi tim penjualan dan menganalisis pasar.", jabatan_terkait: ["sales manager", "sales executive"] },
          { nama_pelamar: "Kartika Sari", no_telepon: "081744445555", pendidikan: ["Sarjana/S1"], pengalaman: ["6-10 Tahun"], deskripsi: "Pemimpin strategis untuk tim penjualan skala besar, penguasa pasar.", jabatan_terkait: ["kepala departemen penjualan", "sales manager"] },
          { nama_pelamar: "Lia Mariana", no_telepon: "081812121212", pendidikan: ["Diploma/D3"], pengalaman: ["Fresh Graduate"], deskripsi: "Memiliki dasar yang kuat dalam komunikasi penjualan dan negosiasi.", jabatan_terkait: ["sales executive"] }, // Tambahan untuk fresh graduate sales
  
          // HRD
          { nama_pelamar: "Lina Marlina", no_telepon: "081866667777", pendidikan: ["Sarjana/S1"], pengalaman: ["Fresh Graduate"], deskripsi: "Tertarik pada pengembangan sumber daya manusia dan administrasi HR.", jabatan_terkait: ["staff hrd"] },
          { nama_pelamar: "Mirza Fachri", no_telepon: "085888889999", pendidikan: ["Sarjana/S1"], pengalaman: ["1-2 Tahun"], deskripsi: "Cepat belajar dan adaptif dalam proses rekrutmen dan seleksi.", jabatan_terkait: ["spesialis rekruitmen", "staff hrd"] },
          { nama_pelamar: "Nia Kurnia", no_telepon: "081500001111", pendidikan: ["Master/S2"], pengalaman: ["3-5 Tahun"], deskripsi: "Ahli dalam merancang program pelatihan dan pengembangan karyawan.", jabatan_terkait: ["manajer pelatihan", "spesialis rekruitmen"] },
          { nama_pelamar: "Omar Wijaya", no_telepon: "087722334455", pendidikan: ["Sarjana/S1"], pengalaman: ["6-10 Tahun"], deskripsi: "Strategis dalam pengelolaan SDM secara keseluruhan, termasuk hubungan industrial.", jabatan_terkait: ["kepala departemen sdm", "manajer pelatihan"] },
  
          // Operasional & Produksi
          { nama_pelamar: "Putra Sanjaya", no_telepon: "081633445566", pendidikan: ["SMA / SMK/ STM"], pengalaman: ["1-2 Tahun"], deskripsi: "Teliti, bertanggung jawab, dan patuh prosedur di lini produksi.", jabatan_terkait: ["operator produksi"] },
          { nama_pelamar: "Qori Amelia", no_telepon: "081255667788", pendidikan: ["Diploma/D3"], pengalaman: ["3-5 Tahun"], deskripsi: "Mampu mengawasi, memimpin tim kecil, dan meningkatkan efisiensi produksi.", jabatan_terkait: ["suverpisor produksi"] },
          { nama_pelamar: "Rani Suryadi", no_telepon: "087812312312", pendidikan: ["Sarjana/S1"], pengalaman: ["6-10 Tahun"], deskripsi: "Paham betul seluk beluk operasional bisnis, mampu mengoptimalkan proses.", jabatan_terkait: ["manajer operasional", "suverpisor produksi"] },
          { nama_pelamar: "Siska Wijoyo", no_telepon: "085734567890", pendidikan: ["Master/S2"], pengalaman: ["6-10 Tahun"], deskripsi: "Memimpin strategi operasional tingkat tinggi, ahli dalam efisiensi supply chain.", jabatan_terkait: ["kepala departemen operasional", "manajer operasional"] },
  
          // IT
          { nama_pelamar: "Taufik Hidayat", no_telepon: "081398765432", pendidikan: ["Sarjana/S1"], pengalaman: ["1-2 Tahun"], deskripsi: "Punya passion di pengembangan perangkat lunak, menguasai beberapa bahasa pemrograman.", jabatan_terkait: ["software engineer", "technical support staff"] },
          { nama_pelamar: "Umi Kalsum", no_telepon: "081512345678", pendidikan: ["Diploma/D3"], pengalaman: ["1-2 Tahun"], deskripsi: "Terampil dalam memecahkan masalah teknis hardware dan software.", jabatan_terkait: ["technical support staff"] },
          { nama_pelamar: "Vicky Gunawan", no_telepon: "087765432109", pendidikan: ["Sarjana/S1"], pengalaman: ["3-5 Tahun"], deskripsi: "Ahli dalam manajemen server, jaringan, dan keamanan sistem.", jabatan_terkait: ["system administrator", "software engineer"] },
          { nama_pelamar: "Wawan Setiawan", no_telepon: "085609876543", pendidikan: ["Master/S2"], pengalaman: ["6-10 Tahun"], deskripsi: "Memimpin tim IT, merancang arsitektur sistem, dan strategi teknologi.", jabatan_terkait: ["manajer IT", "system administrator"] },
          { nama_pelamar: "Xavier Lim", no_telepon: "081187654321", pendidikan: ["Doctor/S3"], pengalaman: ["6-10 Tahun"], deskripsi: "Pengambil keputusan strategis di bidang teknologi informasi, inovator.", jabatan_terkait: ["kepala departemen TI", "manajer IT"] },
  
          // R&D (Research & Development)
          { nama_pelamar: "Yulianti Dewi", no_telepon: "081276543210", pendidikan: ["Master/S2"], pengalaman: ["3-5 Tahun"], deskripsi: "Inovatif dalam penelitian dan pengembangan produk baru atau proses.", jabatan_terkait: ["peneliti"] },
          { nama_pelamar: "Zaky Fahmi", no_telepon: "087854321098", pendidikan: ["Doctor/S3"], pengalaman: ["6-10 Tahun"], deskripsi: "Memimpin inisiatif riset dan pengembangan, mengelola portofolio proyek R&D.", jabatan_terkait: ["kepala departemen R&D", "peneliti"] },
  
          // Pembelian & Logistik
          { nama_pelamar: "Aldo Saputra", no_telepon: "081345678901", pendidikan: ["Diploma/D3"], pengalaman: ["1-2 Tahun"], deskripsi: "Teliti dalam proses pengadaan barang, negosiasi harga dasar.", jabatan_terkait: ["staff pembelian"] },
          { nama_pelamar: "Bella Cahyani", no_telepon: "081987654321", pendidikan: ["Sarjana/S1"], pengalaman: ["3-5 Tahun"], deskripsi: "Negosiator ulung dalam pembelian dan manajemen vendor, ahli pengadaan.", jabatan_terkait: ["buyer", "manajer pembelian", "staff pembelian"] },
          { nama_pelamar: "Cokro Aminoto", no_telepon: "085211223355", pendidikan: ["Sarjana/S1"], pengalaman: ["6-10 Tahun"], deskripsi: "Mampu mengelola seluruh rantai pasok, optimasi biaya logistik.", jabatan_terkait: ["manajer logistik", "buyer"] },
          { nama_pelamar: "Dewi Sri", no_telepon: "087799887766", pendidikan: ["SMA / SMK/ STM"], pengalaman: ["1-2 Tahun"], deskripsi: "Terampil dalam manajemen stok, operasional gudang, dan distribusi.", jabatan_terkait: ["staff logistik", "koordinator gudang"] },
          { nama_pelamar: "Eri Firmansyah", no_telepon: "081233445577", pendidikan: ["Diploma/D3"], pengalaman: ["3-5 Tahun"], deskripsi: "Berpengalaman dalam koordinasi pengiriman dan penerimaan barang.", jabatan_terkait: ["koordinator gudang", "staff logistik"] }, // Tambahan koordinator gudang
  
          // Layanan Pelanggan (Customer Service)
          { nama_pelamar: "Putri Anggraini", no_telepon: "081155667788", pendidikan: ["SMA / SMK/ STM", "Diploma/D3"], pengalaman: ["1-2 Tahun"], deskripsi: "Ramah, sabar, dan komunikatif dalam melayani serta menyelesaikan masalah pelanggan.", jabatan_terkait: ["customer service"] },
          { nama_pelamar: "Rifqi Fadilah", no_telepon: "081277889900", pendidikan: ["Sarjana/S1"], pengalaman: ["3-5 Tahun"], deskripsi: "Mampu mengelola tim customer service dan strategi kepuasan pelanggan.", jabatan_terkait: ["customer service"] }, // Manajer customer service (bisa disesuaikan jika ada posisi manajer CS)
  
          // Legal
          { nama_pelamar: "Rio Fernando", no_telepon: "081266778899", pendidikan: ["Sarjana/S1"], pengalaman: ["3-5 Tahun"], deskripsi: "Paham hukum korporasi dan kontrak, mampu memberikan nasihat hukum.", jabatan_terkait: ["legal counsel"] },
          { nama_pelamar: "Siti Nurjanah", no_telepon: "085700112233", pendidikan: ["Master/S2"], pengalaman: ["6-10 Tahun"], deskripsi: "Pengambil keputusan utama dalam masalah hukum perusahaan, strategi litigasi.", jabatan_terkait: ["general counsel", "legal counsel"] },
  
          // Administrasi
          { nama_pelamar: "Tono Permana", no_telepon: "081311223344", pendidikan: ["SMA / SMK/ STM"], pengalaman: ["Fresh Graduate"], deskripsi: "Teliti dalam administrasi perkantoran dan pengarsipan dokumen.", jabatan_terkait: ["staff adminstrasi"] },
          { nama_pelamar: "Uswatun Hasanah", no_telepon: "087855667788", pendidikan: ["Diploma/D3"], pengalaman: ["1-2 Tahun"], deskripsi: "Profesional dalam pengaturan jadwal, korespondensi, dan dukungan operasional.", jabatan_terkait: ["sekretaris", "staff adminstrasi"] },
          { nama_pelamar: "Vina Lestari", no_telepon: "081599887766", pendidikan: ["Sarjana/S1"], pengalaman: ["3-5 Tahun"], deskripsi: "Mampu mengelola tim administrasi, meningkatkan efisiensi dan sistem kantor.", jabatan_terkait: ["kepala departemen administrasi", "sekretaris"] },
  
          // Audit Internal
          { nama_pelamar: "Wira Dharma", no_telepon: "081100112233", pendidikan: ["Sarjana/S1"], pengalaman: ["3-5 Tahun"], deskripsi: "Berorientasi pada kepatuhan, mitigasi risiko, dan perbaikan proses internal.", jabatan_terkait: ["internal auditor"] },
          { nama_pelamar: "Yuniarti", no_telepon: "085244556677", pendidikan: ["Master/S2"], pengalaman: ["6-10 Tahun"], deskripsi: "Pemimpin tim audit internal, mampu merancang program audit komprehensif.", jabatan_terkait: ["kepala departemen audit internal", "internal auditor"] },
  
          // Quality Control
          { nama_pelamar: "Zulkifli Anwar", no_telepon: "081377889900", pendidikan: ["Diploma/D3"], pengalaman: ["1-2 Tahun"], deskripsi: "Teliti dalam inspeksi kualitas produk, mampu mengidentifikasi cacat.", jabatan_terkait: ["staff quality control"] },
          { nama_pelamar: "Amanda Putri", no_telepon: "087711223344", pendidikan: ["Sarjana/S1"], pengalaman: ["3-5 Tahun"], deskripsi: "Mampu mengembangkan dan mengimplementasikan standar kualitas, analisis data QC.", jabatan_terkait: ["manajer kualitas", "staff quality control"] },
          { nama_pelamar: "Bagus Setiadi", no_telepon: "085699887766", pendidikan: ["Master/S2"], pengalaman: ["6-10 Tahun"], deskripsi: "Memimpin seluruh sistem manajemen kualitas, sertifikasi ISO.", jabatan_terkait: ["kepala departemen kualitas", "manajer kualitas"] },
  
          // Komunikasi (Public Relations/Corporate Communications)
          { nama_pelamar: "Chandra Wibowo", no_telepon: "081222334455", pendidikan: ["Sarjana/S1"], pengalaman: ["1-2 Tahun"], deskripsi: "Mahir dalam komunikasi publik, media sosial, dan penulisan konten.", jabatan_terkait: ["spesialis komunikasi"] },
          { nama_pelamar: "Diana Lestari", no_telepon: "081933445566", pendidikan: ["Sarjana/S1"], pengalaman: ["3-5 Tahun"], deskripsi: "Strategis dalam mengelola reputasi dan hubungan masyarakat, manajemen krisis.", jabatan_terkait: ["manajer komunikasi", "spesialis komunikasi"] },
          { nama_pelamar: "Fajar Gemilang", no_telepon: "087844556677", pendidikan: ["Master/S2"], pengalaman: ["6-10 Tahun"], deskripsi: "Memimpin departemen komunikasi korporat, membangun citra perusahaan.", jabatan_terkait: ["kepala departemen komunikasi", "manajer komunikasi"] }
      
    ];
    // --- Akhir Data Pelamar Dummy ---

    if (simpanButton) {
        simpanButton.addEventListener('click', (event) => {
            event.preventDefault();

            function getCheckedValues(containerId) {
                const checkboxes = document.querySelectorAll(`#${containerId} input[type="checkbox"]:checked`);
                return Array.from(checkboxes).map(checkbox => checkbox.value);
            }

            const formData = {
                tanggal_recruiter: document.getElementById('tanggal_recruiter').value,
                jabatan_karyawan: document.getElementById('jabatan_karyawan').value,
                deskripsi_pekerjaan: document.getElementById('deskripsi_pekerjaan').value,
                tanggungjawab_pekerjaan: document.getElementById('tanggungjawab_pekerjaan').value,
                keahlian: document.getElementById('keahlian').value,
                pendidikan: getCheckedValues('pendidikan'),
                pengalaman: getCheckedValues('pengalaman'),
                tipe_pekerjaan: document.getElementById('tipe_pekerjaan').value,
                gaji: document.getElementById('gaji').value,
                status: 'active',
                id_lowongan: Date.now() // ID unik untuk lowongan ini
            };

            const existingJobPostings = JSON.parse(localStorage.getItem('jobPostings')) || [];
            existingJobPostings.push(formData);
            localStorage.setItem('jobPostings', JSON.stringify(existingJobPostings));

            // --- Logika Menghasilkan Pelamar Otomatis ---
            const currentCandidates = JSON.parse(localStorage.getItem('appliedCandidates')) || [];
            
            // Filter dummy candidates yang cocok dengan jabatan lowongan ini
            const matchingCandidates = dummyCandidates.filter(candidate =>
                candidate.jabatan_terkait.includes(formData.jabatan_karyawan)
            );

            // Jika ada pelamar yang cocok, tambahkan ke daftar pelamar yang melamar
            matchingCandidates.forEach(candidate => {
                currentCandidates.push({
                    id_lowongan: formData.id_lowongan, // Kaitkan pelamar dengan ID lowongan
                    jabatan_lowongan: formData.jabatan_karyawan,
                    status_lowongan: formData.status, // Ambil status lowongan saat ini
                    nama_pelamar: candidate.nama_pelamar,
                    no_telepon: candidate.no_telepon,
                    pendidikan: candidate.pendidikan,
                    pengalaman: candidate.pengalaman,
                    deskripsi: candidate.deskripsi,
                    status_lamaran: 'Pending' // Status awal lamaran
                });
            });

            localStorage.setItem('appliedCandidates', JSON.stringify(currentCandidates));
            // --- Akhir Logika Menghasilkan Pelamar Otomatis ---

            console.log("Lowongan baru disimpan:", formData);
            console.log("Pelamar yang dihasilkan:", matchingCandidates);
            console.log("Local Storage 'appliedCandidates' setelah menyimpan:", JSON.parse(localStorage.getItem('appliedCandidates')));

            window.location.href = 'recruiter.html';
        });
    } else {
        console.error("Error: Tombol dengan class 'simpan' tidak ditemukan di recruiter2.html");
    }
});