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
    const token = localStorage.getItem('token');
    
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
            alert('Logout gagal!')
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

// Fungsi untuk memuat konten
function loadPage(page, activeSidebarId) {
    // Muat konten ke div .content
    fetch(`${page}.html`)
        .then(response => response.text())
        .then(html => {
            document.querySelector('.content').innerHTML = html;

            // Tandai sidebar yang aktif
            document.querySelectorAll('#sidebar li').forEach(item => {
                item.classList.remove('bg-gray-500'); // Hilangkan tanda aktif
            });
            if (activeSidebarId) {
                document.getElementById(activeSidebarId).classList.add('bg-gray-500'); // Tandai yang aktif
            }
        })
    .catch(error => console.error('Error loading page:', error));
}

// Saat halaman pertama kali terbuka, muat konten dashboard
document.addEventListener('DOMContentLoaded', () => {
    loadPage('dashboard', 'sidebar-dashboard');
});

// Close dropdown when clicking outside of it
document.addEventListener('click', function (e) {
    const dropdown = document.getElementById('dropdownDots');
    const button = document.getElementById('dropdownMenuIconButton');

    // Close the dropdown if the clicked area is not the button or the dropdown itself
    if (!button.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.add('hidden');
    }
});
