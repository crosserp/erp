document.addEventListener('DOMContentLoaded', function() {
  let incomingInventory = JSON.parse(localStorage.getItem('incomingInventory')) || [];
  // Anda mungkin perlu mengambil data supplier juga di sini jika ingin menampilkannya di cetakan
  let supplierData = JSON.parse(localStorage.getItem('supplierData')) || []; 

  const incomingTableBody = document.querySelector('#tabelData');

  // Fungsi untuk memformat angka menjadi string Rupiah (misal: "Rp 1.234.567").
  function formatRupiah(number) {
      // Jika input adalah string dengan "Rp", coba parse dulu
      if (typeof number === 'string' && number.startsWith('Rp')) {
          number = parseRupiahToNumber(number);
      }
      
      // Pastikan input adalah angka, jika tidak kembalikan "Rp 0"
      if (typeof number !== 'number' || isNaN(number)) {
          number = 0;
      }
      return new Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: 'IDR',
          minimumFractionDigits: 0 
      }).format(number);
  }

  // Fungsi untuk mengurai string Rupiah menjadi angka (number).
  function parseRupiahToNumber(rupiahString) {
      if (typeof rupiahString !== 'string') {
          return 0;
      }
      const cleaned = rupiahString.replace(/Rp\s?/g, '').replace(/\./g, '').replace(/,/g, '.');
      return parseFloat(cleaned) || 0;
  }

  // Fungsi untuk mengurai angka dari string yang diformat (misal "1.000" menjadi 1000) untuk kuantitas
  function parseFormattedNumber(formattedString) {
      if (typeof formattedString !== 'string') {
          return 0;
      }
      const cleaned = formattedString.replace(/\./g, '').replace(/,/g, '.');
      return parseFloat(cleaned) || 0;
  }

  function renderIncomingInventory() {
      incomingTableBody.innerHTML = '';
      if (incomingInventory.length === 0) {
          incomingTableBody.innerHTML = '<tr><td colspan="7">Tidak ada barang yang akan datang.</td></tr>';
          return;
      }

      incomingInventory.forEach((po, poIndex) => { // Menggunakan poIndex untuk referensi yang lebih baik
          po.items.forEach((item, itemInPoIndex) => { // Menggunakan itemInPoIndex
              const row = document.createElement('tr');
              row.innerHTML = `
                  <td>${po.poId}</td>
                  <td>${po.namaPemasok}</td>
                  <td>${item.namaBarang}</td>
                  <td>${item.kuantitasDipesan} ${item.satuan}</td>
                  <td>${po.expectedArrivalDate}</td>
                  <td>${item.status}</td>
                  <td>
                      <button class="receiveItemBtn" 
                              data-po-index="${poIndex}" 
                              data-item-in-po-index="${itemInPoIndex}">Terima Barang</button>
                      <button class="printDetailBtn" 
                              data-po-index="${poIndex}">Detail/Print</button>
                  </td>
              `;
              incomingTableBody.appendChild(row);
          });
      });
  }

  renderIncomingInventory();

  incomingTableBody.addEventListener('click', function(event) {
      if (event.target.classList.contains('receiveItemBtn')) {
          const poIndex = parseInt(event.target.dataset.poIndex);
          const itemInPoIndex = parseInt(event.target.dataset.itemInPoIndex);
          handleReceiveItem(poIndex, itemInPoIndex);
      } else if (event.target.classList.contains('printDetailBtn')) {
          const poIndex = parseInt(event.target.dataset.poIndex);
          printIncomingPODetail(poIndex); // Panggil fungsi print yang baru
      }
  });

  function handleReceiveItem(poIndex, itemInPoIndex) {
      if (incomingInventory[poIndex] && incomingInventory[poIndex].items[itemInPoIndex]) {
          const currentPO = incomingInventory[poIndex];
          const itemToReceive = currentPO.items[itemInPoIndex];

          // Cek jika barang sudah diterima
          if (itemToReceive.status === 'Diterima') {
              alert(`Barang "${itemToReceive.namaBarang}" dari PO ${currentPO.poId} sudah diterima.`);
              return;
          }

          let mainStock = JSON.parse(localStorage.getItem('mainStock')) || [];
          const existingProductIndex = mainStock.findIndex(p => p.namaBarang === itemToReceive.namaBarang);

          if (existingProductIndex !== -1) {
              mainStock[existingProductIndex].kuantitas += itemToReceive.kuantitasDipesan;
              alert(`Stok ${itemToReceive.namaBarang} berhasil diperbarui. Jumlah baru: ${mainStock[existingProductIndex].kuantitas}`);
          } else {
              mainStock.push({
                  namaBarang: itemToReceive.namaBarang,
                  kuantitas: itemToReceive.kuantitasDipesan,
                  satuan: itemToReceive.satuan,
                  hargaBeliTerakhir: itemToReceive.hargaSatuan, // Simpan harga beli terakhir
                  tanggalMasuk: new Date().toISOString().split('T')[0]
              });
              alert(`${itemToReceive.namaBarang} baru telah ditambahkan ke stok utama.`);
          }
          localStorage.setItem('mainStock', JSON.stringify(mainStock));

          // Mark the specific item as received within its PO
          itemToReceive.status = 'Diterima'; 
          localStorage.setItem('incomingInventory', JSON.stringify(incomingInventory));

          // Periksa apakah semua item dalam PO ini sudah diterima
          const allItemsReceived = currentPO.items.every(item => item.status === 'Diterima');
          if (allItemsReceived) {
              currentPO.statusPengajuan = 'Selesai Diterima'; // Update status PO jika semua item diterima
              localStorage.setItem('incomingInventory', JSON.stringify(incomingInventory));
          }

          renderIncomingInventory();
      } else {
          alert('Gagal menemukan item untuk diterima.');
      }
  }

  // --- FUNGSI BARU: printIncomingPODetail ---
  function printIncomingPODetail(poIndex) {
      const po = incomingInventory[poIndex];
      if (!po) {
          alert('Data PO tidak ditemukan!');
          return;
      }

      // Cari detail supplier jika ada
      const supplierDetail = supplierData.find(s => s.namaSupplier === po.namaPemasok);

      let supplierInfoHtml = '';
      if (supplierDetail) {
          supplierInfoHtml = `
              <p><strong>ID Pemasok:</strong> ${supplierDetail.idSupplier || 'N/A'}</p>
              <p><strong>No. Telepon:</strong> ${supplierDetail.noSupplier || 'N/A'}</p>
              <p><strong>Email:</strong> ${supplierDetail.emailSupplier || 'N/A'}</p>
              <p><strong>Alamat:</strong> ${supplierDetail.alamatSupplier || 'N/A'}</p>
          `;
      } else {
          supplierInfoHtml = `<p>Detail Pemasok tidak ditemukan.</p>`;
      }

      const itemsRows = po.items.map(item => `
          <tr>
              <td>${item.namaBarang}</td>
              <td>${item.kuantitasDipesan}</td>
              <td>${item.satuan}</td>
              <td>${formatRupiah(item.hargaSatuan)}</td>
              <td>${item.status}</td>
          </tr>
      `).join('');

      const printContent = `
          <html>
          <head>
              <title>Detail PO - ${po.poId}</title>
              <style>
                  body { font-family: Arial, sans-serif; margin: 20px; }
                  h1 { text-align: center; color: #333; }
                  h2 { margin-top: 25px; color: #555; }
                  .po-info, .supplier-detail-info { margin-bottom: 20px; border: 1px solid #eee; padding: 10px; border-radius: 5px; background-color: #f9f9f9; }
                  .po-info p, .supplier-detail-info p { margin: 5px 0; }
                  table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                  th, td { padding: 10px; border: 1px solid #ddd; text-align: left; }
                  th { background-color: #eef; font-weight: bold; }
                  .total-section { margin-top: 20px; text-align: right; font-size: 1.1em; }
                  .total-section strong { color: #007bff; }
              </style>
          </head>
          <body>
              <h1>Detail Purchase Order</h1>
              <div class="po-info">
                  <p><strong>Nomor PO:</strong> ${po.poId}</p>
                  <p><strong>Tanggal Pengajuan:</strong> ${po.tanggalPengajuan}</p>
                  <p><strong>Tanggal Perkiraan Kedatangan:</strong> ${po.expectedArrivalDate}</p>
                  <p><strong>Status PO:</strong> ${po.statusPengajuan}</p>
              </div>

              <h2>Informasi Pemasok</h2>
              <div class="supplier-detail-info">
                  <p><strong>Nama Pemasok:</strong> ${po.namaPemasok || 'Tidak Diketahui'}</p>
                  ${supplierInfoHtml}
              </div>

              <h2>Daftar Barang</h2>
              <table>
                  <thead>
                      <tr>
                          <th>Nama Barang</th>
                          <th>Kuantitas Dipesan</th>
                          <th>Satuan</th>
                          <th>Harga Satuan</th>
                          <th>Status Penerimaan</th>
                      </tr>
                  </thead>
                  <tbody>
                      ${itemsRows}
                  </tbody>
              </table>
              <div class="total-section">
                  <p><strong>Total Harga PO:</strong> ${formatRupiah(po.totalHargaPO)}</p>
              </div>
              <script>window.print(); window.close();</script>
          </body>
          </html>
      `;

      const printWindow = window.open('', '_blank');
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
  }
  // --- END FUNGSI BARU: printIncomingPODetail ---


  // Dummy pagination functions (you need to implement the actual logic)
  window.prevPage = function() {
      alert('Fungsi prevPage dipanggil. Implementasi pagination Anda perlu ditambahkan.');
  };

  window.nextPage = function() {
      alert('Fungsi nextPage dipanggil. Implementasi pagination Anda perlu ditambahkan.');
  };

  const pageNumbersSpan = document.querySelector('.page-numbers');
  if (pageNumbersSpan) {
      pageNumbersSpan.textContent = '1 / 1'; // Placeholder
  }
});