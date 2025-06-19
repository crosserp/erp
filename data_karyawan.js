document.addEventListener('DOMContentLoaded', function() {
    const tableBody = document.querySelector('.table tbody');
    let dataKaryawan = localStorage.getItem('dataKaryawan');
    let karyawanArray = dataKaryawan ? JSON.parse(dataKaryawan) : [];

    function populateTable() {
        tableBody.innerHTML = ''; // Kosongkan isi tabel sebelum diisi ulang
        karyawanArray.forEach((karyawan, index) => {
            const row = tableBody.insertRow();
            row.dataset.index = index;

            const idKaryawanCell = row.insertCell();
            const namaKaryawanCell = row.insertCell();
            const jabatanKaryawanCell = row.insertCell();
            const emailKaryawanCell = row.insertCell();
            const rekeningKaryawanCell = row.insertCell();
            const tglMasukKaryawanCell = row.insertCell();
            const npwpKaryawanCell = row.insertCell();
            const departementCell = row.insertCell();
            const keteranganCell = row.insertCell();

            idKaryawanCell.textContent = karyawan.idKaryawan;
            namaKaryawanCell.textContent = karyawan.namaKaryawan;
            jabatanKaryawanCell.textContent = karyawan.jabatanKaryawan;
            emailKaryawanCell.textContent = karyawan.emailKaryawan;
            rekeningKaryawanCell.textContent = karyawan.rekeningKaryawan;
            tglMasukKaryawanCell.textContent = karyawan.tglMasukKaryawan;
            npwpKaryawanCell.textContent = karyawan.npwpKaryawan;
            departementCell.textContent = karyawan.departement;

            // Membuat tombol Update
            const updateButton = document.createElement('button');
            updateButton.textContent = 'Update';
            updateButton.classList.add('update-btn');

            // Membuat tombol Delete
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.classList.add('delete-btn');

            keteranganCell.appendChild(updateButton);
            keteranganCell.appendChild(document.createTextNode(' '));
            keteranganCell.appendChild(deleteButton);
        });
    }

    populateTable();

    tableBody.addEventListener('click', function(event) {
        const clickedElement = event.target;
        const row = clickedElement.closest('tr');
        const index = parseInt(row.dataset.index);

        if (clickedElement.classList.contains('delete-btn')) {
            if (confirm('Apakah Anda yakin ingin menghapus data karyawan ini?')) {
                karyawanArray.splice(index, 1);
                localStorage.setItem('dataKaryawan', JSON.stringify(karyawanArray));
                populateTable();
            }
        } else if (clickedElement.classList.contains('update-btn')) {
            // Redirect ke halaman edit data karyawan (buat halaman edit_karyawan.html)
            window.location.href = `edit_karyawan.html?index=${index}`;
            // Atau, jika ingin edit langsung di halaman ini (tanpa halaman baru),
            // Anda bisa implementasikan logika serupa dengan contoh edit data akun sebelumnya.
        }
    });
});