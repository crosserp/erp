document.addEventListener('DOMContentLoaded', function() {
    // --- Chart.js untuk Sales Chart ---

    // Dapatkan konteks canvas
    const ctx = document.getElementById('salesChart').getContext('2d');

    // Fungsi untuk menghasilkan data penjualan acak
    function generateRandomSalesData(count, min, max) {
        const data = [];
        for (let i = 0; i < count; i++) {
            data.push(Math.floor(Math.random() * (max - min + 1)) + min);
        }
        return data;
    }

    // Label untuk sumbu X (bulan)
    const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu'];
    // Data penjualan acak untuk setiap bulan
    const randomSalesData = generateRandomSalesData(labels.length, 100, 500); // Nilai antara 100 dan 500

    // Konfigurasi untuk anotasi (garis vertikal di grafik)
    // Kita akan menempatkan anotasi di bulan terakhir yang ditampilkan, yaitu Agustus (indeks 7)
    const annotationIndex = labels.length - 1; // Indeks bulan terakhir
    const annotationValue = randomSalesData[annotationIndex]; // Nilai penjualan di bulan tersebut
    const currentDate = new Date();
    const formattedDate = `${currentDate.getDate()}/${currentDate.getMonth() + 1}/${currentDate.getFullYear()}`; // Format tanggal saat ini

    const salesChart = new Chart(ctx, {
        type: 'line', // Jenis grafik: garis
        data: {
            labels: labels, // Label sumbu X
            datasets: [{
                label: 'Sales Volume', // Nama dataset
                data: randomSalesData, // Data yang akan diplot
                borderColor: '#FF7F00', // Warna garis (oranye cerah)
                backgroundColor: 'rgba(255, 127, 0, 0.2)', // Warna area di bawah garis
                tension: 0.4, // Membuat garis sedikit melengkung (kurva halus)
                fill: true, // Mengisi area di bawah garis
                pointBackgroundColor: '#FF7F00', // Warna titik data
                pointBorderColor: '#fff', // Warna border titik data
                pointRadius: 5, // Ukuran titik data
                pointHoverRadius: 8, // Ukuran titik saat di-hover
                pointHoverBackgroundColor: '#FF7F00',
                pointHoverBorderColor: 'rgba(255,255,255,1)',
                pointHitRadius: 10,
                borderWidth: 3 // Ketebalan garis
            }]
        },
        options: {
            responsive: true, // Grafik akan responsif terhadap ukuran kontainernya
            maintainAspectRatio: false, // Penting agar tinggi grafik bisa diatur via CSS
            plugins: {
                legend: {
                    display: false // Sembunyikan label legend "Sales Volume"
                },
                tooltip: { // Konfigurasi tooltip saat hover
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: function(context) {
                            return `Sales: ${context.raw}`; // Format teks tooltip
                        }
                    },
                    backgroundColor: '#333', // Warna latar belakang tooltip
                    titleColor: '#fff', // Warna judul tooltip
                    bodyColor: '#fff', // Warna teks body tooltip
                    borderColor: '#FF7F00', // Warna border tooltip
                    borderWidth: 1
                },
                annotation: { // Konfigurasi plugin anotasi
                    annotations: {
                        line1: {
                            type: 'line', // Tipe anotasi: garis
                            mode: 'vertical', // Garis vertikal
                            scaleID: 'x', // Terkait dengan sumbu X
                            value: labels[annotationIndex], // Posisi garis berdasarkan label bulan
                            borderColor: '#FF7F00', // Warna garis anotasi
                            borderWidth: 2, // Ketebalan garis
                            borderDash: [6, 6], // Membuat garis putus-putus
                            label: { // Label teks untuk anotasi
                                content: `${annotationValue} \n ${formattedDate}`, // Konten label
                                enabled: true, // Aktifkan label
                                position: 'start', // Posisikan di bagian atas (start sumbu Y)
                                backgroundColor: 'rgba(255, 127, 0, 0.8)', // Latar belakang label
                                color: 'white', // Warna teks label
                                font: {
                                    size: 12,
                                    weight: 'bold'
                                },
                                yAdjust: -10, // Geser label sedikit ke atas
                                xAdjust: 20, // Geser label sedikit ke kanan
                                borderRadius: 5, // Border radius untuk label
                                padding: 8 // Padding dalam label
                            }
                        }
                    }
                }
            },
            scales: { // Konfigurasi sumbu X dan Y
                y: {
                    beginAtZero: true, // Sumbu Y dimulai dari 0
                    grid: {
                        color: 'rgba(0,0,0,0.05)', // Warna garis grid Y
                        drawBorder: false // Jangan menggambar border di sekitar grid
                    },
                    ticks: {
                        color: '#666' // Warna label angka di sumbu Y
                    }
                },
                x: {
                    grid: {
                        display: false // Sembunyikan garis grid sumbu X
                    },
                    ticks: {
                        color: '#666' // Warna label bulan di sumbu X
                    }
                }
            }
        }
    });


    // --- OpenLayers untuk Peta Warehouse di Indonesia ---

    // Dapatkan elemen div untuk peta
    const mapElement = document.getElementById('map');
    if (mapElement) {
        const map = new ol.Map({
            target: 'map', // ID elemen HTML tempat peta akan ditampilkan
            layers: [
                new ol.layer.Tile({
                    source: new ol.source.OSM() // Menggunakan OpenStreetMap sebagai sumber peta
                })
            ],
            view: new ol.View({
                // Pusat peta di Indonesia (sekitar Kalimantan/Sulawesi)
                center: ol.proj.fromLonLat([118.0, -2.0]),
                zoom: 5 // Zoom level untuk melihat sebagian besar Indonesia
            })
        });

        // Contoh lokasi warehouse di kota-kota besar Indonesia (koordinat Bujur/Lintang)
        const warehouseLocations = [
            [106.8456, -6.2088],  // Jakarta
            [112.7688, -7.2575],  // Surabaya
            [104.7565, -2.9761],  // Palembang
            [116.1157, -8.6534],  // Denpasar
            [122.9772, -3.9933],  // Kendari
            [110.4267, -7.0000],  // Semarang (dekat pusat Jawa)
            [98.6785, 3.5952],    // Medan
            [119.4327, -5.1477]   // Makassar
        ];

        // Buat fitur (marker) untuk setiap lokasi warehouse
        const features = warehouseLocations.map(coords => {
            return new ol.Feature({
                geometry: new ol.geom.Point(ol.proj.fromLonLat(coords))
            });
        });

        // Buat sumber vektor dari fitur-fitur marker
        const vectorSource = new ol.source.Vector({
            features: features
        });

        // Buat layer vektor untuk menampilkan marker
        const vectorLayer = new ol.layer.Vector({
            source: vectorSource,
            style: new ol.style.Style({
                image: new ol.style.Circle({
                    radius: 8,
                    fill: new ol.style.Fill({color: 'red'}), // Warna isi marker
                    stroke: new ol.style.Stroke({color: 'white', width: 2}) // Warna border marker
                })
            })
        });
        map.addLayer(vectorLayer); // Tambahkan layer marker ke peta
    }
});