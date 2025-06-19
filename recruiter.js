// // recruiter.js
// document.addEventListener('DOMContentLoaded', () => {
//     const tableBody = document.querySelector('.table tbody'); // Dapatkan elemen <tbody> dari tabel

//     // Fungsi untuk menampilkan lowongan kerja di tabel
//     function renderJobPostings() {
//         tableBody.innerHTML = ''; // Bersihkan baris tabel yang ada sebelum mengisi ulang

//         // Ambil data lowongan kerja dari localStorage
//         const jobPostings = JSON.parse(localStorage.getItem('jobPostings')) || [];

//         if (jobPostings.length === 0) {
//             // Tampilkan pesan jika tidak ada lowongan kerja yang diiklankan
//             const noDataRow = document.createElement('tr');
//             noDataRow.innerHTML = '<td colspan="3" style="text-align: center; padding: 20px;">Belum ada lowongan pekerjaan yang diiklankan.</td>';
//             tableBody.appendChild(noDataRow);
//             return; // Hentikan fungsi di sini
//         }

//         // Iterasi setiap lowongan kerja dan buat baris tabel
//         jobPostings.forEach((job, index) => {
//             const row = document.createElement('tr');

//             // Tambahkan class 'stopped' jika lowongan sudah dihentikan iklannya
//             if (job.status === 'stopped') {
//                 row.classList.add('stopped-ad'); // Tambahkan class CSS untuk styling lowongan yang dihentikan
//             }

//             // --- PERHATIAN: PERBAIKAN PENTING DI BAGIAN INI ---
//             // Pastikan job.pendidikan dan job.pengalaman adalah array sebelum memanggil .join()
//             const displayPendidikan = Array.isArray(job.pendidikan) && job.pendidikan.length > 0 ? job.pendidikan.join(', ') : '-';
//             const displayPengalaman = Array.isArray(job.pengalaman) && job.pengalaman.length > 0 ? job.pengalaman.join(', ') : '-';
//             // --- AKHIR PERBAIKAN ---

//             row.innerHTML = `
//                 <td>${job.tanggal_recruiter}</td>
//                 <td>${job.jabatan_karyawan}</td>
//                 <td>
//                     <p><strong>Deskripsi Pekerjaan:</strong> ${job.deskripsi_pekerjaan}</p>
//                     <p><strong>Tanggung Jawab Pekerjaan:</strong> ${job.tanggungjawab_pekerjaan}</p>
//                     <p><strong>Keahlian:</strong> ${job.keahlian}</p>
//                     <p><strong>Bidang Pendidikan:</strong> ${displayPendidikan}</p>
//                     <p><strong>Syarat Pengalaman:</strong> ${displayPengalaman}</p>
//                     <p><strong>Tipe Pekerjaan:</strong> ${job.tipe_pekerjaan}</p>
//                     <p><strong>Gaji:</strong> ${job.gaji}</p>
//                     <p><strong>Status Iklan:</strong> <span class="job-status">${job.status === 'stopped' ? 'Dihentikan' : 'Aktif'}</span></p>
//                     <div class="action-buttons">
//                         <button class="stop-ad-btn ${job.status === 'stopped' ? 'stopped' : ''}"
//                                 data-index="${index}"
//                                 ${job.status === 'stopped' ? 'disabled' : ''}>
//                             ${job.status === 'stopped' ? 'Dihentikan' : 'Stop Iklankan'}
//                         </button>
//                         <button class="delete-btn" data-index="${index}">Hapus</button>
//                     </div>
//                 </td>
//             `;
//             tableBody.appendChild(row);
//         });

//         // --- Event listener untuk tombol "Stop Iklankan" ---
//         document.querySelectorAll('.stop-ad-btn').forEach(button => {
//             button.addEventListener('click', (event) => {
//                 const indexToStop = event.target.dataset.index;
//                 let currentJobPostings = JSON.parse(localStorage.getItem('jobPostings')) || [];

//                 if (currentJobPostings[indexToStop]) {
//                     currentJobPostings[indexToStop].status = 'stopped'; // Ubah status menjadi 'stopped'
//                     localStorage.setItem('jobPostings', JSON.stringify(currentJobPostings));
//                     renderJobPostings(); // Muat ulang tabel untuk menampilkan perubahan status DAN styling
//                 }
//             });
//         });

//         // --- Event listener untuk tombol "Hapus" ---
//         document.querySelectorAll('.delete-btn').forEach(button => {
//             button.addEventListener('click', (event) => {
//                 const indexToDelete = event.target.dataset.index;
//                 let currentJobPostings = JSON.parse(localStorage.getItem('jobPostings')) || [];

//                 currentJobPostings.splice(indexToDelete, 1); // Hapus item dari array
//                 localStorage.setItem('jobPostings', JSON.stringify(currentJobPostings)); // Simpan array yang sudah diperbarui
//                 renderJobPostings(); // Muat ulang tabel untuk menampilkan perubahan
//             });
//         });
//     }

//     // Panggil fungsi ini saat halaman pertama kali dimuat
//     renderJobPostings();
// });






// recruiter.js
document.addEventListener('DOMContentLoaded', () => {
    // Ubah selector ini sesuai dengan struktur tabel yang Anda gunakan (misal: .table-content tbody jika pakai scrollable table body)
    const tableBody = document.querySelector('.table tbody');
    const pageNumbersSpan = document.querySelector('.page-numbers');
    const prevButton = document.querySelector('.prev');
    const nextButton = document.querySelector('.next');

    const itemsPerPage = 2; // Jumlah data per halaman
    let currentPage = 1; // Halaman saat ini

    let allJobPostings = []; // Variabel untuk menyimpan semua data lowongan

    function getJobPostings() {
        return JSON.parse(localStorage.getItem('jobPostings')) || [];
    }

    function renderJobPostings() {
        allJobPostings = getJobPostings(); // Ambil semua data lowongan
        
        // Hitung total halaman
        const totalPages = Math.ceil(allJobPostings.length / itemsPerPage);

        // Pastikan currentPage tidak melebihi totalPages (jika data dihapus atau berubah)
        if (currentPage > totalPages && totalPages > 0) {
            currentPage = totalPages;
        } else if (totalPages === 0) {
            currentPage = 0; // Tidak ada halaman jika tidak ada data
        }

        tableBody.innerHTML = ''; // Bersihkan tabel

        if (allJobPostings.length === 0) {
            const noDataRow = document.createElement('tr');
            noDataRow.innerHTML = '<td colspan="3" style="text-align: center; padding: 20px;">Belum ada lowongan pekerjaan yang diiklankan.</td>';
            tableBody.appendChild(noDataRow);
            // Sembunyikan pagination jika tidak ada data
            prevButton.style.display = 'none';
            nextButton.style.display = 'none';
            pageNumbersSpan.textContent = '';
            return;
        }

        // Tampilkan pagination
        prevButton.style.display = 'inline-block';
        nextButton.style.display = 'inline-block';

        // Hitung indeks awal dan akhir untuk data di halaman ini
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;

        // Ambil data untuk halaman saat ini
        const jobsToDisplay = allJobPostings.slice(startIndex, endIndex);

        jobsToDisplay.forEach((job, index) => {
            // Kita perlu index aslinya di allJobPostings untuk operasi Stop/Delete
            const originalIndex = allJobPostings.indexOf(job); 

            const row = document.createElement('tr');

            if (job.status === 'stopped') {
                row.classList.add('stopped-ad');
            }

            const displayPendidikan = Array.isArray(job.pendidikan) && job.pendidikan.length > 0 ? job.pendidikan.join(', ') : '-';
            const displayPengalaman = Array.isArray(job.pengalaman) && job.pengalaman.length > 0 ? job.pengalaman.join(', ') : '-';

            row.innerHTML = `
                <td>${job.tanggal_recruiter}</td>
                <td>${job.jabatan_karyawan}</td>
                <td>
                    <p><strong>Deskripsi Pekerjaan:</strong> ${job.deskripsi_pekerjaan}</p>
                    <p><strong>Tanggung Jawab Pekerjaan:</strong> ${job.tanggungjawab_pekerjaan}</p>
                    <p><strong>Keahlian:</strong> ${job.keahlian}</p>
                    <p><strong>Bidang Pendidikan:</strong> ${displayPendidikan}</p>
                    <p><strong>Syarat Pengalaman:</strong> ${displayPengalaman}</p>
                    <p><strong>Tipe Pekerjaan:</strong> ${job.tipe_pekerjaan}</p>
                    <p><strong>Gaji:</strong> ${job.gaji}</p>
                    <p><strong>Status Iklan:</strong> <span class="job-status">${job.status === 'stopped' ? 'Dihentikan' : 'Aktif'}</span></p>
                    <div class="action-buttons">
                        <button class="stop-ad-btn ${job.status === 'stopped' ? 'stopped' : ''}"
                                data-index="${originalIndex}"
                                data-id-lowongan="${job.id_lowongan}"
                                ${job.status === 'stopped' ? 'disabled' : ''}>
                            ${job.status === 'stopped' ? 'Dihentikan' : 'Stop Iklankan'}
                        </button>
                        <button class="delete-btn" data-index="${originalIndex}">Hapus</button>
                    </div>
                </td>
            `;
            tableBody.appendChild(row);
        });

        // Update teks nomor halaman
        pageNumbersSpan.textContent = `Halaman ${currentPage} dari ${totalPages}`;

        // Atur status tombol Sebelumnya/Selanjutnya
        prevButton.disabled = currentPage === 1;
        nextButton.disabled = currentPage === totalPages || totalPages === 0;

        // --- Event Listeners untuk Tombol Aksi (Stop/Hapus) ---
        // PENTING: Attach event listeners SETELAH DOM dirender
        document.querySelectorAll('.stop-ad-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const indexToStop = parseInt(event.target.dataset.index); // Parse ke integer
                const idLowonganToStop = event.target.dataset.idLowongan;
                
                let currentJobPostings = getJobPostings(); // Ambil data terbaru
                let appliedCandidates = JSON.parse(localStorage.getItem('appliedCandidates')) || [];

                if (currentJobPostings[indexToStop]) {
                    currentJobPostings[indexToStop].status = 'stopped';
                    localStorage.setItem('jobPostings', JSON.stringify(currentJobPostings));

                    appliedCandidates = appliedCandidates.map(candidate => {
                        if (candidate.id_lowongan == idLowonganToStop) {
                            candidate.status_lowongan = 'stopped';
                        }
                        return candidate;
                    });
                    localStorage.setItem('appliedCandidates', JSON.stringify(appliedCandidates));
                    
                    renderJobPostings(); // Render ulang tabel setelah perubahan
                }
            });
        });

        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const indexToDelete = parseInt(event.target.dataset.index); // Parse ke integer
                const idLowonganToDelete = allJobPostings[indexToDelete].id_lowongan; // Ambil ID dari allJobPostings

                let currentJobPostings = getJobPostings(); // Ambil data terbaru
                let appliedCandidates = JSON.parse(localStorage.getItem('appliedCandidates')) || [];

                currentJobPostings.splice(indexToDelete, 1); // Hapus item dari array
                localStorage.setItem('jobPostings', JSON.stringify(currentJobPostings));

                appliedCandidates = appliedCandidates.filter(candidate => candidate.id_lowongan != idLowonganToDelete);
                localStorage.setItem('appliedCandidates', JSON.stringify(appliedCandidates));

                renderJobPostings(); // Render ulang tabel setelah penghapusan
            });
        });
    }

    // Fungsi untuk navigasi pagination
    window.prevPage = () => {
        if (currentPage > 1) {
            currentPage--;
            renderJobPostings();
        }
    };

    window.nextPage = () => {
        const totalPages = Math.ceil(allJobPostings.length / itemsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            renderJobPostings();
        }
    };

    // Panggil renderJobPostings pertama kali saat DOMContentLoaded
    renderJobPostings();
});