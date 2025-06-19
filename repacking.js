const repackingData = JSON.parse(localStorage.getItem("repackingData")) || [];
const tabelData = document.getElementById("tabelData");
const pageNumbers = document.querySelector(".page-numbers");
const itemsPerPage = 10;
let currentPage = 1;

// Fungsi untuk menampilkan data pada halaman tertentu
function displayData(page) {
  tabelData.innerHTML = ""; // Kosongkan tabel
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const pageData = repackingData.slice(startIndex, endIndex);

  // Tambahkan data ke tabel
  pageData.forEach((item, index) => {
    const row = tabelData.insertRow();
    const cell1 = row.insertCell(0);
    const cell2 = row.insertCell(1);
    const cell3 = row.insertCell(2);
    const cell4 = row.insertCell(3);
    const cell5 = row.insertCell(4);
    const cell6 = row.insertCell(5);
    const cell7 = row.insertCell(6);

    cell1.textContent = item.tanggal;
    cell2.textContent = item.kodeProduk;
    cell3.textContent = item.produkAwal;
    cell4.textContent = item.ProdukAkhir;
    cell5.textContent = item.jumlahSebelum;
    cell6.textContent = item.jumlahSesudah;

    // Tambahkan tombol update dan delete
    const updateButton = document.createElement("button");
    updateButton.textContent = "Update";
    updateButton.addEventListener("click", () => updateData(index));

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", () => deleteData(index));

    cell7.appendChild(updateButton);
    cell7.appendChild(deleteButton);
  });
}

// Fungsi untuk menampilkan nomor halaman
function displayPageNumbers() {
  const totalPages = Math.ceil(repackingData.length / itemsPerPage);
  pageNumbers.textContent = `${currentPage} dari ${totalPages}`;
}

// Fungsi untuk pergi ke halaman sebelumnya
function prevPage() {
  if (currentPage > 1) {
    currentPage--;
    displayData(currentPage);
    displayPageNumbers();
  }
}

// Fungsi untuk pergi ke halaman selanjutnya
function nextPage() {
  const totalPages = Math.ceil(repackingData.length / itemsPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    displayData(currentPage);
    displayPageNumbers();
  }
}

function updateData(index) {
    const dataToUpdate = repackingData[index];
    localStorage.setItem("dataToUpdate", JSON.stringify(dataToUpdate));
    window.location.href = "repacking2.html";
  }

// Fungsi untuk delete data
function deleteData(index) {
  // Implementasikan logika delete data di sini
  // Misalnya, hapus data dari array dan update localStorage
  repackingData.splice(index, 1);
  localStorage.setItem("repackingData", JSON.stringify(repackingData));
  // Refresh tabel
  displayData(currentPage);
  displayPageNumbers();
}

// Inisialisasi tampilan awal
displayData(currentPage);
displayPageNumbers();

// Fungsi untuk update data
function updateData(index) {
    // Ambil data yang akan diupdate
    const dataToUpdate = repackingData[index];
  
    // Simpan data yang akan diupdate ke localStorage
    localStorage.setItem("dataToUpdate", JSON.stringify(dataToUpdate));
  
    // Redirect ke halaman input awal
    window.location.href = "repacking2.html";
  }



  // Fungsi untuk menampilkan data pada halaman tertentu
function displayData(page) {
    tabelData.innerHTML = ""; // Kosongkan tabel
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageData = repackingData.slice(startIndex, endIndex);
  
    // Tambahkan data ke tabel
    pageData.forEach((item, index) => {
      const row = tabelData.insertRow();
      const cell1 = row.insertCell(0);
      const cell2 = row.insertCell(1);
      const cell3 = row.insertCell(2);
      const cell4 = row.insertCell(3);
      const cell5 = row.insertCell(4);
      const cell6 = row.insertCell(5);
      const cell7 = row.insertCell(6);
  
      cell1.textContent = item.tanggal;
      cell2.textContent = item.kodeProduk;
      cell3.textContent = item.produkAwal;
      cell4.textContent = item.ProdukAkhir;
      cell5.textContent = item.jumlahSebelum;
      cell6.textContent = item.jumlahSesudah;
  
      // Tambahkan tombol update dan delete
      const updateButton = document.createElement("button");
      updateButton.textContent = "Update";
      updateButton.addEventListener("click", () => updateData(index));
  
      const deleteButton = document.createElement("button");
      deleteButton.textContent = "Delete";
      deleteButton.addEventListener("click", () => deleteData(index));
  
      cell7.appendChild(updateButton);
      cell7.appendChild(deleteButton);
    });
  }
  
  // Inisialisasi tampilan awal
  displayData(currentPage);

  localStorage.removeItem("dataToUpdate");