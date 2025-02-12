// Copyright 2024 ariefsetyonugroho
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
//     https://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// URL dasar API
const baseUrl = 'http://127.0.0.1:8000/api/voltage';

// Fungsi untuk memetiksa token
function checkAuthentication() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        console.log('Token tidak ditemukan');
    } else {
        console.log(`Token ditemukan ${token}`);
    }
}

// Fungsi untuk login
async function login() {
     // Ambil nilai dari input
     const username = document.getElementById('username').value.trim();
     const password = document.getElementById('password').value.trim();
 
     if (!username || !password) {
         alert('Username dan password harus diisi!');
         return;
     }
 
     try {
         const response = await fetch('http://127.0.0.1:8000/api/login', {
             method: 'POST',
             headers: {
                 'Content-Type': 'application/json',
             },
             body: JSON.stringify({
                 'name': username,
                 'password': password,
             }),
         });
 
         if (response.ok) {
             const data = await response.json();
             // Simpan token ke localStorage
             localStorage.setItem('token', data.token);
             window.location.href = 'index.html';
         } else {
             alert('Login gagal! Periksa username atau password Anda!.');
         }
     } catch (error) {
         console.error('Error:', error);
         alert('Terjadi kesalahan pada server');
     }
}

// Fungsi untuk logout
async function logout() {    
    try {
        const response = await fetch('http://127.0.0.1:8000/api/logout',  {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        if (response.ok) {
            const data = await response.json();
            // Hapus token dari local storage
            localStorage.removeItem('token');
            window.location.href = 'login.html';
        } else {
            // alert('Logout gagal!')
            localStorage.removeItem('token');
            window.location.href = 'login.html';
        }

    } catch (error) {
        console.error('Error:', error);;
        alert('Terjadi kesalahan pada server')
    }
}

function dropdownAdmin() {
    const dropdown = document.getElementById('dropdownDots');
    dropdown.classList.toggle('hidden');
}

// Menampilkan konten yang dipilih
function showContent(contentId, element) {
    // Menyembunyikan semua konten
    const contentPages = document.querySelectorAll('.content-page');
    contentPages.forEach(page => page.classList.add('hidden'));
        
    // Menampilkan konten yang dipilih
    const selectedContent = document.getElementById(contentId);
    if (selectedContent) {
        selectedContent.classList.remove('hidden');
    }
    // Mengatur style hover pada elemen sidebar yang dipilih
    const sidebarItems = document.querySelectorAll('#sidebar li');
    sidebarItems.forEach(item => item.classList.remove('bg-gray-500', 'text-gray-200'));
    element.classList.add('bg-gray-500', 'text-gray-200'); // Menambahkan hover aktif
}

// Menampilkan Dashboard secara default saat halaman pertama kali dibuka
window.onload = function() {
    const defaultItem = document.getElementById('sidebar-dashboard');
    showContent('dashboard', defaultItem);
};

// Close dropdown when clicking outside of it
document.addEventListener('click', function (e) {
    const dropdown = document.getElementById('dropdownDots');
    const button = document.getElementById('dropdownMenuIconButton');

    // Close the dropdown if the clicked area is not the button or the dropdown itself
    if (!button.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.add('hidden');
    }
});



// Konfigurasi awal Chart.js
const ctx = document.getElementById('chart').getContext('2d');

// Inisialisasi Chart.js
const realtimeChart = new Chart(ctx, {
type: 'line',
data: {
    labels: [], // Label untuk sumbu X (waktu atau data lainnya)
    datasets: [{
    label: 'Realtime Data',
    data: [], // Data awal
    borderColor: 'rgba(59, 130, 246, 1)', // Tailwind Blue-500
    backgroundColor: 'rgba(59, 130, 246, 0.2)', // Tailwind Blue-500 (transparan)
    borderWidth: 2,
    tension: 0.4 // Membuat garis lebih mulus
    }]
},
options: {
    responsive: true,
    maintainAspecRation: false,
    plugins: {
    legend: {
        display: true,
        labels: {
        color: '#4B5563' // Tailwind Gray-600
        }
    }
    },
    scales: {
    x: {
        title: {
        display: true,
        text: 'Time',
        color: '#374151', // Tailwind Gray-700
        font: { weight: 'bold' }
        },
        ticks: { color: '#6B7280' } // Tailwind Gray-500
    },
    y: {
        title: {
        display: true,
        text: 'Tegangan (Volt)',
        color: '#374151', // Tailwind Gray-700
        font: { weight: 'bold' }
        },
        beginAtZero: true,
        ticks: { color: '#6B7280' } // Tailwind Gray-500
    }
    }
}
});

let rowCount = 1;
const MAX_DATA = 100;

// Fungsi untuk fetch data dari API
async function fetchData() {
    try {
        const response = await fetch(`${baseUrl}`); // Ganti dengan URL API Anda
        const result = await response.json();
    
        // Untuk data Chart
        // Pastikan data ada dan merupakan array
        if (Array.isArray(result.data) && result.data.length > 0) {
            result.data.forEach(data => {
                // Cek apakah data sudah ada berdasarkan 'time' di chart
                const isDataExist = realtimeChart.data.labels.some(label => label === data.time);
    
                if (!isDataExist) { // Jika data dengan 'time' yang sama belum ada
                    // Tambahkan data baru ke chart
                    realtimeChart.data.labels.push(data.time);
                    realtimeChart.data.datasets[0].data.push(data.voltage);
    
                    // Jika jumlah data di chart melebihi batas, hapus data lama
                    if (realtimeChart.data.labels.length > MAX_DATA) {
                        realtimeChart.data.labels.shift(); // Hapus label pertama
                        realtimeChart.data.datasets[0].data.shift(); // Hapus data pertama
                    }
    
                    // Update chart setelah data baru ditambahkan
                    realtimeChart.update();
                }
            });
        }

        if (Array.isArray(result.data) && result.data.length > 0) {
            const tableBody = document.getElementById("table-body");

            result.data.forEach((data) => {
                const isDataExist = Array.from(tableBody.children).some((row) => {
                    return row.dataset.time == data.time;
                });
    
                if (!isDataExist) {
                    const row = document.createElement("tr");
                    row.dataset.time = data.time;
                    row.className = "hover:bg-gray-100";
    
                    row.innerHTML = `
                        <td class="border border-gray-300 px-4 py-2 text-center">${data.id}</td>
                        <td class="border border-gray-300 px-4 py-2 text-center">${data.time}</td>
                        <td class="border border-gray-300 px-4 py-2 text-center">${data.voltage}</td>
                    `;
    
                    tableBody.prepend(row);
    
                    rowCount++;
    
                    if (tableBody.children.length > MAX_DATA) {
                        tableBody.removeChild(tableBody.lastElementChild);
                    }
                }
            });
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}  
// Panggil fetchData setiap 5 detik
setInterval(fetchData, 5000);

// Date picker
flatpickr("#datetime", {
    enableTime: true,  // Enable time selection
    dateFormat: "Y-m-d",  // Set the format for date and time
});

async function fetchMaxData(date) {
    try {
        // Query parameter yang ingin dikirim
        const queryParams = new URLSearchParams({
           date, // Ganti dengan tanggal yang ingin difilter
        });

        // Susun URL lengkap dengan parameter
        const urlWithParams = `${baseUrl}?${queryParams.toString()}`;

        // Lakukan fetch request
        const response = await fetch(urlWithParams);

        // Parse hasilnya menjadi JSON
        const result = await response.json();

        // Menampilkan data
        if (result.data && Array.isArray(result.data)) {
            console.table(result.data);

            const { average, max, min } = calculateStatistic(result.data);
            // Tampilkan hasil statistik di console
            console.log(`Rata-rata Voltage: ${average.toFixed(2)}`);
            console.log(`Max Voltage: ${max}`);
            console.log(`Min Voltage: ${min}`);

            // Menampilkan hasil di Web
            document.getElementById("average").innerText = average;
            document.getElementById("max").innerText = max;
            document.getElementById("min").innerText = min;

        }

    } catch (error) {
        console.error('Error fetching data: ', error);
    }
}

// Fungsi menghitung statistic data voltage
function calculateStatistic(data) {
    const voltages = data.map(item => parseFloat(item.voltage));

    // Menghitung total voltage
    const total = voltages.reduce((acc, val) => acc + val, 0);
    // Menghitung rata-rata voltage
    const average = total / voltages.length;
    // Menghitung max voltage
    const max = Math.max(...voltages);
    // Menghitung min voltage
    const min = Math.min(...voltages);

    return { average, max, min };
}

// Event listener pada tombol fetch
document.getElementById("fetchButton").addEventListener("click", () => {
    const selectedDate = document.getElementById("datetime").value;

    if (selectedDate) {
        fetchMaxData(selectedDate); // Panggil fungsi fetch dengan date dari date picker
    } else {
        console.error("Pilih tanggal terlebih dahulu!");
        alert('Pilih tanggal telebih dahulu!');
    }
});


