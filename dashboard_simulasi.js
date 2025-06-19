const generateButton = document.getElementById('generateButton');
        const idPasswordModal = document.getElementById('idPasswordModal');
        const closeModalButton = document.getElementById('closeModalButton');
        const displayId = document.getElementById('displayId');
        const displayPassword = document.getElementById('displayPassword');
        const messageBox = document.getElementById('messageBox');
        const simulationTableBody = document.getElementById('simulationTableBody'); // Dapatkan tbody tabel

        // Fungsi untuk menghasilkan ID yang unik dan sederhana
        function generateUniqueId() {
            return 'ERP-EDU-' + Date.now().toString(36).toUpperCase();
        }

        // Fungsi untuk menghasilkan kata sandi acak yang kuat
        function generateRandomPassword(length = 12) {
            const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+';
            let result = '';
            for (let i = 0; i < length; i++) {
                result += characters.charAt(Math.floor(Math.random() * characters.length));
            }
            return result;
        }

        // Fungsi untuk menampilkan pesan temporer
        function showMessage(message) {
            messageBox.textContent = message;
            messageBox.classList.add('show');
            setTimeout(() => {
                messageBox.classList.remove('show');
            }, 2000);
        }

        // Fungsi untuk menyalin teks ke clipboard
        function copyToClipboard(elementId, label) {
            const element = document.getElementById(elementId);
            const textToCopy = element.textContent;

            const textarea = document.createElement('textarea');
            textarea.value = textToCopy;
            document.body.appendChild(textarea);
            textarea.select();
            try {
                document.execCommand('copy');
                showMessage(`${label} disalin!`);
            } catch (err) {
                showMessage(`Gagal menyalin ${label}.`);
                console.error('Failed to copy: ', err);
            }
            document.body.removeChild(textarea);
        }

        // Fungsi untuk menambahkan baris baru ke tabel
        function addSimulationToTable(date, time, code, password) {
            const newRow = document.createElement('tr');

            const dateCell = document.createElement('td');
            dateCell.textContent = date;
            newRow.appendChild(dateCell);

            const timeCell = document.createElement('td');
            timeCell.textContent = time;
            newRow.appendChild(timeCell);

            const codeCell = document.createElement('td');
            codeCell.textContent = code;
            newRow.appendChild(codeCell);

            const passwordCell = document.createElement('td');
            passwordCell.textContent = password;
            newRow.appendChild(passwordCell);

            const teamNameCell = document.createElement('td');
            teamNameCell.textContent = 'Tim [Isi Nama]'; // Placeholder untuk nama tim
            newRow.appendChild(teamNameCell);

            const notesCell = document.createElement('td');
            notesCell.textContent = '-'; // Placeholder untuk keterangan
            newRow.appendChild(notesCell);

            simulationTableBody.appendChild(newRow);
        }

        // Event listener untuk tombol "Buat Kode Simulasi Baru"
        generateButton.addEventListener('click', () => {
            const newId = generateUniqueId();
            const newPassword = generateRandomPassword();

            // Dapatkan tanggal dan waktu saat ini
            const now = new Date();
            const dateOptions = { year: 'numeric', month: '2-digit', day: '2-digit' };
            const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
            const currentDate = now.toLocaleDateString('id-ID', dateOptions); // Format tanggal Indonesia
            const currentTime = now.toLocaleTimeString('id-ID', timeOptions); // Format waktu Indonesia

            // Tampilkan di modal
            displayId.textContent = newId;
            displayPassword.textContent = newPassword;

            // Tambahkan ke tabel
            addSimulationToTable(currentDate, currentTime, newId, newPassword);

            // Menampilkan modal
            idPasswordModal.classList.remove('hidden');
            setTimeout(() => {
                idPasswordModal.classList.add('active');
            }, 10);
        });

        // Event listener untuk tombol "Tutup" pada modal
        closeModalButton.addEventListener('click', () => {
            idPasswordModal.classList.remove('active');
            setTimeout(() => {
                idPasswordModal.classList.add('hidden');
            }, 300);
        });

        // Menutup modal jika klik di luar konten modal
        idPasswordModal.addEventListener('click', (e) => {
            if (e.target === idPasswordModal) {
                idPasswordModal.classList.remove('active');
                setTimeout(() => {
                    idPasswordModal.classList.add('hidden');
                }, 300);
            }
        });