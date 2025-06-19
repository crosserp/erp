document.addEventListener('DOMContentLoaded', function() {
    const btnSimpan = document.getElementById('btnSimpan');
    const formData = document.getElementById('formData');

    btnSimpan.addEventListener('click', function(event) {
        // Prevent default action of the button (not strictly needed here since it's not inside a <form> with a submit)
        event.preventDefault();

        // Ambil nilai dari input fields
        const tanggal = document.getElementById('tipe').value;
        const namaSupplier = document.getElementById('namaSupplier').value;
        const waktu = document.getElementById('waktu').value;
        const ekspedisi = document.getElementById('ekspedisi').value;
        const kendaraan = document.getElementById('kendaraan').value;
        const supir = document.getElementById('supir').value;

        // Buat objek data
        const newData = {
            tanggal: tanggal,
            namaSupplier: namaSupplier,
            waktu: waktu,
            ekspedisi: ekspedisi,
            kendaraan: kendaraan,
            supir: supir
        };

        // Simpan data ke local storage
        let existingData = localStorage.getItem('leveringData');
        let dataArray = existingData ? JSON.parse(existingData) : [];
        dataArray.push(newData);
        localStorage.setItem('leveringData', JSON.stringify(dataArray));

        // Redirect ke halaman levering_time.html setelah menyimpan data
        window.location.href = 'levering_time.html';
    });
});