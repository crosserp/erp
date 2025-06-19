document.addEventListener('DOMContentLoaded', function() {
    const outboundTableBody = document.getElementById('outboundTableBody');

    // Variabel untuk paginasi
    let currentPage = 1;
    const rowsPerPage = 10; // Jumlah baris per halaman

    // Fungsi untuk me-render ulang tabel outbound
    function renderOutboundTable(dataToDisplay) {
        // Gunakan dataToDisplay jika ada (untuk paginasi), jika tidak ambil dari localStorage
        let daftarOutbound = dataToDisplay || JSON.parse(localStorage.getItem('daftarOutbound')) || [];

        if (!outboundTableBody) {
            console.error("Elemen <tbody> tabel tidak ditemukan! Pastikan id='outboundTableBody' ada di HTML Anda.");
            return;
        }

        outboundTableBody.innerHTML = ''; // Kosongkan tbody sebelum mengisi data

        if (daftarOutbound.length === 0) {
            const row = document.createElement('tr');
            // Jumlah colspan harus sesuai dengan jumlah kolom di thead: 7 kolom
            row.innerHTML = `<td colspan="7" style="text-align: center;">Belum ada data outbound.</td>`;
            outboundTableBody.appendChild(row);
        } else {
            daftarOutbound.forEach(outbound => {
                const row = document.createElement('tr');

                // Buat string HTML untuk detail barang
                let itemsHtml = '';
                if (outbound.items && outbound.items.length > 0) {
                    outbound.items.forEach(item => {
                        itemsHtml += `
                            <div class="detail-item">
                                <strong>Kode:</strong> ${item.kode_produk}<br>
                                <strong>Nama:</strong> ${item.nama_produk}<br>
                                <strong>Satuan:</strong> ${item.satuan_produk}<br>
                                <strong>Ekspedisi:</strong> ${item.ekspedisi}<br>
                                <strong>Jumlah:</strong> ${item.jumlah}
                            </div>
                        `;
                    });
                } else {
                    itemsHtml = 'Tidak ada barang.';
                }

                // Kolom Keterangan (Tambahkan tombol Print di sini)
                // Asumsi ada properti 'keterangan' di objek outbound jika ada teks tambahan
                const keteranganText = outbound.keterangan || ''; // Ambil keterangan jika ada

                row.innerHTML = `
                    <td>${outbound.nomor_surat}</td>
                    <td>${outbound.tanggal}</td>
                    <td>${outbound.nama_customer}</td>
                    <td>${outbound.alamat_customer}</td>
                  
                    <td>
                        ${keteranganText}
                        <button class="print-button" data-id="${outbound.id}">Print</button>
                    
                        <button class="update-button" data-id="${outbound.id}">Update</button>
                        <button class="delete-button" data-id="${outbound.id}">Hapus</button>
                    </td>
                `;
                outboundTableBody.appendChild(row);
            });
        }
    }

    // Fungsi untuk memperbarui kontrol paginasi
    function updatePaginationControls() {
        let daftarOutbound = JSON.parse(localStorage.getItem('daftarOutbound')) || [];
        const totalPages = Math.ceil(daftarOutbound.length / rowsPerPage);
        const pageNumbersSpan = document.querySelector('.page-numbers');

        if (pageNumbersSpan) {
            pageNumbersSpan.textContent = `Halaman ${currentPage} dari ${totalPages}`;
        }

        const prevButton = document.querySelector('.prev');
        const nextButton = document.querySelector('.next');

        if (prevButton) {
            prevButton.disabled = currentPage === 1;
        }
        if (nextButton) {
            nextButton.disabled = currentPage === totalPages || totalPages === 0;
        }
    }

    // Fungsi untuk menampilkan halaman tertentu (digunakan oleh paginasi)
    function displayPage(page) {
        let daftarOutbound = JSON.parse(localStorage.getItem('daftarOutbound')) || [];
        // Mengurutkan data (opsional, misalnya berdasarkan tanggal terbaru)
        daftarOutbound.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));

        const startIndex = (page - 1) * rowsPerPage;
        const endIndex = startIndex + rowsPerPage;
        const paginatedData = daftarOutbound.slice(startIndex, endIndex);

        renderOutboundTable(paginatedData); // Render hanya data untuk halaman ini
        updatePaginationControls();
    }

    // Fungsi untuk tombol paginasi "Sebelumnya"
    window.prevPage = function() {
        if (currentPage > 1) {
            currentPage--;
            displayPage(currentPage);
        }
    };

    // Fungsi untuk tombol paginasi "Selanjutnya"
    window.nextPage = function() {
        let daftarOutbound = JSON.parse(localStorage.getItem('daftarOutbound')) || [];
        const totalPages = Math.ceil(daftarOutbound.length / rowsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            displayPage(currentPage);
        }
    };

    // Panggil displayPage untuk pertama kali saat DOM dimuat
    displayPage(currentPage);

    // --- Event Listener untuk Tombol Update, Delete, dan Print ---
    outboundTableBody.addEventListener('click', function(event) {
        const target = event.target;
        const outboundId = target.getAttribute('data-id');

        if (target.classList.contains('update-button')) {
            if (outboundId) {
                // Simpan ID outbound yang akan diupdate ke localStorage
                localStorage.setItem('editOutboundId', outboundId);
                // Lalu mengalihkan ke form input outbound2.html untuk diedit
                window.location.href = 'outbound2.html';
            } else {
                console.error("ID Outbound tidak ditemukan untuk update.");
            }
        } else if (target.classList.contains('delete-button')) {
            if (outboundId) {
                handleDeleteOutbound(outboundId);
            } else {
                console.error("ID Outbound tidak ditemukan untuk delete.");
            }
        } else if (target.classList.contains('print-button')) {
            if (outboundId) {
                handlePrintOutbound(outboundId);
            } else {
                console.error("ID Outbound tidak ditemukan untuk print.");
            }
        }
    });

    // --- Fungsi Handler untuk Delete Outbound ---
    function handleDeleteOutbound(id) {
        if (confirm(`Apakah Anda yakin ingin menghapus data Outbound ini?`)) {
            let daftarOutbound = JSON.parse(localStorage.getItem('daftarOutbound')) || [];

            // Filter array, sisakan hanya yang ID-nya TIDAK sama dengan ID yang akan dihapus
            const updatedDaftarOutbound = daftarOutbound.filter(outbound => outbound.id != id);

            if (updatedDaftarOutbound.length < daftarOutbound.length) {
                localStorage.setItem('daftarOutbound', JSON.stringify(updatedDaftarOutbound));
                alert(`Data Outbound berhasil dihapus.`);
                displayPage(currentPage); // Render ulang tabel untuk menampilkan perubahan
            } else {
                alert(`Data Outbound tidak ditemukan.`);
            }
        }
    }

    // --- Fungsi Handler untuk Print Outbound ---
    function handlePrintOutbound(id) {
        let daftarOutbound = JSON.parse(localStorage.getItem('daftarOutbound')) || [];
        const outboundToPrint = daftarOutbound.find(outbound => outbound.id == id); // Gunakan == karena id dari DOM string

        if (outboundToPrint) {
            // Ini adalah logika dasar untuk mencetak. Anda mungkin ingin membuat halaman khusus
            // untuk faktur/surat jalan yang lebih rapi.
            let printContent = `
                <h1>Surat Jalan / Outbound</h1>
                <p><strong>Nomor Surat:</strong> ${outboundToPrint.nomor_surat}</p>
                <p><strong>Tanggal:</strong> ${outboundToPrint.tanggal}</p>
                <p><strong>Nama Penerima:</strong> ${outboundToPrint.nama_customer}</p>
                <p><strong>Alamat Pengiriman:</strong> ${outboundToPrint.alamat_customer}</p>
                <h3>Detail Barang:</h3>
                <table border="1" style="width:100%; border-collapse: collapse;">
                    <thead>
                        <tr>
                            <th>Kode Produk</th>
                            <th>Nama Produk</th>
                            <th>Satuan</th>
                            <th>Ekspedisi</th>
                            <th>Jumlah</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            outboundToPrint.items.forEach(item => {
                printContent += `
                    <tr>
                        <td>${item.kode_produk}</td>
                        <td>${item.nama_produk}</td>
                        <td>${item.satuan_produk}</td>
                        <td>${item.ekspedisi}</td>
                        <td>${item.jumlah}</td>
                    </tr>
                `;
            });
            printContent += `
                    </tbody>
                </table>
                <p><strong>Keterangan:</strong> ${outboundToPrint.keterangan || '-'}</p>
            `;

            // Membuat jendela baru untuk pencetakan
            const printWindow = window.open('', '', 'height=600,width=800');
            printWindow.document.write('<html><head><title>Print Outbound</title>');
            // Anda bisa menyertakan CSS dasar di sini agar tampilannya rapi saat dicetak
            printWindow.document.write('<style>body{font-family: Arial, sans-serif;} table{width:100%; border-collapse: collapse;} th,td{border:1px solid #000; padding: 8px; text-align: left;} h1, h3{text-align: center;}</style>');
            printWindow.document.write('</head><body>');
            printWindow.document.write(printContent);
            printWindow.document.write('</body></html>');
            printWindow.document.close();
            printWindow.print();
        } else {
            alert('Data Outbound tidak ditemukan untuk dicetak.');
        }
    }
});