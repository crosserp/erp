document.addEventListener('DOMContentLoaded', function() {
    const tbody = document.querySelector('.table tbody');

    // Fungsi helper untuk mendapatkan Nama Pabrik dari ID Pabrik
    function getNamaPabrik(id_pabrik) {
        const factories = JSON.parse(localStorage.getItem('daftarPabrik')) || [];
        const factory = factories.find(f => f.id === id_pabrik);
        return factory ? `${factory.nama} (${factory.alamat})` : 'Tidak Diketahui';
    }

    // Fungsi untuk me-render ulang tabel mesin
    function renderTableMesin() {
        let daftarMesin = JSON.parse(localStorage.getItem('daftarMesin')) || [];

        if (!tbody) {
            console.error("Elemen <tbody> tabel tidak ditemukan!");
            return;
        }

        tbody.innerHTML = ''; // Kosongkan tbody sebelum mengisi data

        if (daftarMesin.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `<td colspan="8" style="text-align: center;">Belum ada data mesin.</td>`;
            tbody.appendChild(row);
        } else {
            daftarMesin.forEach(mesin => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${mesin.nomor_aset}</td>
                    <td>${mesin.nama_aset}</td>
                    <td>${mesin.jenis_mesin}</td>
                    <td>${getNamaPabrik(mesin.id_pabrik)}</td>
                    <td>${mesin.kapasitas} Produk</td>
                    <td>${mesin.pemeliharaan}</td>
                    <td>${mesin.teknisi}</td>
                    <td>
                        <button class="update-button" data-nomor-aset="${mesin.nomor_aset}">Update</button>
                        <button class="delete-button" data-nomor-aset="${mesin.nomor_aset}">Delete</button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        }
    }

    // Panggil fungsi renderTableMesin saat DOMContentLoaded
    renderTableMesin();

    // --- Event Listener untuk Tombol Update dan Delete ---
    tbody.addEventListener('click', function(event) {
        const target = event.target;
        const nomorAset = target.getAttribute('data-nomor-aset');

        if (target.classList.contains('update-button')) {
            if (nomorAset) {
                handleUpdateMesin(nomorAset);
            } else {
                console.error("Nomor Aset tidak ditemukan untuk update.");
            }
        } else if (target.classList.contains('delete-button')) {
            if (nomorAset) {
                handleDeleteMesin(nomorAset);
            } else {
                console.error("Nomor Aset tidak ditemukan untuk delete.");
            }
        }
    });

    // --- Fungsi Handler untuk Update Mesin ---
    function handleUpdateMesin(nomor_aset) {
        let daftarMesin = JSON.parse(localStorage.getItem('daftarMesin')) || [];
        const mesinToUpdate = daftarMesin.find(mesin => mesin.nomor_aset === nomor_aset);

        if (mesinToUpdate) {
            // Untuk update yang lebih baik, Anda bisa mengarahkan ke form mesin2.html
            // dengan mengisi data yang ada ke form tersebut.
            // Contoh sederhana menggunakan prompt:
            const newKapasitas = prompt(`Update Kapasitas (${mesinToUpdate.kapasitas}):`, mesinToUpdate.kapasitas);
            const newPemeliharaan = prompt(`Update Pemeliharaan (${mesinToUpdate.pemeliharaan}):`, mesinToUpdate.pemeliharaan);
            const newTeknisi = prompt(`Update Teknisi (${mesinToUpdate.teknisi}):`, mesinToUpdate.teknisi);

            if (newKapasitas !== null) mesinToUpdate.kapasitas = newKapasitas;
            if (newPemeliharaan !== null) mesinToUpdate.pemeliharaan = newPemeliharaan;
            if (newTeknisi !== null) mesinToUpdate.teknisi = newTeknisi;

            localStorage.setItem('daftarMesin', JSON.stringify(daftarMesin));
            alert(`Mesin dengan Nomor Aset ${nomor_aset} berhasil diupdate.`);
            renderTableMesin();
        } else {
            alert(`Mesin dengan Nomor Aset ${nomor_aset} tidak ditemukan.`);
        }
    }

    // --- Fungsi Handler untuk Delete Mesin ---
    function handleDeleteMesin(nomor_aset) {
        if (confirm(`Apakah Anda yakin ingin menghapus mesin dengan Nomor Aset ${nomor_aset}?`)) {
            let daftarMesin = JSON.parse(localStorage.getItem('daftarMesin')) || [];
            
            const updatedDaftarMesin = daftarMesin.filter(mesin => mesin.nomor_aset !== nomor_aset);

            if (updatedDaftarMesin.length < daftarMesin.length) {
                localStorage.setItem('daftarMesin', JSON.stringify(updatedDaftarMesin));
                alert(`Mesin dengan Nomor Aset ${nomor_aset} berhasil dihapus.`);
                renderTableMesin();
            } else {
                alert(`Mesin dengan Nomor Aset ${nomor_aset} tidak ditemukan.`);
            }
        }
    }
});