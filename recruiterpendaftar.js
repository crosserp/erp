// recruiterpendaftar.js
document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.querySelector('.table tbody');
    const filterActiveBtn = document.getElementById('filterActive');
    const filterStoppedBtn = document.getElementById('filterStopped');
    const filterAllBtn = document.getElementById('filterAll');

    let currentFilter = 'active'; // Default filter

    function renderAppliedCandidates() {
        tableBody.innerHTML = ''; // Bersihkan tabel

        const appliedCandidates = JSON.parse(localStorage.getItem('appliedCandidates')) || [];

        // Filter berdasarkan status lowongan
        const filteredCandidates = appliedCandidates.filter(candidate => {
            if (currentFilter === 'active') {
                return candidate.status_lowongan === 'active';
            } else if (currentFilter === 'stopped') {
                return candidate.status_lowongan === 'stopped';
            }
            return true; // 'all' filter
        });

        if (filteredCandidates.length === 0) {
            const noDataRow = document.createElement('tr');
            noDataRow.innerHTML = '<td colspan="4" style="text-align: center; padding: 20px;">Belum ada pelamar yang masuk untuk kategori ini.</td>';
            tableBody.appendChild(noDataRow);
            return;
        }

        filteredCandidates.forEach((candidate, index) => {
            const row = document.createElement('tr');

            // Tambahkan kelas jika lowongan terkait sudah dihentikan
            if (candidate.status_lowongan === 'stopped') {
                row.classList.add('stopped-applicant');
            }

            // Pastikan pendidikan dan pengalaman adalah array sebelum join
            const displayPendidikan = Array.isArray(candidate.pendidikan) && candidate.pendidikan.length > 0 ? candidate.pendidikan.join(', ') : '-';
            const displayPengalaman = Array.isArray(candidate.pengalaman) && candidate.pengalaman.length > 0 ? candidate.pengalaman.join(', ') : '-';

            row.innerHTML = `
                <td>${candidate.jabatan_lowongan}</td>
                <td>${candidate.nama_pelamar}</td>
                <td>
                    <p><strong>No. Telepon:</strong> ${candidate.no_telepon}</p>
                    <p><strong>Pendidikan:</strong> ${displayPendidikan}</p>
                    <p><strong>Pengalaman:</strong> ${displayPengalaman}</p>
                    <p><strong>Deskripsi:</strong> ${candidate.deskripsi}</p>
                </td>
                <td>${candidate.status_lamaran}</td>
                `;
            tableBody.appendChild(row);
        });
    }

    // Event Listeners untuk tombol filter
    filterActiveBtn.addEventListener('click', () => {
        currentFilter = 'active';
        filterActiveBtn.classList.add('active');
        filterStoppedBtn.classList.remove('active');
        filterAllBtn.classList.remove('active');
        renderAppliedCandidates();
    });

    filterStoppedBtn.addEventListener('click', () => {
        currentFilter = 'stopped';
        filterActiveBtn.classList.remove('active');
        filterStoppedBtn.classList.add('active');
        filterAllBtn.classList.remove('active');
        renderAppliedCandidates();
    });

    filterAllBtn.addEventListener('click', () => {
        currentFilter = 'all';
        filterActiveBtn.classList.remove('active');
        filterStoppedBtn.classList.remove('active');
        filterAllBtn.classList.add('active');
        renderAppliedCandidates();
    });

    // Render pelamar saat halaman pertama kali dimuat
    renderAppliedCandidates();
});