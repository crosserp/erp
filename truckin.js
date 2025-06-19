// document.addEventListener('DOMContentLoaded', function() {
//     const updateIndex = localStorage.getItem("updateIndex");
//     const truckData = JSON.parse(localStorage.getItem("truckData")) || [];

//     // Periksa apakah ini operasi "Update" atau "Add"
//     if (updateIndex) {
//         // Operasi "Update"
//         if (updateIndex >= 0 && updateIndex < truckData.length) {
//             // Isi form dengan data yang akan di-update
//             document.getElementById('tipe').value = truckData[updateIndex].tanggal;
//             document.getElementById('waktu').value = truckData[updateIndex].waktu;
//             document.getElementById('noPol').value = truckData[updateIndex].noPol;
//             document.getElementById('dokumen').value = truckData[updateIndex].dokumen;
//             document.getElementById('keperluan').value = truckData[updateIndex].keperluan;
//             document.getElementById('ekspedisi').value = truckData[updateIndex].ekspedisi;
//             document.getElementById('kendaraan').value = truckData[updateIndex].kendaraan;

//             // Tambahkan event listener untuk operasi "Update"
//             document.getElementById('simpan').addEventListener('click', function() {
//                 updateData(updateIndex, truckData);
//             });
//         } else {
//             console.error("Indeks update tidak valid.");
//         }
//     } else {
//         // Operasi "Add"
//         // Kosongkan formulir
//         document.getElementById('tipe').value = "";
//         document.getElementById('waktu').value = "";
//         document.getElementById('noPol').value = "";
//         document.getElementById('dokumen').value = "";
//         document.getElementById('keperluan').value = "";
//         document.getElementById('ekspedisi').value = "";
//         document.getElementById('kendaraan').value = "";

//         // Tambahkan event listener untuk operasi "Add"
//         document.getElementById('simpan').addEventListener('click', addData);
//     }
// });
// function updateData(updateIndex, truckData) {
//     const tanggal = document.getElementById('tipe').value;
//     const waktu = document.getElementById('waktu').value;
//     const noPol = document.getElementById('noPol').value;
//     const dokumen = document.getElementById('dokumen').value;
//     const keperluan = document.getElementById('keperluan').value;
//     const ekspedisi = document.getElementById('ekspedisi').value;
//     const kendaraan = document.getElementById('kendaraan').value;

//     truckData[updateIndex] = {
//         tanggal: tanggal,
//         waktu: waktu,
//         noPol: noPol,
//         dokumen: dokumen,
//         keperluan: keperluan,
//         ekspedisi: ekspedisi,
//         kendaraan: kendaraan,
//     };

//     localStorage.setItem("truckData", JSON.stringify(truckData));
//     localStorage.removeItem("updateIndex");
//     window.location.href = 'truckin_out.html';
// }

// function addData() {
//     const tanggal = document.getElementById('tipe').value;
//     const waktu = document.getElementById('waktu').value;
//     const noPol = document.getElementById('noPol').value;
//     const dokumen = document.getElementById('dokumen').value;
//     const keperluan = document.getElementById('keperluan').value;
//     const ekspedisi = document.getElementById('ekspedisi').value;
//     const kendaraan = document.getElementById('kendaraan').value;

//     const truckData = JSON.parse(localStorage.getItem("truckData")) || [];

//     const newData = {
//         tanggal: tanggal,
//         waktu: waktu,
//         noPol: noPol,
//         dokumen: dokumen,
//         keperluan: keperluan,
//         ekspedisi: ekspedisi,
//         kendaraan: kendaraan,
//     };

//     truckData.push(newData);
//     localStorage.setItem("truckData", JSON.stringify(truckData));
//     window.location.href = 'truckin_out.html';
// }


document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM loaded"); // Tambahkan log ini
    const updateIndex = localStorage.getItem("updateIndex");
    const truckData = JSON.parse(localStorage.getItem("truckData")) || [];

    // Periksa apakah ini operasi "Update" atau "Add"
    if (updateIndex) {
        // Operasi "Update"
        if (updateIndex >= 0 && updateIndex < truckData.length) {
            // Isi form dengan data yang akan di-update
            document.getElementById('tipe').value = truckData[updateIndex].tanggal;
            document.getElementById('waktu').value = truckData[updateIndex].waktu;
            document.getElementById('noPol').value = truckData[updateIndex].noPol;
            document.getElementById('dokumen').value = truckData[updateIndex].dokumen;
            document.getElementById('keperluan').value = truckData[updateIndex].keperluan;
            document.getElementById('ekspedisi').value = truckData[updateIndex].ekspedisi;
            document.getElementById('kendaraan').value = truckData[updateIndex].kendaraan;

            // Tambahkan event listener untuk operasi "Update"
            const linkSimpan = document.getElementById('linkSimpan');
            if(linkSimpan){
                linkSimpan.addEventListener('click', function() {
                    console.log("Tombol Simpan (Update) diklik"); // Tambahkan log ini
                    updateData(parseInt(updateIndex), truckData);
                });
            } else {
                console.error("Elemen dengan ID 'linkSimpan' tidak ditemukan.");
            }
        } else {
            console.error("Indeks update tidak valid.");
        }
    } else {
        // Operasi "Add"
        // Kosongkan formulir
        document.getElementById('tipe').value = "";
        document.getElementById('waktu').value = "";
        document.getElementById('noPol').value = "";
        document.getElementById('dokumen').value = "";
        document.getElementById('keperluan').value = "";
        document.getElementById('ekspedisi').value = "";
        document.getElementById('kendaraan').value = "";

        // Tambahkan event listener untuk operasi "Add"
        const linkSimpan = document.getElementById('linkSimpan');
        if(linkSimpan){
            linkSimpan.addEventListener('click', function() {
                console.log("Tombol Simpan (Add) diklik"); // Tambahkan log ini
                addData();
            });
        } else {
            console.error("Elemen dengan ID 'linkSimpan' tidak ditemukan.");
        }
    }
});

function updateData(updateIndex, truckData) {
    console.log("Fungsi updateData dipanggil"); // Tambahkan log ini
    const tanggal = document.getElementById('tipe').value;
    const waktu = document.getElementById('waktu').value;
    const noPol = document.getElementById('noPol').value;
    const dokumen = document.getElementById('dokumen').value;
    const keperluan = document.getElementById('keperluan').value;
    const ekspedisi = document.getElementById('ekspedisi').value;
    const kendaraan = document.getElementById('kendaraan').value;

    truckData[updateIndex] = {
        tanggal: tanggal,
        waktu: waktu,
        noPol: noPol,
        dokumen: dokumen,
        keperluan: keperluan,
        ekspedisi: ekspedisi,
        kendaraan: kendaraan,
    };

    localStorage.setItem("truckData", JSON.stringify(truckData));
    localStorage.removeItem("updateIndex");
    window.location.href = 'truckin_out.html';
}

function addData() {
    console.log("Fungsi addData dipanggil"); // Tambahkan log ini
    const tanggal = document.getElementById('tipe').value;
    const waktu = document.getElementById('waktu').value;
    const noPol = document.getElementById('noPol').value;
    const dokumen = document.getElementById('dokumen').value;
    const keperluan = document.getElementById('keperluan').value;
    const ekspedisi = document.getElementById('ekspedisi').value;
    const kendaraan = document.getElementById('kendaraan').value;

    const truckData = JSON.parse(localStorage.getItem("truckData")) || [];

    const newData = {
        tanggal: tanggal,
        waktu: waktu,
        noPol: noPol,
        dokumen: dokumen,
        keperluan: keperluan,
        ekspedisi: ekspedisi,
        kendaraan: kendaraan,
    };

    truckData.push(newData);
    localStorage.setItem("truckData", JSON.stringify(truckData));
    window.location.href = 'truckin_out.html';
}