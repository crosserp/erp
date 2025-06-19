// detail_produk.js (file JS untuk halaman detail_produk.html)

document.addEventListener('DOMContentLoaded', function() {
    const detailKodeProduk = document.getElementById('detail-kode-produk');
    const detailNamaProduk = document.getElementById('detail-nama-produk');
    const detailSatuanProduk = document.getElementById('detail-satuan-produk');
    const detailRawMaterialTableBody = document.querySelector('#detailRawMaterialTable tbody');

    // Ambil ID produk yang ingin ditampilkan dari localStorage
    const detailProdukId = localStorage.getItem('detailProdukId');

    if (detailProdukId) {
        const produkData = JSON.parse(localStorage.getItem('produkData')) || [];
        const produkToDisplay = produkData.find(p => p.id === parseInt(detailProdukId));

        if (produkToDisplay) {
            // Tampilkan detail produk utama
            detailKodeProduk.textContent = produkToDisplay.kodeProduk;
            detailNamaProduk.textContent = produkToDisplay.namaProduk;
            detailSatuanProduk.textContent = produkToDisplay.satuanProduk;

            // Tampilkan daftar raw material
            if (produkToDisplay.rawMaterials && produkToDisplay.rawMaterials.length > 0) {
                detailRawMaterialTableBody.innerHTML = ''; // Kosongkan dulu
                produkToDisplay.rawMaterials.forEach((rm, index) => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${index + 1}.</td>
                        <td>${rm.name}</td>
                        <td>${rm.quantity}</td>
                        <td>${rm.unit}</td>
                    `;
                    detailRawMaterialTableBody.appendChild(row);
                });
            } else {
                // Jika tidak ada raw material
                const row = document.createElement('tr');
                row.innerHTML = `<td colspan="4" style="text-align: center;">Tidak ada daftar raw material.</td>`;
                detailRawMaterialTableBody.appendChild(row);
            }
        } else {
            // Jika produk tidak ditemukan
            alert('Produk tidak ditemukan.');
            window.location.href = 'data_produk.html'; // Kembali ke daftar produk
        }
    } else {
        // Jika tidak ada ID produk di localStorage
        alert('Tidak ada produk yang dipilih untuk ditampilkan detail.');
        window.location.href = 'data_produk.html'; // Kembali ke daftar produk
    }

    // Bersihkan detailProdukId dari localStorage setelah digunakan (opsional, tapi baik untuk kebersihan)
    // localStorage.removeItem('detailProdukId'); // Uncomment jika tidak ingin ID ini bertahan setelah navigasi
});