// script.js

document.addEventListener('DOMContentLoaded', function() {
    // --- Data Penjualan Simulasi ---
    // Ini adalah array data penjualan Anda. Anda bisa mengubahnya sesuai kebutuhan.
    const salesData = [120, 135, 130, 145, 140, 155, 160, 150, 170, 165, 180, 175]; // Contoh penjualan bulanan

    // --- Elemen HTML ---
    const salesDataListElement = document.getElementById('salesDataList');
    const movingAveragePeriodElement = document.getElementById('movingAveragePeriod');
    const forecastButton = document.getElementById('forecastButton');
    const forecastResultTextElement = document.getElementById('forecastResultText');
    const errorMessageElement = document.getElementById('errorMessage');
    const resultSection = document.getElementById('resultSection');
    
    // Elemen untuk Chart.js
    const ctx = document.getElementById('forecastChart').getContext('2d');
    let forecastChart = null; // Variabel untuk menyimpan instance chart

    // --- Inisialisasi: Tampilkan data penjualan simulasi di halaman ---
    function displaySalesData() {
        salesDataListElement.innerHTML = ''; // Bersihkan daftar sebelumnya
        if (salesData.length === 0) {
            salesDataListElement.innerHTML = '<li>Tidak ada data penjualan yang tersedia.</li>';
            return;
        }
        salesData.forEach((sales, index) => {
            const listItem = document.createElement('li');
            listItem.textContent = `Bulan ${index + 1}: ${sales}`;
            salesDataListElement.appendChild(listItem);
        });
        console.log("DEBUG: Data penjualan historis ditampilkan.");
    }

    // --- Fungsi Peramalan ---
    function performForecast() {
        // 1. Reset tampilan hasil dan error
        forecastResultTextElement.textContent = '';
        errorMessageElement.textContent = '';
        resultSection.style.display = 'none';
        if (forecastChart) { // Hancurkan chart sebelumnya jika ada
            forecastChart.destroy();
        }
        console.log("DEBUG: Tampilan hasil direset.");

        // 2. Ambil periode rata-rata bergerak (N)
        const n = parseInt(movingAveragePeriodElement.value);

        // 3. Validasi input dan data
        if (salesData.length === 0) {
            errorMessageElement.textContent = 'Tidak ada data penjualan yang tersedia untuk peramalan.';
            return;
        }
        if (isNaN(n) || n < 1) {
            errorMessageElement.textContent = 'Periode rata-rata bergerak (N) harus angka positif.';
            return;
        }
        if (salesData.length < n) {
            errorMessageElement.textContent = `Jumlah data penjualan (${salesData.length}) harus lebih besar atau sama dengan periode N (${n}).`;
            return;
        }
        console.log(`DEBUG: Validasi berhasil. N = ${n}.`);

        // 4. Lakukan perhitungan Rata-rata Bergerak
        // Ambil N data penjualan terakhir
        const dataForCalculation = salesData.slice(-n); 
        let sum = 0;
        dataForCalculation.forEach(value => {
            sum += value;
        });
        const forecastValue = sum / n;
        console.log("DEBUG: Data untuk perhitungan:", dataForCalculation);
        console.log("DEBUG: Hasil peramalan (Rata-rata Bergerak):", forecastValue);

        // 5. Tampilkan hasil teks peramalan
        forecastResultTextElement.textContent = `Peramalan Penjualan Bulan ${salesData.length + 1}: ${forecastValue.toFixed(2)}`;
        resultSection.style.display = 'block'; // Tampilkan bagian hasil
        console.log("DEBUG: Hasil peramalan ditampilkan dalam teks.");

        // 6. Siapkan data untuk Chart.js
        const labels = salesData.map((_, i) => `Bulan ${i + 1}`);
        labels.push(`Bulan ${salesData.length + 1} (Ramalan)`); // Label untuk titik peramalan

        const chartSalesData = [...salesData, null]; // Data historis, dengan null di titik peramalan
        const forecastPointData = Array(salesData.length).fill(null); // Semua null kecuali titik peramalan
        forecastPointData.push(forecastValue);

        // 7. Buat atau perbarui chart
        forecastChart = new Chart(ctx, {
            type: 'line', // Jenis grafik: garis
            data: {
                labels: labels, // Label untuk sumbu X
                datasets: [
                    {
                        label: 'Penjualan Historis',
                        data: chartSalesData,
                        borderColor: 'rgb(75, 192, 192)', // Warna garis data historis
                        tension: 0.1,
                        fill: false,
                        pointRadius: 5,
                        pointBackgroundColor: 'rgb(75, 192, 192)',
                        segment: {
                            borderColor: ctx => {
                                // Ganti warna garis dari data historis ke titik peramalan
                                const idx = ctx.p0DataIndex;
                                return idx >= salesData.length - 1 ? 'rgb(255, 99, 132)' : 'rgb(75, 192, 192)';
                            },
                            borderDash: ctx => {
                                // Jadikan garis putus-putus untuk segmen peramalan
                                const idx = ctx.p0DataIndex;
                                return idx >= salesData.length - 1 ? [6, 6] : undefined;
                            }
                        }
                    },
                    {
                        label: 'Peramalan', // Label terpisah untuk titik peramalan
                        data: forecastPointData,
                        borderColor: 'rgb(255, 99, 132)', // Warna merah untuk peramalan
                        backgroundColor: 'rgb(255, 99, 132)',
                        pointRadius: 8, // Radius titik peramalan lebih besar
                        pointBackgroundColor: 'rgb(255, 99, 132)',
                        showLine: false, // Jangan gambar garis untuk dataset ini, hanya titik
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Grafik Penjualan Historis dan Peramalan'
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Periode Bulan'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Jumlah Penjualan'
                        },
                        beginAtZero: false // Sesuaikan skala Y agar tidak selalu mulai dari nol
                    }
                }
            }
        });
        console.log("DEBUG: Grafik diperbarui.");
    }

    // --- Event Listener ---
    forecastButton.addEventListener('click', performForecast);

    // --- Panggil fungsi inisialisasi saat halaman pertama kali dimuat ---
    displaySalesData();
    // Opsional: Anda bisa langsung memicu peramalan awal saat halaman dimuat
    // performForecast(); 
});