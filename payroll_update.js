document.addEventListener('DOMContentLoaded', function() {
    // Mendapatkan parameter ID dari URL
    const urlParams = new URLSearchParams(window.location.search);
    const employeeId = urlParams.get('id');

    if (employeeId) {
        // Mendapatkan data karyawan dari localStorage (atau sumber data Anda)
        const employees = JSON.parse(localStorage.getItem('payrollData')) || [];
        const employee = employees.find(emp => emp.id === employeeId);

        if (employee) {
            // Mengisi formulir dengan data karyawan
            document.getElementById('employeeId').value = employee.id;
            document.getElementById('id').value = employee.id;
            document.getElementById('nama').value = employee.nama;
            document.getElementById('rekening').value = employee.rekening;
            document.getElementById('pendapatan').value = employee.pendapatan;
            document.getElementById('tunjangan').value = employee.tunjangan;
            document.getElementById('bonus').value = employee.bonus;
            document.getElementById('pph').value = employee.pph;
        } else {
            alert('Karyawan tidak ditemukan.');
            window.location.href = 'payroll.html';
        }
    } else {
        alert('ID karyawan tidak diberikan.');
        window.location.href = 'payroll.html';
    }

    // Menangani pengiriman formulir
    document.getElementById('form-payroll-update').addEventListener('submit', function(event) {
        event.preventDefault();

        // Mendapatkan data formulir
        const updatedEmployee = {
            id: document.getElementById('employeeId').value,
            nama: document.getElementById('nama').value,
            rekening: document.getElementById('rekening').value,
            pendapatan: document.getElementById('pendapatan').value,
            tunjangan: document.getElementById('tunjangan').value,
            bonus: document.getElementById('bonus').value,
            pph: document.getElementById('pph').value
        };

        // Memperbarui data di localStorage (atau sumber data Anda)
        const employees = JSON.parse(localStorage.getItem('payrollData')) || [];
        const index = employees.findIndex(emp => emp.id === updatedEmployee.id);
        if (index !== -1) {
            employees[index] = updatedEmployee;
            localStorage.setItem('payrollData', JSON.stringify(employees));
            alert('Data karyawan berhasil diperbarui.');
            window.location.href = 'payroll.html';
        } else {
            alert('Karyawan tidak ditemukan.');
        }
    });
});