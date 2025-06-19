document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('datakaryawan');
    const linkSimpan = document.getElementById('linkSimpan');
    const idKaryawanInput = document.getElementById('id_karyawan');
    const namaKaryawanInput = document.getElementById('nama_karyawan');
    const jabatanKaryawanSelect = document.getElementById('jabatan_karyawan');
    const emailKaryawanInput = document.getElementById('email_karyawan');
    const rekeningKaryawanInput = document.getElementById('rekening_karyawan');
    const tglMasukKaryawanInput = document.getElementById('tgl_masuk_karyawan');
    const npwpKaryawanInput = document.getElementById('npwp_karyawan');
    const departementSelect = document.getElementById('departement');
    const linkBatal = document.getElementById('linkBatal');

    linkSimpan.addEventListener('click', function(event) {
        event.preventDefault(); // Mencegah link melakukan navigasi default

        const idKaryawan = idKaryawanInput.value;
        const namaKaryawan = namaKaryawanInput.value;
        const jabatanKaryawan = jabatanKaryawanSelect.value;
        const emailKaryawan = emailKaryawanInput.value;
        const rekeningKaryawan = rekeningKaryawanInput.value;
        const tglMasukKaryawan = tglMasukKaryawanInput.value;
        const npwpKaryawan = npwpKaryawanInput.value;
        const departement = departementSelect.value;

        // Ambil data karyawan yang sudah ada dari Local Storage
        let dataKaryawan = localStorage.getItem('dataKaryawan');
        dataKaryawan = dataKaryawan ? JSON.parse(dataKaryawan) : [];

        // Cek apakah ID karyawan sudah ada
        const isIdKaryawanExist = dataKaryawan.some(karyawan => karyawan.idKaryawan === idKaryawan);

        if (isIdKaryawanExist) {
            alert('ID Karyawan ini sudah ada. Silakan masukkan ID Karyawan yang berbeda.');
            idKaryawanInput.value = ''; // Kosongkan input ID karyawan
            idKaryawanInput.focus(); // Fokus kembali ke input ID karyawan
            return; // Hentikan proses penyimpanan
        }

        // Simpan data ke Local Storage jika ID karyawan belum ada
        const karyawanBaru = {
            idKaryawan: idKaryawan,
            namaKaryawan: namaKaryawan,
            jabatanKaryawan: jabatanKaryawan,
            emailKaryawan: emailKaryawan,
            rekeningKaryawan: rekeningKaryawan,
            tglMasukKaryawan: tglMasukKaryawan,
            npwpKaryawan: npwpKaryawan,
            departement: departement
        };

        dataKaryawan.push(karyawanBaru);
        localStorage.setItem('dataKaryawan', JSON.stringify(dataKaryawan));

        // Redirect ke halaman data_karyawan.html
        window.location.href = 'data_karyawan.html';
    });

    linkBatal.addEventListener('click', function(event) {
        window.location.href = 'data_karyawan.html'; // Kembali ke halaman data_karyawan.html tanpa menyimpan
    });
});