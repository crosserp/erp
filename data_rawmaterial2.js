// data_rawmaterial2.js - Untuk halaman input/edit data master bahan baku

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('datarawmaterial'); 
    const linkSimpan = document.getElementById('linkSimpan');
    const linkBatal = document.getElementById('linkBatal');

    const kodeRawMaterialInput = document.getElementById('kode_rawmaterial');
    const namaRawMaterialInput = document.getElementById('nama_rawmaterial');
    const satuanRawMaterialSelect = document.getElementById('satuan_rawmaterial');

    // Kunci localStorage yang KONSISTEN.
    // Ini harus sama dengan yang digunakan di file JS lain yang membaca data master.
    const LOCAL_STORAGE_KEY = 'rawMaterialMasterData'; 

    // Ambil data master bahan baku yang sudah ada dari localStorage
    let rawMaterialMasterData = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || [];

    // Cek apakah sedang dalam mode edit
    const updateIndex = localStorage.getItem('updateRawMaterialIndex');

    if (updateIndex !== null && rawMaterialMasterData[updateIndex]) {
        // Mode Edit: Isi formulir dengan data yang akan diedit
        const dataToUpdate = rawMaterialMasterData[updateIndex];
        kodeRawMaterialInput.value = dataToUpdate.kodeRawMaterial;
        namaRawMaterialInput.value = dataToUpdate.namaRawMaterial;
        satuanRawMaterialSelect.value = dataToUpdate.satuanRawMaterial;

        // Kode bahan baku tidak bisa diubah saat edit untuk menjaga integritas data
        kodeRawMaterialInput.readOnly = true; 
        kodeRawMaterialInput.style.backgroundColor = '#e9e9e9';
    } else {
        // Mode Tambah Baru: Pastikan input kode tidak readonly
        kodeRawMaterialInput.readOnly = false;
        kodeRawMaterialInput.style.backgroundColor = '';
    }

    // --- Event Listener untuk Tombol Simpan ---
    linkSimpan.addEventListener('click', function(event) {
        event.preventDefault(); // Mencegah form submit default (reload halaman)

        const kodeRawMaterial = kodeRawMaterialInput.value.trim();
        const namaRawMaterial = namaRawMaterialInput.value.trim();
        const satuanRawMaterial = satuanRawMaterialSelect.value;

        // --- Validasi Input ---
        if (!kodeRawMaterial || !namaRawMaterial || !satuanRawMaterial) {
            alert('Kode Raw Material, Nama Raw Material, dan Satuan harus diisi!');
            return; // Hentikan fungsi jika ada input kosong
        }
        
        // Buat objek data bahan baku baru/diperbarui
        const newRawMaterial = {
            kodeRawMaterial: kodeRawMaterial,
            namaRawMaterial: namaRawMaterial,
            satuanRawMaterial: satuanRawMaterial
        };

        if (updateIndex !== null && rawMaterialMasterData[updateIndex]) {
            // --- Logika Update Data ---
            rawMaterialMasterData[updateIndex] = newRawMaterial;
            alert('Data bahan baku berhasil diperbarui!');
            localStorage.removeItem('updateRawMaterialIndex'); // Hapus indeks update setelah selesai
        } else {
            // --- Logika Tambah Data Baru ---
            // Cek apakah kode bahan baku sudah ada
            const isKodeExist = rawMaterialMasterData.some(item => item.kodeRawMaterial === kodeRawMaterial);
            if (isKodeExist) {
                alert('Kode Raw Material sudah ada! Mohon gunakan kode yang berbeda.');
                kodeRawMaterialInput.focus();
                return;
            }
            rawMaterialMasterData.push(newRawMaterial); // Tambahkan data baru
            alert('Data bahan baku berhasil disimpan!');
        }

        // --- Simpan data yang telah diupdate/ditambahkan kembali ke localStorage ---
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(rawMaterialMasterData));
        
        // --- Arahkan kembali ke halaman daftar master bahan baku ---
        window.location.href = 'data_rawmaterial.html';
    });

    // --- Event Listener untuk Tombol Batal ---
    linkBatal.addEventListener('click', function(event) {
        event.preventDefault(); // Mencegah perilaku default
        localStorage.removeItem('updateRawMaterialIndex'); // Hapus indeks update
        window.location.href = 'data_rawmaterial.html'; // Kembali ke halaman daftar
    });
});