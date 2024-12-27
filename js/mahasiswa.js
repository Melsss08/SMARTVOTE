const listKandidatLink = document.getElementById("list-kandidat");
const hasilSuaraLink = document.getElementById("hasil-suara");
const loginMahasiswaList = document.getElementById("login-mahasiswa");
const formBoxLoginList = document.getElementById("form-box-login");
const mainContent = document.querySelector(".main-content");

let currentUser  = null; // Variabel untuk menyimpan data pengguna yang sedang login

// Fungsi untuk menyembunyikan semua konten
function hideAllContents() {
    mainContent.innerHTML = ""; // Hapus konten di mainContent
}

// Fungsi untuk menampilkan konten dan mengubah warna
function setActiveLink(linkElement, content) {
    // Hapus kelas aktif dari semua tautan
    document.querySelectorAll(".nav-link").forEach(link => link.classList.remove("active"));
    linkElement.classList.add("active");

    // Sembunyikan semua konten sebelum menampilkan yang baru
    hideAllContents();

    // Tampilkan konten berdasarkan link yang diklik
    if (content === "login") {
        // Tambahkan form login ke mainContent dan tampilkan
        mainContent.appendChild(formBoxLoginList);
        formBoxLoginList.style.display = "block"; // Tampilkan form login
    } else if (content === "Tidak Ada Hasil Suara") {
        // Tampilkan teks info sesuai parameter
        const infoElement = document.createElement("h1");
        infoElement.className = "info";
        infoElement.textContent = content;

        mainContent.appendChild(infoElement); // Tambahkan info ke main content
    } else if (linkElement === listKandidatLink) {
        showKandidatTable(); // Tampilkan tabel kandidat
    }
}

// Event listeners
listKandidatLink.addEventListener("click", (event) => {
    event.preventDefault();
    setActiveLink(listKandidatLink, "Tidak Ada List Kandidat");
});
hasilSuaraLink.addEventListener("click", (event) => {
    event.preventDefault();
    setActiveLink(hasilSuaraLink, "Tidak Ada Hasil Suara");
});
loginMahasiswaList.addEventListener("click", (event) => {
    event.preventDefault();
    setActiveLink(loginMahasiswaList, "login");
});

// Fungsi untuk mereset form login
function resetForm() {
    document.getElementById("loginID").value = '';
    document.getElementById("loginNama").value = '';
    document.getElementById("loginUsername").value = '';
    document.getElementById("loginPassword").value = '';
}

// Tambahkan event listener ke form login 
document.addEventListener("DOMContentLoaded", function() {
    const formLogin = document.getElementById("formLogin");

    formLogin.addEventListener("submit", (event) => {
        event.preventDefault();

        // Ambil data dari input form
        const loginUsername = document.getElementById("loginUsername").value;
        const loginPassword = document.getElementById("loginPassword").value;

        // Validasi
        if (loginUsername && loginPassword) {
            // Cek data pengguna di database
            const operatorRef = firebase.database().ref('operator');
            operatorRef.orderByChild('namaPengguna').equalTo(loginUsername).once('value', (snapshot) => {
                if (snapshot.exists()) {
                    snapshot.forEach((childSnapshot) => {
                        const operatorData = childSnapshot.val();
                        if (operatorData.kataSandi === loginPassword) {
                            // Simpan ID operator di local storage
                            localStorage.setItem('currentUser ', JSON.stringify(operatorData));

                            // Redirect ke halaman operator
                            window.location.href = "operator.html?operatorId=" + operatorData.idOperator;
                        } else {
                            alert("Kata Sandi salah!");
                        }
                    });
                } else {
                    // Cek data admin di database
                    const adminRef = firebase.database().ref('Akun Admin'); // Ganti dengan path yang sesuai
                    adminRef.orderByChild('namaPengguna').equalTo(loginUsername).once('value', (adminSnapshot) => {
                        if (adminSnapshot.exists()) {
                            adminSnapshot.forEach((adminChildSnapshot) => {
                                const adminData = adminChildSnapshot.val();
                                if (adminData.kataSandi === loginPassword) {
                                    // Simpan data admin di local storage
                                    localStorage.setItem('currentUser ', JSON.stringify(adminData));

                                    // Redirect ke halaman admin
                                    window.location.href = "admin.html?adminID=" + adminData.loginIDAdmin;
                                } else {
                                    alert("Kata Sandi Admin salah!");
                                }
                            });
                        } else {
                            // Cek data kandidat di database
                            const kandidatRef = firebase.database().ref('Daftar Kandidat'); // Ganti dengan path yang sesuai
                            kandidatRef.orderByChild('namaPenggunaKandidat').equalTo(loginUsername).once('value', (kandidatSnapshot) => {
                                if (kandidatSnapshot.exists()) {
                                    kandidatSnapshot.forEach((childSnapshot) => {
                                        const kandidatData = childSnapshot.val();
                                        if (kandidatData.kataSandiKandidat === loginPassword) {
                                            // Simpan data kandidat di local storage
                                            localStorage.setItem('currentUser ', JSON.stringify(kandidatData));

                                            // Redirect ke halaman kandidat
                                            window.location.href = "kandidat.html?kandidatId=" + childSnapshot.key; // Ganti dengan URL halaman kandidat yang sesuai
                                        } else {
                                            alert("Kata Sandi Kandidat salah!");
                                        }
                                    });
                                } else {
                                    alert("Kandidat tidak ditemukan!");
                                }
                            });
                        }
                    });
                }
            });
        } else {
            alert('Harap isi semua field!');
        }
    });
});


// Fungsi untuk menampilkan tabel kandidat di halaman admin
function showKandidatTable() {
    const kandidatRef = firebase.database().ref('Daftar Kandidat');
    kandidatRef.on('value', (snapshot) => {
        mainContent.innerHTML = "";

        // Tampilkan Daftar Sidik Jari
        if (snapshot.exists()) {
            // Membuat elemen div baru dengan kelas table-responsive
            const responsiveDiv = document.createElement("div");
            responsiveDiv.classList.add("table-responsive");

            const table = document.createElement("table");
            table.classList.add("table", "table-striped");
            table.style.fontSize = "14px";
            const thead = document.createElement("thead");
            const headerRow = document.createElement("tr");
            ["Nama Kandidat", "Foto Profil", "Visi & Misi", "Status Kandidat"].forEach(text => {
                const th = document.createElement("th");
                th.textContent = text;
                headerRow.appendChild(th);
            });
            thead.appendChild(headerRow);
            table.appendChild(thead);

            const tbody = document.createElement("tbody");
            snapshot.forEach((childSnapshot) => {
                const kandidatData = childSnapshot.val();
                const row = document.createElement("tr");

                // Menampilkan data sidik jari tanpa kolom aksi
                ["namaKandidat", "fotoProfilKandidat", "visiMisiKandidat", "kandidatJenis"].forEach((key, index) => {
                    const cell = document.createElement("td");
                    if (index === 1) { // Foto Profil
                        // Membuat link baru
                        const link = document.createElement("a");
                        link.href = kandidatData[key]; // Mengatur href link ke nilai foto
                        link.target = "_blank"; // Membuka link di tab baru
                        link.textContent = "Lihat Foto";

                        cell.appendChild(link); // Menambahkan link ke cell
                    } else {
                        cell.textContent = kandidatData[key];
                    }
                    row.appendChild(cell);
                });

                tbody.appendChild(row);
            });
            table.appendChild(tbody);
            responsiveDiv.appendChild(table);
            mainContent.appendChild(responsiveDiv);
        } else {
            mainContent.innerHTML = "<h1 class='info'>Tidak Ada Daftar Kandidat</h1>";
        }
    });
}

// Fungsi untuk menampilkan hasil suara
function showHasilSuara() {
    const maperwaRef = firebase.database().ref('MAPERWA');
    const presidenBemRef = firebase.database().ref('PRESIDEN_BEM');

    const hasilSuaraDiv = document.createElement('div');
    hasilSuaraDiv.classList.add('container', 'mt-4');

    // Menampilkan header hasil suara untuk MAPERWA
    // const maperwaHeader = document.createElement('h2');
    // maperwaHeader.textContent = 'Hasil Suara Ketua Umum MAPERWA';
    // maperwaHeader.style.fontSize = "20px";
    // hasilSuaraDiv.appendChild(maperwaHeader);

    const maperwaTable = document.createElement('table');
    maperwaTable.classList.add('table', 'table-striped');
    maperwaTable.style.fontSize = "14px";
    const maperwaThead = document.createElement('thead');
    const maperwaHeaderRow = document.createElement('tr');
    ['Kandidat Ketua Umum MAPERWA', 'Jumlah Suara', 'Persentase'].forEach(text => {
        const th = document.createElement('th');
        th.textContent = text;
        maperwaHeaderRow.appendChild(th);
    });
    maperwaThead.appendChild(maperwaHeaderRow);
    maperwaTable.appendChild(maperwaThead);

    const maperwaTbody = document.createElement('tbody');
    maperwaRef.on('value', (snapshot) => {
        maperwaTbody.innerHTML = ''; // Bersihkan tabel sebelum diisi ulang
        let totalSuara = 0;

        if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
                totalSuara += childSnapshot.val(); // Hitung total suara
            });
        }
        snapshot.forEach((childSnapshot) => {
            const kandidat = childSnapshot.key;
            const jumlahSuara = childSnapshot.val();
            const maperwaRow = document.createElement('tr');
            const kandidatCell = document.createElement('td');
            kandidatCell.textContent = kandidat;
            const jumlahSuaraCell = document.createElement('td');
            jumlahSuaraCell.textContent = jumlahSuara;

            // Hitung persentase
            const persentase = totalSuara > 0 ? ((jumlahSuara / totalSuara) * 100).toFixed(2) + '%' : '0%';
            const persentaseCell = document.createElement('td');
            persentaseCell.textContent = persentase;

            maperwaRow.appendChild(kandidatCell);
            maperwaRow.appendChild(jumlahSuaraCell);
            maperwaRow.appendChild(persentaseCell);
            maperwaTbody.appendChild(maperwaRow);
        });
        maperwaTable.appendChild(maperwaTbody);
        hasilSuaraDiv.appendChild(maperwaTable);
    });
    
    // Menampilkan header hasil suara untuk PRESIDEN BEM
    // const presidenBemHeader = document.createElement('h2');
    // presidenBemHeader.textContent = 'Hasil Suara Presiden BEM';
    // presidenBemHeader.style.fontSize = "20px";
    // hasilSuaraDiv.appendChild(presidenBemHeader);

    const presidenBemTable = document.createElement('table');
    presidenBemTable.classList.add('table', 'table-striped');
    presidenBemTable.style.fontSize = "14px";
    const presidenBemThead = document.createElement('thead');
    const presidenBemHeaderRow = document.createElement('tr');
    ['Kandidat Presiden BEM', 'Jumlah Suara', 'Persentase'].forEach(text => {
        const th = document.createElement('th');
        th.textContent = text;
        presidenBemHeaderRow.appendChild(th);
    });
    presidenBemThead.appendChild(presidenBemHeaderRow);
    presidenBemTable.appendChild(presidenBemThead);

    const presidenBemTbody = document.createElement('tbody');
    presidenBemRef.on('value', (snapshot) => {
        presidenBemTbody.innerHTML = ''; // Bersihkan tabel sebelum diisi ulang
        let totalSuara = 0;

        if (snapshot.exists()) {
            snapshot.forEach ((childSnapshot) => {
                totalSuara += childSnapshot.val(); // Hitung total suara
            });
        }
        snapshot.forEach((childSnapshot) => {
            const kandidat = childSnapshot.key;
            const jumlahSuara = childSnapshot.val();
            const presidenBemRow = document.createElement('tr');
            const kandidatCell = document.createElement('td');
            kandidatCell.textContent = kandidat;
            const jumlahSuaraCell = document.createElement('td');
            jumlahSuaraCell.textContent = jumlahSuara;
            // Hitung persentase
            const persentase = totalSuara > 0 ? ((jumlahSuara / totalSuara) * 100).toFixed(2) + '%' : '0%';
            const persentaseCell = document.createElement('td');
            persentaseCell.textContent = persentase;

            presidenBemRow.appendChild(kandidatCell);
            presidenBemRow.appendChild(jumlahSuaraCell);
            presidenBemRow.appendChild(persentaseCell);
            presidenBemTbody.appendChild(presidenBemRow);
        });
        presidenBemTable.appendChild(presidenBemTbody);
        hasilSuaraDiv.appendChild(presidenBemTable);
    });

    // Periksa localStorage untuk status visibilitas
    const storedVisibility = localStorage.getItem('isTableVisible');
    if (storedVisibility === 'false') {
        hasilSuaraDiv.querySelectorAll('table').forEach(table => table.style.display = 'none'); // Sembunyikan tabel
    }

    // Menampilkan hasil suara di mainContent
    mainContent.innerHTML = ''; // Bersihkan konten sebelumnya
    mainContent.appendChild(hasilSuaraDiv);
}

// Event listener untuk tautan hasil suara
hasilSuaraLink.addEventListener("click", (event) => {
    event.preventDefault();
    showHasilSuara();
});