document.addEventListener('DOMContentLoaded', function() {
    const mesinForm = document.getElementById('mesinForm2');
    const nomorAsetSelect = document.getElementById('nomor_aset');
    const namaAsetInput = document.getElementById('nama_aset');
    const jenisMesinSelect = document.getElementById('jenis_mesin');
    const idPabrikSelect = document.getElementById('id_pabrik');
    const kapasitasInput = document.getElementById('kapasitas2');
    const pemeliharaanInput = document.getElementById('pemeliharaan2');
    const teknisiInput = document.getElementById('teknisi2');
    const linkBatal = document.getElementById('linkBatal');

    // --- Fungsi untuk mengisi dropdown Nomor Mesin dan Nama Mesin dari data_aset.js ---
    function populateAsetDropdowns() {
        const assets = JSON.parse(localStorage.getItem('daftarAset')) || [];

        // Kosongkan opsi yang ada (kecuali placeholder jika ada)
        nomorAsetSelect.innerHTML = '<option value="">Pilih Nomor Aset</option>';
        namaAsetInput.value = ''; // Kosongkan nama aset

        assets.forEach(asset => {
            const option = document.createElement('option');
            option.value = asset.nomor;
            option.textContent = asset.nomor;
            nomorAsetSelect.appendChild(option);
        });

        // Event listener untuk saat Nomor Aset dipilih
        nomorAsetSelect.addEventListener('change', function() {
            const selectedNomor = this.value;
            const selectedAsset = assets.find(asset => asset.nomor === selectedNomor);
            if (selectedAsset) {
                namaAsetInput.value = selectedAsset.nama;
            } else {
                namaAsetInput.value = '';
            }
        });
    }

    // --- Fungsi untuk mengisi dropdown Lokasi (id_pabrik) dari data_pabrik.js ---
    function populatePabrikDropdown() {
        const factories = JSON.parse(localStorage.getItem('daftarPabrik')) || [];
        
        // Kosongkan opsi yang ada (kecuali placeholder jika ada)
        idPabrikSelect.innerHTML = '<option value="">Pilih Lokasi Pabrik</option>';

        factories.forEach(factory => {
            const option = document.createElement('option');
            option.value = factory.id;
            option.textContent = `${factory.nama} (${factory.alamat})`; // Menampilkan nama dan alamat
            idPabrikSelect.appendChild(option);
        });
    }

    // Panggil fungsi-fungsi populate saat DOM selesai dimuat
    populateAsetDropdowns();
    populatePabrikDropdown();

    // --- Penanganan Submit Form ---
    mesinForm.addEventListener('submit', function(event) {
        event.preventDefault(); // Mencegah form melakukan submit default

        // Ambil nilai dari setiap input
        const nomorAset = nomorAsetSelect.value;
        const namaAset = namaAsetInput.value;
        const jenisMesin = jenisMesinSelect.value;
        const idPabrik = idPabrikSelect.value;
        const kapasitas = kapasitasInput.value;
        const pemeliharaan = pemeliharaanInput.value;
        const teknisi = teknisiInput.value;

        // Validasi sederhana
        if (!nomorAset || !namaAset || !jenisMesin || !idPabrik || !kapasitas || !pemeliharaan || !teknisi) {
            alert('Semua kolom harus diisi!');
            return;
        }

        // Ambil data mesin yang sudah ada dari localStorage
        let daftarMesin = JSON.parse(localStorage.getItem('daftarMesin')) || [];

        // Cek apakah nomor aset sudah ada (untuk mencegah duplikasi)
        const isExisting = daftarMesin.some(mesin => mesin.nomor_aset === nomorAset);
        if (isExisting) {
            alert('Nomor Mesin ini sudah terdaftar. Gunakan nomor lain atau lakukan update jika ingin mengubah data.');
            return;
        }

        // Buat objek mesin baru
        const newMesin = {
            nomor_aset: nomorAset,
            nama_aset: namaAset,
            jenis_mesin: jenisMesin,
            id_pabrik: idPabrik,
            kapasitas: kapasitas,
            pemeliharaan: pemeliharaan,
            teknisi: teknisi
        };

        // Tambahkan mesin baru ke array
        daftarMesin.push(newMesin);

        // Simpan kembali array ke localStorage
        localStorage.setItem('daftarMesin', JSON.stringify(daftarMesin));

        alert('Data mesin berhasil disimpan!');
        
        // Opsional: Reset form setelah submit
        mesinForm.reset();
        namaAsetInput.value = ''; // Pastikan nama aset juga kosong setelah reset

        // Arahkan kembali ke halaman mesin.html setelah simpan
        window.location.href = 'mesin.html';
    });

    // --- Penanganan tombol Batal ---
    // Tombol batal sudah punya href ke mesin.html, jadi tidak perlu JS tambahan kecuali ada logika lain.
    // Namun, jika ingin memastikan aksi 'batal' melalui JS:
    // linkBatal.addEventListener('click', function(event) {
    //     event.preventDefault(); // Mencegah navigasi default jika ingin melakukan sesuatu sebelum navigasi
    //     window.location.href = 'mesin.html';
    // });
});